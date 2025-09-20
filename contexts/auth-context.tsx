'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

type UserRole = 'admin' | 'citizen'

type AuthContextType = {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error?: Error }>
  signUp: (email: string, password: string, fullName: string, role?: UserRole) => Promise<{ error?: Error }>
  signOut: () => Promise<{ error?: Error }>
  signInWithGoogle: (userType?: UserRole, callbackUrl?: string) => Promise<{ error?: Error }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    
    // Check active sessions and sets the user
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
      
      // Get the current path to prevent unnecessary redirects
      const currentPath = window.location.pathname;
      
      // Handle auth state changes
      if (event === 'SIGNED_IN' && session?.user) {
        const role = session.user.user_metadata?.role || session.user.role || 'citizen';
        
        // Only redirect if not already on a valid route or on auth callback
        if (currentPath === '/auth/callback') {
          // Let the callback page handle the redirect
          return;
        }
        
        // Only redirect if not already on a valid route
        if (role === 'admin' && !currentPath.startsWith('/admin')) {
          router.replace('/admin/dashboard');
        } else if (role === 'citizen' && !currentPath.startsWith('/citizen')) {
          router.replace('/citizen/dashboard');
        }
      } else if (event === 'SIGNED_OUT') {
        // Only redirect if not already on a public route
        if (!['/citizen/login', '/admin/login', '/', '/auth'].includes(currentPath)) {
          router.replace('/');
        }
      }
    });

    // Check active session on initial load
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        setUser(session?.user ?? null);
        
        // Don't handle redirects here for auth callback routes - let the callback page handle them
        // This prevents conflicts during OAuth flows
        const currentPath = window.location.pathname;
        if (currentPath === '/auth/callback') {
          return;
        }
        
        // Handle initial redirect based on session and role for other routes
        if (session?.user) {
          const role = session.user.user_metadata?.role || session.user.role || 'citizen';
          
          // Don't redirect if already on a valid route for the user's role
          if (role === 'admin' && !currentPath.startsWith('/admin')) {
            router.replace('/admin/dashboard');
          } else if ((role === 'citizen' || !role) && !currentPath.startsWith('/citizen') && currentPath !== '/auth') {
            router.replace('/citizen/dashboard');
          }
        }
      } catch (error) {
        console.error('Error getting session:', error);
      } finally {
        setLoading(false);
      }
    };
    
    getSession();

    return () => {
      subscription?.unsubscribe();
    };
  }, [router]);

  const signIn = async (email: string, password: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      return { error: error ? new Error(error.message) : undefined }
    } catch (error) {
      return { error: error as Error }
    }
  }

  const signUp = async (email: string, password: string, fullName: string, role: UserRole = 'citizen') => {
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: role,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      return { error: error ? new Error(error.message) : undefined }
    } catch (error) {
      return { error: error as Error }
    }
  }

  const signOut = async () => {
    try {
      const supabase = createClient()
      
      // Clear all auth-related cookies first
      if (typeof document !== 'undefined') {
        document.cookie = 'sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        document.cookie = 'sb-refresh-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        document.cookie = 'sb-provider-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      }
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      // Force a hard redirect to ensure all state is cleared
      if (typeof window !== 'undefined') {
        window.location.href = '/auth';
        // Prevent any further execution after redirect
        await new Promise(() => {});
      }
      
      return { error: error ? new Error(error.message) : undefined };
    } catch (error) {
      console.error('Error during sign out:', error);
      // Even if there's an error, try to redirect
      if (typeof window !== 'undefined') {
        window.location.href = '/auth';
      }
      return { error: error as Error };
    }
  }
  
  const signInWithGoogle = async (userType: UserRole = 'citizen', callbackUrl?: string) => {
    try {
      const supabase = createClient()
      
      // Use custom redirect URL if provided, otherwise use default
      const redirectTo = callbackUrl || `${window.location.origin}/auth/callback`
      
      console.log('Google OAuth redirect URL:', redirectTo)
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });
      
      if (error) throw error;
      return { error: undefined };
    } catch (error) {
      console.error('Error signing in with Google:', error);
      return { error: error as Error };
    }
  }

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}