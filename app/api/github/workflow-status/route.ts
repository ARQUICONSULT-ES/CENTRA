import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserGitHubToken } from "@/lib/auth-github";

const GITHUB_API_URL = "https://api.github.com";

export async function GET(request: NextRequest) {
  const token = await getAuthenticatedUserGitHubToken();

  if (!token) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const owner = searchParams.get("owner");
  const repo = searchParams.get("repo");
  const workflow = searchParams.get("workflow") || "CICD.yaml";

  if (!owner || !repo) {
    return NextResponse.json(
      { error: "Faltan parámetros owner y repo" },
      { status: 400 }
    );
  }

  try {
    const res = await fetch(
      `${GITHUB_API_URL}/repos/${owner}/${repo}/actions/workflows/${workflow}/runs?per_page=1&page=1`,
      {
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github.v3+json",
        },
        cache: "no-store",
      }
    );

    if (!res.ok) {
      // Si el workflow no existe, retornamos null
      if (res.status === 404) {
        return NextResponse.json({ workflow: null });
      }
      throw new Error(`GitHub API error: ${res.status}`);
    }

    const data = await res.json();

    if (data.workflow_runs && data.workflow_runs.length > 0) {
      const latestRun = data.workflow_runs[0];
      return NextResponse.json({
        workflow: {
          status: latestRun.status, // 'queued', 'in_progress', 'completed'
          conclusion: latestRun.conclusion, // 'success', 'failure', 'cancelled', null (if in progress)
          html_url: latestRun.html_url,
        },
      });
    }

    return NextResponse.json({ workflow: null });
  } catch (error) {
    console.error("Error fetching workflow status:", error);
    return NextResponse.json(
      { error: "Error al obtener estado del workflow" },
      { status: 500 }
    );
  }
}
