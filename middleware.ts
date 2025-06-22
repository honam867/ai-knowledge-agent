import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define protected and public routes
const protectedRoutes = ["/dashboard", "/profile"];
const publicRoutes = ["/auth/signin", "/auth/signup", "/auth/callback"];
const authRoutes = ["/auth/signin", "/auth/signup"];

// Helper function to check if token exists and is not expired
function isValidToken(token: string | undefined): boolean {
  if (!token) return false;

  try {
    // Decode JWT payload (simple base64 decode for expiration check)
    const payload = JSON.parse(atob(token.split(".")[1]));
    const currentTime = Math.floor(Date.now() / 1000);

    // Check if token is expired
    return payload.exp && payload.exp > currentTime;
  } catch (error) {
    // If token can't be decoded, it's invalid
    return false;
  }
}

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // Get token from cookies (for server-side) or check for auth_token in headers
  const token =
    request.cookies.get("auth_token")?.value ||
    request.headers.get("authorization")?.replace("Bearer ", "");

  const isAuthenticated = isValidToken(token);

  // Check if this is a Google OAuth callback (has 'code' parameter)
  const isOAuthCallback = searchParams.has("code");
  console.log("❤️ ~ middleware ~ isOAuthCallback:", isOAuthCallback);

  // Handle protected routes
  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    if (!isAuthenticated && !isOAuthCallback) {
      // Only redirect to signin if not authenticated AND not an OAuth callback
      const signInUrl = new URL("/auth/signin", request.url);
      signInUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(signInUrl);
    }
  }

  // Handle auth routes (redirect if already authenticated)
  if (authRoutes.some((route) => pathname.startsWith(route))) {
    if (isAuthenticated) {
      // Redirect to dashboard if already authenticated
      const dashboardUrl = new URL("/dashboard", request.url);
      return NextResponse.redirect(dashboardUrl);
    }
  }

  // Handle OAuth callback route - always allow access
  if (pathname.startsWith("/auth/callback")) {
    return NextResponse.next();
  }

  // For all other routes, continue normally
  return NextResponse.next();
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
