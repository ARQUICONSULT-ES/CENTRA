import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { syncMultipleEnvironments } from "@/lib/installedapp-sync";
import { getUserPermissions } from "@/lib/auth-permissions";

/**
 * POST /api/installedapps/sync-all
 * Sincroniza las instalaciones de todos los entornos de todos los tenants con Business Central
 */
export async function POST() {
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

    // Construir filtro según permisos
    const whereClause = permissions.allCustomers
      ? {
          NOT: {
            status: "SoftDeleted",
          },
        }
      : {
          tenant: {
            customerId: { in: permissions.allowedCustomerIds },
          },
          NOT: {
            status: "SoftDeleted",
          },
        };

    // Obtener los entornos activos que el usuario puede ver
    const environments = await prisma.environment.findMany({
      where: whereClause,
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
        message: "No hay entornos activos para sincronizar",
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
      message: `Sincronización completada: ${results.success}/${results.total} entornos sincronizados correctamente`,
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
