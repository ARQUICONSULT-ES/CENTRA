import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

// GET - Obtener información del usuario actual
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      select: {
        id: true,
        name: true,
        email: true,
        canAccessRepos: true,
        canAccessCustomers: true,
        allCustomers: true,
        canAccessAdmin: true,
        githubToken: true,
        githubAvatar: true,
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

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Transformar la estructura
    const transformedUser = {
      ...user,
      allowedCustomers: user.allowedCustomers.map(ac => ({
        id: ac.customer.id,
        name: ac.customer.customerName,
        logo: ac.customer.imageBase64,
      })),
    };

    return NextResponse.json({ user: transformedUser });
  } catch (error) {
    console.error("Error al obtener información del usuario:", error);
    return NextResponse.json(
      { error: "Error al obtener información del usuario" },
      { status: 500 }
    );
  }
}

// PUT - Actualizar el perfil del usuario actual
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, email, password, githubToken } = body;

    // Validar campos requeridos
    if (!name || !email) {
      return NextResponse.json(
        { error: "Nombre y email son requeridos" },
        { status: 400 }
      );
    }

    // Obtener el usuario actual
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email! },
    });

    if (!currentUser) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Verificar que el email no esté en uso por otro usuario
    if (email !== currentUser.email) {
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
      githubToken: githubToken || null,
    };

    // Si se proporciona una nueva contraseña, encriptarla
    if (password && password.trim() !== "") {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }

    // Actualizar el usuario
    // IMPORTANTE: No permitir cambiar permisos desde este endpoint
    const updatedUser = await prisma.user.update({
      where: { id: currentUser.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        canAccessRepos: true,
        canAccessCustomers: true,
        allCustomers: true,
        canAccessAdmin: true,
        githubToken: true,
        githubAvatar: true,
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

    return NextResponse.json({ 
      user: transformedUser,
      message: "Perfil actualizado correctamente"
    });
  } catch (error) {
    console.error("Error al actualizar perfil:", error);
    return NextResponse.json(
      { error: "Error al actualizar perfil" },
      { status: 500 }
    );
  }
}
