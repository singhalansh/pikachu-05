import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
    // Skip auth checks for login and signup pages to prevent redirect loops
    const publicPaths = [
        "/admin/login",
        "/admin/signup",
        "/citizen/login",
        "/citizen/signup"
    ];
    if (publicPaths.some((path) => request.nextUrl.pathname.startsWith(path))) {
        return NextResponse.next();
    }
    // Debug: log incoming cookies and token
    console.log('[MIDDLEWARE] Cookies:', request.cookies);
    const debugToken = request.cookies.get("sb-access-token")?.value || request.cookies.get("auth-token")?.value;
    console.log('[MIDDLEWARE] Access Token:', debugToken);

    // Get the session from cookies (accept sb-access-token or auth-token)
    const accessToken = request.cookies.get("sb-access-token")?.value || request.cookies.get("auth-token")?.value;
    if (!accessToken) {
        // Not logged in, redirect for protected sections
        if (request.nextUrl.pathname.startsWith("/admin")) {
            return NextResponse.redirect(new URL("/admin/login", request.url));
        }
        if (request.nextUrl.pathname.startsWith("/citizen")) {
            return NextResponse.next(); // allow citizen pages to load; app can guard client-side if needed
        }
        return NextResponse.next();
    }

    // Validate by decoding JWT claims (no verification) to read role
    let role: string | undefined;
    let email: string | undefined;
    try {
        const { decodeJwt } = await import('jose');
        const claims = decodeJwt(accessToken);
        // Supabase JWT typically contains role info either at top-level `role`
        // or under `user_metadata.role`
        role = (claims as any)?.user_metadata?.role || (claims as any)?.role;
        email = (claims as any)?.email;
    } catch (e) {
        // If token cannot be decoded, treat as unauthenticated
        if (request.nextUrl.pathname.startsWith("/admin")) {
            return NextResponse.redirect(new URL("/admin/login", request.url));
        }
        if (request.nextUrl.pathname.startsWith("/citizen")) {
            return NextResponse.redirect(new URL("/citizen/login", request.url));
        }
        return NextResponse.next();
    }

    // Role-based protection using decoded role; allow cookie override
    // Admin allowlist fallback via env
    const allowedEmails = (process.env.ADMIN_EMAILS || "")
        .split(",")
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean);
    const allowedDomain = (process.env.ADMIN_EMAIL_DOMAIN || "").trim().toLowerCase();
    const isEmailAllowed = email
        ? allowedEmails.includes(email.toLowerCase()) ||
          (allowedDomain && email.toLowerCase().endsWith(`@${allowedDomain}`))
        : false;
    const appRoleCookie = request.cookies.get("app-role")?.value;
    const effectiveRole = appRoleCookie || role;

    console.log('[MIDDLEWARE] Decoded identity:', { email, role: effectiveRole, isEmailAllowed });
    if (request.nextUrl.pathname.startsWith("/admin") && effectiveRole !== "admin" && !isEmailAllowed) {
        return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    // Citizen area: only require a valid session, not a strict role match
    // This avoids blocking users whose role metadata isn't set yet
    // All good, continue
    return NextResponse.next();
}
