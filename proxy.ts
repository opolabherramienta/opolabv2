import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const privatePaths = [
  "/onboarding",
  "/dashboard",
  "/temas",
  "/practicos",
  "/calendario",
  "/progreso",
  "/sugerencias",
  "/ajustes",
  "/admin",
];

const authPaths = ["/login", "/register"];

function matchesPath(pathname: string, paths: string[]) {
  return paths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isPrivatePath = matchesPath(pathname, privatePaths);
  const isAuthPath = matchesPath(pathname, authPaths);

  if (isPrivatePath && !user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  if (isAuthPath && user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/dashboard";
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: [
    "/login",
    "/register",
    "/onboarding/:path*",
    "/dashboard/:path*",
    "/temas/:path*",
    "/practicos/:path*",
    "/calendario/:path*",
    "/progreso/:path*",
    "/sugerencias/:path*",
    "/ajustes/:path*",
    "/admin/:path*",
  ],
};
