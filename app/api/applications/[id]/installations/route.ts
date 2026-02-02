import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserPermissions } from "@/lib/auth-permissions";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const permissions = await getUserPermissions();

    if (!permissions.isAuthenticated) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { id: applicationId } = await params;

    // Obtener todas las instalaciones de esta aplicación (excluyendo SoftDeleted)
    const installations = await prisma.installedApp.findMany({
      where: {
        id: applicationId,
        state: {
          not: "SoftDeleted",
        },
      },
      include: {
        environment: {
          include: {
            tenant: {
              include: {
                customer: true,
              },
            },
          },
        },
      },
    });

    // Filtrar por permisos si no tiene acceso a todos los clientes
    let filteredInstallations = installations;
    
    if (!permissions.allCustomers && permissions.allowedCustomerIds.length > 0) {
      const allowedIds = permissions.allowedCustomerIds as string[];
      filteredInstallations = installations.filter((installation) => {
        const customerId = installation.environment.tenant.customerId;
        return allowedIds.includes(customerId);
      });
    }

    // Transformar los datos al formato InstalledAppWithEnvironment
    const result = filteredInstallations.map((installation) => ({
      // Campos de InstalledApp
      tenantId: installation.tenantId,
      environmentName: installation.environmentName,
      id: installation.id,
      name: installation.name,
      version: installation.version,
      publisher: installation.publisher,
      publishedAs: installation.publishedAs,
      state: installation.state,
      // Campos adicionales
      customerId: installation.environment.tenant.customerId,
      customerName: installation.environment.tenant.customer.customerName,
      customerImage: installation.environment.tenant.customer.imageBase64,
      environmentType: installation.environment.type,
      environmentStatus: installation.environment.status,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching application installations:", error);
    return NextResponse.json(
      { error: "Error al obtener las instalaciones" },
      { status: 500 }
    );
  }
}
