"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import LocationPicker from "@/components/location-picker";
import PhoneInput from "@/components/phone-input";
import { useToast } from "@/hooks/use-toast";
import {
    User,
    Mail,
    Calendar,
    MapPin,
    Phone,
    Edit,
    Save,
    X,
    Camera,
    Upload,
    Settings,
    Bell,
    Shield,
    Eye,
    EyeOff,
    Trash2,
    RefreshCw,
    Users,
    FileText,
    BarChart3,
    Building,
    Key,
    Database,
    Activity,
    Clock,
    CheckCircle,
    AlertCircle,
    TrendingUp,
    ArrowLeft,
} from "lucide-react";
import AccountManagement from "@/components/account-management";
import { getDepartmentName } from "@/lib/departments";

interface Department {
    id: string;
    name: string;
    email: string;
    description?: string;
    created_at: string;
}

interface ProfileData {
    full_name: string;
    email: string;
    phone?: string;
    bio?: string;
    location?: string;
    location_coordinates?: { lat: number; lng: number };
    avatar_url?: string;
    email_notifications: boolean;
    push_notifications: boolean;
    privacy_public_profile: boolean;
    role?: string;
    department?: string;
    admin_level?: string;
}

interface AdminStats {
    issues_managed: number;
    issues_resolved: number;
    users_managed: number;
    departments_managed: number;
    notifications_sent: number;
    reports_generated: number;
    system_uptime: string;
    last_login: string;
    total_admin_actions: number;
    success_rate: number;
}

