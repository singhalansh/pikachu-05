"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Shield, Mail, Lock, Eye, EyeOff, User } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"

export default function AdminSignupPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    // Handle OAuth callback tokens and set cookies, then redirect
    if (typeof window !== 'undefined' && window.location.hash.includes('access_token=')) {
      const params = new URLSearchParams(window.location.hash.substring(1))
      const accessToken = params.get('access_token')
      const refreshToken = params.get('refresh_token')
      if (accessToken) {
        window.location.href = `/api/auth/set-token?access_token=${encodeURIComponent(accessToken)}${refreshToken ? `&refresh_token=${encodeURIComponent(refreshToken)}` : ''}&redirect=/admin/signup`
      }
    }
  }, [])

  useEffect(() => {
    // If already signed in (cookies set), ensure role is admin, refresh session, and redirect
    const run = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      if ((user.user_metadata as any)?.role !== "admin") {
        await supabase.auth.updateUser({ data: { role: "admin", name } })
        const { data: refreshed } = await supabase.auth.refreshSession()
        if (refreshed?.session?.access_token) {
          await fetch("/api/auth/set-token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              access_token: refreshed.session.access_token,
              refresh_token: refreshed.session.refresh_token,
            }),
          })
        }
      }
      router.push("/admin/dashboard")
    }
    run().catch(() => {})
  }, [name, router])

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    const supabase = createClient()
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name, role: "admin" },
          emailRedirectTo: `${window.location.origin}/admin/login`,
        },
      })
      if (error) throw error

      if (data.session?.access_token) {
        await fetch("/api/auth/set-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
          }),
        })
        toast({ title: "Sign up successful", description: "Redirecting to admin dashboard..." })
        router.push("/admin/dashboard")
        return
      }

      toast({
        title: "Check your email",
        description: "We sent you a confirmation link to complete sign up.",
      })
    } catch (err: any) {
      toast({ title: "Sign up failed", description: err.message || "Please try again.", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignup = () => {
    const supabase = createClient()
    setIsLoading(true)
    supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/admin/signup`,
      },
    }).catch((error: any) => {
      toast({
        title: "Google Sign up Failed",
        description: error.message || "An error occurred during Google sign up.",
        variant: "destructive",
      })
    }).finally(() => setIsLoading(false))
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-accent mr-2" />
            <h1 className="text-2xl font-bold">Civic Platform</h1>
          </div>
          <h2 className="text-xl text-muted-foreground">Admin Portal</h2>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle>Create Administrator Account</CardTitle>
            <CardDescription>Sign up to manage civic issues and municipal operations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Admin Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your admin email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating Account..." : "Create Admin Account"}
              </Button>
            </form>

            <Button
              variant="outline"
              className="w-full bg-transparent"
              onClick={handleGoogleSignup}
              disabled={isLoading}
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continue with Google
            </Button>

            <div className="text-center text-sm">
              <span className="text-muted-foreground">Already have an account? </span>
              <Link href="/admin/login" className="text-accent hover:underline">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6 space-y-2">
          <Link href="/" className="block text-sm text-muted-foreground hover:text-accent">
            ← Back to Home
          </Link>
          <div className="text-xs text-muted-foreground">Admin access is restricted. Your email may require approval.</div>
        </div>
      </div>
    </div>
  )
}


