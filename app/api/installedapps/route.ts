import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserPermissions } from "@/lib/auth-permissions";

/**
 * GET /api/installedapps
 * Obtiene todas las instalaciones de la base de datos con información del cliente y entorno
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
        environment: {
          tenant: {
            customerId: customerId,
          },
        },
      };
    } else {
      // Sin customerId, aplicar permisos generales
      whereClause = permissions.allCustomers
        ? {} // Ve todas las aplicaciones
        : {
            environment: {
              tenant: {
                customerId: { in: permissions.allowedCustomerIds },
              },
            },
          }; // Ve solo aplicaciones de sus clientes permitidos
    }

    const applications = await prisma.installedApp.findMany({
      where: whereClause,
      include: {
        environment: {
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
          },
        },
      },
      orderBy: [
        { environment: { tenant: { customer: { customerName: "asc" } } } },
        { environmentName: "asc" },
        { name: "asc" },
      ],
    });

    // Transformar los datos para incluir información del cliente y entorno de forma más accesible
    const transformedApplications = applications.map((app) => ({
      tenantId: app.tenantId,
      environmentName: app.environmentName,
      id: app.id,
      name: app.name,
      version: app.version,
      publisher: app.publisher,
      publishedAs: app.publishedAs,
      state: app.state,
      customerId: app.environment.tenant.customer.id,
      customerName: app.environment.tenant.customer.customerName,
      customerImage: app.environment.tenant.customer.imageBase64,
      environmentType: app.environment.type,
      environmentStatus: app.environment.status,
    }));

    return NextResponse.json(transformedApplications);
  } catch (error) {
    console.error("Error fetching installed apps:", error);
    return NextResponse.json(
      { error: "Error al obtener las instalaciones" },
      { status: 500 }
    );
  }
}
