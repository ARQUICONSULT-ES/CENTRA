import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

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
      console.error("GraphQL errors:", errors);
    }

    if (!data) {
      return {};
    }

    const results: Record<string, { release: ReleaseInfo | null }> = {};

    // Procesar respuesta GraphQL
    Object.keys(data).forEach((alias) => {
      const repoData = data[alias];
      if (repoData && repoData.nameWithOwner) {
        const latestRelease = repoData.latestRelease;
        results[repoData.nameWithOwner] = {
          release: latestRelease
            ? {
                tag_name: latestRelease.tagName,
                name: latestRelease.name || latestRelease.tagName,
                html_url: latestRelease.url,
                published_at: latestRelease.publishedAt,
              }
            : null,
        };
      }
    });

    return results;
  } catch (error) {
    console.error("Error fetching GraphQL releases:", error);
    return {};
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
    console.error("Error fetching batch releases:", error);
    return NextResponse.json(
      { error: "Error al obtener releases" },
      { status: 500 }
    );
  }
}
