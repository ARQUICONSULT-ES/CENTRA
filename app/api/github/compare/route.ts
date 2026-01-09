import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserGitHubToken } from "@/lib/auth-github";

const GITHUB_API_URL = "https://api.github.com";

export async function GET(request: NextRequest) {
  try {
    const token = await getAuthenticatedUserGitHubToken();

    if (!token) {
      return NextResponse.json(
        { error: "Token de GitHub no configurado" }, 
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const owner = searchParams.get("owner");
    const repo = searchParams.get("repo");
    const base = searchParams.get("base"); // tag de la última release (ej: "v1.0.0")
    const head = searchParams.get("head") || "main"; // rama a comparar

    if (!owner || !repo) {
      return NextResponse.json(
        { error: "Faltan parámetros owner y repo" },
        { status: 400 }
      );
    }

    // Si no hay base (primera release), obtener todos los commits de main
    if (!base) {
      const res = await fetch(
        `${GITHUB_API_URL}/repos/${owner}/${repo}/commits?sha=${head}&per_page=50`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.github.v3+json",
          },
          cache: "no-store",
        }
      );

      if (!res.ok) {
        throw new Error(`GitHub API error: ${res.status}`);
      }

      const commits = await res.json();

      return NextResponse.json({
        commits: commits.map((c: { sha: string; commit: { message: string; author: { date: string } }; author?: { login: string; avatar_url: string } }) => ({
          sha: c.sha,
          message: c.commit.message.split("\n")[0], // Solo primera línea
          author: c.author?.login || "unknown",
          avatar_url: c.author?.avatar_url,
          date: c.commit.author.date,
        })),
        total_commits: commits.length,
        is_first_release: true,
      });
    }

    // Comparar entre base (tag) y head (main)
    const res = await fetch(
      `${GITHUB_API_URL}/repos/${owner}/${repo}/compare/${base}...${head}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github.v3+json",
        },
        cache: "no-store",
      }
    );

    if (!res.ok) {
      if (res.status === 404) {
        return NextResponse.json({
          commits: [],
          total_commits: 0,
          is_first_release: false,
        });
      }
      throw new Error(`GitHub API error: ${res.status}`);
    }

    const data = await res.json();

    return NextResponse.json({
      commits: data.commits.map((c: { sha: string; commit: { message: string; author: { date: string } }; author?: { login: string; avatar_url: string } }) => ({
        sha: c.sha,
        message: c.commit.message.split("\n")[0],
        author: c.author?.login || "unknown",
        avatar_url: c.author?.avatar_url,
        date: c.commit.author.date,
      })),
      total_commits: data.total_commits,
      ahead_by: data.ahead_by,
      behind_by: data.behind_by,
      is_first_release: false,
    });
  } catch (error) {
    console.error("Error comparing commits:", error);
    return NextResponse.json(
      { error: "Error al comparar commits" },
      { status: 500 }
    );
  }
}
