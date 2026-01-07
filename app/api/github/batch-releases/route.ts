import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserGitHubToken } from "@/lib/auth-github";

const GITHUB_GRAPHQL_URL = "https://api.github.com/graphql";

interface RepoRequest {
  owner: string;
  repo: string;
}

interface ReleaseInfo {
  tag_name: string;
  name: string;
  html_url: string;
  published_at: string;
}

// Construir query GraphQL para múltiples repos
function buildGraphQLQuery(repos: RepoRequest[]): string {
  const repoQueries = repos.map((repo, index) => {
    const alias = `repo${index}`;
    return `
      ${alias}: repository(owner: "${repo.owner}", name: "${repo.repo}") {
        nameWithOwner
        latestRelease {
          tagName
          name
          url
          publishedAt
        }
      }
    `;
  }).join('\n');

  return `
    query {
      ${repoQueries}
    }
  `;
}

async function fetchReleasesGraphQL(
  token: string,
  repos: RepoRequest[]
): Promise<Record<string, { release: ReleaseInfo | null }>> {
  try {
    const query = buildGraphQLQuery(repos);
    
    const res = await fetch(GITHUB_GRAPHQL_URL, {
      method: "POST",
      headers: {
        Authorization: `bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    });

    if (!res.ok) {
      console.error("GraphQL API error:", res.status, res.statusText);
      return {};
    }

    const { data, errors } = await res.json();

    if (errors) {
      console.error("GraphQL errors:", JSON.stringify(errors, null, 2));
    }

    if (!data) {
      console.log("[batch-releases] No data returned from GraphQL");
      return {};
    }

    console.log(`[batch-releases] Processing ${Object.keys(data).length} repositories`);

    const results: Record<string, { release: ReleaseInfo | null }> = {};

    // Procesar respuesta GraphQL
    Object.keys(data).forEach((alias) => {
      const repoData = data[alias];
      if (repoData && repoData.nameWithOwner) {
        const latestRelease = repoData.latestRelease;
        const releaseData = latestRelease
          ? {
              tag_name: latestRelease.tagName,
              name: latestRelease.name || latestRelease.tagName,
              html_url: latestRelease.url,
              published_at: latestRelease.publishedAt,
            }
          : null;
        
        results[repoData.nameWithOwner] = {
          release: releaseData,
        };
        
        // Log para depuración
        if (latestRelease) {
          console.log(`[batch-releases] ${repoData.nameWithOwner}: ${latestRelease.tagName}`);
        } else {
          console.log(`[batch-releases] ${repoData.nameWithOwner}: No release`);
        }
      }
    });

    console.log(`[batch-releases] Returning ${Object.keys(results).length} results`);
    return results;
  } catch (error) {
    console.error("Error fetching GraphQL releases:", error);
    return {};
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = await getAuthenticatedUserGitHubToken();

    if (!token) {
      return NextResponse.json({ error: "Token de GitHub no configurado" }, { status: 401 });
    }

    const body = await request.json();
    const repos: RepoRequest[] = body.repos;

    if (!repos || !Array.isArray(repos) || repos.length === 0) {
      return NextResponse.json(
        { error: "Se requiere una lista de repositorios" },
        { status: 400 }
      );
    }

    // Dividir en chunks de 50 repos y ejecutar en paralelo
    const CHUNK_SIZE = 50;
    const chunks: RepoRequest[][] = [];
    
    for (let i = 0; i < repos.length; i += CHUNK_SIZE) {
      chunks.push(repos.slice(i, i + CHUNK_SIZE));
    }

    // Ejecutar todas las queries GraphQL en paralelo
    const chunkResults = await Promise.all(
      chunks.map(chunk => fetchReleasesGraphQL(token, chunk))
    );

    // Combinar todos los resultados
    const allResults: Record<string, { release: ReleaseInfo | null }> = {};
    chunkResults.forEach(result => {
      Object.assign(allResults, result);
    });

    return NextResponse.json({ data: allResults });
  } catch (error) {
    if (error instanceof Error && error.message === "Usuario no autenticado") {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }
    console.error("Error fetching batch releases:", error);
    return NextResponse.json(
      { error: "Error al obtener releases" },
      { status: 500 }
    );
  }
}
