"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import {
    LayoutDashboard,
    AlertTriangle,
    FileText,
    Gavel,
    Map,
    Building,
    Download,
    Settings,
    Users,
    LogOut,
    Menu,
    X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface AdminSidebarProps {
    pendingIssues?: number;
}

export default function AdminSidebar({ pendingIssues = 0 }: AdminSidebarProps) {
    const router = useRouter();
    const pathname = usePathname();
    const supabase = createClient();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [currentUserProfile, setCurrentUserProfile] = useState<any>(null);
    const [userDepartmentName, setUserDepartmentName] = useState<string>("");

    const navItems = [
        {
            id: "dashboard",
            label: "Dashboard",
            icon: LayoutDashboard,
            badge: null,
            route: "/admin/dashboard",
        },
        {
            id: "issues",
            label: "Manage Issues",
            icon: AlertTriangle,
            badge: pendingIssues > 0 ? pendingIssues.toString() : null,
            route: "/admin/issues",
        },
        {
            id: "reports",
            label: "Reports",
            icon: FileText,
            badge: null,
            route: "/admin/reports",
        },
    ];

    useEffect(() => {
        const fetchUserProfile = async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (user) {
                const { data: profile } = await (supabase as any)
                    .from("profiles")
                    .select("*")
                    .eq("id", user.id)
                    .single();

                setCurrentUserProfile(profile);

                if (profile?.department) {
                    const { data: dept } = await (supabase as any)
                        .from("departments")
                        .select("name")
                        .eq("id", profile.department)
                        .single();

                    if (dept) setUserDepartmentName(dept.name);
                }
            }
        };

        fetchUserProfile();
    }, []);

    const navigateTo = (route: string) => {
        (router as any).push(route);
        setMobileMenuOpen(false);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        (router as any).push("/login");
    };

    const getCurrentPage = () => {
        if (pathname.includes("/profile")) return "profile";
        const item = navItems.find((item) => pathname === item.route);
        return item?.id || "dashboard";
    };

    const currentPage = getCurrentPage();

    return (
        <>
            {/* Mobile Menu Toggle */}
            <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-emerald-50 to-white shadow-lg border-0">
                <div className="flex items-center justify-between px-4 py-3">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-[#2E6A56] to-emerald-600 bg-clip-text text-transparent">
                        JANMARG Admin
                    </h1>
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="p-2"
                    >
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Sidebar Navigation */}
            <div
                className={`${
                    mobileMenuOpen ? "block" : "hidden"
                } md:block fixed md:relative top-14 md:top-0 left-0 right-0 md:w-64 bg-gradient-to-br from-white to-emerald-50/30 shadow-xl border-0 transition-all duration-300 z-40 md:z-auto h-screen overflow-y-auto`}
            >
                <div className="p-4 md:p-6 space-y-6">
                    {/* Sidebar Header */}
                    <div className="hidden md:block">
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-[#2E6A56] to-emerald-600 bg-clip-text text-transparent mb-2">
                            JANMARG
                        </h2>
                        <p className="text-sm text-gray-600">Admin Dashboard</p>
                    </div>

                    {/* Navigation Items */}
                    <nav className="space-y-2">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = currentPage === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => navigateTo(item.route)}
                                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 ${
                                        isActive
                                            ? "bg-gradient-to-r from-[#2E6A56] to-emerald-600 text-white shadow-lg transform scale-100"
                                            : "text-emerald-700 hover:bg-emerald-50 hover:shadow-sm"
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Icon size={20} />
                                        <span className="font-medium">
                                            {item.label}
                                        </span>
                                    </div>
                                    {item.badge && (
                                        <Badge
                                            variant="secondary"
                                            className={`${
                                                item.id === "issues"
                                                    ? "bg-red-500"
                                                    : "bg-emerald-600"
                                            } text-white border-0 shadow-sm`}
                                        >
                                            {item.badge}
                                        </Badge>
                                    )}
                                </button>
                            );
                        })}
                    </nav>

                    {/* Profile & Logout Section */}
                    <div className="pt-6 space-y-2">
                        <button
                            onClick={() => navigateTo("/admin/profile")}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                                currentPage === "profile"
                                    ? "bg-gradient-to-r from-[#2E6A56] to-emerald-600 text-white shadow-md"
                                    : "text-emerald-700 hover:bg-emerald-50 hover:shadow-sm"
                            }`}
                        >
                            <Users size={20} />
                            <span className="font-medium">Profile</span>
                        </button>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-red-600 hover:bg-red-50 hover:shadow-sm"
                        >
                            <LogOut size={20} />
                            <span className="font-medium">Logout</span>
                        </button>
                    </div>

                    {/* User Info Section */}
                    <div className="pt-4">
                        <div className="flex items-center gap-3 p-3 bg-gradient-to-br from-emerald-50 to-green-50 rounded-lg shadow-md">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2E6A56] to-emerald-600 flex items-center justify-center text-white font-bold shadow-md">
                                {currentUserProfile?.full_name
                                    ?.charAt(0)
                                    ?.toUpperCase() || "A"}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium truncate text-gray-900">
                                    {currentUserProfile?.full_name ||
                                        "Admin User"}
                                </p>
                                <p className="text-xs text-gray-600 truncate">
                                    {userDepartmentName || "Super Admin"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
