import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const tenant = await prisma.tenant.findUnique({
      where: { id },
    });

    if (!tenant) {
      return NextResponse.json(
        { error: "Tenant no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(tenant);
  } catch (error) {
    console.error("Error fetching tenant:", error);
    return NextResponse.json(
      { error: "Error al obtener el tenant" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { customerId, connectionId, grantType, clientId, clientSecret, scope, token, tokenExpiresAt } = body;

    const now = new Date();

    // Verificar si el tenant existe
    const existingTenant = await prisma.tenant.findUnique({
      where: { id },
    });

    if (!existingTenant) {
      return NextResponse.json(
        { error: "Tenant no encontrado" },
        { status: 404 }
      );
    }

    // Si se proporciona customerId, verificar que el customer existe
    if (customerId && customerId !== existingTenant.customerId) {
      const customer = await prisma.customer.findUnique({
        where: { id: customerId },
      });

      if (!customer) {
        return NextResponse.json(
          { error: "El customer especificado no existe" },
          { status: 400 }
        );
      }
    }

    // Actualizar tenant
    const tenant = await prisma.tenant.update({
      where: { id },
      data: {
        ...(customerId && { customerId }),
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

    return NextResponse.json(tenantWithCustomerName);
  } catch (error) {
    console.error("Error updating tenant:", error);
    return NextResponse.json(
      { error: "Error al actualizar el tenant" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.tenant.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting tenant:", error);
    return NextResponse.json(
      { error: "Error al olvidar el tenant" },
      { status: 500 }
    );
  }
}
