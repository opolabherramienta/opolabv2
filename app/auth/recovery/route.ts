import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Password recovery link. Accepts the PKCE code or a recovery token hash
// ({{ .SiteURL }}/auth/recovery?token_hash={{ .TokenHash }}).
// Fixed destinations: never redirect to an untrusted next/returnTo parameter.
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const tokenHash = request.nextUrl.searchParams.get("token_hash");

  if (code || tokenHash) {
    const supabase = await createClient();
    const { error } = code
      ? await supabase.auth.exchangeCodeForSession(code)
      : await supabase.auth.verifyOtp({
          token_hash: tokenHash as string,
          type: "recovery",
        });

    if (!error) {
      return NextResponse.redirect(new URL("/reset-password", request.url));
    }
  }

  return NextResponse.redirect(
    new URL("/forgot-password?enlace=caducado", request.url),
  );
}
