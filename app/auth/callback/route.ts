import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Optional PKCE callback, when configured as the Auth redirect URL.
// Fixed destination: never redirect to an untrusted next/returnTo parameter.
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL("/onboarding", request.url));
  }
  return NextResponse.redirect(new URL("/login?confirmation=failed", request.url));
}
