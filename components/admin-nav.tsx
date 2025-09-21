"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

// ✅ Correct imports for UI components
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

// ✅ Correct supabase client import
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/auth-context";
import { UserAvatar } from "@/components/ui/user-avatar";
import { getUserDisplayName } from "@/lib/utils/avatar";
import {
    BarChart3,
    Bell,
    FileText,
    Settings,
    Shield,
    Users,
    LogOut,
  User,
  Flag,
  Menu,
  X,
} from "lucide-react";

// ✅ Final merged navigation items
const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/admin/issues", label: "Manage Issues", icon: Settings },
  { href: "/admin/notifications", label: "Notifications", icon: Bell },
  { href: "/admin/reports", label: "Reports", icon: FileText },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/crowdfunding", label: "₹ Funds" }, // no icon
  { href: "/admin/abhiyaan", label: "Abhiyaan", icon: Flag },
];

// Page titles for breadcrumb
const getPageTitle = (pathname: string) => {
  const titles: { [key: string]: string } = {
    "/admin/dashboard": "Dashboard",
    "/admin/issues": "Manage Issues",
    "/admin/notifications": "Notifications",
    "/admin/reports": "Reports",
    "/admin/users": "Users",
    "/admin/profile": "Profile",
    "/admin/crowdfunding": "₹ Funds",
    "/admin/abhiyaan": "Abhiyaan",
  };
  
  return titles[pathname] || "Admin Panel";
};

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // User state
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentUserProfile, setCurrentUserProfile] = useState<any>(null);
  const [userRole, setUserRole] = useState<string>("");
  const [notifications, setNotifications] = useState(0);
  
  const supabase = createClient();
  
  // Load user data and notifications
  useEffect(() => {
    const loadUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUser(user);
        setUserRole(user.user_metadata?.role || user.role || "citizen");
        
        // Fetch user profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        setCurrentUserProfile(profile);
        
        // Fetch notification count
        const { data: newIssues } = await supabase
          .from("issues")
          .select("id")
          .eq("status", "submitted")
          .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
        const notificationCount = newIssues?.length || 0;
        console.log("Notification count:", notificationCount);
        setNotifications(notificationCount);
      }
    };
    
    loadUserData();
  }, []);
  
  const handleLogout = async () => {
    await signOut();
    setMobileMenuOpen(false);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <div className="bg-white/95 border-b border-gray-200 sticky top-0 z-50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left section - Logo */}
          <div className="flex items-center">
            <Link href="/admin/dashboard" className="flex items-center space-x-3 animate-slideInLeft">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-xl text-gray-900 hidden sm:block">CivicAdmin</span>
              <span className="font-bold text-lg text-gray-900 sm:hidden">Civic</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.filter(item => item.href !== "/admin/notifications").map((item, index) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link key={item.href} href={item.href as any}>
                  <button
                    className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 relative hover:scale-105 ${
                      isActive
                        ? "bg-gray-700 text-blue-300 shadow-md transform scale-105"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {Icon && <Icon className="w-4 h-4 mr-2" />}
                    {item.label}
                    {(item as any).badge && (
                      <Badge
                        variant="destructive"
                        className="ml-2 px-1.5 py-0.5 text-xs animate-pulse"
                      >
                        {(item as any).badge}
                      </Badge>
                    )}
                  </button>
                </Link>
              );
            })}
          </nav>

          {/* Desktop Right section */}
          <div className="hidden lg:flex items-center space-x-4 animate-slideInRight">
            {/* Notifications */}
            <Button
              variant="outline"
              size="sm"
              className="relative border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200 hover:scale-105"
              asChild
            >
              <Link href="/admin/notifications">
                <Bell className="w-4 h-4" />
                {notifications > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                    {notifications}
                  </div>
                )}
              </Link>
            </Button>
            
            {/* User Profile */}
            {currentUser && (
              <Link href="/admin/profile" className="flex items-center space-x-3 pl-4 border-l border-gray-200 hover:bg-gray-50 rounded-lg px-2 py-1 transition-all duration-200 hover:scale-105">
                <UserAvatar
                  user={currentUser}
                  profile={currentUserProfile}
                  size="sm"
                />
                <div className="hidden lg:block">
                  <p className="text-sm font-medium text-gray-900">
                    {getUserDisplayName(currentUser, currentUserProfile)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {userRole
                      .replace("_", " ")
                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                  </p>
                </div>
              </Link>
            )}
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout}
              className="border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200 hover:scale-105"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>

          {/* Tablet Right section (768px to lg) */}
          <div className="hidden md:flex lg:hidden items-center space-x-4">
            {/* Notifications */}
            <Button
              variant="outline"
              size="sm"
              className="relative border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200"
              asChild
            >
              <Link href="/admin/notifications">
                <Bell className="w-4 h-4" />
                {notifications > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                    {notifications}
                  </div>
                )}
              </Link>
            </Button>
            
            {/* User Profile */}
            {currentUser && (
              <Link href="/admin/profile" className="flex items-center space-x-3 pl-4 border-l border-gray-200 hover:bg-gray-50 rounded-lg px-2 py-1 transition-all duration-200 hover:scale-105">
                <UserAvatar
                  user={currentUser}
                  profile={currentUserProfile}
                  size="sm"
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {getUserDisplayName(currentUser, currentUserProfile)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {userRole
                      .replace("_", " ")
                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                  </p>
                </div>
              </Link>
            )}
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout}
              className="border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200 hover:scale-105"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center space-x-2 md:hidden">
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile/Tablet Menu Overlay */}
        {mobileMenuOpen && (
          <>
            <div 
              className="fixed inset-0 bg-gray-900 bg-opacity-20 backdrop-blur-sm z-40 lg:hidden"
              onClick={closeMobileMenu}
            />
            <div className="absolute top-0 left-0 right-0 bg-white border-b border-gray-200 shadow-lg z-50 lg:hidden animate-slideDown">
              <div className="px-4 py-4 space-y-2 max-h-96 overflow-y-auto">
                {/* Close Button */}
                <div className="flex justify-end mb-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={closeMobileMenu}
                    className="text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
                {/* Mobile Navigation Links */}
                {navItems.map((item, index) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;

                  return (
                    <Link key={item.href} href={item.href as any} onClick={closeMobileMenu}>
                      <button
                        className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 animate-slideInUp hover:scale-105 ${
                          isActive
                            ? "bg-gray-700 text-blue-300 shadow-md transform scale-105"
                            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                        }`}
                        style={{ animationDelay: `${index * 0.05}s` }}
                      >
                        {Icon && <Icon className="w-5 h-5 mr-3" />}
                        <span className="flex-1 text-left">{item.label}</span>
                        {item.href === "/admin/notifications" && notifications > 0 && (
                          <Badge
                            variant="destructive"
                            className="ml-2 px-1.5 py-0.5 text-xs"
                          >
                            {notifications}
                          </Badge>
                        )}
                      </button>
                    </Link>
                  );
                })}

                {/* Mobile Profile */}
                {currentUser && (
                  <div className="pt-2 border-t border-gray-200">
                    <Link 
                      href="/admin/profile" 
                      className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 rounded-lg transition-all duration-200"
                      onClick={closeMobileMenu}
                    >
                      <UserAvatar
                        user={currentUser}
                        profile={currentUserProfile}
                        size="sm"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {getUserDisplayName(currentUser, currentUserProfile)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {userRole
                            .replace("_", " ")
                            .replace(/\b\w/g, (l) => l.toUpperCase())}
                        </p>
                      </div>
                    </Link>
                  </div>
                )}



                {/* Mobile Logout */}
                <div className="pt-2 border-t border-gray-200">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleLogout}
                    className="w-full justify-start border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200"
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    Logout
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Add these animations to your global CSS or include in your component styles
const styles = `
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeInUp {
  animation: fadeInUp 0.6s ease-out;
  animation-fill-mode: both;
}

.animate-slideInLeft {
  animation: slideInLeft 0.6s ease-out;
  animation-fill-mode: both;
}

.animate-slideInRight {
  animation: slideInRight 0.6s ease-out;
  animation-fill-mode: both;
}

.animate-slideDown {
  animation: slideDown 0.3s ease-out;
}

.animate-slideInUp {
  animation: slideInUp 0.4s ease-out;
  animation-fill-mode: both;
}

/* Responsive breakpoints */
@media (max-width: 640px) {
  .animate-fadeInUp {
    animation-duration: 0.4s;
  }
}
`;