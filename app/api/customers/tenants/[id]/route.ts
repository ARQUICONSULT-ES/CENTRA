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
    const { customerName, connectionId, grantType, clientId, clientSecret, scope, token, tokenExpiresAt } = body;

    if (!customerName) {
      return NextResponse.json(
        { error: "El nombre del cliente es requerido" },
        { status: 400 }
      );
    }

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

    // Actualizar tenant
    const tenant = await prisma.tenant.update({
      where: { id },
      data: {
        customerName,
        modifiedAt: now,
        connectionId: connectionId || null,
        grantType: grantType || null,
        clientId: clientId || null,
        clientSecret: clientSecret || null,
        scope: scope || null,
        token: token || null,
        tokenExpiresAt: tokenExpiresAt ? new Date(tokenExpiresAt) : null,
      },
    });

    return NextResponse.json(tenant);
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
      { error: "Error al eliminar el tenant" },
      { status: 500 }
    );
  }
}
