import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserPermissions } from "@/lib/auth-permissions";

/**
 * GET /api/applications/by-repo?repoName=xxx
 * Busca una aplicación por su nombre de repositorio de GitHub
 */
export async function GET(request: NextRequest) {
  try {
    console.log("[by-repo] Endpoint llamado");
    
    const permissions = await getUserPermissions();

    if (!permissions.isAuthenticated) {
      console.log("[by-repo] Usuario no autenticado");
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const repoName = searchParams.get("repoName");
    
    console.log("[by-repo] Buscando repo:", repoName);

    if (!repoName) {
      return NextResponse.json(
        { error: "Parámetro repoName requerido" },
        { status: 400 }
      );
    }

    // Buscar la aplicación por githubRepoName
    // Hacer búsqueda case-insensitive para mayor flexibilidad
    const application = await prisma.application.findFirst({
      where: {
        githubRepoName: {
          equals: repoName,
          mode: 'insensitive'
        },
      },
      select: {
        id: true,
        name: true,
        githubRepoName: true,
      },
    });
    
    console.log("[by-repo] Aplicación encontrada:", application);
    
    // Debug: mostrar todas las apps para comparar
    if (!application) {
      const allApps = await prisma.application.findMany({
        select: {
          githubRepoName: true,
          name: true,
        },
        take: 10,
      });
      console.log("[by-repo] Primeras 10 apps en BD:", allApps);
    }

    if (!application) {
      return NextResponse.json(
        { error: "Aplicación no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(application);
  } catch (error) {
    console.error("Error buscando aplicación por repo:", error);
    return NextResponse.json(
      { error: "Error al buscar la aplicación" },
      { status: 500 }
    );
  }
}
