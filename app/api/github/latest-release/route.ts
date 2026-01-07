import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserGitHubToken } from "@/lib/auth-github";

const GITHUB_API_URL = "https://api.github.com";

export async function GET(request: NextRequest) {
  try {
    const token = await getAuthenticatedUserGitHubToken();

    if (!token) {
      return NextResponse.json({ error: "Token de GitHub no configurado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
  const owner = searchParams.get("owner");
  const repo = searchParams.get("repo");

  if (!owner || !repo) {
    return NextResponse.json(
      { error: "Faltan parámetros owner y repo" },
      { status: 400 }
    );
  }

    const res = await fetch(
      `${GITHUB_API_URL}/repos/${owner}/${repo}/releases/latest`,
      {
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github.v3+json",
        },
        cache: "no-store",
      }
    );

    if (!res.ok) {
      // Si no hay releases, retornamos null
      if (res.status === 404) {
        return NextResponse.json({ release: null });
      }
      throw new Error(`GitHub API error: ${res.status}`);
    }

    const data = await res.json();

    return NextResponse.json({
      release: {
        tag_name: data.tag_name,
        name: data.name,
        html_url: data.html_url,
        published_at: data.published_at,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Usuario no autenticado") {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }
    console.error("Error fetching latest release:", error);
    return NextResponse.json(
      { error: "Error al obtener la última release" },
      { status: 500 }
    );
  }
}
