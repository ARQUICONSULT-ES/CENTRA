import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserPermissions } from "@/lib/auth-permissions";

export async function GET(request: NextRequest) {
  try {
    const permissions = await getUserPermissions();
    
    if (!permissions.isAuthenticated) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const customerId = searchParams.get("customerId");
    const tenantId = searchParams.get("tenantId");
    const environmentName = searchParams.get("environmentName");
    const applicationId = searchParams.get("applicationId");

    // Construir el where clause
    const whereClause: any = {};

    // Filtro por customer
    if (customerId) {
      whereClause.customerId = customerId;
    } else if (!permissions.allCustomers && permissions.allowedCustomerIds.length > 0) {
      // Si el usuario no es admin, filtrar por sus clientes permitidos
      whereClause.customerId = {
        in: permissions.allowedCustomerIds,
      };
    }

    // Filtro por tenant
    if (tenantId) {
      whereClause.tenantId = tenantId;
    }

    // Filtro por environment
    if (environmentName) {
      whereClause.environmentName = environmentName;
    }

    // Filtro por aplicación (buscar en detalles)
    let deploymentLogsWithApp: string[] | undefined;
    if (applicationId) {
      const detailsWithApp = await prisma.deploymentLogDetail.findMany({
        where: { applicationId },
        select: { deploymentId: true },
        distinct: ["deploymentId"],
      });
      deploymentLogsWithApp = detailsWithApp.map((d) => d.deploymentId);
      
      if (deploymentLogsWithApp.length === 0) {
        // No hay deployments con esa aplicación
        return NextResponse.json({ deployments: [] });
      }
      
      whereClause.id = {
        in: deploymentLogsWithApp,
      };
    }

    // Obtener los deployment logs
    const deploymentLogs = await prisma.deploymentLog.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            githubAvatar: true,
          },
        },
        details: {
          include: {
            application: {
              select: {
                id: true,
                name: true,
                publisher: true,
                logoBase64: true,
              },
            },
          },
          orderBy: {
            order: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Enriquecer con información de customer y environment
    const enrichedDeployments = await Promise.all(
      deploymentLogs.map(async (log) => {
        const customer = await prisma.customer.findUnique({
          where: { id: log.customerId },
          select: {
            id: true,
            customerName: true,
            imageBase64: true,
          },
        });

        const environment = await prisma.environment.findUnique({
          where: {
            tenantId_name: {
              tenantId: log.tenantId,
              name: log.environmentName,
            },
          },
          select: {
            name: true,
            type: true,
            status: true,
            tenant: {
              select: {
                id: true,
                description: true,
              },
            },
          },
        });

        return {
          ...log,
          customer,
          environment,
        };
      })
    );

    return NextResponse.json({ deployments: enrichedDeployments });
  } catch (error) {
    console.error("Error fetching deployment history:", error);
    return NextResponse.json(
      { error: "Error al obtener el histórico de deployments" },
      { status: 500 }
    );
  }
}
