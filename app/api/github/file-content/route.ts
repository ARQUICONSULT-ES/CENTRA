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
    const path = searchParams.get("path");
    const ref = searchParams.get("ref") || "main";

    if (!owner || !repo || !path) {
      return NextResponse.json(
        { error: "Missing required parameters: owner, repo, path" },
        { status: 400 }
      );
    }

    const res = await fetch(
      `${GITHUB_API_URL}/repos/${owner}/${repo}/contents/${path}?ref=${ref}`,
      {
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github.v3+json",
        },
        cache: "no-store",
      }
    );

    if (res.status === 404) {
      return NextResponse.json(
        { error: "File not found", content: null },
        { status: 404 }
      );
    }

    if (!res.ok) {
      throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    
    // El contenido viene en base64, lo decodificamos
    if (data.content) {
      const content = Buffer.from(data.content, "base64").toString("utf-8");
      try {
        // Intentamos parsear como JSON
        const jsonContent = JSON.parse(content);
        return NextResponse.json({ content: jsonContent, raw: content });
      } catch {
        // Si no es JSON válido, devolvemos el contenido raw
        return NextResponse.json({ content: null, raw: content });
      }
    }

    return NextResponse.json({ content: null, raw: null });
  } catch (error) {
    console.error("Error fetching file content:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch file content" },
      { status: 500 }
    );
  }
}
