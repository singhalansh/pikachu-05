"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
    Home,
    Plus,
    FileText,
    Bell,
    Trophy,
    User,
    LogOut,
    Menu,
} from "lucide-react";
import NotificationSystem from "@/components/notification-system";
import { useIsMobile } from "@/hooks/use-mobile";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth-utils";

const navItems = [
    {
        href: "/citizen/dashboard",
        label: "Dashboard",
        icon: Home,
    },
    {
        href: "/citizen/report",
        label: "Report Issue",
        icon: Plus,
    },
    {
        href: "/citizen/my-issues",
        label: "My Issues",
        icon: FileText,
    },
    {
        href: "/citizen/notifications",
        label: "Notifications",
        icon: Bell,
        badge: 3, // Unread count
    },
    {
        href: "/citizen/leaderboard",
        label: "Leaderboard",
        icon: Trophy,
    },
];

export default function CitizenNav() {
    const pathname = usePathname();
    const isMobile = useIsMobile();
    const [isOpen, setIsOpen] = useState(false);

    const NavItems = ({
        mobile = false,
        onItemClick,
    }: {
        mobile?: boolean;
        onItemClick?: () => void;
    }) => (
        <nav
            className={
                mobile
                    ? "flex flex-col space-y-2"
                    : "hidden lg:flex lg:items-center lg:space-x-1"
            }
        >
            {navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                return (
                    <Button
                        key={item.href}
                        variant={isActive ? "default" : "ghost"}
                        size={mobile ? "default" : "sm"}
                        asChild
                        className={`relative ${
                            mobile ? "w-full justify-start h-11" : "h-9"
                        }`}
                        onClick={onItemClick}
                    >
                        <Link href={item.href as any}>
                            <Icon className="w-4 h-4 mr-2" />
                            {item.label}
                            {item.badge && (
                                <Badge
                                    variant="destructive"
                                    className="ml-auto px-1 py-0 text-xs"
                                >
                                    {item.badge}
                                </Badge>
                            )}
                        </Link>
                    </Button>
                );
            })}
        </nav>
    );

    // Add Supabase logout logic
    const handleLogout = async () => {
        await signOut('/citizen/login');
    };

    return (
        <div className="border-b bg-card sticky top-0 z-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3">
                <div className="flex items-center justify-between">
                    {/* Logo - Always visible */}
                    <Link
                        href="/citizen/dashboard"
                        className="flex items-center space-x-2"
                    >
                        <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                            <Home className="w-5 h-5 text-accent-foreground" />
                        </div>
                        <span className="font-semibold text-base sm:text-lg">
                            CivicReport
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <NavItems />

                    {/* Desktop User Actions */}
                    <div className="hidden lg:flex lg:items-center lg:space-x-4">
                        <NotificationSystem />
                        <Button variant="ghost" size="sm" className="h-9">
                            <User className="w-4 h-4 mr-2" />
                            Profile
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-9"
                            onClick={handleLogout}
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            Logout
                        </Button>
                    </div>

                    {/* Mobile Navigation */}
                    <div className="flex lg:hidden items-center space-x-2">
                        <NotificationSystem />
                        <Sheet open={isOpen} onOpenChange={setIsOpen}>
                            <SheetTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-9 w-9 p-0"
                                >
                                    <Menu className="w-5 h-5" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="w-80">
                                <div className="flex flex-col h-full">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center space-x-2">
                                            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                                                <Home className="w-5 h-5 text-accent-foreground" />
                                            </div>
                                            <span className="font-semibold text-lg">
                                                CivicReport
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex-1">
                                        <NavItems
                                            mobile
                                            onItemClick={() => setIsOpen(false)}
                                        />
                                    </div>

                                    <div className="border-t pt-4 space-y-2">
                                        <Button
                                            variant="ghost"
                                            className="w-full justify-start h-11"
                                        >
                                            <User className="w-4 h-4 mr-2" />
                                            Profile
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            className="w-full justify-start h-11"
                                            onClick={handleLogout}
                                        >
                                            <LogOut className="w-4 h-4 mr-2" />
                                            Logout
                                        </Button>
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </div>
        </div>
    );
}
