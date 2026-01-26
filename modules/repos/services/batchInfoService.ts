import { RepoExtraInfo } from "@/modules/repos/types";

const GITHUB_API_BASE = "/api/github";

/**
 * Obtiene toda la información (workflow, release, PRs, branches) en batch para múltiples repositorios
 */
export async function fetchBatchRepoInfo(
  repoRequests: Array<{ owner: string; repo: string }>
): Promise<Record<string, RepoExtraInfo>> {
  try {
    const res = await fetch(`${GITHUB_API_BASE}/batch-info`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ repos: repoRequests }),
    });

    if (res.ok) {
      const data = await res.json();
      return data.data;
    }
    return {};
  } catch (error) {
    console.error("Error fetching batch repo info:", error);
    return {};
  }
}
