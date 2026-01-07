import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { syncMultipleEnvironments } from "@/lib/installedapp-sync";
import { getUserPermissions } from "@/lib/auth-permissions";

/**
 * POST /api/installedapps/sync-customer/[customerId]
 * Sincroniza las instalaciones de todos los entornos de un cliente específico
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ customerId: string }> }
) {
  try {
    const { customerId } = await params;
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

    // Verificar que el usuario tenga acceso a este cliente específico
    if (!permissions.allCustomers && !permissions.allowedCustomerIds.includes(customerId)) {
      return NextResponse.json(
        { error: "No tienes permiso para sincronizar este cliente" },
        { status: 403 }
      );
    }

    // Obtener todos los entornos del cliente (a través de sus tenants)
    const environments = await prisma.environment.findMany({
      where: {
        tenant: {
          customerId: customerId,
        },
        NOT: {
          status: "SoftDeleted",
        },
      },
      select: {
        tenantId: true,
        name: true,
        tenant: {
          select: {
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
        message: "No hay entornos activos para este cliente",
      });
    }

    // Mapear entornos al formato esperado
    const envsToSync = environments.map(env => ({
      tenantId: env.tenantId,
      name: env.name,
      customerName: env.tenant.customer.customerName,
    }));

    // Sincronizar usando la función compartida
    const results = await syncMultipleEnvironments(envsToSync);

    return NextResponse.json({
      ...results,
      message: `Sincronización completada: ${results.success}/${results.total} entornos sincronizados`,
    });
  } catch (error) {
    console.error("Error syncing customer applications:", error);
    return NextResponse.json(
      { 
        error: "Error al sincronizar las aplicaciones del cliente",
        details: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}
