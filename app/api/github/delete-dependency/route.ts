import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserGitHubToken } from "@/lib/auth-github";

const GITHUB_API_URL = "https://api.github.com";

export async function POST(request: NextRequest) {
  try {
    const token = await getAuthenticatedUserGitHubToken();

    if (!token) {
      return NextResponse.json(
        { error: "No GitHub token found. Please add your GitHub token in your profile." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { owner, repo, branch, fileName } = body as {
      owner: string;
      repo: string;
      branch: string;
      fileName: string;
    };

    if (!owner || !repo || !branch || !fileName) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    const filePath = `dependencies/${fileName}`;

    // Obtener el SHA del archivo
    const fileRes = await fetch(
      `${GITHUB_API_URL}/repos/${owner}/${repo}/contents/${filePath}?ref=${branch}`,
      {
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );

    if (!fileRes.ok) {
      throw new Error("No se pudo encontrar el archivo");
    }

    const fileData = await fileRes.json();

    // Eliminar el archivo
    const deleteRes = await fetch(
      `${GITHUB_API_URL}/repos/${owner}/${repo}/contents/${filePath}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: `Delete dependency file: ${fileName}`,
          sha: fileData.sha,
          branch: branch,
        }),
      }
    );

    if (!deleteRes.ok) {
      const errorData = await deleteRes.json();
      throw new Error(`No se pudo eliminar el archivo: ${errorData.message}`);
    }

    return NextResponse.json({
      success: true,
      fileName: fileName,
    });
  } catch (error) {
    console.error("Error deleting dependency:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete dependency" },
      { status: 500 }
    );
  }
}
