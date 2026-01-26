import { NextResponse } from "next/server";
import { syncMultipleEnvironments } from "@/lib/installedapp-sync";
import { getUserPermissions } from "@/lib/auth-permissions";

/**
 * POST /api/installedapps/sync-environment
 * Sincroniza las instalaciones de un entorno específico con Business Central
 * Body: { tenantId: string, environmentName: string }
 */
export async function POST(request: Request) {
  try {
    const permissions = await getUserPermissions();

    if (!permissions.isAuthenticated) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    // Verificar permiso de acceso a clientes
    if (!permissions.canAccessCustomers) {
      return NextResponse.json(
        { error: "No tienes permiso para sincronizar instalaciones" },
        { status: 403 }
      );
    }

    // Obtener datos del body
    const body = await request.json();
    const { tenantId, environmentName } = body;

    if (!tenantId || !environmentName) {
      return NextResponse.json(
        { error: "Se requieren tenantId y environmentName" },
        { status: 400 }
      );
    }

    // Obtener información del entorno incluyendo el nombre del cliente
    const prisma = (await import("@/lib/prisma")).default;
    
    const environment = await prisma.environment.findUnique({
      where: {
        tenantId_name: {
          tenantId,
          name: environmentName,
        },
      },
      select: {
        tenantId: true,
        name: true,
        tenant: {
          select: {
            customerId: true,
            customer: {
              select: {
                customerName: true,
              },
            },
          },
        },
      },
    });

    if (!environment) {
      return NextResponse.json(
        { error: "Entorno no encontrado" },
        { status: 404 }
      );
    }

    // Verificar permisos sobre el cliente
    if (!permissions.allCustomers && !permissions.allowedCustomerIds.includes(environment.tenant.customerId)) {
      return NextResponse.json(
        { error: "No tienes permiso para sincronizar este entorno" },
        { status: 403 }
      );
    }

    // Sincronizar el entorno específico
    const results = await syncMultipleEnvironments([
      {
        tenantId: environment.tenantId,
        name: environment.name,
        customerName: environment.tenant.customer.customerName,
      },
    ]);

    if (results.success === 1) {
      return NextResponse.json({
        success: true,
        message: `Entorno ${environmentName} sincronizado correctamente`,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: results.errors[0]?.error || "Error al sincronizar el entorno",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error syncing environment:", error);
    return NextResponse.json(
      { 
        error: "Error al sincronizar el entorno",
        details: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}
