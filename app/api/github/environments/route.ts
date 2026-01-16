import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

/**
 * GET /api/github/environments?owner={owner}&repo={repo}
 * Lista los entornos de un repositorio de GitHub
 */
export async function GET(request: NextRequest) {
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
        { error: "Solo los administradores pueden ver los entornos" },
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

    if (!owner || !repo) {
      return NextResponse.json(
        { error: "Se requieren los parámetros owner y repo" },
        { status: 400 }
      );
    }

    // Obtener los entornos del repositorio
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/environments`,
      {
        headers: {
          Authorization: `Bearer ${user.githubToken}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.message || "Error al obtener los entornos" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error al obtener entornos:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
