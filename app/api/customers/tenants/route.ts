import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getUserPermissions } from "@/lib/auth-permissions";

export async function GET(request: NextRequest) {
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
        { error: "No tienes permiso para acceder a tenants" },
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
      whereClause = { customerId };
    } else {
      // Sin customerId, aplicar permisos generales
      whereClause = permissions.allCustomers
        ? {} // Ve todos los tenants
        : { customerId: { in: permissions.allowedCustomerIds } }; // Ve solo tenants de sus clientes permitidos
    }

    const tenants = await prisma.tenant.findMany({
      where: whereClause,
      select: {
        id: true,
        customerId: true,
        description: true,
        createdAt: true,
        modifiedAt: true,
        authContext: true,
        customer: {
          select: {
            customerName: true,
            imageBase64: true,
          },
        },
      },
      orderBy: {
        modifiedAt: 'desc',
      },
    });

    // Transformar para incluir customerName y customerImage en el nivel superior
    const tenantsWithCustomerName = tenants.map(tenant => ({
      id: tenant.id,
      customerId: tenant.customerId,
      customerName: tenant.customer.customerName,
      customerImage: tenant.customer.imageBase64,
      description: tenant.description,
      createdAt: tenant.createdAt,
      modifiedAt: tenant.modifiedAt,
      authContext: tenant.authContext,
    }));

    return NextResponse.json(tenantsWithCustomerName);
  } catch (error) {
    console.error("Error fetching tenants:", error);
    return NextResponse.json(
      { error: "Error al obtener los tenants" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, customerId, description, connectionId, grantType, clientId, clientSecret, scope, token, tokenExpiresAt, authContext } = body;

    if (!customerId) {
      return NextResponse.json(
        { error: "El customerId es requerido" },
        { status: 400 }
      );
    }

    // Verificar que el customer existe
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "El customer especificado no existe" },
        { status: 400 }
      );
    }

    const tenantId = id || crypto.randomUUID();
    const now = new Date();

    const tenant = await prisma.tenant.create({
      data: {
        id: tenantId,
        customerId,
        description: description || null,
        createdAt: now,
        modifiedAt: now,
        connectionId: connectionId || null,
        grantType: grantType || null,
        clientId: clientId || null,
        clientSecret: clientSecret || null,
        scope: scope || null,
        token: token || null,
        tokenExpiresAt: tokenExpiresAt ? new Date(tokenExpiresAt) : null,
        authContext: authContext || null,
      },
      include: {
        customer: {
          select: {
            customerName: true,
          },
        },
      },
    });

    // Transformar para incluir customerName en el nivel superior
    const tenantWithCustomerName = {
      ...tenant,
      customerName: tenant.customer.customerName,
      customer: undefined,
    };

    return NextResponse.json(tenantWithCustomerName, { status: 201 });
  } catch (error) {
    console.error("Error creating tenant:", error);
    return NextResponse.json(
      { error: "Error al crear el tenant" },
      { status: 500 }
    );
  }
}
