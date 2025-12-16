import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET - Obtener un cliente por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        tenants: true,
      },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Cliente no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(customer);
  } catch (error) {
    console.error("Error fetching customer:", error);
    return NextResponse.json(
      { error: "Error al obtener el cliente" },
      { status: 500 }
    );
  }
}

// PUT - Actualizar un cliente
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { customerName, imageBase64 } = body;

    if (!customerName || customerName.trim() === "") {
      return NextResponse.json(
        { error: "El nombre del cliente es requerido" },
        { status: 400 }
      );
    }

    const customer = await prisma.customer.update({
      where: { id },
      data: {
        customerName: customerName.trim(),
        imageBase64: imageBase64 !== undefined ? imageBase64 : undefined,
      },
    });

    return NextResponse.json(customer);
  } catch (error) {
    console.error("Error updating customer:", error);
    return NextResponse.json(
      { error: "Error al actualizar el cliente" },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar un cliente
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Primero verificar si existe
    const existingCustomer = await prisma.customer.findUnique({
      where: { id },
      include: {
        _count: {
          select: { tenants: true },
        },
      },
    });

    if (!existingCustomer) {
      return NextResponse.json(
        { error: "Cliente no encontrado" },
        { status: 404 }
      );
    }

    // Eliminar el cliente (cascade eliminará los tenants automáticamente)
    await prisma.customer.delete({
      where: { id },
    });

    return NextResponse.json(
      {
        message: "Cliente eliminado correctamente",
        tenantsDeleted: existingCustomer._count.tenants,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting customer:", error);
    return NextResponse.json(
      { error: "Error al eliminar el cliente" },
      { status: 500 }
    );
  }
}
