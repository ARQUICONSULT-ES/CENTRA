import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET - Verificar si un nombre de cliente ya existe
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const customerName = searchParams.get('name');
    const excludeId = searchParams.get('excludeId');

    if (!customerName || customerName.trim() === "") {
      return NextResponse.json(
        { exists: false },
        { status: 200 }
      );
    }

    const whereClause: any = {
      customerName: {
        equals: customerName.trim(),
        mode: 'insensitive', // Case-insensitive
      },
    };

    // Si se proporciona un ID, excluirlo de la búsqueda (útil para edición)
    if (excludeId) {
      whereClause.NOT = { id: excludeId };
    }

    const existingCustomer = await prisma.customer.findFirst({
      where: whereClause,
      select: {
        id: true,
        customerName: true,
      },
    });

    return NextResponse.json({
      exists: !!existingCustomer,
      customer: existingCustomer || null,
    });
  } catch (error) {
    console.error("Error checking duplicate customer:", error);
    return NextResponse.json(
      { error: "Error al verificar el nombre del cliente" },
      { status: 500 }
    );
  }
}
