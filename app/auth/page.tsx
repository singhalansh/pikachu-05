"use client";

import type React from "react";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
    Mail,
    Lock,
    Eye,
    EyeOff,
    ArrowLeft,
    User,
    UserPlus,
    LogIn,
    Shield,
    MapPin,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";

type AuthMode = "signin" | "signup";
type UserRole =
    | "citizen"
    | "department_head"
    | "supervisor"
    | "field_worker"
    | "clerk_operator"
    | "technician";

interface Role {
    id: string;
    name: string;
    description: string;
    level: number;
}

interface Department {
    id: string;
    name: string;
    description: string;
}

function UnifiedAuthPageInner() {
    const [authMode, setAuthMode] = useState<AuthMode>("signin");
    const [selectedRole, setSelectedRole] = useState<UserRole>("citizen");
    const [selectedDepartment, setSelectedDepartment] = useState<string>("");
    const [roles, setRoles] = useState<Role[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        confirmPassword: "",
        fullName: "",
        department: "",
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { toast } = useToast();
    const { user, loading, signIn, signUp, signInWithGoogle } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    // Fetch roles and departments
    useEffect(() => {
        const fetchRolesAndDepartments = async () => {
            try {
                // Fetch roles
                const rolesResponse = await fetch("/api/roles");
                if (rolesResponse.ok) {
                    const rolesData = await rolesResponse.json();
                    setRoles(rolesData.roles || []);
                }

                // Fetch departments
                const departmentsResponse = await fetch("/api/departments");
                if (departmentsResponse.ok) {
                    const departmentsData = await departmentsResponse.json();
                    setDepartments(departmentsData.departments || []);
                }
            } catch (error) {
                console.error("Error fetching roles and departments:", error);
            }
        };

        fetchRolesAndDepartments();
    }, []);

    // Redirect if user is already logged in
    useEffect(() => {
        if (user) {
            const redirectTo = searchParams.get("redirectedFrom");
            if (redirectTo && redirectTo.startsWith("/")) {
                router.replace(redirectTo as any);
            } else {
                // Redirect based on user role or default to citizen
                const userRole = user.user_metadata?.role || "citizen";
                const dashboardPath =
                    userRole === "citizen"
                        ? "/citizen/dashboard"
                        : "/admin/dashboard";
                router.replace(dashboardPath);
            }
        }
    }, [user, router, searchParams]);

    // Show loading state while auth is being resolved
    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#2E6A56] to-[#5C9479] flex items-center justify-center">
                <div className="text-center text-white">
                    <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <h2 className="text-xl font-semibold">Loading...</h2>
                    <p className="mt-2 text-white/80">
                        Please wait while we check your authentication status.
                    </p>
                </div>
            </div>
        );
    }

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (authMode === "signup") {
            if (formData.password !== formData.confirmPassword) {
                setError("Passwords do not match");
                return;
            }
            if (formData.password.length < 6) {
                setError("Password must be at least 6 characters long");
                return;
            }
        }

        setIsLoading(true);
        setError(null);

        try {
            if (authMode === "signin") {
                const { error } = await signIn(
                    formData.email,
                    formData.password
                );
                if (error) throw error;

                toast({
                    title: "Login Successful",
                    description: `Welcome back! Redirecting to your dashboard...`,
                });

                const redirectTo = searchParams.get("redirectedFrom");
                if (redirectTo && redirectTo.startsWith("/")) {
                    router.push(redirectTo as any);
                }
            } else {
                if (selectedRole !== "citizen") {
                    if (!selectedDepartment) {
                        setError("Please select a department for your role");
                        return;
                    }
                }

                const { error } = await signUp(
                    formData.email,
                    formData.password,
                    formData.fullName,
                    selectedRole,
                    selectedDepartment
                );
                if (error) throw error;

                toast({
                    title: "Account Created Successfully!",
                    description: `Welcome! Please check your email to verify your account.`,
                });
                router.push("/auth");
                return;
            }
        } catch (error: any) {
            setError(
                error.message ||
                    `${
                        authMode === "signin" ? "Login" : "Sign up"
                    } failed. Please try again.`
            );
            toast({
                title: `${authMode === "signin" ? "Login" : "Sign Up"} Failed`,
                description:
                    error.message ||
                    `An error occurred during ${
                        authMode === "signin" ? "login" : "sign up"
                    }.`,
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleAuth = async () => {
        try {
            if (authMode === "signup") {
                if (selectedRole !== "citizen" && !selectedDepartment) {
                    setError("Please select a department for your role");
                    return;
                }

                const baseUrl = window.location.origin;
                const callbackUrl = `${baseUrl}/auth/callback?role=${selectedRole}&department=${selectedDepartment}&signup=true`;

                console.log(
                    "Starting Google OAuth with callback URL:",
                    callbackUrl
                );

                const { error } = await signInWithGoogle(
                    selectedRole,
                    callbackUrl,
                    selectedDepartment
                );
                if (error) throw error;
            } else {
                const { error } = await signInWithGoogle("citizen");
                if (error) throw error;

                toast({
                    title: "Login Successful",
                    description:
                        "Welcome back! Redirecting to your dashboard...",
                });
            }
        } catch (error: any) {
            toast({
                title: `Google ${
                    authMode === "signin" ? "Login" : "Sign Up"
                } Failed`,
                description:
                    error.message ||
                    `An error occurred during Google ${
                        authMode === "signin" ? "login" : "sign up"
                    }.`,
                variant: "destructive",
            });
        }
    };

    const toggleAuthMode = () => {
        setAuthMode((prev) => (prev === "signin" ? "signup" : "signin"));
        setError(null);
        setFormData({
            email: "",
            password: "",
            confirmPassword: "",
            fullName: "",
            department: "",
        });
    };

    return (
        <div className="min-h-screen relative overflow-hidden">
            {/* Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#2E6A56] via-[#5C9479] to-[#2E6A56]" />

            {/* Animated Pattern Overlay */}
            <div className="absolute inset-0 opacity-10">
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.3) 0%, transparent 50%),
                           radial-gradient(circle at 75% 75%, rgba(255,255,255,0.2) 0%, transparent 50%)`,
                        backgroundSize: "50% 50%",
                    }}
                />
            </div>

            <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    {/* Back to Home */}
                    <div className="mb-6">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-white hover:bg-white/20 hover:text-white transition-all"
                            asChild
                        >
                            <Link href="/">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Home
                            </Link>
                        </Button>
                    </div>

                    {/* Main Card with Glass Morphism */}
                    <Card className="backdrop-blur-xl bg-white/95 shadow-2xl border-0 overflow-hidden">
                        {/* Decorative Top Bar */}
                        <div className="h-2 bg-emerald-600" />

                        <CardHeader className="text-center pb-4 pt-8">
                            {/* Logo/Icon */}
                            <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-gradient-to-br from-[#2E6A56] to-[#5C9479] flex items-center justify-center shadow-lg">
                                {authMode === "signin" ? (
                                    <LogIn className="w-8 h-8 text-white" />
                                ) : (
                                    <UserPlus className="w-8 h-8 text-white" />
                                )}
                            </div>

                            <CardTitle className="text-3xl font-bold text-white">
                                {authMode === "signin"
                                    ? "Welcome Back"
                                    : "Create Account"}
                            </CardTitle>
                            <CardDescription className="text-base mt-2">
                                {authMode === "signin"
                                    ? "Sign in to your account"
                                    : "Join our community and make a difference"}
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-6 px-8 pb-8">
                            {/* Auth Mode Toggle */}
                            <div className="flex bg-white/10 rounded-xl p-1.5 shadow-inner">
                                <Button
                                    variant={
                                        authMode === "signin"
                                            ? "default"
                                            : "ghost"
                                    }
                                    size="sm"
                                    className={`flex-1 transition-all ${
                                        authMode === "signin"
                                            ? "bg-emerald-600 text-white shadow-md"
                                            : "text-gray-600 hover:text-[#2E6A56]"
                                    }`}
                                    onClick={() => setAuthMode("signin")}
                                >
                                    <LogIn className="w-4 h-4 mr-2" />
                                    Sign In
                                </Button>
                                <Button
                                    variant={
                                        authMode === "signup"
                                            ? "default"
                                            : "ghost"
                                    }
                                    size="sm"
                                    className={`flex-1 transition-all ${
                                        authMode === "signup"
                                            ? "bg-emerald-600 text-white shadow-md"
                                            : "text-gray-600 hover:text-[#2E6A56]"
                                    }`}
                                    onClick={() => setAuthMode("signup")}
                                >
                                    <UserPlus className="w-4 h-4 mr-2" />
                                    Sign Up
                                </Button>
                            </div>

                            {/* Role Selection - Only for Signup */}
                            {authMode === "signup" && (
                                <div className="space-y-2">
                                    <Label
                                        htmlFor="role"
                                        className="text-gray-700 font-semibold"
                                    >
                                        Select Your Role
                                    </Label>
                                    <Select
                                        value={selectedRole}
                                        onValueChange={(value: UserRole) => {
                                            setSelectedRole(value);
                                            setSelectedDepartment("");
                                        }}
                                    >
                                        <SelectTrigger className="border-white/10 focus:border-[#5C9479] focus:ring-[#5C9479] bg-white/5 text-white">
                                            <SelectValue placeholder="Choose your role" />
                                        </SelectTrigger>
                                        <SelectContent className="relative z-10 bg-white/5 border-white/10 backdrop-blur-xl border-2">
                                            <SelectItem value="citizen">
                                                <div className="flex items-center space-x-2">
                                                    <MapPin className="w-4 h-4 text-[#2E6A56]" />
                                                    <span>
                                                        Citizen - Report and
                                                        track civic issues
                                                    </span>
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="department_head">
                                                <div className="flex items-center space-x-2">
                                                    <Shield className="w-4 h-4 text-[#5C9479]" />
                                                    <span>
                                                        Department Head - Full
                                                        administrative access
                                                    </span>
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="supervisor">
                                                <div className="flex items-center space-x-2">
                                                    <User className="w-4 h-4 text-[#2E6A56]" />
                                                    <span>
                                                        Supervisor - Team
                                                        management and oversight
                                                    </span>
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="field_worker">
                                                <div className="flex items-center space-x-2">
                                                    <User className="w-4 h-4 text-[#5C9479]" />
                                                    <span>
                                                        Field Worker - On-ground
                                                        issue resolution
                                                    </span>
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="clerk_operator">
                                                <div className="flex items-center space-x-2">
                                                    <User className="w-4 h-4 text-[#2E6A56]" />
                                                    <span>
                                                        Clerk/Operator -
                                                        Administrative tasks
                                                    </span>
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="technician">
                                                <div className="flex items-center space-x-2">
                                                    <User className="w-4 h-4 text-[#5C9479]" />
                                                    <span>
                                                        Technician - Technical
                                                        specialist
                                                    </span>
                                                </div>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            {/* Department Selection - Only for non-citizen roles during signup */}
                            {authMode === "signup" &&
                                selectedRole !== "citizen" && (
                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="department"
                                            className="text-gray-700 font-semibold"
                                        >
                                            Select Your Department
                                        </Label>
                                        <Select
                                            value={selectedDepartment}
                                            onValueChange={
                                                setSelectedDepartment
                                            }
                                        >
                                            <SelectTrigger className="border-white/10 focus:border-[#5C9479] focus:ring-[#5C9479] bg-white/5 text-white">
                                                <SelectValue placeholder="Choose your department" />
                                            </SelectTrigger>
                                            <SelectContent className="relative z-10 bg-white/5 border-white/10 backdrop-blur-xl border-2">
                                                {departments.map((dept) => (
                                                    <SelectItem
                                                        key={dept.id}
                                                        value={dept.id}
                                                    >
                                                        <div className="flex items-center space-x-2">
                                                            <Shield className="w-4 h-4 text-[#2E6A56]" />
                                                            <span>
                                                                {dept.name}
                                                            </span>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}

                            {/* Form */}
                            <form
                                onSubmit={handleSubmit}
                                className="space-y-4 mb-6"
                            >
                                {error && (
                                    <div className="p-4 text-sm text-red-700 bg-red-50 border-l-4 border-red-500 rounded-lg shadow-sm flex items-start gap-3">
                                        <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <span className="text-white text-xs font-bold">
                                                !
                                            </span>
                                        </div>
                                        <span>{error}</span>
                                    </div>
                                )}

                                {authMode === "signup" && (
                                    <div className="space-y-2">
                                        <Label htmlFor="fullName">
                                            Full Name
                                        </Label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-3 h-5 w-5 text-[#5C9479]" />
                                            <Input
                                                id="fullName"
                                                type="text"
                                                placeholder="Enter your full name"
                                                value={formData.fullName}
                                                onChange={(e) =>
                                                    handleInputChange(
                                                        "fullName",
                                                        e.target.value
                                                    )
                                                }
                                                className="pl-10 border-gray-200 focus:border-[#2E6A56] focus:ring-[#2E6A56] bg-white"
                                                required={authMode === "signup"}
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 h-5 w-5 text-[#5C9479]" />
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="Enter your email"
                                            value={formData.email}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    "email",
                                                    e.target.value
                                                )
                                            }
                                            className="pl-10 border-gray-200 focus:border-[#2E6A56] focus:ring-[#2E6A56] bg-white"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3 h-5 w-5 text-[#5C9479]" />
                                        <Input
                                            id="password"
                                            type={
                                                showPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            placeholder={
                                                authMode === "signin"
                                                    ? "Enter your password"
                                                    : "Create a password"
                                            }
                                            value={formData.password}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    "password",
                                                    e.target.value
                                                )
                                            }
                                            className="pl-10 pr-10 border-gray-200 focus:border-[#2E6A56] focus:ring-[#2E6A56] bg-white"
                                            required
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                            onClick={() =>
                                                setShowPassword(!showPassword)
                                            }
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                </div>

                                {authMode === "signup" && (
                                    <div className="space-y-2">
                                        <Label htmlFor="confirmPassword">
                                            Confirm Password
                                        </Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-3 h-5 w-5 text-[#5C9479]" />
                                            <Input
                                                id="confirmPassword"
                                                type={
                                                    showConfirmPassword
                                                        ? "text"
                                                        : "password"
                                                }
                                                placeholder="Confirm your password"
                                                value={formData.confirmPassword}
                                                onChange={(e) =>
                                                    handleInputChange(
                                                        "confirmPassword",
                                                        e.target.value
                                                    )
                                                }
                                                className="pl-10 pr-10 border-gray-200 focus:border-[#2E6A56] focus:ring-[#2E6A56] bg-white"
                                                required={authMode === "signup"}
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                onClick={() =>
                                                    setShowConfirmPassword(
                                                        !showConfirmPassword
                                                    )
                                                }
                                            >
                                                {showConfirmPassword ? (
                                                    <EyeOff className="h-4 w-4" />
                                                ) : (
                                                    <Eye className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                <Button
                                    type="submit"
                                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                            {authMode === "signin"
                                                ? "Signing in..."
                                                : "Creating account..."}
                                        </>
                                    ) : (
                                        <>
                                            {authMode === "signin" ? (
                                                <>
                                                    <LogIn className="w-5 h-5 mr-2" />
                                                    Sign In
                                                </>
                                            ) : (
                                                <>
                                                    <UserPlus className="w-5 h-5 mr-2" />
                                                    Create Account
                                                </>
                                            )}
                                        </>
                                    )}
                                </Button>
                            </form>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <Separator className="w-full" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-black px-2 text-white/60">
                                        Or continue with
                                    </span>
                                </div>
                            </div>

                            <Button
                                variant="outline"
                                className="w-full hover:bg-[#2E6A56]/10 hover:border-[#2E6A56] border-2 bg-white/5 text-white font-semibold transition-all backdrop-blur-xl"
                                onClick={handleGoogleAuth}
                                disabled={isLoading}
                            >
                                <svg
                                    className="w-4 h-4 mr-2"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        fill="currentColor"
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    />
                                </svg>
                                Continue with Google
                            </Button>

                            <div className="text-center text-sm">
                                <span className="text-gray-600">
                                    {authMode === "signin"
                                        ? "Don't have an account? "
                                        : "Already have an account? "}
                                </span>
                                <Button
                                    variant="link"
                                    className="p-0 h-auto text-[#2E6A56] hover:text-[#5C9479] font-semibold hover:underline"
                                    onClick={toggleAuthMode}
                                >
                                    {authMode === "signin"
                                        ? "Sign up"
                                        : "Sign in"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Footer Text */}
                    <p className="text-center text-white/80 text-sm mt-6">
                        Secure authentication powered by JANMARG
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function UnifiedAuthPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-gradient-to-br from-[#2E6A56] to-[#5C9479] flex items-center justify-center">
                    <div className="text-center text-white">
                        <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <h2 className="text-xl font-semibold">Loading...</h2>
                    </div>
                </div>
            }
        >
            <UnifiedAuthPageInner />
        </Suspense>
    );
}
