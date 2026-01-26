import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserGitHubToken } from "@/lib/auth-github";

const GITHUB_API_URL = "https://api.github.com";

interface RepoRequest {
  owner: string;
  repo: string;
}

interface WorkflowInfo {
  status: "queued" | "in_progress" | "completed";
  conclusion: "success" | "failure" | "cancelled" | "skipped" | null;
  html_url: string;
}

interface ReleaseInfo {
  tag_name: string;
  name: string;
  html_url: string;
  published_at: string;
}

interface RepoInfo {
  workflow: WorkflowInfo | null;
  release: ReleaseInfo | null;
  prerelease: ReleaseInfo | null;
  openPRCount: number;
  branchCount: number;
}

// Función para obtener el estado del workflow de un repo
async function fetchWorkflowStatus(
  token: string,
  owner: string,
  repo: string
): Promise<WorkflowInfo | null> {
  try {
    const res = await fetch(
      `${GITHUB_API_URL}/repos/${owner}/${repo}/actions/workflows/CICD.yaml/runs?per_page=1&page=1`,
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

    const data = await res.json();

    if (data.workflow_runs && data.workflow_runs.length > 0) {
      const latestRun = data.workflow_runs[0];
      return {
        status: latestRun.status,
        conclusion: latestRun.conclusion,
        html_url: latestRun.html_url,
      };
    }

    return null;
  } catch {
    return null;
  }
}

// Función para obtener el número de PRs abiertos
async function fetchOpenPRCount(
  token: string,
  owner: string,
  repo: string
): Promise<number> {
  try {
    const res = await fetch(
      `${GITHUB_API_URL}/repos/${owner}/${repo}/pulls?state=open&per_page=1`,
      {
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github.v3+json",
        },
        cache: "no-store",
      }
    );

    if (!res.ok) {
      return 0;
    }

    // GitHub devuelve el total en el header Link
    const linkHeader = res.headers.get("link");
    if (linkHeader) {
      const match = linkHeader.match(/page=(\d+)>; rel="last"/);
      if (match) {
        return parseInt(match[1], 10);
      }
    }

    // Si no hay paginación, contar los elementos del array
    const data = await res.json();
    return data.length;
  } catch {
    return 0;
  }
}

// Función para obtener el número de branches
async function fetchBranchCount(
  token: string,
  owner: string,
  repo: string
): Promise<number> {
  try {
    const res = await fetch(
      `${GITHUB_API_URL}/repos/${owner}/${repo}/branches?per_page=1`,
      {
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github.v3+json",
        },
        cache: "no-store",
      }
    );

    if (!res.ok) {
      return 0;
    }

    // GitHub devuelve el total en el header Link
    const linkHeader = res.headers.get("link");
    if (linkHeader) {
      const match = linkHeader.match(/page=(\d+)>; rel="last"/);
      if (match) {
        return parseInt(match[1], 10);
      }
    }

    // Si no hay paginación, contar los elementos del array
    const data = await res.json();
    return data.length;
  } catch {
    return 0;
  }
}

// Función para obtener la última release de un repo
async function fetchLatestRelease(
  token: string,
  owner: string,
  repo: string
): Promise<ReleaseInfo | null> {
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

    if (!res.ok) {
      return null;
    }

    const data = await res.json();

    return {
      tag_name: data.tag_name,
      name: data.name,
      html_url: data.html_url,
      published_at: data.published_at,
    };
  } catch {
    return null;
  }
}

// Función para obtener la última prerelease de un repo
async function fetchLatestPrerelease(
  token: string,
  owner: string,
  repo: string
): Promise<ReleaseInfo | null> {
  try {
    const res = await fetch(
      `${GITHUB_API_URL}/repos/${owner}/${repo}/releases?per_page=1`,
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

    const data = await res.json();

    // Buscar la primera prerelease
    const prerelease = data.find((r: any) => r.prerelease === true);

    if (!prerelease) {
      return null;
    }

    return {
      tag_name: prerelease.tag_name,
      name: prerelease.name,
      html_url: prerelease.html_url,
      published_at: prerelease.published_at,
    };
  } catch {
    return null;
  }
}

// POST: Recibe lista de repos y devuelve info en batch
export async function POST(request: NextRequest) {
  const token = await getAuthenticatedUserGitHubToken();

  if (!token) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const repos: RepoRequest[] = body.repos;

    if (!repos || !Array.isArray(repos) || repos.length === 0) {
      return NextResponse.json(
        { error: "Se requiere una lista de repositorios" },
        { status: 400 }
      );
    }

    // Limitar a 100 repos por petición para evitar timeout
    const limitedRepos = repos.slice(0, 100);

    // Procesar todos los repos en paralelo con concurrencia limitada
    const CONCURRENCY_LIMIT = 10;
    const results: Record<string, RepoInfo> = {};

    // Procesar en chunks para limitar la concurrencia
    for (let i = 0; i < limitedRepos.length; i += CONCURRENCY_LIMIT) {
      const chunk = limitedRepos.slice(i, i + CONCURRENCY_LIMIT);

      const chunkResults = await Promise.all(
        chunk.map(async ({ owner, repo }) => {
          const key = `${owner}/${repo}`;

          // Ejecutar todas las llamadas en paralelo para cada repo
          const [workflow, release, prerelease, openPRCount, branchCount] = await Promise.all([
            fetchWorkflowStatus(token, owner, repo),
            fetchLatestRelease(token, owner, repo),
            fetchLatestPrerelease(token, owner, repo),
            fetchOpenPRCount(token, owner, repo),
            fetchBranchCount(token, owner, repo),
          ]);

          return { key, workflow, release, prerelease, openPRCount, branchCount };
        })
      );

      // Agregar resultados al objeto
      for (const { key, workflow, release, prerelease, openPRCount, branchCount } of chunkResults) {
        results[key] = { workflow, release, prerelease, openPRCount, branchCount };
      }
    }

    return NextResponse.json({ data: results });
  } catch (error) {
    console.error("Error fetching batch info:", error);
    return NextResponse.json(
      { error: "Error al obtener información en batch" },
      { status: 500 }
    );
  }
}
