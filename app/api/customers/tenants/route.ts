import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const tenants = await prisma.tenant.findMany({
      select: {
        id: true,
        customerId: true,
        createdAt: true,
        modifiedAt: true,
        customer: {
          select: {
            customerName: true,
          },
        },
      },
      orderBy: {
        modifiedAt: 'desc',
      },
    });

    // Transformar para incluir customerName en el nivel superior
    const tenantsWithCustomerName = tenants.map(tenant => ({
      id: tenant.id,
      customerId: tenant.customerId,
      customerName: tenant.customer.customerName,
      createdAt: tenant.createdAt,
      modifiedAt: tenant.modifiedAt,
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
    const { id, customerId, connectionId, grantType, clientId, clientSecret, scope, token, tokenExpiresAt } = body;

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
        createdAt: now,
        modifiedAt: now,
        connectionId: connectionId || null,
        grantType: grantType || null,
        clientId: clientId || null,
        clientSecret: clientSecret || null,
        scope: scope || null,
        token: token || null,
        tokenExpiresAt: tokenExpiresAt ? new Date(tokenExpiresAt) : null,
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
