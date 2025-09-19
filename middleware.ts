import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

const publicRoutes = [
  '/',
  '/admin/login',
  '/admin/signup',
  '/citizen/login',
  '/citizen/signup',
  '/auth/callback',
  '/api/auth',
  '/_next',
  '/favicon.ico',
];

const isPublicRoute = (pathname: string) => {
  return publicRoutes.some(route => 
    pathname === route || 
    pathname.startsWith(`${route}/`) ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/auth/')
  );
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for public routes
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  try {
    const supabase = createServerClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    
    // If no session and trying to access protected routes
    if (!user || error) {
      const loginUrl = pathname.startsWith('/admin') 
        ? '/admin/login' 
        : '/citizen/login';
      
      const redirectUrl = new URL(loginUrl, request.url);
      // Add the current path as a query parameter for redirecting back after login
      if (pathname !== '/') {
        redirectUrl.searchParams.set('redirectedFrom', pathname);
      }
      
      return NextResponse.redirect(redirectUrl);
    }
    
    // Check user role
    const role = user?.user_metadata?.role || 'citizen'; // Default to citizen
    
    // Redirect to appropriate dashboard if already logged in and trying to access login pages
    if (pathname === '/admin/login' || pathname === '/citizen/login') {
      const dashboardPath = role === 'admin' ? '/admin/dashboard' : '/citizen/dashboard';
      return NextResponse.redirect(new URL(dashboardPath, request.url));
    }
    
    // Role-based access control
    if (pathname.startsWith('/admin') && role !== 'admin') {
      return NextResponse.redirect(new URL('/citizen/dashboard', request.url));
    }
    
    // Allow admins to access citizen routes, but redirect citizens trying to access admin routes
    if (pathname.startsWith('/citizen') && role !== 'citizen' && role !== 'admin') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
    
    return NextResponse.next();
  } catch (error) {
    console.error('Middleware error:', error);
    // On error, redirect to home with error message
    const redirectUrl = new URL('/', request.url);
    redirectUrl.searchParams.set('error', 'authentication_error');
    return NextResponse.redirect(redirectUrl);
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
