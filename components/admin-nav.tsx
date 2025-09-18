"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import {
    BarChart3,
    Bell,
    FileText,
    Settings,
    Shield,
    Users,
    LogOut,
} from "lucide-react";
import NotificationSystem from "@/components/notification-system";

const navItems = [
    {
        href: "/admin/dashboard",
        label: "Dashboard",
        icon: BarChart3,
    },
    {
        href: "/admin/issues",
        label: "Manage Issues",
        icon: Settings,
    },
    {
        href: "/admin/notifications",
        label: "Notifications",
        icon: Bell,
        badge: 5,
    },
    {
        href: "/admin/reports",
        label: "Reports",
        icon: FileText,
    },
    {
        href: "/admin/users",
        label: "Users",
        icon: Users,
    },
];

export default function AdminNav() {
    const pathname = usePathname();
    const router = useRouter();
    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push("/admin/login");
    };

    return (
        <div className="border-b bg-card">
            <div className="container mx-auto px-4 py-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                        <Link
                            href="/admin/dashboard"
                            className="flex items-center space-x-2"
                        >
                            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                                <Shield className="w-5 h-5 text-accent-foreground" />
                            </div>
                            <span className="font-semibold text-lg">
                                CivicAdmin
                            </span>
                        </Link>

                        <nav className="flex items-center space-x-1">
                            {navItems.map((item) => {
                                const isActive = pathname === item.href;
                                const Icon = item.icon;

                                return (
                                    <Button
                                        key={item.href}
                                        variant={isActive ? "default" : "ghost"}
                                        size="sm"
                                        asChild
                                        className="relative"
                                    >
                                        <Link href={item.href}>
                                            <Icon className="w-4 h-4 mr-2" />
                                            {item.label}
                                            {item.badge && (
                                                <Badge
                                                    variant="destructive"
                                                    className="ml-2 px-1 py-0 text-xs"
                                                >
                                                    {item.badge}
                                                </Badge>
                                            )}
                                        </Link>
                                    </Button>
                                );
                            })}
                        </nav>
                    </div>

                    <div className="flex items-center space-x-4">
                        <NotificationSystem />

                        <Button variant="ghost" size="sm">
                            <Shield className="w-4 h-4 mr-2" />
                            Admin Panel
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleLogout}
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            Logout
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
