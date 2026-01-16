import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

/**
 * GET /api/github/environments/[environmentName]/secrets?owner={owner}&repo={repo}
 * Lista los secrets de un entorno de GitHub
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ environmentName: string }> }
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
        { error: "Solo los administradores pueden ver los secrets" },
        { status: 403 }
      );
    }

    if (!user.githubToken) {
      return NextResponse.json(
        { error: "No GitHub token found. Please add your GitHub token in your profile." },
        { status: 401 }
      );
    }

    // Await params en Next.js 16+
    const resolvedParams = await params;
    const { searchParams } = new URL(request.url);
    const owner = searchParams.get("owner");
    const repo = searchParams.get("repo");
    const environmentName = decodeURIComponent(resolvedParams.environmentName);

    if (!owner || !repo) {
      return NextResponse.json(
        { error: "Se requieren los parámetros owner y repo" },
        { status: 400 }
      );
    }

    console.log(`Fetching secrets for: ${owner}/${repo}/environments/${environmentName}`);

    // Obtener los secrets del entorno
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/environments/${encodeURIComponent(environmentName)}/secrets`,
      {
        headers: {
          Authorization: `Bearer ${user.githubToken}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
      }
    );

    if (!response.ok) {
      // Si es 404, puede ser que el entorno no tenga secrets configurados o no exista
      if (response.status === 404) {
        console.log(`No secrets found for environment: ${environmentName}`);
        return NextResponse.json({
          total_count: 0,
          secrets: []
        });
      }
      
      const errorData = await response.json().catch(() => ({}));
      console.error(`GitHub API error (${response.status}):`, errorData);
      return NextResponse.json(
        { 
          error: errorData.message || "Error al obtener los secrets",
          details: `Status: ${response.status}, Endpoint: ${owner}/${repo}/environments/${environmentName}/secrets`
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error al obtener secrets:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
