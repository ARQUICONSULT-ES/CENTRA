import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserPermissions } from "@/lib/auth-permissions";
import { isVersionOutdated } from "@/modules/applications/utils/versionComparison";

/**
 * GET /api/environments
 * Obtiene todos los environments de la base de datos con información del cliente
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

    // Verificar permiso de acceso a clientes (entornos son parte del módulo clientes)
    if (!permissions.canAccessCustomers) {
      return NextResponse.json(
        { error: "No tienes permiso para acceder a entornos" },
        { status: 403 }
      );
    }

    // Obtener el parámetro customerId de la URL si existe
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');

    // Construir el where según los permisos y el filtro de customerId
    let whereClause: any = {};
    
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
      whereClause = {
        tenant: {
          customerId: customerId,
        },
      };
    } else {
      // Sin customerId, aplicar permisos generales
      whereClause = permissions.allCustomers
        ? {} // Ve todos los environments
        : {
            tenant: {
              customerId: { in: permissions.allowedCustomerIds },
            },
          }; // Ve solo environments de sus clientes permitidos
    }

    const environments = await prisma.environment.findMany({
      where: whereClause,
      include: {
        tenant: {
          include: {
            customer: {
              select: {
                id: true,
                customerName: true,
                imageBase64: true,
              },
            },
          },
        },
        installedApps: {
          where: {
            publisher: {
              not: 'Microsoft',
            },
          },
        },
      },
      orderBy: [
        { tenant: { customer: { customerName: "asc" } } },
        { name: "asc" },
      ],
    });

    // Obtener todas las aplicaciones del catálogo para comparar versiones
    const catalogApplications = await prisma.application.findMany({
      select: {
        id: true,
        latestReleaseVersion: true,
      },
    });

    // Crear un mapa de versiones más recientes
    const latestVersions = new Map<string, string>();
    catalogApplications.forEach(app => {
      if (app.latestReleaseVersion) {
        latestVersions.set(app.id, app.latestReleaseVersion);
      }
    });

    // Transformar los datos para incluir información del cliente de forma más accesible
    const transformedEnvironments = environments.map((env) => {
      // Calcular cuántas apps están desactualizadas
      const outdatedAppsCount = env.installedApps.filter(app => {
        const latestVersion = latestVersions.get(app.id);
        return latestVersion && isVersionOutdated(app.version, latestVersion);
      }).length;

      return {
        tenantId: env.tenantId,
        name: env.name,
        type: env.type,
        status: env.status,
        webClientUrl: env.webClientUrl,
        locationName: env.locationName,
        applicationVersion: env.applicationVersion,
        platformVersion: env.platformVersion,
        customerId: env.tenant.customer.id,
        customerName: env.tenant.customer.customerName,
        customerImage: env.tenant.customer.imageBase64,
        tenantDescription: env.tenant.description,
        tenantAuthContext: env.tenant.authContext,
        appsCount: env.installedApps.length,
        outdatedAppsCount,
      };
    });

    return NextResponse.json(transformedEnvironments);
  } catch (error) {
    console.error("Error fetching environments:", error);
    return NextResponse.json(
      { error: "Error al obtener los environments" },
      { status: 500 }
    );
  }
}
