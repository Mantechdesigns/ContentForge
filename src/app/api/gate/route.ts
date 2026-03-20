import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/gate
 * Verifies beta passcode and sets access cookie.
 *
 * Passcode is stored in BETA_PASSCODE env var.
 * Admin passcode is stored in ADMIN_PASSCODE env var.
 */
export async function POST(req: NextRequest) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { passcode } = body as { passcode: string };

  if (!passcode) {
    return NextResponse.json({ error: "Passcode required" }, { status: 400 });
  }

  const betaCode = process.env.BETA_PASSCODE || "contentforge2026";
  const adminCode = process.env.ADMIN_PASSCODE || "cfadmin2026";

  const isBeta = passcode === betaCode;
  const isAdmin = passcode === adminCode;

  if (!isBeta && !isAdmin) {
    return NextResponse.json({ error: "Invalid access code" }, { status: 401 });
  }

  const response = NextResponse.json({ success: true, role: isAdmin ? "admin" : "beta" });

  // Set beta access cookie (30 days)
  response.cookies.set("cf_beta_access", "granted", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: "/",
  });

  // If admin, also set admin cookie
  if (isAdmin) {
    response.cookies.set("cf_admin_access", "granted", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });
  }

  return response;
}
