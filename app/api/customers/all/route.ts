import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserPermissions } from "@/lib/auth-permissions";

// GET - Obtener todos los clientes (sin restricciones de permisos)
// Solo para administradores
export async function GET() {
  try {
    const permissions = await getUserPermissions();

    if (!permissions.isAuthenticated) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    // Verificar que sea administrador
    if (!permissions.canAccessAdmin) {
      return NextResponse.json(
        { error: "Solo administradores pueden acceder a este endpoint" },
        { status: 403 }
      );
    }

    // Obtener TODOS los clientes sin restricciones
    const customers = await prisma.customer.findMany({
      orderBy: {
        customerName: 'asc',
      },
      select: {
        id: true,
        customerName: true,
        imageBase64: true,
      },
    });

    return NextResponse.json(customers);
  } catch (error) {
    console.error("Error fetching all customers:", error);
    return NextResponse.json(
      { error: "Error al obtener los clientes" },
      { status: 500 }
    );
  }
}
