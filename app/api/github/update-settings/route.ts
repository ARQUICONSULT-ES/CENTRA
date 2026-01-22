import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserGitHubToken } from "@/lib/auth-github";

const GITHUB_API_URL = "https://api.github.com";

interface AppDependencyProbingPath {
  repo: string;
  version: string;
  release_status: string;
  authTokenSecret?: string;
  projects?: string;
}

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
    const { owner, repo, baseBranch = "main", appDependencyProbingPaths, installApps } = body as {
      owner: string;
      repo: string;
      baseBranch?: string;
      appDependencyProbingPaths: AppDependencyProbingPath[];
      installApps?: string[];
    };

    if (!owner || !repo || !appDependencyProbingPaths) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // 1. Obtener el archivo settings.json actual de la rama base
    const settingsRes = await fetch(
      `${GITHUB_API_URL}/repos/${owner}/${repo}/contents/.AL-Go/settings.json?ref=${baseBranch}`,
      {
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );

    if (!settingsRes.ok) {
      throw new Error("No se pudo obtener el archivo settings.json");
    }

    const settingsData = await settingsRes.json();
    const currentContent = JSON.parse(
      Buffer.from(settingsData.content, "base64").toString("utf-8")
    );

    // 2. Actualizar el contenido
    const updatedContent = {
      ...currentContent,
      appDependencyProbingPaths,
    };

    // Si se proporcionó installApps, usarlo; sino mantener el existente o crear uno con dependencies/
    if (installApps !== undefined) {
      // Asegurar que dependencies/ esté incluido si no está ya
      const hasDepFolder = installApps.some(path => path.trim() === "dependencies/");
      updatedContent.installApps = hasDepFolder ? installApps : [...installApps, "dependencies/"];
    } else if (!currentContent.installApps || !Array.isArray(currentContent.installApps)) {
      // Si no existe installApps, crear uno con dependencies/
      updatedContent.installApps = ["dependencies/"];
    } else if (!currentContent.installApps.includes("dependencies/")) {
      // Si existe pero no tiene dependencies/, agregarlo
      updatedContent.installApps = [...currentContent.installApps, "dependencies/"];
    }

    // 3. Obtener el SHA del commit más reciente en la rama base
    const baseRefRes = await fetch(
      `${GITHUB_API_URL}/repos/${owner}/${repo}/git/ref/heads/${baseBranch}`,
      {
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );

    if (!baseRefRes.ok) {
      throw new Error(`No se pudo obtener la referencia de ${baseBranch}`);
    }

    const baseRefData = await baseRefRes.json();
    const baseSha = baseRefData.object.sha;

    // 4. Crear una nueva rama desde la rama base
    const branchName = `update-dependencies-${Date.now()}`;
    const createBranchRes = await fetch(
      `${GITHUB_API_URL}/repos/${owner}/${repo}/git/refs`,
      {
        method: "POST",
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ref: `refs/heads/${branchName}`,
          sha: baseSha,
        }),
      }
    );

    if (!createBranchRes.ok) {
      const errorData = await createBranchRes.json();
      throw new Error(`No se pudo crear la rama: ${errorData.message}`);
    }

    // 5. Actualizar el archivo en la nueva rama
    const updateFileRes = await fetch(
      `${GITHUB_API_URL}/repos/${owner}/${repo}/contents/.AL-Go/settings.json`,
      {
        method: "PUT",
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: "Update appDependencyProbingPaths in settings.json",
          content: Buffer.from(JSON.stringify(updatedContent, null, 4)).toString("base64"),
          sha: settingsData.sha,
          branch: branchName,
        }),
      }
    );

    if (!updateFileRes.ok) {
      const errorData = await updateFileRes.json();
      throw new Error(`No se pudo actualizar el archivo: ${errorData.message}`);
    }

    // 6. Crear el Pull Request
    const createPrRes = await fetch(
      `${GITHUB_API_URL}/repos/${owner}/${repo}/pulls`,
      {
        method: "POST",
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "Update CI/CD Dependencies",
          body: `This PR updates the \`appDependencyProbingPaths\` in \`.AL-Go/settings.json\`.\n\n**Changes:**\n- Updated dependencies configuration\n\nGenerated automatically by CENTRA.`,
          head: branchName,
          base: baseBranch,
        }),
      }
    );

    if (!createPrRes.ok) {
      const errorData = await createPrRes.json();
      throw new Error(`No se pudo crear el PR: ${errorData.message}`);
    }

    const prData = await createPrRes.json();

    return NextResponse.json({
      success: true,
      branch: branchName,
      pullRequestUrl: prData.html_url,
      pullRequestNumber: prData.number,
    });
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update settings" },
      { status: 500 }
    );
  }
}
