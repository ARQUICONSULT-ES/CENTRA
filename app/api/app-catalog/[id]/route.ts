import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

// PUT - Actualizar aplicación
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { name, publisher, githubRepoName } = body;

    // Validaciones
    if (!name || !publisher || !githubRepoName) {
      return NextResponse.json(
        { error: "Todos los campos son requeridos" },
        { status: 400 }
      );
    }

    // Verificar que existe
    const existingApp = await prisma.application.findUnique({
      where: { id },
    });

    if (!existingApp) {
      return NextResponse.json(
        { error: "Aplicación no encontrada" },
        { status: 404 }
      );
    }

    // Actualizar la aplicación
    const application = await prisma.application.update({
      where: { id },
      data: {
        name,
        publisher,
        githubRepoName,
      },
    });

    return NextResponse.json({
      application,
      message: "Aplicación actualizada exitosamente",
    });
  } catch (error) {
    console.error("Error al actualizar aplicación:", error);
    return NextResponse.json(
      { error: "Error al actualizar aplicación" },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar aplicación
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Verificar que existe
    const existingApp = await prisma.application.findUnique({
      where: { id },
    });

    if (!existingApp) {
      return NextResponse.json(
        { error: "Aplicación no encontrada" },
        { status: 404 }
      );
    }

    // Eliminar la aplicación
    await prisma.application.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Aplicación eliminada exitosamente",
    });
  } catch (error) {
    console.error("Error al eliminar aplicación:", error);
    return NextResponse.json(
      { error: "Error al eliminar aplicación" },
      { status: 500 }
    );
  }
}
