import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserPermissions } from "@/lib/auth-permissions";

const GITHUB_API_URL = "https://api.github.com";

interface IdRange {
  from: number;
  to: number;
}

interface AppJsonContent {
  id: string;
  name: string;
  publisher: string;
  version?: string;
  brief?: string;
  description?: string;
  logo?: string;
  idRanges?: IdRange[];
}

/**
 * POST /api/applications/[id]/sync
 * Sincroniza una aplicación específica desde su repositorio de GitHub
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const permissions = await getUserPermissions();

    if (!permissions.isAuthenticated) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    // Obtener la aplicación existente
    const application = await prisma.application.findUnique({
      where: { id },
    });

    if (!application) {
      return NextResponse.json(
        { error: "Aplicación no encontrada" },
        { status: 404 }
      );
    }

    if (!application.githubRepoName || !application.githubUrl) {
      return NextResponse.json(
        { error: "Esta aplicación no tiene un repositorio de GitHub asociado" },
        { status: 400 }
      );
    }

    // Usar el token de administrador de GitHub
    const githubToken = process.env.GITHUB_ADMIN_TOKEN;

    if (!githubToken) {
      return NextResponse.json(
        { error: "Token de administrador de GitHub no configurado en el servidor" },
        { status: 500 }
      );
    }

    // Extraer owner del githubUrl
    const urlParts = application.githubUrl.split('/');
    const owner = urlParts[urlParts.length - 2];
    const repoName = application.githubRepoName;

    console.log(`Sincronizando aplicación ${application.name} desde ${owner}/${repoName}`);

    // Obtener información del repositorio
    const repoRes = await fetch(`${GITHUB_API_URL}/repos/${owner}/${repoName}`, {
      headers: {
        Authorization: `token ${githubToken}`,
        Accept: "application/vnd.github.v3+json",
      },
      cache: "no-store",
    });

    if (!repoRes.ok) {
      throw new Error(`No se pudo acceder al repositorio: ${repoRes.status}`);
    }

    const repo = await repoRes.json();
    const defaultBranch = repo.default_branch || "main";

    // Obtener app.json
    const appJsonContent = await getAppJsonFromRepo(
      githubToken,
      owner,
      repoName,
      defaultBranch
    );

    if (!appJsonContent) {
      return NextResponse.json(
        { error: "No se encontró app.json en el repositorio" },
        { status: 404 }
      );
    }

    // Validar que el ID coincida
    if (appJsonContent.id !== id) {
      return NextResponse.json(
        { 
          error: `El ID en app.json (${appJsonContent.id}) no coincide con el ID de la aplicación (${id})` 
        },
        { status: 400 }
      );
    }

    // Obtener logo
    const logoBase64 = await getAppLogoFromRepo(
      githubToken,
      owner,
      repoName,
      defaultBranch,
      appJsonContent
    );

    // Obtener releases
    const latestRelease = await getLatestRelease(githubToken, owner, repoName);
    const latestPrerelease = await getLatestPrerelease(githubToken, owner, repoName);

    // Actualizar la aplicación
    const updatedApp = await prisma.application.update({
      where: { id },
      data: {
        name: appJsonContent.name,
        publisher: appJsonContent.publisher,
        githubRepoName: repoName,
        githubUrl: repo.html_url,
        latestReleaseVersion: latestRelease?.version,
        latestReleaseDate: latestRelease?.date,
        latestPrereleaseVersion: latestPrerelease?.version,
        latestPrereleaseDate: latestPrerelease?.date,
        logoBase64: logoBase64 || application.logoBase64,
        idRanges: (appJsonContent.idRanges || application.idRanges || []) as any,
        updatedAt: new Date(),
      },
    });

    console.log(`✓ Aplicación sincronizada: ${updatedApp.name}`);

    return NextResponse.json({
      success: true,
      message: "Aplicación sincronizada correctamente",
      application: updatedApp,
    });
  } catch (error) {
    console.error("Error en sincronización de aplicación:", error);
    return NextResponse.json(
      { 
        error: "Error al sincronizar aplicación",
        details: error instanceof Error ? error.message : "Error desconocido"
      },
      { status: 500 }
    );
  }
}

/**
 * Intenta obtener y parsear el contenido del archivo app.json de un repositorio
 */
