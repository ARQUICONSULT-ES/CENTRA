import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserPermissions } from "@/lib/auth-permissions";

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

    // Construir el where según los permisos
    const whereClause = permissions.isAdmin
      ? {} // Admin ve todos los environments
      : {
          tenant: {
            customerId: { in: permissions.allowedCustomerIds },
          },
        }; // USER ve solo environments de sus clientes permitidos

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

    // Transformar los datos para incluir información del cliente de forma más accesible
    const transformedEnvironments = environments.map((env) => ({
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
      appsCount: env.installedApps.length,
    }));

    return NextResponse.json(transformedEnvironments);
  } catch (error) {
    console.error("Error fetching environments:", error);
    return NextResponse.json(
      { error: "Error al obtener los environments" },
      { status: 500 }
    );
  }
}
