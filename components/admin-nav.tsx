"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

// ✅ Correct imports for UI components
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// ✅ Correct supabase client import
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/auth-context";
import {
    BarChart3,
    Bell,
    FileText,
    Settings,
    Shield,
    Users,
    LogOut,
    Flag
} from "lucide-react";
import AdminNotifications from "@/components/admin-notifications";

// Navigation items
const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/admin/issues", label: "Manage Issues", icon: Settings },
  { href: "/admin/notifications", label: "Notifications", icon: Bell, badge: 5 },
  { href: "/admin/reports", label: "Reports", icon: FileText },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/crowdfunding", label: "₹ Funds", icon: undefined }, // No icon needed
  { href: "/admin/abhiyaan", label: "Abhiyaan", icon: Flag }, // No icon needed
];

export default function AdminNav() {
    const pathname = usePathname();
    const router = useRouter();
    const { signOut } = useAuth();
    const handleLogout = async () => {
        await signOut();
    };

  return (
    <div className="border-b bg-card">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left section */}
          <div className="flex items-center space-x-6">
            <Link href="/admin/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-accent-foreground" />
              </div>
              <span className="font-semibold text-lg">CivicAdmin</span>
            </Link>

            {/* Navigation links */}
            <nav className="flex items-center space-x-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                                return (
                                    <Link key={item.href} href={item.href as any}>
                                        <button
                                            className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 relative ${
                                                isActive 
                                                    ? 'bg-primary text-primary-foreground' 
                                                    : 'text-gray-700 hover:bg-gray-100'
                                            }`}
                                        >
                                             {/* ✅ Render icon only if it exists */}
                                            {Icon && <Icon className="w-4 h-4 mr-2" />}
                                            {item.label}
                                            {item.badge && (
                                                <Badge
                                                    variant="destructive"
                                                    className="ml-2 px-1 py-0 text-xs"
                                                >
                                                    {item.badge}
                                                </Badge>
                                            )}
                                        </button>
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    <div className="flex items-center space-x-4">
                        <AdminNotifications />

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