async function getAppJsonFromRepo(
  token: string,
  owner: string,
  repo: string,
  branch: string
): Promise<AppJsonContent | null> {
  const paths = ["app.json", "app/app.json"];
  
  for (const path of paths) {
    try {
      const res = await fetch(
        `${GITHUB_API_URL}/repos/${owner}/${repo}/contents/${path}?ref=${branch}`,
        {
          headers: {
            Authorization: `token ${token}`,
            Accept: "application/vnd.github.v3+json",
          },
          cache: "no-store",
        }
      );

      if (res.status === 404) {
        continue;
      }

      if (!res.ok) {
        throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      
      if (!data.content) {
        continue;
      }

      const content = Buffer.from(data.content, "base64").toString("utf-8");
      const appJson = JSON.parse(content) as AppJsonContent;

      console.log(`  ✓ app.json encontrado en /${path}`);
      return appJson;
    } catch (error) {
      if (path === paths[paths.length - 1]) {
        console.error(`Error leyendo app.json de ${owner}/${repo}:`, error);
      }
    }
  }
  
  return null;
}

/**
 * Intenta obtener el logo de la aplicación desde el repositorio
 */
async function getAppLogoFromRepo(
  token: string,
  owner: string,
  repo: string,
  branch: string,
  appJsonContent: AppJsonContent
): Promise<string | null> {
  if (!appJsonContent.logo || appJsonContent.logo.trim() === "") {
    return null;
  }

  try {
    const logoPath = appJsonContent.logo.startsWith("/") 
      ? appJsonContent.logo.substring(1) 
      : appJsonContent.logo;
    
    const res = await fetch(
      `${GITHUB_API_URL}/repos/${owner}/${repo}/contents/${logoPath}?ref=${branch}`,
      {
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github.v3+json",
        },
        cache: "no-store",
      }
    );

    if (!res.ok) {
      return null;
    }

    const fileData = await res.json();
    
    if (!fileData.content || fileData.type !== "file") {
      return null;
    }

    const base64Content = fileData.content.replace(/\n/g, "");
    
    const fileName = logoPath.toLowerCase();
    let mimeType = "image/png";
    if (fileName.endsWith(".jpg") || fileName.endsWith(".jpeg")) {
      mimeType = "image/jpeg";
    } else if (fileName.endsWith(".svg")) {
      mimeType = "image/svg+xml";
    } else if (fileName.endsWith(".gif")) {
      mimeType = "image/gif";
    } else if (fileName.endsWith(".webp")) {
      mimeType = "image/webp";
    }
    
    const dataUrl = `data:${mimeType};base64,${base64Content}`;
    return dataUrl;
  } catch (error) {
    return null;
  }
}

/**
 * Obtiene la información de la última release de un repositorio
 */
async function getLatestRelease(
  token: string,
  owner: string,
  repo: string
): Promise<{ version: string; date: Date } | null> {
  try {
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

    if (res.status === 404) {
      return null;
    }

    if (!res.ok) {
      return null;
    }

    const release = await res.json();
    
    return {
      version: release.tag_name || release.name || "Unknown",
      date: new Date(release.published_at || release.created_at)
    };
  } catch (error) {
    return null;
  }
}

/**
 * Obtiene la información de la última prerelease de un repositorio
 */
async function getLatestPrerelease(
  token: string,
  owner: string,
  repo: string
): Promise<{ version: string; date: Date } | null> {
  try {
    const res = await fetch(
      `${GITHUB_API_URL}/repos/${owner}/${repo}/releases?per_page=50`,
      {
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github.v3+json",
        },
        cache: "no-store",
      }
    );

    if (res.status === 404) {
      return null;
    }

    if (!res.ok) {
      return null;
    }

    const releases = await res.json();
    
    const latestPrerelease = releases.find((r: any) => r.prerelease === true);
    
    if (!latestPrerelease) {
      return null;
    }
    
    return {
      version: latestPrerelease.tag_name || latestPrerelease.name || "Unknown",
      date: new Date(latestPrerelease.published_at || latestPrerelease.created_at)
    };
  } catch (error) {
    return null;
  }
}
