import { NextRequest, NextResponse } from "next/server";
import { getPullRequests } from "@/lib/github";

export async function GET(req: NextRequest) {
  try {
    // Obtener token admin de las variables de entorno
    const token = process.env.GITHUB_ADMIN_TOKEN;

    if (!token) {
      console.error("[API] GITHUB_ADMIN_TOKEN no configurado");
      return NextResponse.json(
        { error: "GITHUB_ADMIN_TOKEN no configurado en el servidor" },
        { status: 500 }
      );
    }

    // Obtener parámetros de la URL
    const { searchParams } = new URL(req.url);
    const owner = searchParams.get("owner");
    const repo = searchParams.get("repo");

    console.log(`[API] Request for PRs - Owner: ${owner}, Repo: ${repo}`);

    if (!owner || !repo) {
      return NextResponse.json(
        { error: "Se requieren los parámetros 'owner' y 'repo'" },
        { status: 400 }
      );
    }

    const pullRequests = await getPullRequests(token, owner, repo);
    console.log(`[API] Returning ${pullRequests.length} PRs`);
    return NextResponse.json(pullRequests);
  } catch (error) {
    console.error("Error fetching pull requests:", error);
    return NextResponse.json(
      { error: "Error al obtener pull requests" },
      { status: 500 }
    );
  }
}
