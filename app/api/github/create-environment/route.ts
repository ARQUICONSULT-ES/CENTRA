import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/github/create-environment
 * 
 * Crea un GitHub Environment en un repositorio
 * Documentación: https://docs.github.com/en/rest/deployments/environments?apiVersion=2022-11-28
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { owner, repo, environmentName } = body;

    if (!owner || !repo || !environmentName) {
      return NextResponse.json(
        { error: "Faltan parámetros: owner, repo, environmentName" },
        { status: 400 }
      );
    }

    // Obtener el token de GitHub de las cookies
    const token = request.cookies.get("github_token")?.value;
    if (!token) {
      return NextResponse.json(
        { error: "No se encontró token de GitHub" },
        { status: 401 }
      );
    }

    // Crear el entorno en GitHub (sin protection rules)
    const githubResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/environments/${encodeURIComponent(environmentName)}`,
      {
        method: "PUT",
        headers: {
          Accept: "application/vnd.github+json",
          Authorization: `Bearer ${token}`,
          "X-GitHub-Api-Version": "2022-11-28",
        },
      }
    );

    if (!githubResponse.ok) {
      const errorData = await githubResponse.json();
      console.error("Error al crear entorno en GitHub:", errorData);
      return NextResponse.json(
        { error: errorData.message || "Error al crear el entorno en GitHub" },
        { status: githubResponse.status }
      );
    }

    const data = await githubResponse.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error en POST /api/github/create-environment:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
