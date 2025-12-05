import { GitHubRepository, GitHubUser } from "@/types/github";

const GITHUB_API_URL = "https://api.github.com";

/**
 * Obtiene todos los repositorios del usuario autenticado (con paginación)
 */
export async function getUserRepos(token: string): Promise<GitHubRepository[]> {
  const allRepos: GitHubRepository[] = [];
  let page = 1;
  const perPage = 100;

  try {
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

      const repos: GitHubRepository[] = await res.json();
      allRepos.push(...repos);

      // Si recibimos menos de perPage, ya no hay más páginas
      if (repos.length < perPage) {
        break;
      }

      page++;
    }

    return allRepos;
  } catch (error) {
    console.error("Error fetching user repos:", error);
    throw error;
  }
}

/**
 * Obtiene la información del usuario autenticado
 */
export async function getAuthenticatedUser(token: string): Promise<GitHubUser> {
  try {
    const res = await fetch(`${GITHUB_API_URL}/user`, {
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
    }

    return res.json();
  } catch (error) {
    console.error("Error fetching authenticated user:", error);
    throw error;
  }
}

/**
 * Obtiene un repositorio específico
 */
export async function getRepository(token: string, owner: string, repo: string): Promise<GitHubRepository> {
  try {
    const res = await fetch(`${GITHUB_API_URL}/repos/${owner}/${repo}`, {
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
    }

    return res.json();
  } catch (error) {
    console.error("Error fetching repository:", error);
    throw error;
  }
}
