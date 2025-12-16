import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * GET /api/customers/tenants/[id]/environments
 * Obtiene los environments de un tenant desde la base de datos local
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Verificar que el tenant existe
    const tenant = await prisma.tenant.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!tenant) {
      return NextResponse.json(
        { error: "Tenant no encontrado" },
        { status: 404 }
      );
    }

    // Obtener environments desde la base de datos local
    const environments = await prisma.environment.findMany({
      where: { tenantId: id },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(environments);
  } catch (error) {
    console.error("Error fetching environments:", error);
    return NextResponse.json(
      { error: "Error al obtener environments" },
      { status: 500 }
    );
  }
}
