import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// For the email confirmation template using .TokenHash (see the local runbook).
export async function GET(request: NextRequest) {
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  if (tokenHash) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: "email" });
    if (!error) return NextResponse.redirect(new URL("/onboarding", request.url));
  }
  return NextResponse.redirect(new URL("/login?confirmation=failed", request.url));
}
