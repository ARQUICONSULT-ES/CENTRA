import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getUserRepos } from "@/lib/github";

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

    const repos = await getUserRepos(token);
    return NextResponse.json(repos);
  } catch (error) {
    console.error("Error fetching repos:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch repositories" },
      { status: 500 }
    );
  }
}
