import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserPermissions } from "@/lib/auth-permissions";

/**
 * GET /api/installedapps
 * Obtiene todas las instalaciones de la base de datos con información del cliente y entorno
 * Implementa paginación por entorno para evitar errores de memoria
 */
export async function GET(request: NextRequest) {
  try {
    const permissions = await getUserPermissions();

    if (!permissions.isAuthenticated) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    // Verificar permiso de acceso a clientes (instalaciones son parte del módulo clientes)
    if (!permissions.canAccessCustomers) {
      return NextResponse.json(
        { error: "No tienes permiso para acceder a instalaciones" },
        { status: 403 }
      );
    }

    // Obtener el parámetro customerId de la URL si existe
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');

    // Construir el where según los permisos para obtener entornos
    let environmentWhereClause: any = {};
    
    if (customerId) {
      // Si se especifica un customerId, filtrar por ese cliente
      // Verificar que el usuario tenga permiso para ver ese cliente (solo si no tiene allCustomers)
      const allowedIds: string[] = permissions.allowedCustomerIds;
      if (!permissions.allCustomers && allowedIds.length > 0 && !allowedIds.includes(customerId)) {
        return NextResponse.json(
          { error: "No autorizado para ver este cliente" },
          { status: 403 }
        );
      }
      environmentWhereClause = {
        tenant: {
          customerId: customerId,
        },
      };
    } else {
      // Sin customerId, aplicar permisos generales
      environmentWhereClause = permissions.allCustomers
        ? {} // Ve todos los entornos
        : {
            tenant: {
              customerId: { in: permissions.allowedCustomerIds },
            },
          }; // Ve solo entornos de sus clientes permitidos
    }

    // Paso 1: Obtener todos los entornos que cumplen con los permisos
    const environments = await prisma.environment.findMany({
      where: environmentWhereClause,
      select: {
        tenantId: true,
        name: true,
        type: true,
        status: true,
        tenant: {
          select: {
            customer: {
              select: {
                id: true,
                customerName: true,
                imageBase64: true,
              },
            },
          },
        },
      },
      orderBy: [
        { tenant: { customer: { customerName: "asc" } } },
        { name: "asc" },
      ],
    });

    // Paso 2: Crear mapa de clientes únicos para evitar duplicar imageBase64
    const customersMap = new Map<string, { id: string; name: string; image: string | null }>();
    environments.forEach(env => {
      const customer = env.tenant.customer;
      if (!customersMap.has(customer.id)) {
        customersMap.set(customer.id, {
          id: customer.id,
          name: customer.customerName,
          image: customer.imageBase64,
        });
      }
    });

    // Paso 3: Procesar entornos en lotes para evitar sobrecarga de memoria
    const BATCH_SIZE = 10; // Procesar 10 entornos a la vez
    const allApplications: any[] = [];

    for (let i = 0; i < environments.length; i += BATCH_SIZE) {
      const batch = environments.slice(i, i + BATCH_SIZE);
      
      const batchPromises = batch.map(async (env) => {
        // Sin límite por entorno - cargar todas las apps con LEFT JOIN a Application
        const apps = await prisma.$queryRaw<Array<{
          tenantId: string;
          environmentName: string;
          id: string;
          name: string;
          version: string;
          publisher: string;
          publishedAs: string;
          state: string | null;
          latestReleaseVersion: string | null;
        }>>`
          SELECT 
            ia."tenantId",
            ia."environmentName",
            ia.id,
            ia.name,
            ia.version,
            ia.publisher,
            ia."publishedAs",
            ia.state,
            a.latest_release_version as "latestReleaseVersion"
          FROM installed_apps ia
          LEFT JOIN applications a ON ia.id = a.id
          WHERE ia."tenantId" = ${env.tenantId}::uuid
            AND ia."environmentName" = ${env.name}
          ORDER BY ia.name ASC
        `;

        const customerId = env.tenant.customer.id;
        const customer = customersMap.get(customerId)!;

        // Transformar las apps agregando información del entorno y cliente
        return apps.map((app) => ({
          tenantId: app.tenantId,
          environmentName: app.environmentName,
          id: app.id,
          name: app.name,
          version: app.version,
          publisher: app.publisher,
          publishedAs: app.publishedAs,
          state: app.state,
          latestReleaseVersion: app.latestReleaseVersion,
          customerId: customer.id,
          customerName: customer.name,
          customerImage: customer.image,
          environmentType: env.type,
          environmentStatus: env.status,
        }));
      });

      const batchResults = await Promise.all(batchPromises);
      allApplications.push(...batchResults.flat());
      
      // Log de progreso
      console.log(`Processed ${Math.min(i + BATCH_SIZE, environments.length)}/${environments.length} environments, ${allApplications.length} apps so far`);
    }

    console.log(`Returning ${allApplications.length} installed apps from ${environments.length} environments`);

    return NextResponse.json(allApplications);
  } catch (error) {
    console.error("Error fetching installed apps:", error);
    return NextResponse.json(
      { error: "Error al obtener las instalaciones" },
      { status: 500 }
    );
  }
}
