"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { MapPin, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/lib/supabase/client";

import React, { useEffect } from "react";

export default function CitizenLoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const router = useRouter();

    useEffect(() => {
                // Handle OAuth callback: extract access_token and refresh_token from URL hash, set cookie, and update Supabase session
                                if (window.location.hash.includes('access_token=')) {
                                        const params = new URLSearchParams(window.location.hash.substring(1));
                                        const accessToken = params.get('access_token');
                                        const refreshToken = params.get('refresh_token');
                                        if (accessToken) {
                                                // Redirect to API route to set cookie server-side and redirect to dashboard
                                                window.location.href = `/api/auth/set-token?access_token=${encodeURIComponent(accessToken)}${refreshToken ? `&refresh_token=${encodeURIComponent(refreshToken)}` : ''}&redirect=/citizen/dashboard`;
                                                return;
                                        }
                                }
        const supabase = createClient();
        const checkSession = async () => {
            const { data } = await supabase.auth.getSession();
            if (data.session) {
                router.push("/citizen/dashboard");
            }
        };
        checkSession();
        const { data: listener } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                if (session) {
                    router.push("/citizen/dashboard");
                }
            }
        );
        return () => {
            listener?.subscription.unsubscribe();
        };
    }, [router]);
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const supabase = createClient();

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (error) throw error;
            // Persist tokens in HTTP-only cookies for middleware
            if (data?.session?.access_token) {
                await fetch("/api/auth/set-token", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        access_token: data.session.access_token,
                        refresh_token: data.session.refresh_token,
                    }),
                });
            }
            toast({
                title: "Login Successful",
                description: "Welcome back! Redirecting to your dashboard...",
            });
            router.push("/citizen/dashboard");
        } catch (error: any) {
            toast({
                title: "Login Failed",
                description: error.message || "An error occurred during login.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        const supabase = createClient();
        setIsLoading(true);
        supabase.auth
            .signInWithOAuth({
                provider: "google",
                options: {
                    redirectTo: `${window.location.origin}/citizen/login`,
                },
            })
            .catch((error: any) => {
                toast({
                    title: "Google Login Failed",
                    description:
                        error.message ||
                        "An error occurred during Google login.",
                    variant: "destructive",
                });
            })
            .finally(() => setIsLoading(false));
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center mb-4">
                        <MapPin className="w-8 h-8 text-accent mr-2" />
                        <h1 className="text-2xl font-bold">Civic Platform</h1>
                    </div>
                    <h2 className="text-xl text-muted-foreground">
                        Citizen Portal
                    </h2>
                </div>

                <Card>
                    <CardHeader className="text-center">
                        <CardTitle>Welcome Back</CardTitle>
                        <CardDescription>
                            Sign in to report issues and track their progress
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={(e) =>
                                            setEmail(e.target.value)
                                        }
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
                                        type={
                                            showPassword ? "text" : "password"
                                        }
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={(e) =>
                                            setPassword(e.target.value)
                                        }
                                        className="pl-10 pr-10"
                                        required
                                        disabled={isLoading}
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
                                        className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                                        disabled={isLoading}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isLoading}
                            >
                                {isLoading ? "Signing In..." : "Sign In"}
                            </Button>
                        </form>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <Separator className="w-full" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-card px-2 text-muted-foreground">
                                    Or continue with
                                </span>
                            </div>
                        </div>

                        <Button
                            variant="outline"
                            className="w-full bg-transparent"
                            onClick={handleGoogleLogin}
                        >
                            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                                <path
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    fill="#4285F4"
                                />
                                <path
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    fill="#34A853"
                                />
                                <path
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    fill="#FBBC05"
                                />
                                <path
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    fill="#EA4335"
                                />
                            </svg>
                            Continue with Google
                        </Button>

                        <div className="text-center text-sm">
                            <span className="text-muted-foreground">
                                Don't have an account?{" "}
                            </span>
                            <Link
                                href="/citizen/signup"
                                className="text-accent hover:underline"
                            >
                                Sign up
                            </Link>
                        </div>

                        <div className="text-center">
                            <Link
                                href="/citizen/forgot-password"
                                className="text-sm text-muted-foreground hover:text-accent"
                            >
                                Forgot your password?
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                <div className="text-center mt-6">
                    <Link
                        href="/"
                        className="text-sm text-muted-foreground hover:text-accent"
                    >
                        ← Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
