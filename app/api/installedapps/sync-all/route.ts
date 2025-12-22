import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * Verifica si un token ha expirado y lo refresca si es necesario
 * Retorna el token válido (ya sea el actual o uno nuevo)
 */
async function ensureValidToken(tenantId: string): Promise<{ success: boolean; token?: string; error?: string }> {
  try {
    // Obtener información del token
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: {
        tokenExpiresAt: true,
        token: true,
        grantType: true,
        clientId: true,
        clientSecret: true,
        scope: true,
      },
    });

    if (!tenant) {
      return { success: false, error: "Tenant no encontrado" };
    }

    // Verificar si no tiene configuración de autenticación
    if (!tenant.grantType || !tenant.clientId || !tenant.clientSecret || !tenant.scope) {
      return { success: false, error: "Configuración de autenticación incompleta" };
    }

    // Verificar si el token ha expirado (con margen de 5 minutos)
    const now = new Date();
    const expirationBuffer = 5 * 60 * 1000; // 5 minutos en milisegundos
    const needsRefresh = !tenant.token || !tenant.tokenExpiresAt || 
                        new Date(tenant.tokenExpiresAt).getTime() - now.getTime() < expirationBuffer;

    if (!needsRefresh && tenant.token) {
      return { success: true, token: tenant.token }; // Token válido
    }

    // Refrescar el token directamente (sin hacer petición HTTP interna)
    console.log(`Refrescando token para tenant ${tenantId}...`);
    
    const authUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
    
    const authRes = await fetch(authUrl, {
      method: "POST",
      body: new URLSearchParams({
        grant_type: tenant.grantType,
        client_id: tenant.clientId,
        client_secret: tenant.clientSecret,
        scope: tenant.scope,
      }),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    if (!authRes.ok) {
      const errorData = await authRes.json().catch(() => ({ error: "No se pudo parsear la respuesta de error" }));
      console.error(`Error al refrescar token para tenant ${tenantId}:`, errorData);
      return { 
        success: false, 
        error: `Error ${authRes.status} al obtener token: ${errorData.error || authRes.statusText}` 
      };
    }

    // Parsear la respuesta
    const authData = await authRes.json();
    const accessToken = authData.access_token;
    const expiresIn = authData.expires_in; // segundos

    if (!accessToken) {
      return { success: false, error: "No se recibió token de acceso" };
    }

    // Calcular la fecha de expiración
    const tokenExpiresAt = new Date(Date.now() + expiresIn * 1000);

    // Actualizar el tenant con el nuevo token
    await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        token: accessToken,
        tokenExpiresAt: tokenExpiresAt,
      },
    });

    console.log(`Token refrescado exitosamente para tenant ${tenantId}`);
    return { success: true, token: accessToken };
  } catch (error) {
    console.error('Error ensuring valid token:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido al verificar token' 
    };
  }
}

/**
 * Sincroniza las aplicaciones de un entorno específico
 */
