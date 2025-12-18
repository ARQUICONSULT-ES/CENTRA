import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

// GET - Obtener todos los usuarios
export async function GET() {
  try {
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
        { error: "No tienes permisos para acceder a esta funcionalidad" },
        { status: 403 }
      );
    }

    const users = await prisma.user.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        githubToken: true,
        createdAt: true,
        updatedAt: true,
        password: false, // No devolver password
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

    // Transformar la estructura de allowedCustomers
    const transformedUsers = users.map(user => ({
      ...user,
      allowedCustomers: user.allowedCustomers.map(ac => ({
        id: ac.customer.id,
        name: ac.customer.customerName,
        logo: ac.customer.imageBase64,
      })),
    }));

    return NextResponse.json({ users: transformedUsers });
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    return NextResponse.json(
      { error: "Error al obtener usuarios" },
      { status: 500 }
    );
  }
}

// POST - Crear nuevo usuario
export async function POST(request: Request) {
  try {
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
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: "Nombre, email, contraseña y rol son requeridos" },
        { status: 400 }
      );
    }

    // Verificar que el email no esté en uso
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "El email ya está en uso" },
        { status: 400 }
      );
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear el nuevo usuario con relaciones de clientes
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        githubToken: githubToken || null,
        allowedCustomers: allowedCustomerIds && allowedCustomerIds.length > 0 ? {
          create: allowedCustomerIds.map((customerId: string) => ({
            customer: {
              connect: { id: customerId },
            },
          })),
        } : undefined,
      },
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
      ...newUser,
      allowedCustomers: newUser.allowedCustomers.map(ac => ({
        id: ac.customer.id,
        name: ac.customer.customerName,
        logo: ac.customer.imageBase64,
      })),
    };

    return NextResponse.json({ user: transformedUser }, { status: 201 });
  } catch (error) {
    console.error("Error al crear usuario:", error);
    return NextResponse.json(
      { error: "Error al crear usuario" },
      { status: 500 }
    );
  }
}
