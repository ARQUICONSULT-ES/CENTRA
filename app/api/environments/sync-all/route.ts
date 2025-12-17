import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * Verifica si un token ha expirado y lo refresca si es necesario
 */
async function ensureValidToken(tenantId: string): Promise<{ success: boolean; error?: string }> {
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

    // Verificar si no tiene token configurado
    if (!tenant.token) {
      return { success: false, error: "No tiene token configurado" };
    }

    // Verificar si no tiene configuración de autenticación
    if (!tenant.grantType || !tenant.clientId || !tenant.clientSecret || !tenant.scope) {
      return { success: false, error: "Configuración de autenticación incompleta" };
    }

    // Verificar si el token ha expirado (con margen de 5 minutos)
    const now = new Date();
    const expirationBuffer = 5 * 60 * 1000; // 5 minutos en milisegundos
    const needsRefresh = !tenant.tokenExpiresAt || 
                        new Date(tenant.tokenExpiresAt).getTime() - now.getTime() < expirationBuffer;

    if (!needsRefresh) {
      return { success: true }; // Token válido
    }

    // Refrescar el token
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/customers/tenants/${tenantId}/refresh-token`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Error al refrescar token' }));
      return { success: false, error: errorData.error || 'Error al refrescar token' };
    }

    return { success: true };
  } catch (error) {
    console.error('Error ensuring valid token:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido al verificar token' 
    };
  }
}

/**
 * POST /api/environments/sync-all
 * Sincroniza los entornos de todos los tenants con Business Central
 */
export async function POST() {
  try {
    // Obtener todos los tenants activos
    const tenants = await prisma.tenant.findMany({
      select: {
        id: true,
        customerId: true,
        customer: {
          select: {
            customerName: true,
          },
        },
      },
    });

    if (tenants.length === 0) {
      return NextResponse.json({
        success: 0,
        failed: 0,
        total: 0,
        errors: [],
        message: "No hay tenants para sincronizar",
      });
    }

    let successCount = 0;
    let failedCount = 0;
    const errors: Array<{ tenantId: string; customerName: string; error: string }> = [];

    // Sincronizar cada tenant de forma secuencial para evitar sobrecarga
    for (const tenant of tenants) {
      try {
        // Verificar y refrescar el token si es necesario
        const tokenResult = await ensureValidToken(tenant.id);
        
        if (!tokenResult.success) {
          failedCount++;
          errors.push({
            tenantId: tenant.id,
            customerName: tenant.customer.customerName,
            error: `Token inválido: ${tokenResult.error}`,
          });
          continue; // Saltar a la siguiente iteración
        }

        // Llamar al endpoint de sincronización individual
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/customers/tenants/${tenant.id}/environments/sync`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        if (response.ok) {
          successCount++;
        } else {
          failedCount++;
          const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
          errors.push({
            tenantId: tenant.id,
            customerName: tenant.customer.customerName,
            error: errorData.error || `Error ${response.status}`,
          });
        }
      } catch (error) {
        failedCount++;
        errors.push({
          tenantId: tenant.id,
          customerName: tenant.customer.customerName,
          error: error instanceof Error ? error.message : 'Error desconocido',
        });
      }
    }

    return NextResponse.json({
      success: successCount,
      failed: failedCount,
      total: tenants.length,
      errors,
      message: `Sincronización completada: ${successCount}/${tenants.length} tenants sincronizados correctamente`,
    });
  } catch (error) {
    console.error("Error syncing all environments:", error);
    return NextResponse.json(
      { 
        error: "Error al sincronizar los entornos",
        details: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}
