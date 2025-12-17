import { ReleaseInfo, Commit } from "@/modules/repos/types";

const GITHUB_API_BASE = "/api/github";

/**
 * Obtiene la última release de un repositorio
 */
export async function fetchLatestRelease(
  owner: string,
  repoName: string
): Promise<ReleaseInfo | null> {
  try {
    const res = await fetch(
      `${GITHUB_API_BASE}/latest-release?owner=${owner}&repo=${repoName}`
    );
    
    if (res.ok) {
      const data = await res.json();
      return data.release;
    }
    return null;
  } catch (error) {
    console.error("Error fetching latest release:", error);
    return null;
  }
}

/**
 * Obtiene las releases en batch para múltiples repositorios
 */
export async function fetchBatchReleases(
  repoRequests: Array<{ owner: string; repo: string }>
): Promise<Record<string, { release: ReleaseInfo | null }>> {
  try {
    const res = await fetch(`${GITHUB_API_BASE}/batch-releases`, {
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
    console.error("Error fetching batch releases:", error);
    return {};
  }
}

/**
 * Obtiene los commits entre dos referencias (tags/branches)
 */
export async function fetchCompareCommits(
  owner: string,
  repo: string,
  base: string,
  head: string
): Promise<Commit[]> {
  try {
    const url = `${GITHUB_API_BASE}/compare?owner=${owner}&repo=${repo}&base=${base}&head=${head}`;
    const res = await fetch(url);
    
    if (res.ok) {
      const data = await res.json();
      return data.commits || [];
    }
    return [];
  } catch (error) {
    console.error("Error fetching commits:", error);
    return [];
  }
}
