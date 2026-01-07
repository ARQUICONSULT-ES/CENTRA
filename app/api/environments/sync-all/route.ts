import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { syncMultipleTenants } from "@/lib/environment-sync";
import { getUserPermissions } from "@/lib/auth-permissions";

/**
 * POST /api/environments/sync-all
 * Sincroniza los entornos de todos los tenants con Business Central
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
        { error: "No tienes permiso para sincronizar entornos" },
        { status: 403 }
      );
    }

    // Construir filtro según permisos
    const whereClause = permissions.allCustomers
      ? {}
      : { customerId: { in: permissions.allowedCustomerIds } };

    // Obtener todos los tenants que el usuario puede ver
    const tenants = await prisma.tenant.findMany({
      where: whereClause,
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

    // Mapear tenants al formato esperado
    const tenantsToSync = tenants.map(tenant => ({
      id: tenant.id,
      customerName: tenant.customer.customerName,
    }));

    // Sincronizar usando la función compartida
    const results = await syncMultipleTenants(tenantsToSync);

    return NextResponse.json({
      ...results,
      message: `Sincronización completada: ${results.success}/${results.total} tenants sincronizados correctamente`,
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
