import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

/**
 * DELETE /api/github/environments/[environmentName]?owner={owner}&repo={repo}
 * Elimina un entorno de GitHub
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { environmentName: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    // Verificar que el usuario sea ADMIN
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { 
        id: true,
        canAccessAdmin: true,
        githubToken: true,
      },
    });

    if (!user || !user.canAccessAdmin) {
      return NextResponse.json(
        { error: "Solo los administradores pueden eliminar entornos" },
        { status: 403 }
      );
    }

    if (!user.githubToken) {
      return NextResponse.json(
        { error: "No GitHub token found. Please add your GitHub token in your profile." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const owner = searchParams.get("owner");
    const repo = searchParams.get("repo");
    const environmentName = params.environmentName;

    if (!owner || !repo) {
      return NextResponse.json(
        { error: "Se requieren los parámetros owner y repo" },
        { status: 400 }
      );
    }

    // Eliminar el entorno
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/environments/${environmentName}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${user.githubToken}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.message || "Error al eliminar el entorno" },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error al eliminar entorno:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
