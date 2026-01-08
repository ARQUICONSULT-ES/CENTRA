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
    const perPage = searchParams.get("per_page") || "50";

    if (!owner || !repo) {
      return NextResponse.json(
        { error: "Faltan parámetros owner y repo" },
        { status: 400 }
      );
    }

    const res = await fetch(
      `${GITHUB_API_URL}/repos/${owner}/${repo}/releases?per_page=${perPage}`,
      {
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github.v3+json",
        },
        cache: "no-store",
      }
    );

    if (!res.ok) {
      if (res.status === 404) {
        return NextResponse.json({ releases: [] });
      }
      throw new Error(`GitHub API error: ${res.status}`);
    }

    const releases = await res.json();

    return NextResponse.json({
      releases: releases.map((r: any) => ({
        tag_name: r.tag_name,
        name: r.name,
        html_url: r.html_url,
        published_at: r.published_at,
        prerelease: r.prerelease,
      })),
    });
  } catch (error) {
    console.error("Error fetching releases:", error);
    return NextResponse.json(
      { error: "Error al obtener releases" },
      { status: 500 }
    );
  }
}
