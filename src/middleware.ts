import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Route Classification for Content Forge
 * ─────────────────────────────────────────
 * MVP_ROUTES:    Active in beta, accessible to authenticated beta users
 * LOCKED_ROUTES: Built but gated behind feature flags / Pro tier
 * ADMIN_ROUTES:  Internal only, requires admin claim
 * PUBLIC_ROUTES: Always accessible (gate page, API routes)
 */

const MVP_ROUTES = [
  "/",                    // Dashboard
  "/research",            // Research Engine
  "/research/viral",      // Viral Intelligence
  "/research/breakdown",  // Video Breakdown
  "/scripts",             // Script Generator
  "/production",          // Video Production (core HeyGen path)
  "/profile",             // Brand Profile
  "/frameworks",          // Content Frameworks
  "/settings",            // Settings & API Keys
];

const LOCKED_ROUTES = [
  "/production/scenes",   // Scene Editor (Pro)
  "/cinematic",           // Cinematic Studio (Pro)
  "/autopilot",           // AutoPilot suite
  "/autopilot/research",
  "/autopilot/queue",
  "/autopilot/schedule",
  "/autopilot/analytics",
  "/extension",           // Chrome Extension (Pro)
  "/assets",              // Asset Library (Pro)
];

const ADMIN_ROUTES = [
  "/openclaw",            // OpenClaw Agent Dashboard
  "/openclaw/skills",     // Skills Hub
  "/openclaw/produce",    // AI Producer
  "/openclaw/content",    // Content Vault
  "/openclaw/logs",       // Activity Log
];

const PUBLIC_ROUTES = [
  "/gate",                // Beta access gate
  "/api",                 // All API routes
  "/_next",               // Next.js internals
  "/favicon.ico",
];

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((r) => pathname.startsWith(r));
}

function isLockedRoute(pathname: string): boolean {
  return LOCKED_ROUTES.some((r) => pathname === r || pathname.startsWith(r + "/"));
}

function isAdminRoute(pathname: string): boolean {
  return ADMIN_ROUTES.some((r) => pathname === r || pathname.startsWith(r + "/"));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always allow public routes (gate page, API, static assets)
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Check beta access cookie
  const betaAccess = request.cookies.get("cf_beta_access")?.value;
  const isAuthenticated = betaAccess === "granted";

  // Not authenticated → redirect to gate
  if (!isAuthenticated) {
    const gateUrl = new URL("/gate", request.url);
    gateUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(gateUrl);
  }

  // Check admin access for admin routes
  if (isAdminRoute(pathname)) {
    const adminAccess = request.cookies.get("cf_admin_access")?.value;
    if (adminAccess !== "granted") {
      // Redirect to dashboard with a message
      const dashUrl = new URL("/", request.url);
      dashUrl.searchParams.set("locked", "admin");
      return NextResponse.redirect(dashUrl);
    }
  }

  // Locked routes → redirect to dashboard with locked flag
  if (isLockedRoute(pathname)) {
    const dashUrl = new URL("/", request.url);
    dashUrl.searchParams.set("locked", "pro");
    return NextResponse.redirect(dashUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public files (images, svgs)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
