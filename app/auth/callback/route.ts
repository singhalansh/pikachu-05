import { createServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/';

  if (code) {
    const supabase = createServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      // Get the user's role after successful authentication
      const { data: { session } } = await supabase.auth.getSession();
      const role = session?.user?.user_metadata?.role || 'citizen';
      
      // Redirect based on role
      const redirectUrl = role === 'admin' 
        ? new URL('/admin/dashboard', request.url)
        : new URL('/citizen/dashboard', request.url);
      
      return NextResponse.redirect(redirectUrl);
    }
  }

  // If there's an error or no code, redirect to home
  return NextResponse.redirect(new URL('/', request.url));
}