async function syncEnvironmentApplications(
  tenantId: string,
  environmentName: string,
  token: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Llamar a la API de Business Central
    const bcApiUrl = process.env.BC_ADMIN_API_URL || "https://api.businesscentral.dynamics.com/admin/v2.28/applications";
    const url = `${bcApiUrl}/BusinessCentral/environments/${environmentName}/apps`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error from BC API for environment ${environmentName}:`, errorText);
      return { 
        success: false, 
        error: `Error ${response.status}: ${response.statusText}` 
      };
    }

    const data = await response.json();

    // Sincronizar con la base de datos usando transacción con timeout extendido
    await prisma.$transaction(async (tx) => {
      // Obtener aplicaciones existentes para este entorno
      const existingApps = await tx.installedApp.findMany({
        where: { 
          tenantId: tenantId,
          environmentName: environmentName,
        },
      });

      // Crear un Set con los IDs de las aplicaciones actuales de BC
      const currentAppIds = new Set(data.value.map((app: any) => app.id));

      // Eliminar las aplicaciones que ya no existen en BC
      const appsToDelete = existingApps.filter(
        (app) => !currentAppIds.has(app.id)
      );

      for (const app of appsToDelete) {
        await tx.installedApp.delete({
          where: {
            tenantId_environmentName_id: {
              tenantId: tenantId,
              environmentName: environmentName,
              id: app.id,
            },
          },
        });
      }

      // Crear o actualizar las aplicaciones actuales de BC
      await Promise.all(
        data.value.map((bcApp: any) =>
          tx.installedApp.upsert({
            where: {
              tenantId_environmentName_id: {
                tenantId: tenantId,
                environmentName: environmentName,
                id: bcApp.id,
              },
            },
            update: {
              name: bcApp.name,
              version: bcApp.version,
              publisher: bcApp.publisher,
              publishedAs: bcApp.appType,
              state: bcApp.state,
            },
            create: {
              tenantId: tenantId,
              environmentName: environmentName,
              id: bcApp.id,
              name: bcApp.name,
              version: bcApp.version,
              publisher: bcApp.publisher,
              publishedAs: bcApp.appType,
              state: bcApp.state,
            },
          })
        )
      );
    }, {
      maxWait: 15000, // 15 segundos máximo de espera
      timeout: 30000, // 30 segundos de timeout
    });

    return { success: true };
  } catch (error) {
    console.error(`Error syncing applications for environment ${environmentName}:`, error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    };
  }
}

/**
 * POST /api/installedapps/sync-all
 * Sincroniza las aplicaciones de todos los entornos de todos los tenants con Business Central
 */
export async function POST() {
  try {
    // Obtener todos los entornos activos (no SoftDeleted)
    const environments = await prisma.environment.findMany({
      where: {
        NOT: {
          status: "SoftDeleted",
        },
      },
      select: {
        tenantId: true,
        name: true,
        tenant: {
          select: {
            id: true,
            customer: {
              select: {
                customerName: true,
              },
            },
          },
        },
      },
    });

    if (environments.length === 0) {
      return NextResponse.json({
        success: 0,
        failed: 0,
        total: 0,
        errors: [],
        message: "No hay entornos activos para sincronizar",
      });
    }

    let successCount = 0;
    let failedCount = 0;
    const errors: Array<{ 
      tenantId: string; 
      environmentName: string;
      customerName: string; 
      error: string 
    }> = [];

    // Sincronizar cada entorno de forma secuencial para evitar sobrecarga
    for (const env of environments) {
      try {
        // Verificar y refrescar el token si es necesario
        const tokenResult = await ensureValidToken(env.tenantId);
        
        if (!tokenResult.success || !tokenResult.token) {
          failedCount++;
          errors.push({
            tenantId: env.tenantId,
            environmentName: env.name,
            customerName: env.tenant.customer.customerName,
            error: `Token inválido: ${tokenResult.error || 'No se pudo obtener token'}`,
          });
          continue; // Saltar a la siguiente iteración
        }

        // Sincronizar las aplicaciones del entorno usando el token válido
        const syncResult = await syncEnvironmentApplications(
          env.tenantId,
          env.name,
          tokenResult.token // Usar el token validado/refrescado
        );

        if (syncResult.success) {
          successCount++;
        } else {
          failedCount++;
          errors.push({
            tenantId: env.tenantId,
            environmentName: env.name,
            customerName: env.tenant.customer.customerName,
            error: syncResult.error || 'Error desconocido',
          });
        }
      } catch (error) {
        failedCount++;
        errors.push({
          tenantId: env.tenantId,
          environmentName: env.name,
          customerName: env.tenant.customer.customerName,
          error: error instanceof Error ? error.message : 'Error desconocido',
        });
      }
    }

    return NextResponse.json({
      success: successCount,
      failed: failedCount,
      total: environments.length,
      errors,
      message: `Sincronización completada: ${successCount}/${environments.length} entornos sincronizados correctamente`,
    });
  } catch (error) {
    console.error("Error syncing all applications:", error);
    return NextResponse.json(
      { 
        error: "Error al sincronizar las aplicaciones",
        details: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}
