"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // console.log('Auth callback page loaded');
        const roleParam = searchParams.get('role');
        const wasUpdated = searchParams.get('updated') === 'true';
        
        console.log('Callback params:', { roleParam, wasUpdated });
        
        // Wait a bit for the session to be established
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const supabase = createClient();
        
        // Get the current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        console.log('Session data:', { 
          hasSession: !!session, 
          error: sessionError, 
          userId: session?.user?.id,
          userEmail: session?.user?.email,
          userMetadata: session?.user?.user_metadata 
        });
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          throw new Error("Failed to get session");
        }

        if (!session) {
          console.log('No session found, redirecting to auth');
          router.replace('/auth');
          return;
        }

        // Get the role from user metadata
        let userRole = session.user.user_metadata?.role;
        console.log('User role from metadata:', userRole);
        
        // If no role in metadata but we have a role param (fallback for edge cases)
        if (!userRole && roleParam) {
          console.log('No role in metadata, using role param:', roleParam);
          userRole = roleParam;
          
          // Try to update the metadata as a fallback
          const { error: updateError } = await supabase.auth.updateUser({
            data: { role: roleParam }
          });
          
          if (updateError) {
            console.error('Fallback role update failed:', updateError);
          } else {
            console.log('Fallback role update succeeded');
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }
        
        // Default to citizen if still no role
        if (!userRole) {
          console.log('No role found, defaulting to citizen');
          userRole = 'citizen';
        }

        // Clear any stored role from localStorage (cleanup)
        localStorage.removeItem('pendingGoogleSignupRole');

        // Redirect based on final role (staff roles go to admin dashboard, citizens go to citizen dashboard)
        const dashboardPath = userRole !== 'citizen' ? '/admin/dashboard' : '/citizen/dashboard';
        // console.log('Final role:', userRole, 'Redirecting to:', dashboardPath);
        
        router.replace(dashboardPath);
        
      } catch (err) {
        console.error('Auth callback error:', err);
        setError(err instanceof Error ? err.message : 'Authentication failed');
        setIsProcessing(false);
        
        // Redirect to auth page after a delay
        setTimeout(() => {
          router.replace('/auth');
        }, 3000);
      }
    };

    handleAuthCallback();
  }, [router, searchParams]);

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-red-600">Authentication Error</h2>
          <p className="text-muted-foreground mt-2">{error}</p>
          <p className="text-sm text-muted-foreground mt-4">Redirecting to login page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <h2 className="text-lg font-semibold">Completing authentication...</h2>
        <p className="text-muted-foreground mt-2">Please wait while we set up your account.</p>
      </div>
    </div>
  );
}