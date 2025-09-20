import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

const publicRoutes = [
  '/',
  '/auth', // Unified auth page
  '/login', // Keep for backward compatibility
  '/signup', // Keep for backward compatibility
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
  
  // Skip middleware for truly public routes and static assets
  if (pathname === '/' || pathname.startsWith('/_next/') || 
      pathname.startsWith('/api/auth/') || pathname === '/favicon.ico' ||
      pathname.startsWith('/auth/callback')) {
    return NextResponse.next();
  }
  
  try {
    const supabase = createServerClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    
    // If user is authenticated
    if (user && !error) {
      // Get user role with fallback logic
      const role = user?.user_metadata?.role || user?.role || 'citizen';
      
      // Enhanced admin detection - check role first, then email patterns as fallback
      const isAdmin = role === 'admin' || 
                     user?.email?.includes('@admin.') || 
                     user?.email?.includes('@city.gov');
      const actualRole = isAdmin ? 'admin' : 'citizen';
      
      // Redirect authenticated users away from auth pages to their appropriate dashboard
      if (pathname === '/auth' || pathname === '/login' || pathname === '/signup' || 
          pathname === '/admin/login' || pathname === '/admin/signup' || 
          pathname === '/citizen/login' || pathname === '/citizen/signup') {
        const dashboardPath = actualRole === 'admin' ? '/admin/dashboard' : '/citizen/dashboard';
        return NextResponse.redirect(new URL(dashboardPath, request.url));
      }
      
      // Role-based access control for protected routes
      if (pathname.startsWith('/admin') && actualRole !== 'admin') {
        return NextResponse.redirect(new URL('/citizen/dashboard', request.url));
      }
      
      // Allow admins to access citizen routes, but redirect non-citizens/non-admins
      if (pathname.startsWith('/citizen') && actualRole !== 'citizen' && actualRole !== 'admin') {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      }
      
      // Allow access to other routes
      return NextResponse.next();
    }
    
    // If no session or error, handle unauthenticated users
    if (!user || error) {
      // Allow access to auth pages for unauthenticated users
      if (pathname === '/auth' || pathname === '/login' || pathname === '/signup' || 
          pathname === '/admin/login' || pathname === '/admin/signup' || 
          pathname === '/citizen/login' || pathname === '/citizen/signup') {
        return NextResponse.next();
      }
      
      // Redirect unauthenticated users to unified auth page for protected routes
      const redirectUrl = new URL('/auth', request.url);
      if (pathname !== '/') {
        redirectUrl.searchParams.set('redirectedFrom', pathname);
      }
      
      return NextResponse.redirect(redirectUrl);
    }
    
    return NextResponse.next();
  } catch (error) {
    console.error('Middleware error:', error);
    // On error, redirect to home with error parameter
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