import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET - Obtener todos los clientes
export async function GET() {
  try {
    const customers = await prisma.customer.findMany({
      orderBy: {
        customerName: 'asc',
      },
    });

    return NextResponse.json(customers);
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
