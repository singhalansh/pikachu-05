import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { access_token, refresh_token } = await request.json();
  if (!access_token) {
    return NextResponse.json({ error: "Missing access_token" }, { status: 400 });
  }
  const response = NextResponse.json({ success: true });
  response.cookies.set("sb-access-token", access_token, {
    httpOnly: true,
    secure: false, // Always false for localhost/dev
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
  });
  try {
    const { decodeJwt } = await import("jose");
    const claims = decodeJwt(access_token) as any;
    const role = claims?.user_metadata?.role || claims?.role;
    if (role) {
      response.cookies.set("app-role", String(role), {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24,
      });
    }
  } catch {}
  if (refresh_token) {
    response.cookies.set("sb-refresh-token", refresh_token, {
      httpOnly: true,
      secure: false, // Always false for localhost/dev
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });
  }
  return response;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const access_token = searchParams.get('access_token');
  const refresh_token = searchParams.get('refresh_token');
  const redirect = searchParams.get('redirect') || '/citizen/dashboard';
  if (!access_token) {
    return NextResponse.json({ error: "Missing access_token" }, { status: 400 });
  }
  const absoluteRedirect = new URL(redirect, request.url);
  const response = NextResponse.redirect(absoluteRedirect);
  response.cookies.set("sb-access-token", access_token, {
    httpOnly: true,
    secure: false, // Always false for localhost/dev
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
  });
  try {
    const { decodeJwt } = await import("jose");
    const claims = decodeJwt(access_token) as any;
    const role = claims?.user_metadata?.role || claims?.role;
    if (role) {
      response.cookies.set("app-role", String(role), {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24,
      });
    }
  } catch {}
  if (refresh_token) {
    response.cookies.set("sb-refresh-token", refresh_token, {
      httpOnly: true,
      secure: false, // Always false for localhost/dev
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });
  }
  return response;
}
