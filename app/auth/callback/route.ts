import { createServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const role = requestUrl.searchParams.get('role');
  const isSignup = requestUrl.searchParams.get('signup') === 'true';
  const next = requestUrl.searchParams.get('next') || '/';

  console.log('Server callback - params:', { code: !!code, role, isSignup });

  if (code) {
    const supabase = createServerClient();
    const { error, data } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error && data?.user) {
      console.log('Session established for user:', data.user.id);
      
      // If this is a signup with a specific role, update the user metadata
      if (isSignup && role && (role === 'admin' || role === 'citizen')) {
        console.log('Updating user role to:', role);
        
        const { error: updateError } = await supabase.auth.updateUser({
          data: { role: role }
        });
        
        if (updateError) {
          console.error('Error updating user role:', updateError);
        } else {
          console.log('Successfully updated user role');
        }
        
        // Redirect to client-side callback with role parameter
        const callbackUrl = new URL('/auth/callback', request.url);
        callbackUrl.searchParams.set('role', role);
        callbackUrl.searchParams.set('updated', 'true');
        
        return NextResponse.redirect(callbackUrl);
      }
      
      // For signin or if role update wasn't needed, redirect to client-side callback
      return NextResponse.redirect(new URL('/auth/callback', request.url));
    }
  }

  // If there's an error or no code, redirect to auth page
  return NextResponse.redirect(new URL('/auth', request.url));
}