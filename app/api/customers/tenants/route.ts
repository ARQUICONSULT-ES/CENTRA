import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const tenants = await prisma.tenant.findMany({
      select: {
        id: true,
        customerName: true,
        createdAt: true,
        modifiedAt: true,
      },
      orderBy: {
        modifiedAt: 'desc',
      },
    });

    return NextResponse.json(tenants);
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
    const { id, customerName, connectionId, grantType, clientId, clientSecret, scope, token, tokenExpiresAt } = body;

    if (!customerName) {
      return NextResponse.json(
        { error: "El nombre del cliente es requerido" },
        { status: 400 }
      );
    }

    const tenantId = id || crypto.randomUUID();
    const now = new Date();

    const tenant = await prisma.tenant.create({
      data: {
        id: tenantId,
        customerName,
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
    });

    return NextResponse.json(tenant, { status: 201 });
  } catch (error) {
    console.error("Error creating tenant:", error);
    return NextResponse.json(
      { error: "Error al crear el tenant" },
      { status: 500 }
    );
  }
}
