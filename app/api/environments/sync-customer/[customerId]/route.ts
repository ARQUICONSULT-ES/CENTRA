import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { syncMultipleTenants } from "@/lib/environment-sync";
import { getUserPermissions } from "@/lib/auth-permissions";

/**
 * POST /api/environments/sync-customer/[customerId]
 * Sincroniza los entornos de todos los tenants de un cliente específico con Business Central
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ customerId: string }> }
) {
  try {
    const { customerId } = await context.params;
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

    // Verificar que el usuario tenga acceso a este cliente específico
    if (!permissions.allCustomers && !permissions.allowedCustomerIds.includes(customerId)) {
      return NextResponse.json(
        { error: "No tienes permiso para sincronizar este cliente" },
        { status: 403 }
      );
    }

    // Verificar que el cliente existe
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      select: { id: true, customerName: true },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Cliente no encontrado" },
        { status: 404 }
      );
    }

    // Obtener los tenants del cliente
    const tenants = await prisma.tenant.findMany({
      where: {
        customerId: customerId,
      },
      select: {
        id: true,
      },
    });

    if (tenants.length === 0) {
      return NextResponse.json({
        success: 0,
        failed: 0,
        total: 0,
        errors: [],
        message: "No hay tenants configurados para este cliente",
      });
    }

    // Mapear tenants al formato esperado
    const tenantsToSync = tenants.map(tenant => ({
      id: tenant.id,
      customerName: customer.customerName,
    }));

    // Sincronizar usando la función compartida
    const results = await syncMultipleTenants(tenantsToSync);

    return NextResponse.json({
      ...results,
      message: `Sincronización completada: ${results.success}/${results.total} tenants sincronizados correctamente`,
    });
  } catch (error) {
    console.error("Error syncing customer environments:", error);
    return NextResponse.json(
      {
        error: "Error al sincronizar entornos del cliente",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}
