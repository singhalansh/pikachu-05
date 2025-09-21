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
    Flag,
    CheckCircle,
    DollarSign,
} from "lucide-react";
import RealTimeNotifications from "@/components/real-time-notifications";
import { useIsMobile } from "@/hooks/use-mobile";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

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
        href: "/citizen/issues",
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
        href: "/citizen/crowdfunding",
        label: "₹ Funds",
        icon: DollarSign,
    },
    {
        href: "/citizen/Abhiyaan",
        label: "Abhiyaan",
        icon: Flag,
    },
];

export default function CitizenNav() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const { user, signOut } = useAuth();

    const displayName =
        (user?.user_metadata as any)?.full_name ||
        (user?.user_metadata as any)?.name ||
        (user?.email ? String(user.email).split("@")[0] : undefined) ||
        "Profile";

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
                const IconComponent = item.icon;

                return (
                    <Button
                        key={item.href}
                        variant={isActive ? "default" : "ghost"}
                        size={mobile ? "default" : "sm"}
                        asChild
                        className={`relative ${mobile ? "w-full justify-start h-11" : "h-9"
                            }`}
                        onClick={onItemClick}
                    >
                        <Link href={item.href as any}>
                            {IconComponent && <IconComponent className="w-4 h-4 mr-2" />}
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

    // Use the unified auth context logout
    const handleLogout = async () => {
        await signOut();
    };

    return (
        <div className="border-b bg-card sticky top-0 z-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3">
                <div className="flex items-center justify-between">
                    {/* Logo */}
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
                    <div className="hidden lg:flex lg:items-center lg:space-x-2">
                        {/* Combined Profile Button with Notifications */}
                        <div className="flex items-center space-x-2">
                            <RealTimeNotifications />
                            <Button
                                variant="default"
                                size="sm"
                                className="h-9 bg-orange-500 hover:bg-orange-600 text-white px-4"
                                asChild
                            >
                                <Link
                                    href="/citizen/profile"
                                    className="flex items-center"
                                >
                                    <Avatar className="w-6 h-6 mr-2">
                                        <AvatarImage
                                            src={
                                                (user?.user_metadata as any)
                                                    ?.avatar_url ||
                                                (user?.user_metadata as any)
                                                    ?.picture
                                            }
                                            alt={displayName}
                                        />
                                        <AvatarFallback className="bg-white text-orange-500 text-xs font-bold">
                                            {String(displayName)
                                                .substring(0, 2)
                                                .toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span>{displayName}</span>
                                </Link>
                            </Button>
                        </div>

                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-9 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={handleLogout}
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            Logout
                        </Button>
                    </div>

                    {/* Mobile Navigation */}
                    <div className="flex lg:hidden items-center space-x-2">
                        {/* Combined Profile Button with Notifications - Mobile */}
                        <div className="flex items-center space-x-2">
                            <RealTimeNotifications />
                            <Button
                                variant="default"
                                size="sm"
                                className="h-9 bg-orange-500 hover:bg-orange-600 text-white px-3"
                                asChild
                            >
                                <Link
                                    href="/citizen/profile"
                                    className="flex items-center"
                                >
                                    <Avatar className="w-5 h-5 mr-1">
                                        <AvatarImage
                                            src={
                                                (user?.user_metadata as any)
                                                    ?.avatar_url ||
                                                (user?.user_metadata as any)
                                                    ?.picture
                                            }
                                            alt={displayName}
                                        />
                                        <AvatarFallback className="bg-white text-orange-500 text-xs font-bold">
                                            {String(displayName)
                                                .substring(0, 2)
                                                .toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="text-sm">
                                        {displayName}
                                    </span>
                                </Link>
                            </Button>
                        </div>

                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-9 w-9 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={handleLogout}
                        >
                            <LogOut className="w-4 h-4" />
                        </Button>
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
                                        <NavItems mobile onItemClick={() => setIsOpen(false)} />
                                    </div>

                                    <div className="border-t pt-4 space-y-2">
                                        <div className="flex items-center gap-3 px-3 py-2 mb-2">
                                            <Avatar className="w-9 h-9">
                                                <AvatarImage
                                                    src={
                                                        (
                                                            user?.user_metadata as any
                                                        )?.avatar_url ||
                                                        (
                                                            user?.user_metadata as any
                                                        )?.picture
                                                    }
                                                    alt={displayName}
                                                />
                                                <AvatarFallback>
                                                    {String(displayName)
                                                        .substring(0, 2)
                                                        .toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="min-w-0">
                                                <div className="font-medium truncate">
                                                    {displayName}
                                                </div>
                                                <div className="text-xs text-muted-foreground truncate">
                                                    {user?.email ?? ""}
                                                </div>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            className="w-full justify-start h-11"
                                            asChild
                                            onClick={() => setIsOpen(false)}
                                        >
                                            <Link href="/citizen/profile">
                                                <User className="w-4 h-4 mr-2" />
                                                Profile
                                            </Link>
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            className="w-full justify-start h-11"
                                            asChild
                                            onClick={() => setIsOpen(false)}
                                        >
                                            <Link href="/citizen/issues">
                                                <FileText className="w-4 h-4 mr-2" />
                                                My Issues
                                            </Link>
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            className="w-full justify-start h-11"
                                            asChild
                                            onClick={() => setIsOpen(false)}
                                        >
                                            <Link href="/citizen/notifications">
                                                <Bell className="w-4 h-4 mr-2" />
                                                Notifications
                                            </Link>
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

