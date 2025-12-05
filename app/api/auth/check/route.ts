import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAuthenticatedUser } from "@/lib/github";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("github_token")?.value;

    if (!token) {
      return NextResponse.json({ authenticated: false });
    }

    // Validate token is still valid
    const user = await getAuthenticatedUser(token);
    
    return NextResponse.json({ 
      authenticated: true,
      user: {
        login: user.login,
        avatar_url: user.avatar_url,
        name: user.name,
      }
    });
  } catch (error) {
    // Token is invalid or expired
    const cookieStore = await cookies();
    cookieStore.delete("github_token");
    
    return NextResponse.json({ authenticated: false });
  }
}
