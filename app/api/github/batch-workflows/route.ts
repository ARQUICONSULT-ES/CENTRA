import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

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

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("github_token")?.value;

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

    const CONCURRENCY_LIMIT = 10;
    const results: Record<string, { workflow: WorkflowInfo | null }> = {};

    for (let i = 0; i < repos.length; i += CONCURRENCY_LIMIT) {
      const chunk = repos.slice(i, i + CONCURRENCY_LIMIT);

      const chunkResults = await Promise.all(
        chunk.map(async ({ owner, repo }) => {
          const key = `${owner}/${repo}`;
          const workflow = await fetchWorkflowStatus(token, owner, repo);
          return { key, workflow };
        })
      );

      for (const { key, workflow } of chunkResults) {
        results[key] = { workflow };
      }
    }

    return NextResponse.json({ data: results });
  } catch (error) {
    console.error("Error fetching batch workflows:", error);
    return NextResponse.json(
      { error: "Error al obtener workflows" },
      { status: 500 }
    );
  }
}
