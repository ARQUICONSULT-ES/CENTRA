import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserPermissions } from "@/lib/auth-permissions";
import { cookies } from "next/headers";

const GITHUB_API_URL = "https://api.github.com";

interface AppJsonContent {
  id: string;
  name: string;
  publisher: string;
  version?: string;
  brief?: string;
  description?: string;
  logo?: string;
}

/**
 * POST /api/applications/sync-github
 * Sincroniza aplicaciones desde repositorios de GitHub
 * Lee los archivos app.json de los repositorios para extraer información de las aplicaciones
 */
export async function POST(request: NextRequest) {
  try {
    const permissions = await getUserPermissions();

    if (!permissions.isAuthenticated) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const cookieStore = await cookies();
    const githubToken = cookieStore.get("github_token")?.value;

    if (!githubToken) {
      return NextResponse.json(
        { error: "Token de GitHub no encontrado. Por favor inicia sesión." },
        { status: 401 }
      );
    }

    // 1. Obtener todos los repositorios del usuario
    console.log("Obteniendo repositorios de GitHub...");
    const repos = await getAllUserRepos(githubToken);
    console.log(`Se encontraron ${repos.length} repositorios`);

    const syncResults = {
      total: repos.length,
      processed: 0,
      created: 0,
      updated: 0,
      skipped: 0,
      errors: [] as Array<{ repo: string; error: string }>,
    };

    // 2. Procesar cada repositorio para buscar app.json
    for (const repo of repos) {
      try {
        console.log(`Procesando repositorio: ${repo.full_name}`);
        
        // Intentar obtener el archivo app.json del repositorio
        const appJsonContent = await getAppJsonFromRepo(
          githubToken,
          repo.owner.login,
          repo.name,
          repo.default_branch
        );

        if (!appJsonContent) {
          console.log(`  ⊘ No se encontró app.json en ${repo.name}`);
          syncResults.skipped++;
          syncResults.processed++;
          continue;
        }

        // Validar que tenga las propiedades requeridas
        if (!appJsonContent.id || !appJsonContent.name || !appJsonContent.publisher) {
          console.log(`  ⚠ app.json incompleto en ${repo.name}`);
          syncResults.errors.push({
            repo: repo.name,
            error: "app.json no contiene id, name o publisher"
          });
          syncResults.skipped++;
          syncResults.processed++;
          continue;
        }

        // Intentar obtener el logo de la aplicación
        const logoBase64 = await getAppLogoFromRepo(
          githubToken,
          repo.owner.login,
          repo.name,
          repo.default_branch,
          appJsonContent
        );

        // Obtener la última release del repositorio
        const latestRelease = await getLatestRelease(
          githubToken,
          repo.owner.login,
          repo.name
        );

        // Construir la URL del repositorio
        const githubUrl = repo.html_url;

        // 3. Crear o actualizar la aplicación en la base de datos
        const existingApp = await prisma.application.findUnique({
          where: { id: appJsonContent.id },
        });

        if (existingApp) {
          // Actualizar aplicación existente
          await prisma.application.update({
            where: { id: appJsonContent.id },
            data: {
              name: appJsonContent.name,
              publisher: appJsonContent.publisher,
              githubRepoName: repo.name,
              githubUrl: githubUrl,
              latestReleaseVersion: latestRelease?.version,
              latestReleaseDate: latestRelease?.date,
              logoBase64: logoBase64 || existingApp.logoBase64, // Mantener logo existente si no se encuentra uno nuevo
              updatedAt: new Date(),
            },
          });
          console.log(`  ✓ Actualizada: ${appJsonContent.name}`);
          syncResults.updated++;
        } else {
          // Crear nueva aplicación
          await prisma.application.create({
            data: {
              id: appJsonContent.id,
              name: appJsonContent.name,
              publisher: appJsonContent.publisher,
              githubRepoName: repo.name,
              githubUrl: githubUrl,
              latestReleaseVersion: latestRelease?.version,
              latestReleaseDate: latestRelease?.date,
              logoBase64: logoBase64,
            },
          });
          console.log(`  ✓ Creada: ${appJsonContent.name}`);
          syncResults.created++;
        }

        syncResults.processed++;
      } catch (error) {
        console.error(`Error procesando ${repo.name}:`, error);
        syncResults.errors.push({
          repo: repo.name,
          error: error instanceof Error ? error.message : "Error desconocido"
        });
        syncResults.processed++;
      }
    }

    console.log("Sincronización completada:", syncResults);

    return NextResponse.json({
      success: true,
      message: "Sincronización completada",
      results: syncResults,
    });
  } catch (error) {
    console.error("Error en sincronización de aplicaciones:", error);
    return NextResponse.json(
      { 
        error: "Error al sincronizar aplicaciones",
        details: error instanceof Error ? error.message : "Error desconocido"
      },
      { status: 500 }
    );
  }
}

