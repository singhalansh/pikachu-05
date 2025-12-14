"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
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
        router.push(route);
        setMobileMenuOpen(false);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/login");
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
            <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="md:hidden fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-2xl border-b border-white/10 shadow-lg"
            >
                <div className="flex items-center justify-between px-4 py-3">
                    <h1 className="text-2xl font-bold text-white">
                        civik Admin
                    </h1>
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="p-2 text-white"
                    >
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </motion.button>
                </div>
            </motion.div>

            {/* Sidebar Navigation */}
            <motion.div
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className={`${
                    mobileMenuOpen ? "block" : "hidden"
                } md:block fixed md:relative top-14 md:top-0 left-0 right-0 md:w-64 bg-black/90 backdrop-blur-2xl shadow-xl border-r border-white/10 transition-all duration-300 z-50 md:z-10 h-screen overflow-y-auto`}
            >
                <div className="p-4 md:p-6 space-y-6">
                    {/* Sidebar Header */}
                    <div className="hidden md:block">
                        <h2 className="text-2xl font-bold text-white mb-2">
                            civik
                        </h2>
                        <p className="text-sm text-white/60">Admin Dashboard</p>
                    </div>

                    {/* Navigation Items */}
                    <nav className="space-y-2">
                        {navItems.map((item, idx) => {
                            const Icon = item.icon;
                            const isActive = currentPage === item.id;
                            return (
                                <motion.button
                                    key={item.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    whileHover={{ scale: 1.02, x: 4 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => navigateTo(item.route)}
                                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 ${
                                        isActive
                                            ? "bg-gradient-to-r from-[#2E6A56] to-[#5C9479] text-white shadow-lg shadow-[#2E6A56]/30"
                                            : "text-white/70 hover:bg-white/10 hover:text-white"
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
                                </motion.button>
                            );
                        })}
                    </nav>

                    {/* Profile & Logout Section */}
                    <div className="pt-6 space-y-2">
                        <motion.button
                            whileHover={{ scale: 1.02, x: 4 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => navigateTo("/admin/profile")}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                                currentPage === "profile"
                                    ? "bg-gradient-to-r from-[#2E6A56] to-[#5C9479] text-white shadow-md shadow-[#2E6A56]/30"
                                    : "text-white/70 hover:bg-white/10 hover:text-white"
                            }`}
                        >
                            <Users size={20} />
                            <span className="font-medium">Profile</span>
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.02, x: 4 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-red-400 hover:bg-red-500/20 hover:text-red-300"
                        >
                            <LogOut size={20} />
                            <span className="font-medium">Logout</span>
                        </motion.button>
                    </div>

                    {/* User Info Section */}
                    <div className="pt-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-lg backdrop-blur-xl shadow-md"
                        >
                            <motion.div
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2E6A56] to-[#5C9479] flex items-center justify-center text-white font-bold shadow-md shadow-[#2E6A56]/30"
                            >
                                {currentUserProfile?.full_name
                                    ?.charAt(0)
                                    ?.toUpperCase() || "A"}
                            </motion.div>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium truncate text-white">
                                    {currentUserProfile?.full_name ||
                                        "Admin User"}
                                </p>
                                <p className="text-xs text-white/60 truncate">
                                    {userDepartmentName || "Super Admin"}
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </motion.div>
        </>
    );
}
