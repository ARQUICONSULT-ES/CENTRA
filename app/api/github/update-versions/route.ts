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
    const { 
      owner, 
      repo, 
      baseBranch = "main", 
      settingsVersion,
      appJsonVersion 
    } = body as {
      owner: string;
      repo: string;
      baseBranch?: string;
      settingsVersion: string;
      appJsonVersion: string;
    };

    if (!owner || !repo || !settingsVersion || !appJsonVersion) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // 1. Obtener el SHA del commit más reciente en la rama base
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

    // 2. Crear una nueva rama desde la rama base
    const branchName = `update-versions-${Date.now()}`;
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

    // 3. Obtener el archivo settings.json actual de la rama recién creada
    const settingsRes = await fetch(
      `${GITHUB_API_URL}/repos/${owner}/${repo}/contents/.AL-Go/settings.json?ref=${branchName}`,
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
    const currentSettingsContent = JSON.parse(
      Buffer.from(settingsData.content, "base64").toString("utf-8")
    );

    // 4. Actualizar settings.json con el nuevo repoVersion
    const updatedSettingsContent = {
      ...currentSettingsContent,
      repoVersion: settingsVersion,
    };

    const updateSettingsRes = await fetch(
      `${GITHUB_API_URL}/repos/${owner}/${repo}/contents/.AL-Go/settings.json`,
      {
        method: "PUT",
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: `Update repoVersion to ${settingsVersion}`,
          content: Buffer.from(JSON.stringify(updatedSettingsContent, null, 4)).toString("base64"),
          sha: settingsData.sha,
          branch: branchName,
        }),
      }
    );

    if (!updateSettingsRes.ok) {
      const errorData = await updateSettingsRes.json();
      throw new Error(`No se pudo actualizar settings.json: ${errorData.message}`);
    }

    // 5. Obtener el archivo app.json actual de la rama
    const appJsonRes = await fetch(
      `${GITHUB_API_URL}/repos/${owner}/${repo}/contents/app.json?ref=${branchName}`,
      {
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );

    if (!appJsonRes.ok) {
      throw new Error("No se pudo obtener el archivo app.json");
    }

    const appJsonData = await appJsonRes.json();
    const currentAppJsonContent = JSON.parse(
      Buffer.from(appJsonData.content, "base64").toString("utf-8")
    );

    // 6. Actualizar app.json con la nueva versión
    const updatedAppJsonContent = {
      ...currentAppJsonContent,
      version: appJsonVersion,
    };

    const updateAppJsonRes = await fetch(
      `${GITHUB_API_URL}/repos/${owner}/${repo}/contents/app.json`,
      {
        method: "PUT",
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: `Update version to ${appJsonVersion}`,
          content: Buffer.from(JSON.stringify(updatedAppJsonContent, null, 4)).toString("base64"),
          sha: appJsonData.sha,
          branch: branchName,
        }),
      }
    );

    if (!updateAppJsonRes.ok) {
      const errorData = await updateAppJsonRes.json();
      throw new Error(`No se pudo actualizar app.json: ${errorData.message}`);
    }

    // 7. Crear el Pull Request
    const prBody = `
## 🔄 Sincronización de Versiones

### Cambios realizados:
- **settings.json (repoVersion)**: \`${settingsVersion}\`
- **app.json (version)**: \`${appJsonVersion}\`

### ⚠️ Importante:
Ambas versiones deben estar sincronizadas para mantener la coherencia en el repositorio CI/CD.

---
*PR generado automáticamente desde CENTRA*
    `.trim();

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
          title: `Sincronizar versiones: ${settingsVersion} / ${appJsonVersion}`,
          body: prBody,
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
    console.error("Error updating versions:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update versions" },
      { status: 500 }
    );
  }
}
