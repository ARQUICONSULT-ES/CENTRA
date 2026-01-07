import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserPermissions } from "@/lib/auth-permissions";

/**
 * GET /api/applications/[id]
 * Obtiene los detalles de una aplicación
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const permissions = await getUserPermissions();

    if (!permissions.isAuthenticated) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { id } = await params;

    const application = await prisma.application.findUnique({
      where: { id },
    });

    if (!application) {
      return NextResponse.json(
        { error: "Aplicación no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(application);
  } catch (error) {
    console.error("Error fetching application:", error);
    return NextResponse.json(
      { error: "Error al obtener la aplicación" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/applications/[id]
 * Actualiza una aplicación existente
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const permissions = await getUserPermissions();

    if (!permissions.isAuthenticated) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { name, publisher, githubRepoName } = body;

    if (!name || !publisher || !githubRepoName) {
      return NextResponse.json(
        { error: "Faltan campos requeridos: name, publisher, githubRepoName" },
        { status: 400 }
      );
    }

    // Verificar que la aplicación existe
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
    const updatedApplication = await prisma.application.update({
      where: { id },
      data: {
        name,
        publisher,
        githubRepoName,
      },
    });

    return NextResponse.json(updatedApplication);
  } catch (error) {
    console.error("Error updating application:", error);
    return NextResponse.json(
      { error: "Error al actualizar la aplicación" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/applications/[id]
 * Elimina una aplicación del catálogo
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const permissions = await getUserPermissions();

    if (!permissions.isAuthenticated) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Verificar que la aplicación existe
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

    return NextResponse.json({ success: true, message: "Aplicación eliminada correctamente" });
  } catch (error) {
    console.error("Error deleting application:", error);
    return NextResponse.json(
      { error: "Error al eliminar la aplicación" },
      { status: 500 }
    );
  }
}