/**
 * Obtiene todos los repositorios del usuario autenticado
 */
async function getAllUserRepos(token: string): Promise<Array<{
  name: string;
  full_name: string;
  owner: { login: string };
  default_branch: string;
  html_url: string;
}>> {
  const allRepos = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    const res = await fetch(
      `${GITHUB_API_URL}/user/repos?per_page=${perPage}&page=${page}&sort=updated`,
      {
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github.v3+json",
        },
        cache: "no-store",
      }
    );

    if (!res.ok) {
      throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
    }

    const repos = await res.json();
    allRepos.push(...repos);

    if (repos.length < perPage) {
      break;
    }

    page++;
  }

  return allRepos;
}

/**
 * Intenta obtener y parsear el contenido del archivo app.json de un repositorio
 * Busca primero en la raíz y luego en /app/app.json
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
        continue; // Intentar con el siguiente path
      }

      if (!res.ok) {
        throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      
      if (!data.content) {
        continue;
      }

      // Decodificar contenido base64
      const content = Buffer.from(data.content, "base64").toString("utf-8");
      const appJson = JSON.parse(content) as AppJsonContent;

      console.log(`  ✓ app.json encontrado en /${path}`);
      return appJson;
    } catch (error) {
      if (path === paths[paths.length - 1]) {
        // Solo loguear error en el último intento
        console.error(`Error leyendo app.json de ${owner}/${repo}:`, error);
      }
    }
  }
  
  return null; // No se encontró en ninguna ubicación
}

/**
 * Intenta obtener el logo de la aplicación desde el repositorio
 * Solo utiliza el valor del campo "logo" en app.json
 * Si no hay valor, no busca en otras ubicaciones
 */
async function getAppLogoFromRepo(
  token: string,
  owner: string,
  repo: string,
  branch: string,
  appJsonContent: AppJsonContent
): Promise<string | null> {
  // Verificar si app.json especifica una ruta de logo
  if (!appJsonContent.logo || appJsonContent.logo.trim() === "") {
    console.log(`  ⊘ No se especificó logo en app.json`);
    return null;
  }

  try {
    const logoPath = appJsonContent.logo.startsWith("/") 
      ? appJsonContent.logo.substring(1) 
      : appJsonContent.logo;
    
    console.log(`  → Intentando obtener logo desde app.json: ${logoPath}`);
    
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
      console.log(`  ⚠ No se pudo obtener logo desde: ${logoPath}`);
      return null;
    }

    const fileData = await res.json();
    
    if (!fileData.content || fileData.type !== "file") {
      console.log(`  ⚠ Logo no es un archivo válido: ${logoPath}`);
      return null;
    }

    const base64Content = fileData.content.replace(/\n/g, "");
    
    // Determinar el tipo MIME según la extensión
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
    console.log(`  ✓ Logo encontrado: ${logoPath}`);
    return dataUrl;
  } catch (error) {
    console.log(`  ⚠ Error obteniendo logo:`, error instanceof Error ? error.message : "Error desconocido");
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
      return null; // No hay releases
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
    console.error(`Error obteniendo última release de ${owner}/${repo}:`, error);
    return null;
  }
}
