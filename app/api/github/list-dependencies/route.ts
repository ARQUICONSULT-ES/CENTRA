import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserGitHubToken } from "@/lib/auth-github";

const GITHUB_API_URL = "https://api.github.com";

export async function GET(request: NextRequest) {
  try {
    const token = await getAuthenticatedUserGitHubToken();

    if (!token) {
      return NextResponse.json(
        { error: "No GitHub token found. Please add your GitHub token in your profile." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const owner = searchParams.get("owner");
    const repo = searchParams.get("repo");
    const ref = searchParams.get("ref") || "main";

    if (!owner || !repo) {
      return NextResponse.json(
        { error: "Missing required parameters: owner, repo" },
        { status: 400 }
      );
    }

    const res = await fetch(
      `${GITHUB_API_URL}/repos/${owner}/${repo}/contents/dependencies?ref=${ref}`,
      {
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github.v3+json",
        },
        cache: "no-store",
      }
    );

    if (res.status === 404) {
      // La carpeta no existe, devolver array vacío
      return NextResponse.json({ files: [] });
    }

    if (!res.ok) {
      throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    
    // Filtrar solo archivos .app
    const appFiles = Array.isArray(data) 
      ? data.filter((item: any) => item.type === "file" && item.name.endsWith(".app"))
      : [];

    return NextResponse.json({ 
      files: appFiles.map((file: any) => ({
        name: file.name,
        path: file.path,
        sha: file.sha,
        size: file.size,
      }))
    });
  } catch (error) {
    console.error("Error listing dependencies:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to list dependencies" },
      { status: 500 }
    );
  }
}