export default function AdminProfilePage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [userRole, setUserRole] = useState<string>("");
    const [userDepartment, setUserDepartment] = useState<string>("");
    const [userDepartmentName, setUserDepartmentName] = useState<string>("");
    const [userAdminLevel, setUserAdminLevel] = useState<string>("");
    const [departments, setDepartments] = useState<Department[]>([]);
    const [profileData, setProfileData] = useState<ProfileData>({
        full_name: "",
        email: "",
        phone: "",
        bio: "",
        location: "",
        location_coordinates: undefined,
        avatar_url: "",
        email_notifications: true,
        push_notifications: true,
        privacy_public_profile: true,
        role: "admin",
        department: "",
        admin_level: "senior",
    });
    const [adminStats, setAdminStats] = useState<AdminStats>({
        issues_managed: 0,
        issues_resolved: 0,
        users_managed: 0,
        departments_managed: 0,
        notifications_sent: 0,
        reports_generated: 0,
        system_uptime: "99.9%",
        last_login: "",
        total_admin_actions: 0,
        success_rate: 0,
    });
    const [statsLoading, setStatsLoading] = useState(true);

    useEffect(() => {
        if (user) {
            // Set user role, department, and admin level from metadata
            const role = user.user_metadata?.role || user.role || "admin";
            const department = user.user_metadata?.department;
            const adminLevel = user.user_metadata?.admin_level || "senior";

            console.log("User metadata:", user.user_metadata);
            console.log(
                "Role:",
                role,
                "Department:",
                department,
                "Admin Level:",
                adminLevel
            );

            setUserRole(role);
            setUserDepartment(department || "");
            setUserAdminLevel(adminLevel);

            // Get department name
            if (department) {
                getDepartmentName(department).then(setUserDepartmentName);
            }

            fetchProfileData();
            fetchAdminStats();
        }
    }, [user]);

    // Fetch departments for the department selection
    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const response = await fetch("/api/departments");
                if (response.ok) {
                    const data = await response.json();
                    if (data.departments && Array.isArray(data.departments)) {
                        setDepartments(data.departments);
                    }
                }
            } catch (error) {
                console.error("Error fetching departments:", error);
            }
        };

        fetchDepartments();
    }, []);

    const fetchProfileData = async () => {
        try {
            const response = await fetch("/api/profile", {
                credentials: "include",
                cache: "no-store",
            });
            if (response.ok) {
                const data = await response.json();
                console.log("[PROFILE FETCH] /api/profile data:", data);
                const locCoords =
                    typeof data.profile?.location_coordinates === "string"
                        ? (() => {
                              try {
                                  return JSON.parse(
                                      data.profile.location_coordinates
                                  );
                              } catch {
                                  return undefined;
                              }
                          })()
                        : data.profile?.location_coordinates || undefined;
                setProfileData({
                    full_name:
                        data.profile?.full_name ||
                        user?.user_metadata?.full_name ||
                        "",
                    email: user?.email || "",
                    phone: data.profile?.phone || "",
                    bio: data.profile?.bio || "",
                    location: data.profile?.location || "",
                    location_coordinates: locCoords,
                    avatar_url: data.profile?.avatar_url || "",
                    email_notifications:
                        data.profile?.email_notifications ?? true,
                    push_notifications:
                        data.profile?.push_notifications ?? true,
                    privacy_public_profile:
                        data.profile?.privacy_public_profile ?? true,
                    role: data.profile?.role || "admin",
                    department: data.profile?.department || "",
                    admin_level: data.profile?.admin_level || "senior",
                });

                // If department_id exists in DB, prefer it over user metadata
                if (data.profile?.department_id) {
                    const deptId: string = data.profile.department_id;
                    if (deptId !== userDepartment) {
                        // Update the local state so UI reflects DB value by default
                        setUserDepartment(deptId);
                        // Update the human-friendly name as well
                        getDepartmentName(deptId).then(setUserDepartmentName);
                    }
                }
            }
        } catch (error) {
            console.error("Error fetching profile:", error);
        }
    };

    const fetchAdminStats = async () => {
        try {
            setStatsLoading(true);
            const response = await fetch("/api/admin/profile/stats", {
                credentials: "include",
            });
            if (response.ok) {
                const data = await response.json();
                setAdminStats(
                    data.stats || {
                        issues_managed: 0,
                        issues_resolved: 0,
                        users_managed: 0,
                        departments_managed: 0,
                        notifications_sent: 0,
                        reports_generated: 0,
                        system_uptime: "99.9%",
                        last_login: "",
                        total_admin_actions: 0,
                        success_rate: 0,
                    }
                );
            } else if (response.status === 403) {
                // User is not authenticated as admin, set default stats
                console.warn(
                    "Admin access denied - user may not be authenticated as admin"
                );
                setAdminStats({
                    issues_managed: 0,
                    issues_resolved: 0,
                    users_managed: 0,
                    departments_managed: 0,
                    notifications_sent: 0,
                    reports_generated: 0,
                    system_uptime: "N/A",
                    last_login: "Not available",
                    total_admin_actions: 0,
                    success_rate: 0,
                });
            } else {
                console.error(
                    "Admin stats API error:",
                    response.status,
                    response.statusText
                );
                // Set default stats on error
                setAdminStats({
                    issues_managed: 0,
                    issues_resolved: 0,
                    users_managed: 0,
                    departments_managed: 0,
                    notifications_sent: 0,
                    reports_generated: 0,
                    system_uptime: "Error",
                    last_login: "Error",
                    total_admin_actions: 0,
                    success_rate: 0,
                });
            }
        } catch (error) {
            console.error("Error fetching admin stats:", error);
            // Set default stats on error
            setAdminStats({
                issues_managed: 0,
                issues_resolved: 0,
                users_managed: 0,
                departments_managed: 0,
                notifications_sent: 0,
                reports_generated: 0,
                system_uptime: "Error",
                last_login: "Error",
                total_admin_actions: 0,
                success_rate: 0,
            });
        } finally {
            setStatsLoading(false);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            console.log("=== SAVE DEBUG ===");
            console.log("userDepartment state:", userDepartment);
            console.log("profileData:", profileData);

            const requestBody = {
                ...profileData,
                department_id: userDepartment || null,
            };

            console.log("Request body being sent:", requestBody);

            // Save profile data with department_id
            const response = await fetch("/api/profile", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify(requestBody),
            });

            if (response.ok) {
                // Also update user metadata for backward compatibility
                if (user?.id) {
                    const { createClient } = await import(
                        "@/lib/supabase/client"
                    );
                    const supabase = createClient();

                    // Update user metadata
                    await supabase.auth.updateUser({
                        data: {
                            department: userDepartment,
                        },
                    });
                }

                toast({
                    title: "Profile updated",
                    description:
                        "Your admin profile has been successfully updated.",
                });
                setIsEditing(false);

                // Refresh profile data to reflect changes
                fetchProfileData();
            } else {
                throw new Error("Failed to update profile");
            }
        } catch (error) {
            console.error("Profile update error:", error);
            toast({
                title: "Error",
                description: "Failed to update profile. Please try again.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarUpload = async (file: File) => {
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);

            const response = await fetch("/api/upload/avatar", {
                method: "POST",
                credentials: "include",
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                setProfileData((prev) => ({ ...prev, avatar_url: data.url }));
                toast({
                    title: "Avatar updated",
                    description: "Your profile picture has been updated.",
                });
            } else {
                throw new Error("Failed to upload avatar");
            }
        } catch (error) {
            toast({
                title: "Upload failed",
                description: "Failed to upload avatar. Please try again.",
                variant: "destructive",
            });
        } finally {
            setUploading(false);
        }
    };

    const displayName =
        profileData.full_name || user?.email?.split("@")[0] || "Admin";

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-2 xs:px-3 sm:px-4 md:px-6 lg:px-8 py-2 xs:py-3 sm:py-4 md:py-6 lg:py-8">
                {/* Action Buttons */}
                <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2 xs:gap-3 sm:gap-4 mb-3 xs:mb-4 sm:mb-6">
                    <div className="flex flex-col xs:flex-row xs:items-center gap-2 sm:gap-3">
                        <Link href="/admin/dashboard">
                            <Button variant="outline" size="sm" className="w-full xs:w-auto border-gray-200 text-gray-700 hover:bg-gray-50 transition-all duration-200 hover:scale-105 text-xs xs:text-sm">
                                <ArrowLeft className="w-3 h-3 xs:w-4 xs:h-4 mr-1 xs:mr-2" />
                                <span className="hidden xs:inline">Dashboard</span>
                                <span className="xs:hidden">Back to Dashboard</span>
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="grid gap-3 xs:gap-4 sm:gap-6 lg:grid-cols-3">
                    {/* Profile Overview */}
                    <div className="lg:col-span-1">
                        <Card className="bg-white border-0 shadow-sm hover:shadow-lg transition-all duration-300 animate-fade-in">
                            <CardContent className="pt-4 xs:pt-6">
                                <div className="flex flex-col items-center text-center">
                                <div className="relative mb-4">
                                    <Avatar className="w-24 h-24">
                                        {profileData.avatar_url ? (
                                            <AvatarImage
                                                src={profileData.avatar_url}
                                                alt={displayName}
                                            />
                                        ) : (
                                            <AvatarFallback className="text-2xl">
                                                {displayName
                                                    .substring(0, 2)
                                                    .toUpperCase()}
                                            </AvatarFallback>
                                        )}
                                    </Avatar>
                                    {isEditing && (
                                        <div className="absolute -bottom-2 -right-2">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => {
                                                    const file =
                                                        e.target.files?.[0];
                                                    if (file)
                                                        handleAvatarUpload(
                                                            file
                                                        );
                                                }}
                                                className="hidden"
                                                id="avatar-upload"
                                            />
                                            <label
                                                htmlFor="avatar-upload"
                                                className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full cursor-pointer hover:bg-primary/90"
                                            >
                                                {uploading ? (
                                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                ) : (
                                                    <Camera className="w-4 h-4" />
                                                )}
                                            </label>
                                        </div>
                                    )}
                                </div>

                                    <h2 className="text-lg xs:text-xl font-semibold mb-2 text-gray-900">
                                        {displayName}
                                    </h2>
                                    <p className="text-xs xs:text-sm text-gray-600 mb-2">
                                        {profileData.email}
                                    </p>
                                    <div className="flex flex-col xs:flex-row gap-2 mb-4">
                                        <Badge
                                            variant="secondary"
                                            className="bg-blue-100 text-blue-800 text-xs"
                                        >
                                            <Shield className="w-3 h-3 mr-1" />
                                            {userAdminLevel
                                                ? userAdminLevel
                                                      .charAt(0)
                                                      .toUpperCase() +
                                                  userAdminLevel.slice(1)
                                                : "Senior"}{" "}
                                            Admin
                                        </Badge>
                                        {userDepartmentName && (
                                            <Badge variant="outline" className="text-xs">
                                                <Building className="w-3 h-3 mr-1" />
                                                <span className="hidden xs:inline">{userDepartmentName}</span>
                                                <span className="xs:hidden">{userDepartmentName.split(' ')[0]}</span>
                                            </Badge>
                                        )}
                                    </div>

                                    {!isEditing ? (
                                        <Button
                                            onClick={() => setIsEditing(true)}
                                            variant="outline"
                                            size="sm"
                                            className="border-gray-200 text-gray-700 hover:bg-gray-50 transition-all duration-200 hover:scale-105 text-xs xs:text-sm"
                                        >
                                            <Edit className="w-3 h-3 xs:w-4 xs:h-4 mr-1 xs:mr-2" />
                                            <span className="hidden xs:inline">Edit Profile</span>
                                            <span className="xs:hidden">Edit</span>
                                        </Button>
                                    ) : (
                                        <div className="flex flex-col xs:flex-row gap-2">
                                            <Button
                                                onClick={handleSave}
                                                disabled={loading}
                                                size="sm"
                                                className="bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200 hover:scale-105 focus:ring-2 focus:ring-blue-200 text-xs xs:text-sm"
                                            >
                                                <Save className="w-3 h-3 xs:w-4 xs:h-4 mr-1 xs:mr-2" />
                                                {loading ? "Saving..." : "Save"}
                                            </Button>
                                            <Button
                                                onClick={() => setIsEditing(false)}
                                                variant="outline"
                                                size="sm"
                                                className="border-gray-200 text-gray-700 hover:bg-gray-50 transition-all duration-200 hover:scale-105 text-xs xs:text-sm"
                                            >
                                                <X className="w-3 h-3 xs:w-4 xs:h-4 mr-1 xs:mr-2" />
                                                Cancel
                                            </Button>
                                        </div>
                                    )}
                            </div>
                        </CardContent>
                    </Card>

                        {/* Admin Performance Summary */}
                        <Card className="mt-4 xs:mt-6 bg-white border-0 shadow-sm hover:shadow-lg transition-all duration-300 animate-fade-in">
                            <CardHeader className="pb-2 xs:pb-3 sm:pb-4">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center text-sm xs:text-base sm:text-lg font-semibold text-gray-900">
                                        <div className="w-6 h-6 xs:w-8 xs:h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-2 xs:mr-3 shadow-lg">
                                            <BarChart3 className="w-3 h-3 xs:w-4 xs:h-4 text-white" />
                                        </div>
                                        <span className="hidden xs:inline">Admin Performance</span>
                                        <span className="xs:hidden">Performance</span>
                                        {statsLoading && (
                                            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin ml-2" />
                                        )}
                                    </CardTitle>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={fetchAdminStats}
                                    disabled={statsLoading}
                                    className="h-8 w-8 p-0"
                                    title="Refresh stats"
                                >
                                    <RefreshCw
                                        className={`w-4 h-4 ${
                                            statsLoading ? "animate-spin" : ""
                                        }`}
                                    />
                                </Button>
                            </div>
                        </CardHeader>
                            <CardContent className="pt-0">
                                {statsLoading ? (
                                    <div className="space-y-2 xs:space-y-3">
                                        {[1, 2, 3, 4, 5].map((i) => (
                                            <div
                                                key={i}
                                                className="flex justify-between items-center"
                                            >
                                                <div className="h-3 xs:h-4 bg-gray-200 rounded w-20 xs:w-24 animate-pulse"></div>
                                                <div className="h-5 xs:h-6 bg-gray-200 rounded w-6 xs:w-8 animate-pulse"></div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="space-y-2 xs:space-y-3 sm:space-y-4">
                                        <div className="flex justify-between items-center p-2 xs:p-3 rounded-lg bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-all duration-200">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 xs:w-3 xs:h-3 bg-blue-500 rounded-full"></div>
                                                <span className="text-xs xs:text-sm font-medium text-blue-900">
                                                    Issues Managed
                                                </span>
                                            </div>
                                            <Badge className="bg-blue-500 text-white text-xs">
                                                {adminStats.issues_managed}
                                            </Badge>
                                        </div>

                                        <div className="flex justify-between items-center p-2 xs:p-3 rounded-lg bg-green-50 border border-green-200 hover:bg-green-100 transition-all duration-200">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 xs:w-3 xs:h-3 bg-green-500 rounded-full"></div>
                                                <span className="text-xs xs:text-sm font-medium text-green-900">
                                                    Issues Resolved
                                                </span>
                                            </div>
                                            <Badge className="bg-green-500 text-white text-xs">
                                                {adminStats.issues_resolved}
                                            </Badge>
                                        </div>

                                        <div className="flex justify-between items-center p-2 xs:p-3 rounded-lg bg-purple-50 border border-purple-200 hover:bg-purple-100 transition-all duration-200">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 xs:w-3 xs:h-3 bg-purple-500 rounded-full"></div>
                                                <span className="text-xs xs:text-sm font-medium text-purple-900">
                                                    Users Managed
                                                </span>
                                            </div>
                                            <Badge className="bg-purple-500 text-white text-xs">
                                                {adminStats.users_managed}
                                            </Badge>
                                        </div>

                                        <div className="flex justify-between items-center p-2 xs:p-3 rounded-lg bg-orange-50 border border-orange-200 hover:bg-orange-100 transition-all duration-200">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 xs:w-3 xs:h-3 bg-orange-500 rounded-full"></div>
                                                <span className="text-xs xs:text-sm font-medium text-orange-900">
                                                    Departments
                                                </span>
                                            </div>
                                            <Badge className="bg-orange-500 text-white text-xs">
                                                {adminStats.departments_managed}
                                            </Badge>
                                        </div>

                                        <div className="flex justify-between items-center p-2 xs:p-3 rounded-lg bg-yellow-50 border border-yellow-200 hover:bg-yellow-100 transition-all duration-200">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 xs:w-3 xs:h-3 bg-yellow-500 rounded-full"></div>
                                                <span className="text-xs xs:text-sm font-medium text-yellow-900">
                                                    Reports Generated
                                                </span>
                                            </div>
                                            <Badge className="bg-yellow-500 text-white text-xs">
                                                {adminStats.reports_generated}
                                            </Badge>
                                        </div>

                                        <div className="flex justify-between items-center p-2 xs:p-3 rounded-lg bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 transition-all duration-200">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 xs:w-3 xs:h-3 bg-indigo-500 rounded-full"></div>
                                                <span className="text-xs xs:text-sm font-medium text-indigo-900">
                                                    System Uptime
                                                </span>
                                            </div>
                                            <Badge className="bg-indigo-500 text-white text-xs">
                                                {adminStats.system_uptime}
                                            </Badge>
                                        </div>
                                </div>
                            )}

                                    {!statsLoading && (
                                        <div className="mt-3 xs:mt-4 pt-3 xs:pt-4 border-t border-gray-200">
                                            <div className="flex justify-between text-xs text-gray-600">
                                                <span>Success Rate:</span>
                                                <span className="font-medium text-green-600">
                                                    {adminStats.success_rate}%
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-xs text-gray-600 mt-1">
                                                <span>Total Actions:</span>
                                                <span className="font-medium">
                                                    {adminStats.total_admin_actions}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Profile Details */}
                    <div className="lg:col-span-2 space-y-3 xs:space-y-4 sm:space-y-6">
                        {/* Personal Information */}
                        <Card className="bg-white border-0 shadow-sm hover:shadow-lg transition-all duration-300 animate-fade-in">
                            <CardHeader className="pb-2 xs:pb-3 sm:pb-4">
                                <CardTitle className="flex items-center text-sm xs:text-base sm:text-lg font-semibold text-gray-900">
                                    <div className="w-6 h-6 xs:w-8 xs:h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center mr-2 xs:mr-3 shadow-lg">
                                        <User className="w-3 h-3 xs:w-4 xs:h-4 text-white" />
                                    </div>
                                    <span className="hidden xs:inline">Personal Information</span>
                                    <span className="xs:hidden">Personal Info</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-0 space-y-3 xs:space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 xs:gap-4">
                                    <div className="space-y-1 xs:space-y-2">
                                        <Label htmlFor="full_name" className="text-xs xs:text-sm font-medium text-gray-700">Full Name</Label>
                                    {isEditing ? (
                                            <Input
                                                id="full_name"
                                                value={profileData.full_name}
                                                onChange={(e) =>
                                                    setProfileData((prev) => ({
                                                        ...prev,
                                                        full_name: e.target.value,
                                                    }))
                                                }
                                                placeholder="Enter your full name"
                                                className="border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                                            />
                                    ) : (
                                            <p className="text-xs xs:text-sm text-gray-600">
                                                {profileData.full_name ||
                                                    "Not provided"}
                                            </p>
                                    )}
                                </div>

                                    <div className="space-y-1 xs:space-y-2">
                                        <Label htmlFor="email" className="text-xs xs:text-sm font-medium text-gray-700">Email</Label>
                                        <p className="text-xs xs:text-sm text-gray-600">
                                            {profileData.email}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            Email cannot be changed here
                                        </p>
                                    </div>

                                    <div className="space-y-1 xs:space-y-2">
                                        {isEditing ? (
                                            <div>
                                                <Label htmlFor="phone" className="text-xs xs:text-sm font-medium text-gray-700">
                                                    Phone Number
                                                </Label>
                                                <Input
                                                    id="phone"
                                                    value={profileData.phone || ""}
                                                    onChange={(e) =>
                                                        setProfileData((prev) => ({
                                                            ...prev,
                                                            phone: e.target.value,
                                                        }))
                                                    }
                                                    placeholder="Enter 10-digit mobile number"
                                                    className="border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                                                />
                                            </div>
                                        ) : (
                                            <>
                                                <Label htmlFor="phone" className="text-xs xs:text-sm font-medium text-gray-700">
                                                    Phone Number
                                                </Label>
                                                <p className="text-xs xs:text-sm text-gray-600">
                                                    {profileData.phone
                                                        ? `+91 ${profileData.phone}`
                                                        : "Not provided"}
                                                </p>
                                            </>
                                        )}
                                    </div>

                                    <div className="space-y-1 xs:space-y-2">
                                        {isEditing ? (
                                            <div>
                                                <Label htmlFor="location" className="text-xs xs:text-sm font-medium text-gray-700">
                                                    Location
                                                </Label>
                                                <Input
                                                    id="location"
                                                    value={profileData.location || ""}
                                                    onChange={(e) =>
                                                        setProfileData((prev) => ({
                                                            ...prev,
                                                            location: e.target.value,
                                                        }))
                                                    }
                                                    placeholder="Enter your city/area"
                                                    className="border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                                                />
                                            </div>
                                        ) : (
                                            <>
                                                <Label htmlFor="location" className="text-xs xs:text-sm font-medium text-gray-700">
                                                    Location
                                                </Label>
                                                <p className="text-xs xs:text-sm text-gray-600">
                                                    {profileData.location ||
                                                        "Not provided"}
                                                </p>
                                            </>
                                        )}
                                    </div>

                                    <div className="space-y-1 xs:space-y-2">
                                        <Label htmlFor="department" className="text-xs xs:text-sm font-medium text-gray-700">
                                            Department
                                        </Label>
                                    {isEditing ? (
                                            <Select
                                                value={userDepartment || ""}
                                                onValueChange={(value) => {
                                                    console.log(
                                                        "Department changed from",
                                                        userDepartment,
                                                        "to",
                                                        value
                                                    );
                                                    setUserDepartment(value);
                                                }}
                                            >
                                                <SelectTrigger className="w-full border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200">
                                                    <SelectValue placeholder="Select department" />
                                                </SelectTrigger>
                                            <SelectContent className="w-full min-w-[250px] max-w-[350px] bg-white border-gray-200 shadow-lg z-50">
                                                {departments.map((dept) => (
                                                    <SelectItem
                                                        key={dept.id}
                                                        value={dept.id}
                                                        className="hover:bg-blue-50 focus:bg-blue-50 cursor-pointer"
                                                    >
                                                        <div className="flex items-start space-x-2 w-full">
                                                            <Shield className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                                            <div className="flex flex-col w-full">
                                                                <span className="font-medium text-gray-900">
                                                                    {dept.name}
                                                                </span>
                                                                {dept.description && (
                                                                    <span className="text-xs text-gray-600">
                                                                        {
                                                                            dept.description
                                                                        }
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                            <p className="text-xs xs:text-sm text-gray-600">
                                                {userDepartmentName ||
                                                    "Not assigned"}
                                            </p>
                                    )}
                                </div>

                                    <div className="space-y-1 xs:space-y-2">
                                        <Label htmlFor="admin_level" className="text-xs xs:text-sm font-medium text-gray-700">
                                            Admin Level
                                        </Label>
                                    {isEditing ? (
                                            <Select
                                                value={userAdminLevel || "senior"}
                                                onValueChange={(value) =>
                                                    setUserAdminLevel(value)
                                                }
                                            >
                                                <SelectTrigger className="w-full border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200">
                                                    <SelectValue placeholder="Select admin level" />
                                                </SelectTrigger>
                                            <SelectContent className="w-full min-w-[200px] max-w-[300px] bg-white border-gray-200 shadow-lg z-50">
                                                <SelectItem value="junior" className="hover:bg-blue-50 focus:bg-blue-50 cursor-pointer">
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-gray-900">
                                                            Junior Admin
                                                        </span>
                                                        <span className="text-xs text-gray-600">
                                                            Basic administrative
                                                            access
                                                        </span>
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="senior" className="hover:bg-blue-50 focus:bg-blue-50 cursor-pointer">
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-gray-900">
                                                            Senior Admin
                                                        </span>
                                                        <span className="text-xs text-gray-600">
                                                            Full administrative
                                                            access
                                                        </span>
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="super" className="hover:bg-blue-50 focus:bg-blue-50 cursor-pointer">
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-gray-900">
                                                            Super Admin
                                                        </span>
                                                        <span className="text-xs text-gray-600">
                                                            Advanced system
                                                            access
                                                        </span>
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="system" className="hover:bg-blue-50 focus:bg-blue-50 cursor-pointer">
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-gray-900">
                                                            System Admin
                                                        </span>
                                                        <span className="text-xs text-gray-600">
                                                            Complete system
                                                            control
                                                        </span>
                                                    </div>
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                            <p className="text-xs xs:text-sm text-gray-600 capitalize">
                                                {userAdminLevel
                                                    ? userAdminLevel
                                                          .charAt(0)
                                                          .toUpperCase() +
                                                      userAdminLevel.slice(1)
                                                    : "Senior"}{" "}
                                                Admin
                                            </p>
                                    )}
                                </div>
                            </div>

                                <div className="space-y-1 xs:space-y-2">
                                    <Label htmlFor="bio" className="text-xs xs:text-sm font-medium text-gray-700">Bio</Label>
                                    {isEditing ? (
                                        <Textarea
                                            id="bio"
                                            value={profileData.bio}
                                            onChange={(e) =>
                                                setProfileData((prev) => ({
                                                    ...prev,
                                                    bio: e.target.value,
                                                }))
                                            }
                                            placeholder="Tell us about your role and responsibilities..."
                                            rows={3}
                                            className="border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                                        />
                                    ) : (
                                        <p className="text-xs xs:text-sm text-gray-600">
                                            {profileData.bio || "No bio provided"}
                                        </p>
                                    )}
                                </div>
                        </CardContent>
                    </Card>

                        {/* Admin Permissions & Settings */}
                        <Card className="bg-white border-0 shadow-sm hover:shadow-lg transition-all duration-300 animate-fade-in">
                            <CardHeader className="pb-2 xs:pb-3 sm:pb-4">
                                <CardTitle className="flex items-center text-sm xs:text-base sm:text-lg font-semibold text-gray-900">
                                    <div className="w-6 h-6 xs:w-8 xs:h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mr-2 xs:mr-3 shadow-lg">
                                        <Shield className="w-3 h-3 xs:w-4 xs:h-4 text-white" />
                                    </div>
                                    <span className="hidden xs:inline">Admin Permissions & Settings</span>
                                    <span className="xs:hidden">Permissions</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-0 space-y-3 xs:space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 xs:gap-4">
                                <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200">
                                    <div className="flex items-center gap-2">
                                        <Users className="w-4 h-4 text-blue-500" />
                                        <div>
                                            <p className="font-medium">
                                                User Management
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                Manage user accounts
                                            </p>
                                        </div>
                                    </div>
                                    <Badge variant="secondary">Enabled</Badge>
                                </div>

                                <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200">
                                    <div className="flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-green-500" />
                                        <div>
                                            <p className="font-medium">
                                                Issue Management
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                Handle civic issues
                                            </p>
                                        </div>
                                    </div>
                                    <Badge variant="secondary">Enabled</Badge>
                                </div>

                                <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200">
                                    <div className="flex items-center gap-2">
                                        <BarChart3 className="w-4 h-4 text-purple-500" />
                                        <div>
                                            <p className="font-medium">
                                                Analytics Access
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                View system analytics
                                            </p>
                                        </div>
                                    </div>
                                    <Badge variant="secondary">Enabled</Badge>
                                </div>

                                <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200">
                                    <div className="flex items-center gap-2">
                                        <Database className="w-4 h-4 text-orange-500" />
                                        <div>
                                            <p className="font-medium">
                                                System Settings
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                Configure system
                                            </p>
                                        </div>
                                    </div>
                                    <Badge variant="secondary">Enabled</Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                        {/* Notification Settings */}
                        <Card className="bg-white border-0 shadow-sm hover:shadow-lg transition-all duration-300 animate-fade-in">
                            <CardHeader className="pb-2 xs:pb-3 sm:pb-4">
                                <CardTitle className="flex items-center text-sm xs:text-base sm:text-lg font-semibold text-gray-900">
                                    <div className="w-6 h-6 xs:w-8 xs:h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center mr-2 xs:mr-3 shadow-lg">
                                        <Bell className="w-3 h-3 xs:w-4 xs:h-4 text-white" />
                                    </div>
                                    <span className="hidden xs:inline">Notification Preferences</span>
                                    <span className="xs:hidden">Notifications</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-0 space-y-3 xs:space-y-4">
                                <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-200">
                                    <div>
                                        <p className="text-xs xs:text-sm font-medium text-gray-900">
                                            Email Notifications
                                        </p>
                                        <p className="text-xs text-gray-600">
                                            Receive updates about system events via email
                                        </p>
                                    </div>
                                <Switch
                                    checked={profileData.email_notifications}
                                    onCheckedChange={(checked) =>
                                        setProfileData((prev) => ({
                                            ...prev,
                                            email_notifications: checked,
                                        }))
                                    }
                                    disabled={!isEditing}
                                />
                            </div>

                                <Separator className="my-3" />

                                <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-200">
                                    <div>
                                        <p className="text-xs xs:text-sm font-medium text-gray-900">
                                            Push Notifications
                                        </p>
                                        <p className="text-xs text-gray-600">
                                            Receive instant notifications for urgent issues
                                        </p>
                                    </div>
                                <Switch
                                    checked={profileData.push_notifications}
                                    onCheckedChange={(checked) =>
                                        setProfileData((prev) => ({
                                            ...prev,
                                            push_notifications: checked,
                                        }))
                                    }
                                    disabled={!isEditing}
                                />
                            </div>
                        </CardContent>
                    </Card>

                        {/* Account Management */}
                        <AccountManagement userType="admin" />
                    </div>
                </div>
            </div>
        </div>
    );
}