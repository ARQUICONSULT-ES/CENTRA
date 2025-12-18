import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

// PUT - Actualizar usuario
export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    // Verificar que el usuario sea admin
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email! },
    });

    if (!currentUser || currentUser.role !== "ADMIN") {
      return NextResponse.json(
        { error: "No tienes permisos para realizar esta acción" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, email, password, role, githubToken, allowedCustomerIds } = body;

    // Validar campos requeridos
    if (!name || !email || !role) {
      return NextResponse.json(
        { error: "Nombre, email y rol son requeridos" },
        { status: 400 }
      );
    }

    // Verificar que el usuario a actualizar existe
    const userToUpdate = await prisma.user.findUnique({
      where: { id },
    });

    if (!userToUpdate) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Verificar que el email no esté en uso por otro usuario
    if (email !== userToUpdate.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: "El email ya está en uso" },
          { status: 400 }
        );
      }
    }

    // Preparar datos de actualización
    const updateData: any = {
      name,
      email,
      role,
      githubToken: githubToken || null,
    };

    // Si se proporciona una nueva contraseña, encriptarla
    if (password && password.trim() !== "") {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }

    // Actualizar las relaciones de clientes permitidos
    if (allowedCustomerIds !== undefined) {
      // Primero eliminamos todas las relaciones existentes
      await prisma.userCustomer.deleteMany({
        where: { userId: id },
      });

      // Luego creamos las nuevas relaciones si hay IDs
      if (allowedCustomerIds && allowedCustomerIds.length > 0) {
        updateData.allowedCustomers = {
          create: allowedCustomerIds.map((customerId: string) => ({
            customer: {
              connect: { id: customerId },
            },
          })),
        };
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        githubToken: true,
        createdAt: true,
        updatedAt: true,
        password: false,
        allowedCustomers: {
          select: {
            customer: {
              select: {
                id: true,
                customerName: true,
                imageBase64: true,
              },
            },
          },
        },
      },
    });

    // Transformar la estructura
    const transformedUser = {
      ...updatedUser,
      allowedCustomers: updatedUser.allowedCustomers.map(ac => ({
        id: ac.customer.id,
        name: ac.customer.customerName,
        logo: ac.customer.imageBase64,
      })),
    };

    return NextResponse.json({ user: transformedUser });
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    return NextResponse.json(
      { error: "Error al actualizar usuario" },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar usuario
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    // Verificar que el usuario sea admin
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email! },
    });

    if (!currentUser || currentUser.role !== "ADMIN") {
      return NextResponse.json(
        { error: "No tienes permisos para realizar esta acción" },
        { status: 403 }
      );
    }

    // Evitar que el admin se elimine a sí mismo
    if (currentUser.id === id) {
      return NextResponse.json(
        { error: "No puedes eliminar tu propio usuario" },
        { status: 400 }
      );
    }

    // Verificar que el usuario existe
    const userToDelete = await prisma.user.findUnique({
      where: { id },
    });

    if (!userToDelete) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Usuario eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    return NextResponse.json(
      { error: "Error al eliminar usuario" },
      { status: 500 }
    );
  }
}
