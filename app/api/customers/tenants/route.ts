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
