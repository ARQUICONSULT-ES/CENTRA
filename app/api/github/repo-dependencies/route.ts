import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const GITHUB_API_URL = "https://api.github.com";

interface AppDependencyProbingPath {
  repo: string;
  version: string;
  release_status: string;
  authTokenSecret?: string;
  projects?: string;
}

interface FileDependency {
  name: string;
  path: string;
  sha: string;
  size: number;
}

interface RepoDependencies {
  repoFullName: string;
  repoDependencies: AppDependencyProbingPath[];
  fileDependencies: FileDependency[];
  error?: string;
}

// Obtiene las dependencias de un repositorio específico
async function getRepoDependencies(
  token: string,
  owner: string,
  repo: string,
  ref: string = "main"
): Promise<RepoDependencies> {
  const result: RepoDependencies = {
    repoFullName: `${owner}/${repo}`,
    repoDependencies: [],
    fileDependencies: [],
  };

  try {
    // Obtener settings.json
    const settingsRes = await fetch(
      `${GITHUB_API_URL}/repos/${owner}/${repo}/contents/.AL-Go/settings.json?ref=${ref}`,
      {
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github.v3+json",
        },
        cache: "no-store",
      }
    );

    if (settingsRes.ok) {
      const settingsData = await settingsRes.json();
      if (settingsData.content) {
        const content = Buffer.from(settingsData.content, "base64").toString("utf-8");
        try {
          const settings = JSON.parse(content);
          if (settings.appDependencyProbingPaths) {
            result.repoDependencies = settings.appDependencyProbingPaths;
          }
        } catch {
          // Error parsing JSON, ignorar
        }
      }
    }

    // Obtener archivos de /dependencies
    const depsRes = await fetch(
      `${GITHUB_API_URL}/repos/${owner}/${repo}/contents/dependencies?ref=${ref}`,
      {
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github.v3+json",
        },
        cache: "no-store",
      }
    );

    if (depsRes.ok) {
      const depsData = await depsRes.json();
      if (Array.isArray(depsData)) {
        result.fileDependencies = depsData
          .filter((item: { type: string; name: string }) => 
            item.type === "file" && item.name.endsWith(".app")
          )
          .map((file: { name: string; path: string; sha: string; size: number }) => ({
            name: file.name,
            path: file.path,
            sha: file.sha,
            size: file.size,
          }));
      }
    }
  } catch (error) {
    result.error = error instanceof Error ? error.message : "Unknown error";
  }

  return result;
}

// Extrae owner y repo de una URL de GitHub
function parseRepoUrl(repoUrl: string): { owner: string; repo: string } | null {
  const match = repoUrl.match(/github\.com\/([^/]+)\/([^/@]+)/);
  if (match) {
    return { owner: match[1], repo: match[2] };
  }
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("github_token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "No GitHub token found. Please login first." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { repoUrls, ref = "main" } = body;

    if (!repoUrls || !Array.isArray(repoUrls) || repoUrls.length === 0) {
      return NextResponse.json(
        { error: "Missing required parameter: repoUrls (array of GitHub repository URLs)" },
        { status: 400 }
      );
    }

    const results: RepoDependencies[] = [];
    const processedRepos = new Set<string>();
    const reposToProcess: string[] = [...repoUrls];

    // Procesar recursivamente
    while (reposToProcess.length > 0) {
      const repoUrl = reposToProcess.shift()!;
      const parsed = parseRepoUrl(repoUrl);
      
      if (!parsed) {
        continue;
      }

      const fullName = `${parsed.owner}/${parsed.repo}`;
      
      if (processedRepos.has(fullName)) {
        continue;
      }
      
      processedRepos.add(fullName);
      
      const dependencies = await getRepoDependencies(token, parsed.owner, parsed.repo, ref);
      results.push(dependencies);

      // Añadir las dependencias de repositorio encontradas a la cola para procesarlas
      for (const dep of dependencies.repoDependencies) {
        const depParsed = parseRepoUrl(dep.repo);
        if (depParsed) {
          const depFullName = `${depParsed.owner}/${depParsed.repo}`;
          if (!processedRepos.has(depFullName)) {
            reposToProcess.push(dep.repo);
          }
        }
      }
    }

    return NextResponse.json({ dependencies: results });
  } catch (error) {
    console.error("Error fetching repo dependencies:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch repo dependencies" },
      { status: 500 }
    );
  }
}

// GET para obtener dependencias de un solo repositorio
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("github_token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "No GitHub token found. Please login first." },
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

    const dependencies = await getRepoDependencies(token, owner, repo, ref);
    return NextResponse.json(dependencies);
  } catch (error) {
    console.error("Error fetching repo dependencies:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch repo dependencies" },
      { status: 500 }
    );
  }
}
