import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserPermissions } from "@/lib/auth-permissions";

// GET - Obtener todos los clientes
export async function GET() {
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
        { error: "No tienes permiso para acceder a clientes" },
        { status: 403 }
      );
    }

    // Construir el where según los permisos
    // Si allCustomers es true, array vacío significa "sin restricciones"
    const whereClause = permissions.allCustomers
      ? {} // Ve todos los clientes
      : { id: { in: permissions.allowedCustomerIds } }; // Ve solo sus clientes permitidos

    const customers = await prisma.customer.findMany({
      where: whereClause,
      orderBy: {
        customerName: 'asc',
      },
      include: {
        _count: {
          select: {
            tenants: true,
          },
        },
        tenants: {
          include: {
            environments: {
              where: {
                NOT: {
                  status: 'SoftDeleted',
                },
              },
            },
          },
        },
      },
    });

    // Mapear para incluir el conteo de tenants y entornos activos
    const customersWithCount = customers.map(customer => {
      const activeEnvironmentsCount = customer.tenants.reduce(
        (total, tenant) => total + tenant.environments.length,
        0
      );

      return {
        id: customer.id,
        customerName: customer.customerName,
        imageBase64: customer.imageBase64,
        tenantsCount: customer._count.tenants,
        activeEnvironmentsCount,
      };
    });

    return NextResponse.json(customersWithCount);
  } catch (error) {
    console.error("Error fetching customers:", error);
    return NextResponse.json(
      { error: "Error al obtener los clientes" },
      { status: 500 }
    );
  }
}

// POST - Crear un nuevo cliente
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerName, imageBase64 } = body;

    if (!customerName || customerName.trim() === "") {
      return NextResponse.json(
        { error: "El nombre del cliente es requerido" },
        { status: 400 }
      );
    }

    const customer = await prisma.customer.create({
      data: {
        customerName: customerName.trim(),
        imageBase64: imageBase64 || null,
      },
    });

    return NextResponse.json(customer, { status: 201 });
  } catch (error) {
    console.error("Error creating customer:", error);
    return NextResponse.json(
      { error: "Error al crear el cliente" },
      { status: 500 }
    );
  }
}
