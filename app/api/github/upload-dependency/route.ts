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

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const owner = formData.get("owner") as string;
    const repo = formData.get("repo") as string;
    const branch = formData.get("branch") as string;

    if (!file || !owner || !repo || !branch) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Validar que sea un archivo .app
    if (!file.name.endsWith(".app")) {
      return NextResponse.json(
        { error: "Solo se permiten archivos .app" },
        { status: 400 }
      );
    }

    // Convertir el archivo a base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Content = buffer.toString("base64");

    // Verificar si el archivo ya existe
    const filePath = `dependencies/${file.name}`;
    let sha: string | undefined;

    const checkFileRes = await fetch(
      `${GITHUB_API_URL}/repos/${owner}/${repo}/contents/${filePath}?ref=${branch}`,
      {
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );

    if (checkFileRes.ok) {
      const fileData = await checkFileRes.json();
      sha = fileData.sha;
    }

    // Subir o actualizar el archivo
    const uploadRes = await fetch(
      `${GITHUB_API_URL}/repos/${owner}/${repo}/contents/${filePath}`,
      {
        method: "PUT",
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: `Add dependency file: ${file.name}`,
          content: base64Content,
          branch: branch,
          ...(sha && { sha }),
        }),
      }
    );

    if (!uploadRes.ok) {
      const errorData = await uploadRes.json();
      throw new Error(`No se pudo subir el archivo: ${errorData.message}`);
    }

    const uploadData = await uploadRes.json();

    return NextResponse.json({
      success: true,
      fileName: file.name,
      path: filePath,
      sha: uploadData.content.sha,
    });
  } catch (error) {
    console.error("Error uploading dependency:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to upload dependency" },
      { status: 500 }
    );
  }
}
