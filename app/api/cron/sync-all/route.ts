import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { syncMultipleTenants } from "@/lib/environment-sync";
import { syncMultipleEnvironments } from "@/lib/installedapp-sync";

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
 * POST /api/cron/sync-all
 * Endpoint para Vercel Cron Job que ejecuta la sincronización completa del sistema.
 * 
 * Este endpoint está protegido por un token secreto (CRON_SECRET) y ejecuta
 * directamente la lógica de sincronización sin necesidad de peticiones HTTP internas.
 * 
 * Configuración en vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/sync-all",
 *     "schedule": "0 7 * * *"
 *   }]
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Verificar autorización con token secreto
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      console.error("❌ CRON_SECRET no está configurado");
      return NextResponse.json(
        { error: "Configuración del servidor incompleta" },
        { status: 500 }
      );
    }

    // Vercel envía el token como "Bearer <token>"
    const token = authHeader?.replace("Bearer ", "");
    if (token !== cronSecret) {
      console.error("❌ Token de autorización inválido para cron job");
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    console.log("⏰ Cron job iniciado - ejecutando sincronización completa");
    const startTime = Date.now();

    const results = {
      environments: { 
        success: 0, 
        failed: 0, 
        total: 0, 
        errors: [] as Array<{ tenantId: string; customerName?: string; error: string }> 
      },
      installedApps: { 
        success: 0, 
        failed: 0, 
        total: 0, 
        errors: [] as Array<{ tenantId: string; environmentName: string; customerName?: string; error: string }> 
      },
      applications: { 
        success: 0, 
        failed: 0, 
        total: 0, 
        created: 0, 
        updated: 0, 
        skipped: 0, 
        errors: [] as string[] 
      },
      duration: 0,
    };

    // ========================================
    // 1. SINCRONIZAR TODOS LOS ENTORNOS
    // ========================================
    console.log("\n📦 [1/3] Sincronizando TODOS los entornos de Business Central...");
    try {
      const tenants = await prisma.tenant.findMany({
        select: {
          id: true,
          customer: {
            select: {
              customerName: true,
            },
          },
        },
      });

      if (tenants.length === 0) {
        console.log("⚠️  No hay tenants configurados");
      } else {
        console.log(`   Encontrados ${tenants.length} tenants para sincronizar`);
        
        const tenantsToSync = tenants.map(tenant => ({
          id: tenant.id,
          customerName: tenant.customer.customerName,
        }));

        const envResults = await syncMultipleTenants(tenantsToSync);
        results.environments = {
          success: envResults.success,
          failed: envResults.failed,
          total: envResults.total,
          errors: envResults.errors,
        };

        console.log(`✅ Entornos sincronizados: ${envResults.success}/${envResults.total}`);
        if (envResults.failed > 0) {
          console.error(`❌ Entornos fallidos: ${envResults.failed}`);
        }
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Error desconocido";
      console.error("❌ Error crítico sincronizando entornos:", errorMsg);
      results.environments.errors.push({
        tenantId: "unknown",
        error: errorMsg,
      });
    }

    // ========================================
    // 2. SINCRONIZAR TODAS LAS APLICACIONES INSTALADAS
    // ========================================
    console.log("\n📱 [2/3] Sincronizando TODAS las aplicaciones instaladas...");
    try {
      const environments = await prisma.environment.findMany({
        where: {
          NOT: {
            status: "SoftDeleted",
          },
        },
        select: {
          tenantId: true,
          name: true,
          tenant: {
            select: {
              customer: {
                select: {
                  customerName: true,
                },
              },
            },
          },
        },
      });

      if (environments.length === 0) {
        console.log("⚠️  No hay entornos activos para sincronizar");
      } else {
        console.log(`   Encontrados ${environments.length} entornos activos`);
        
        const envsToSync = environments.map(env => ({
          tenantId: env.tenantId,
          name: env.name,
          customerName: env.tenant.customer.customerName,
        }));

        const appsResults = await syncMultipleEnvironments(envsToSync);
        results.installedApps = {
          success: appsResults.success,
          failed: appsResults.failed,
          total: appsResults.total,
          errors: appsResults.errors,
        };

        console.log(`✅ Apps instaladas sincronizadas: ${appsResults.success}/${appsResults.total}`);
        if (appsResults.failed > 0) {
          console.error(`❌ Apps instaladas fallidas: ${appsResults.failed}`);
        }
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Error desconocido";
      console.error("❌ Error crítico sincronizando apps instaladas:", errorMsg);
      results.installedApps.errors.push({
        tenantId: "unknown",
        environmentName: "unknown",
        customerName: "unknown",
        error: errorMsg,
      });
    }

    // ========================================
    // 3. SINCRONIZAR APLICACIONES DESDE GITHUB
    // ========================================
    console.log("\n🐙 [3/3] Sincronizando aplicaciones desde GitHub...");
    try {
      const githubToken = process.env.GITHUB_ADMIN_TOKEN;

      if (!githubToken) {
        const errorMsg = "GITHUB_ADMIN_TOKEN no configurado en el servidor";
        console.error(`❌ ${errorMsg}`);
        results.applications.errors.push(errorMsg);
      } else {
        console.log("   Obteniendo repositorios de GitHub...");
        const githubResults = await syncGitHubApplications(githubToken);
        
        results.applications = {
          success: githubResults.created + githubResults.updated,
          failed: githubResults.failed,
          total: githubResults.total,
          created: githubResults.created,
          updated: githubResults.updated,
          skipped: githubResults.skipped,
          errors: githubResults.errors || [],
        };

        console.log(`✅ Apps GitHub procesadas: ${githubResults.total}`);
        console.log(`   - Creadas: ${githubResults.created}`);
        console.log(`   - Actualizadas: ${githubResults.updated}`);
        console.log(`   - Omitidas: ${githubResults.skipped}`);
        if (githubResults.failed > 0) {
          console.error(`❌ Apps GitHub fallidas: ${githubResults.failed}`);
        }
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Error desconocido";
      console.error("❌ Error crítico sincronizando GitHub:", errorMsg);
      results.applications.errors.push(errorMsg);
    }

    // ========================================
    // RESUMEN FINAL
    // ========================================
    results.duration = Date.now() - startTime;
    
    console.log("\n" + "=".repeat(60));
    console.log("✅ CRON JOB COMPLETADO");
    console.log("=".repeat(60));
    console.log(`⏱️  Duración total: ${(results.duration / 1000).toFixed(2)}s`);
    console.log(`📦 Entornos: ${results.environments.success}/${results.environments.total}`);
    console.log(`📱 Apps instaladas: ${results.installedApps.success}/${results.installedApps.total}`);
    console.log(`🐙 Apps GitHub: ${results.applications.success}/${results.applications.total}`);
    
    const totalErrors = results.environments.errors.length + 
                       results.installedApps.errors.length + 
                       results.applications.errors.length;
    
    if (totalErrors > 0) {
      console.log(`⚠️  Total de errores: ${totalErrors}`);
    }
    console.log("=".repeat(60));

    return NextResponse.json({
      success: true,
      message: "Cron job ejecutado exitosamente",
      timestamp: new Date().toISOString(),
      results: {
        environments: {
          total: results.environments.total,
          success: results.environments.success,
          failed: results.environments.failed,
          errors: results.environments.errors,
        },
        installedApps: {
          total: results.installedApps.total,
          success: results.installedApps.success,
          failed: results.installedApps.failed,
          errors: results.installedApps.errors,
        },
        applications: {
          total: results.applications.total,
          created: results.applications.created,
          updated: results.applications.updated,
          skipped: results.applications.skipped,
          failed: results.applications.failed,
          errors: results.applications.errors,
        },
        duration: results.duration,
      },
    });
  } catch (error) {
    console.error("❌ Error crítico en cron job:", error);
    return NextResponse.json(
      {
        error: "Error en cron job",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}

/**
 * Sincroniza aplicaciones desde repositorios de GitHub usando el token admin
 */
async function syncGitHubApplications(githubToken: string) {
  const results = {
    total: 0,
    created: 0,
    updated: 0,
    skipped: 0,
    failed: 0,
    errors: [] as string[],
  };

  try {
    const repos = await getAllUserRepos(githubToken);
    results.total = repos.length;
    console.log(`   Analizando ${repos.length} repositorios...`);

    for (const repo of repos) {
      try {
        const appJsonContent = await getAppJsonFromRepo(
          githubToken,
          repo.owner.login,
          repo.name,
          repo.default_branch
        );

        if (!appJsonContent || !appJsonContent.id || !appJsonContent.name || !appJsonContent.publisher) {
          results.skipped++;
          continue;
        }

        const logoBase64 = await getAppLogoFromRepo(
          githubToken,
          repo.owner.login,
          repo.name,
          repo.default_branch,
          appJsonContent
        );

        const latestRelease = await getLatestRelease(
          githubToken,
          repo.owner.login,
          repo.name
        );

        const existingApp = await prisma.application.findUnique({
          where: { id: appJsonContent.id },
        });

        if (existingApp) {
          await prisma.application.update({
            where: { id: appJsonContent.id },
            data: {
              name: appJsonContent.name,
              publisher: appJsonContent.publisher,
              githubRepoName: repo.name,
              githubUrl: repo.html_url,
              latestReleaseVersion: latestRelease?.version,
              latestReleaseDate: latestRelease?.date,
              logoBase64: logoBase64 || existingApp.logoBase64,
              updatedAt: new Date(),
            },
          });
          results.updated++;
        } else {
          await prisma.application.create({
            data: {
              id: appJsonContent.id,
              name: appJsonContent.name,
              publisher: appJsonContent.publisher,
              githubRepoName: repo.name,
              githubUrl: repo.html_url,
              latestReleaseVersion: latestRelease?.version,
              latestReleaseDate: latestRelease?.date,
              logoBase64: logoBase64,
            },
          });
          results.created++;
        }
      } catch (error) {
        results.failed++;
        const errorMsg = `${repo.name}: ${error instanceof Error ? error.message : 'Error desconocido'}`;
        results.errors.push(errorMsg);
      }
    }

    return results;
  } catch (error) {
    throw error;
  }
}

async function getAllUserRepos(token: string) {
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

    if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
    const repos = await res.json();
    allRepos.push(...repos);
    if (repos.length < perPage) break;
    page++;
  }

  return allRepos;
}

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

      if (res.status === 404) continue;
      if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);

      const data = await res.json();
      if (!data.content) continue;

      const content = Buffer.from(data.content, "base64").toString("utf-8");
      return JSON.parse(content);
    } catch (error) {
      if (path === paths[paths.length - 1]) {
        console.error(`Error leyendo app.json de ${owner}/${repo}:`, error);
      }
    }
  }

  return null;
}

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

    if (!res.ok) return null;

    const fileData = await res.json();
    if (!fileData.content || fileData.type !== "file") return null;

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

    return `data:${mimeType};base64,${base64Content}`;
  } catch (error) {
    return null;
  }
}

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

    if (res.status === 404 || !res.ok) return null;

    const release = await res.json();
    return {
      version: release.tag_name || release.name || "Unknown",
      date: new Date(release.published_at || release.created_at),
    };
  } catch (error) {
    return null;
  }
}
