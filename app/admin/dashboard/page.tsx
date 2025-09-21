"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
} from "recharts";
import {
    Shield,
    AlertTriangle,
    CheckCircle,
    Clock,
    Eye,
    MapPin,
    Calendar,
    TrendingUp,
    Bell,
    FileText,
    BarChart3,
    Loader2,
} from "lucide-react";
import AnalyticsCharts from "@/components/analytics-charts";
import { createClient } from "@/lib/supabase/client";
import { UserAvatar } from "@/components/ui/user-avatar";
import { getUserDisplayName } from "@/lib/utils/avatar";
import { isIssueForDepartment, getDepartmentName } from "@/lib/departments";

// Types for our data
type Issue = {
    id: string;
    title: string;
    category: string;
    status: string;
    priority: string | null;
    location_address: string | null;
    created_at: string;
    updated_at: string | null;
    profiles?: {
        full_name: string;
        email: string;
    };
};

type DashboardStats = {
    totalIssues: number;
    pendingIssues: number;
    inProgressIssues: number;
    resolvedIssues: number;
    newThisWeek: number;
    resolvedThisWeek: number;
    averageResolutionTime: number;
    citizenSatisfaction: number;
};

type CategoryData = {
    name: string;
    value: number;
    color: string;
};

type MonthlyTrend = {
    month: string;
    reported: number;
    resolved: number;
};

type DepartmentPerformance = {
    department: string;
    assigned: number;
    completed: number;
    efficiency: number;
};

// Helper functions
const getStatusColor = (status: string) => {
    switch (status) {
        case "submitted":
            return "bg-status-submitted text-white";
        case "in-review":
            return "bg-status-review text-white";
        case "in-progress":
            return "bg-status-progress text-white";
        case "resolved":
            return "bg-status-resolved text-white";
        default:
            return "bg-muted text-muted-foreground";
    }
};

const getPriorityColor = (priority: string) => {
    switch (priority) {
        case "high":
            return "bg-destructive text-destructive-foreground";
        case "medium":
            return "bg-status-review text-white";
        case "low":
            return "bg-muted text-muted-foreground";
        default:
            return "bg-muted text-muted-foreground";
    }
};

export default function AdminDashboard() {
    const router = useRouter();
    const [selectedTimeRange, setSelectedTimeRange] = useState("7d");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Dynamic data state
    const [overviewStats, setOverviewStats] = useState<DashboardStats>({
        totalIssues: 0,
        pendingIssues: 0,
        inProgressIssues: 0,
        resolvedIssues: 0,
        newThisWeek: 0,
        resolvedThisWeek: 0,
        averageResolutionTime: 0,
        citizenSatisfaction: 0,
    });
    const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
    const [monthlyTrends, setMonthlyTrends] = useState<MonthlyTrend[]>([]);
    const [departmentPerformance, setDepartmentPerformance] = useState<
        DepartmentPerformance[]
    >([]);
    const [recentIssues, setRecentIssues] = useState<Issue[]>([]);
    const [notifications, setNotifications] = useState(0);

    // Additional data for analytics charts
    const [analyticsMonthlyData, setAnalyticsMonthlyData] = useState<any[]>([]);
    const [analyticsCategoryData, setAnalyticsCategoryData] = useState<any[]>(
        []
    );
    const [analyticsResponseTimeData, setAnalyticsResponseTimeData] = useState<
        any[]
    >([]);
    const [analyticsResolutionTrendData, setAnalyticsResolutionTrendData] =
        useState<any[]>([]);

    const supabase = createClient();

    // Current user state
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [currentUserProfile, setCurrentUserProfile] = useState<any>(null);
    const [userDepartment, setUserDepartment] = useState<string | null>(null);
    const [userDepartmentName, setUserDepartmentName] = useState<string>("");
    const [userRole, setUserRole] = useState<string>("");

    useEffect(() => {
        const checkAuth = async () => {
            const {
                data: { user },
                error,
            } = await supabase.auth.getUser();

            if (error || !user) {
                router.push("/admin/login");
                return;
            }

            // Check if user has staff role (any role other than citizen)
            const role = user.user_metadata?.role || user.role || "citizen";
            setUserRole(role);
            if (role === "citizen") {
                router.push("/citizen/dashboard");
                return;
            }

            setCurrentUser(user);

            // Fetch user profile
            const { data: profile } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", user.id)
                .single();

            setCurrentUserProfile(profile);

            // Get user's department from metadata
            const department = user.user_metadata?.department;
            setUserDepartment(department);

            // Get department name
            if (department) {
                const departmentName = await getDepartmentName(department);
                setUserDepartmentName(departmentName);
            }

            // Load dashboard data
            await loadDashboardData();
        };

        checkAuth();
    }, [router]);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch all data in parallel
            const [
                statsResult,
                categoriesResult,
                trendsResult,
                departmentsResult,
                recentResult,
                notificationsResult,
                analyticsMonthlyResult,
                analyticsCategoryResult,
                analyticsResponseTimeResult,
                analyticsResolutionTrendResult,
            ] = await Promise.all([
                fetchOverviewStats(),
                fetchCategoryData(),
                fetchMonthlyTrends(),
                fetchDepartmentPerformance(),
                fetchRecentIssues(),
                fetchNotificationCount(),
                fetchAnalyticsMonthlyData(),
                fetchAnalyticsCategoryData(),
                fetchAnalyticsResponseTimeData(),
                fetchAnalyticsResolutionTrendData(),
            ]);

            setOverviewStats(statsResult);
            setCategoryData(categoriesResult);
            setMonthlyTrends(trendsResult);
            setDepartmentPerformance(departmentsResult);
            setRecentIssues(recentResult);
            setNotifications(notificationsResult);
            setAnalyticsMonthlyData(analyticsMonthlyResult);
            setAnalyticsCategoryData(analyticsCategoryResult);
            setAnalyticsResponseTimeData(analyticsResponseTimeResult);
            setAnalyticsResolutionTrendData(analyticsResolutionTrendResult);
        } catch (err: any) {
            console.error("Error loading dashboard data:", err);
            setError(err.message || "Failed to load dashboard data");
        } finally {
            setLoading(false);
        }
    };

    const fetchOverviewStats = async (): Promise<DashboardStats> => {
        // Get all issues
        const { data: allIssues, error } = await supabase
            .from("issues")
            .select(
                "status, created_at, updated_at, title, description, category"
            );

        if (error) throw error;

        // Type assertion to help TypeScript understand the structure
        type IssueData = {
            status: string;
            created_at: string;
            updated_at: string | null;
            title: string;
            description: string;
            category: string;
        };

        let typedIssues = (allIssues || []) as IssueData[];

        // Filter issues by department if user has a specific department
        if (userDepartment) {
            const departmentFilteredIssues = [];
            for (const issue of typedIssues) {
                if (await isIssueForDepartment(issue, userDepartment)) {
                    departmentFilteredIssues.push(issue);
                }
            }
            typedIssues = departmentFilteredIssues;
        }

        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        const totalIssues = typedIssues.length || 0;
        const pendingIssues =
            typedIssues.filter((i) => i.status === "submitted").length || 0;
        const inProgressIssues =
            typedIssues.filter((i) =>
                ["in-review", "in-progress"].includes(i.status)
            ).length || 0;
        const resolvedIssues =
            typedIssues.filter((i) => i.status === "resolved").length || 0;

        const newThisWeek =
            typedIssues.filter((i) => new Date(i.created_at) >= oneWeekAgo)
                .length || 0;

        const resolvedThisWeek =
            typedIssues.filter(
                (i) =>
                    i.status === "resolved" &&
                    i.updated_at &&
                    new Date(i.updated_at) >= oneWeekAgo
            ).length || 0;

        // Calculate average resolution time
        const resolvedWithTimes =
            typedIssues.filter(
                (i) => i.status === "resolved" && i.updated_at
            ) || [];

        const avgResolutionTime =
            resolvedWithTimes.length > 0
                ? resolvedWithTimes.reduce((sum, issue) => {
                      const created = new Date(issue.created_at);
                      const resolved = new Date(issue.updated_at!);
                      const days =
                          (resolved.getTime() - created.getTime()) /
                          (1000 * 60 * 60 * 24);
                      return sum + days;
                  }, 0) / resolvedWithTimes.length
                : 0;

        // Mock citizen satisfaction for now (could be calculated from ratings/feedback)
        const citizenSatisfaction =
            resolvedIssues > 0
                ? Math.min(95, 70 + (resolvedIssues / totalIssues) * 25)
                : 0;

        return {
            totalIssues,
            pendingIssues,
            inProgressIssues,
            resolvedIssues,
            newThisWeek,
            resolvedThisWeek,
            averageResolutionTime: Math.round(avgResolutionTime * 10) / 10,
            citizenSatisfaction: Math.round(citizenSatisfaction),
        };
    };

    const fetchCategoryData = async (): Promise<CategoryData[]> => {
        const { data: issues, error } = await supabase
            .from("issues")
            .select("category");

        if (error) throw error;

        const categoryColors: { [key: string]: string } = {
            pothole: "#8b5cf6",
            streetlight: "#06b6d4",
            garbage: "#10b981",
            "water-leakage": "#f59e0b",
            traffic: "#ef4444",
            other: "#6b7280",
        };

        const typedIssues = (issues || []) as { category: string }[];
        const categoryCounts = typedIssues.reduce(
            (acc: { [key: string]: number }, issue) => {
                const category = issue.category || "other";
                acc[category] = (acc[category] || 0) + 1;
                return acc;
            },
            {}
        );

        return Object.entries(categoryCounts).map(([category, count]) => ({
            name:
                category.charAt(0).toUpperCase() +
                category.slice(1).replace("-", " "),
            value: count,
            color: categoryColors[category] || categoryColors.other,
        }));
    };

    const fetchMonthlyTrends = async (): Promise<MonthlyTrend[]> => {
        const { data: issues, error } = await supabase
            .from("issues")
            .select("created_at, updated_at, status");

        if (error) throw error;

        // Type assertion for the issues data
        type TrendIssueData = {
            created_at: string;
            updated_at: string | null;
            status: string;
        };
        const typedIssues = (issues || []) as TrendIssueData[];

        // Get last 7 months
        const months = [];
        const now = new Date();
        for (let i = 6; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            months.push({
                date,
                name: date.toLocaleDateString("en-US", { month: "short" }),
            });
        }

        return months.map((month) => {
            const nextMonth = new Date(
                month.date.getFullYear(),
                month.date.getMonth() + 1,
                1
            );

            const reported =
                typedIssues.filter((issue) => {
                    const created = new Date(issue.created_at);
                    return created >= month.date && created < nextMonth;
                }).length || 0;

            const resolved =
                typedIssues.filter((issue) => {
                    if (issue.status !== "resolved" || !issue.updated_at)
                        return false;
                    const updated = new Date(issue.updated_at);
                    return updated >= month.date && updated < nextMonth;
                }).length || 0;

            return {
                month: month.name,
                reported,
                resolved,
            };
        });
    };

    const fetchDepartmentPerformance = async (): Promise<
        DepartmentPerformance[]
    > => {
        // This would ideally come from a departments table and assignments
        // For now, we'll create mock data based on categories
        const { data: issues, error } = await supabase
            .from("issues")
            .select("category, status, assigned_to");

        if (error) throw error;

        // Type assertion for department performance data
        type DeptIssueData = {
            category: string;
            status: string;
            assigned_to: string | null;
        };
        const typedIssues = (issues || []) as DeptIssueData[];

        const departmentMap: { [key: string]: string } = {
            pothole: "Road Maintenance",
            streetlight: "Electrical Services",
            garbage: "Sanitation",
            "water-leakage": "Water & Sewage",
            traffic: "Traffic Management",
        };

        const deptStats: {
            [key: string]: { assigned: number; completed: number };
        } = {};

        typedIssues.forEach((issue) => {
            const dept = departmentMap[issue.category] || "General Services";
            if (!deptStats[dept]) {
                deptStats[dept] = { assigned: 0, completed: 0 };
            }

            if (
                issue.assigned_to ||
                ["in-progress", "resolved"].includes(issue.status)
            ) {
                deptStats[dept].assigned++;
                if (issue.status === "resolved") {
                    deptStats[dept].completed++;
                }
            }
        });

        return Object.entries(deptStats).map(([department, stats]) => ({
            department,
            assigned: stats.assigned,
            completed: stats.completed,
            efficiency:
                stats.assigned > 0
                    ? Math.round((stats.completed / stats.assigned) * 100)
                    : 0,
        }));
    };

    const fetchRecentIssues = async (): Promise<Issue[]> => {
        const { data: issues, error } = await supabase
            .from("issues")
            .select(
                `
        *,
        profiles:user_id (
          full_name,
          email
        )
      `
            )
            .order("created_at", { ascending: false })
            .limit(50); // Get more issues to filter

        if (error) throw error;

        let filteredIssues = (issues || []) as Issue[];

        // Filter issues by department if user has a specific department
        if (userDepartment) {
            const departmentFilteredIssues = [];
            for (const issue of filteredIssues) {
                if (await isIssueForDepartment(issue, userDepartment)) {
                    departmentFilteredIssues.push(issue);
                }
            }
            filteredIssues = departmentFilteredIssues;
        }

        // Return only the first 5 after filtering
        return filteredIssues.slice(0, 5);
    };

    const fetchNotificationCount = async (): Promise<number> => {
        // Count unread notifications (new issues, urgent issues, etc.)
        const { data: newIssues, error } = await supabase
            .from("issues")
            .select("id")
            .eq("status", "submitted")
            .gte(
                "created_at",
                new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
            );

        if (error) return 0;
        return newIssues?.length || 0;
    };

    // Additional analytics data fetching functions
    const fetchAnalyticsMonthlyData = async () => {
        const { data: issues, error } = await supabase
            .from("issues")
            .select("created_at, updated_at, status");

        if (error) return [];

        // Type assertion for analytics data
        type AnalyticsIssueData = {
            created_at: string;
            updated_at: string | null;
            status: string;
        };
        const typedIssues = (issues || []) as AnalyticsIssueData[];

        // Get last 6 months
        const months = [];
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            months.push({
                date,
                name: date.toLocaleDateString("en-US", { month: "short" }),
            });
        }

        return months.map((month) => {
            const nextMonth = new Date(
                month.date.getFullYear(),
                month.date.getMonth() + 1,
                1
            );

            const submitted =
                typedIssues.filter((issue) => {
                    const created = new Date(issue.created_at);
                    return created >= month.date && created < nextMonth;
                }).length || 0;

            const resolved =
                typedIssues.filter((issue) => {
                    if (issue.status !== "resolved" || !issue.updated_at)
                        return false;
                    const updated = new Date(issue.updated_at);
                    return updated >= month.date && updated < nextMonth;
                }).length || 0;

            return {
                month: month.name,
                submitted,
                resolved,
            };
        });
    };

    const fetchAnalyticsCategoryData = async () => {
        const { data: issues, error } = await supabase
            .from("issues")
            .select("category");

        if (error) return [];

        // Type assertion for category data
        const typedIssues = (issues || []) as { category: string }[];

        const categoryColors: { [key: string]: string } = {
            pothole: "#3b82f6",
            streetlight: "#f59e0b",
            garbage: "#10b981",
            "water-leakage": "#8b5cf6",
            traffic: "#ef4444",
            other: "#6b7280",
        };

        const categoryCounts = typedIssues.reduce(
            (acc: { [key: string]: number }, issue) => {
                const category = issue.category || "other";
                acc[category] = (acc[category] || 0) + 1;
                return acc;
            },
            {}
        );

        return Object.entries(categoryCounts).map(([category, count]) => ({
            category:
                category.charAt(0).toUpperCase() +
                category.slice(1).replace("-", " "),
            count,
            color: categoryColors[category] || categoryColors.other,
        }));
    };

    const fetchAnalyticsResponseTimeData = async () => {
        const { data: issues, error } = await supabase
            .from("issues")
            .select("category, status, created_at, updated_at");

        if (error) return [];

        // Type assertion for response time data
        type ResponseTimeIssueData = {
            category: string;
            status: string;
            created_at: string;
            updated_at: string | null;
        };
        const typedIssues = (issues || []) as ResponseTimeIssueData[];

        const departmentMap: { [key: string]: string } = {
            pothole: "Roads",
            streetlight: "Lighting",
            garbage: "Sanitation",
            "water-leakage": "Water",
            traffic: "Traffic",
        };

        const deptResponseTimes: { [key: string]: number[] } = {};

        typedIssues.forEach((issue) => {
            const dept = departmentMap[issue.category] || "Other";
            if (!deptResponseTimes[dept]) {
                deptResponseTimes[dept] = [];
            }

            if (issue.status !== "submitted" && issue.updated_at) {
                const created = new Date(issue.created_at);
                const updated = new Date(issue.updated_at);
                const hours =
                    (updated.getTime() - created.getTime()) / (1000 * 60 * 60);
                deptResponseTimes[dept].push(hours);
            }
        });

        return Object.entries(deptResponseTimes)
            .map(([department, times]) => ({
                department,
                avgHours:
                    times.length > 0
                        ? Math.round(
                              times.reduce((sum, time) => sum + time, 0) /
                                  times.length
                          )
                        : 0,
            }))
            .filter((dept) => dept.avgHours > 0);
    };

    const fetchAnalyticsResolutionTrendData = async () => {
        const { data: issues, error } = await supabase
            .from("issues")
            .select("updated_at, status");

        if (error) return [];

        // Type assertion for resolution trend data
        type ResolutionTrendData = {
            updated_at: string | null;
            status: string;
        };
        const typedIssues = (issues || []) as ResolutionTrendData[];

        // Get last 6 weeks
        const weeks = [];
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
            const weekStart = new Date(
                now.getTime() - i * 7 * 24 * 60 * 60 * 1000
            );
            weeks.push({
                start: weekStart,
                name: `Week ${6 - i}`,
            });
        }

        return weeks.map((week) => {
            const weekEnd = new Date(
                week.start.getTime() + 7 * 24 * 60 * 60 * 1000
            );

            const resolved =
                typedIssues.filter((issue) => {
                    if (issue.status !== "resolved" || !issue.updated_at)
                        return false;
                    const updated = new Date(issue.updated_at);
                    return updated >= week.start && updated < weekEnd;
                }).length || 0;

            return {
                week: week.name,
                resolved,
                target: 15, // Target of 15 resolutions per week
            };
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground">
                        Loading dashboard...
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-4" />
                    <p className="text-red-600 mb-4">{error}</p>
                    <Button onClick={loadDashboardData}>Retry</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="border-b bg-card">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                        <div className="flex items-center space-x-3 sm:space-x-4">
                            <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-accent flex-shrink-0" />
                            <div>
                                <h1 className="text-xl sm:text-2xl font-bold">
                                    Municipal Dashboard
                                    {userDepartmentName && (
                                        <span className="ml-2 text-sm font-normal text-muted-foreground">
                                            - {userDepartmentName}
                                        </span>
                                    )}
                                </h1>
                                <p className="text-sm sm:text-base text-muted-foreground">
                                    {userDepartment
                                        ? `Department-specific issue management and analytics`
                                        : `Civic issue management and analytics`}
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
                            <Button
                                variant="outline"
                                size="sm"
                                asChild
                                className="h-10 justify-start sm:justify-center bg-transparent"
                            >
                                <Link href="/admin/notifications">
                                    <Bell className="w-4 h-4 mr-2" />
                                    <span className="sm:hidden">
                                        Notifications
                                    </span>
                                    <span className="hidden sm:inline">
                                        Notifications
                                    </span>
                                    {notifications > 0 && (
                                        <Badge
                                            variant="destructive"
                                            className="ml-auto sm:ml-2 px-1 py-0 text-xs"
                                        >
                                            {notifications}
                                        </Badge>
                                    )}
                                </Link>
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                asChild
                                className="h-10 justify-start sm:justify-center bg-transparent"
                            >
                                <Link href="/admin/reports">
                                    <FileText className="w-4 h-4 mr-2" />
                                    Reports
                                </Link>
                            </Button>
                            <Button
                                size="sm"
                                asChild
                                className="h-10 justify-start sm:justify-center"
                            >
                                <Link href="/admin/issues">
                                    <BarChart3 className="w-4 h-4 mr-2" />
                                    Manage Issues
                                </Link>
                            </Button>

                            {/* User Profile */}
                            {currentUser && (
                                <div className="flex items-center space-x-3 pl-3 border-l">
                                    <UserAvatar
                                        user={currentUser}
                                        profile={currentUserProfile}
                                        size="sm"
                                    />
                                    <div className="hidden sm:block">
                                        <p className="text-sm font-medium">
                                            {getUserDisplayName(
                                                currentUser,
                                                currentUserProfile
                                            )}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {userRole
                                                .replace("_", " ")
                                                .replace(/\b\w/g, (l) =>
                                                    l.toUpperCase()
                                                )}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
                {/* Overview Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <Card>
                        <CardContent className="p-3 sm:p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs sm:text-sm text-muted-foreground">
                                        Total Issues
                                    </p>
                                    <p className="text-lg sm:text-2xl font-bold">
                                        {overviewStats.totalIssues.toLocaleString()}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        <span className="text-status-resolved">
                                            +{overviewStats.newThisWeek}
                                        </span>{" "}
                                        this week
                                    </p>
                                </div>
                                <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground flex-shrink-0" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-3 sm:p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs sm:text-sm text-muted-foreground">
                                        Pending
                                    </p>
                                    <p className="text-lg sm:text-2xl font-bold status-submitted">
                                        {overviewStats.pendingIssues}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Awaiting assignment
                                    </p>
                                </div>
                                <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-status-submitted flex-shrink-0" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-3 sm:p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs sm:text-sm text-muted-foreground">
                                        In Progress
                                    </p>
                                    <p className="text-lg sm:text-2xl font-bold status-progress">
                                        {overviewStats.inProgressIssues}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Being worked on
                                    </p>
                                </div>
                                <Eye className="w-6 h-6 sm:w-8 sm:h-8 text-status-progress flex-shrink-0" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-3 sm:p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs sm:text-sm text-muted-foreground">
                                        Resolved
                                    </p>
                                    <p className="text-lg sm:text-2xl font-bold status-resolved">
                                        {overviewStats.resolvedIssues}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        <span className="text-status-resolved">
                                            +{overviewStats.resolvedThisWeek}
                                        </span>{" "}
                                        this week
                                    </p>
                                </div>
                                <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-status-resolved flex-shrink-0" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Performance Metrics */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
                    <Card>
                        <CardHeader className="pb-3 sm:pb-4">
                            <CardTitle className="flex items-center text-base sm:text-lg">
                                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-accent" />
                                Key Metrics
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 sm:space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm">
                                    Avg. Resolution Time
                                </span>
                                <span className="font-semibold">
                                    {overviewStats.averageResolutionTime} days
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm">
                                    Citizen Satisfaction
                                </span>
                                <span className="font-semibold">
                                    {overviewStats.citizenSatisfaction}%
                                </span>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Resolution Rate</span>
                                    <span>
                                        {overviewStats.totalIssues > 0
                                            ? Math.round(
                                                  (overviewStats.resolvedIssues /
                                                      overviewStats.totalIssues) *
                                                      100
                                              )
                                            : 0}
                                        %
                                    </span>
                                </div>
                                <Progress
                                    value={
                                        overviewStats.totalIssues > 0
                                            ? (overviewStats.resolvedIssues /
                                                  overviewStats.totalIssues) *
                                              100
                                            : 0
                                    }
                                    className="h-2"
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Response Time</span>
                                    <span>
                                        {overviewStats.totalIssues > 0
                                            ? Math.round(
                                                  ((overviewStats.inProgressIssues +
                                                      overviewStats.resolvedIssues) /
                                                      overviewStats.totalIssues) *
                                                      100
                                              )
                                            : 0}
                                        %
                                    </span>
                                </div>
                                <Progress
                                    value={
                                        overviewStats.totalIssues > 0
                                            ? ((overviewStats.inProgressIssues +
                                                  overviewStats.resolvedIssues) /
                                                  overviewStats.totalIssues) *
                                              100
                                            : 0
                                    }
                                    className="h-2"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3 sm:pb-4">
                            <CardTitle className="text-base sm:text-lg">
                                Issues by Category
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {categoryData.length > 0 ? (
                                <>
                                    <div className="h-48 sm:h-64">
                                        <ResponsiveContainer
                                            width="100%"
                                            height="100%"
                                        >
                                            <PieChart>
                                                <Pie
                                                    data={categoryData}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={30}
                                                    outerRadius={60}
                                                    paddingAngle={2}
                                                    dataKey="value"
                                                >
                                                    {categoryData.map(
                                                        (entry, index) => (
                                                            <Cell
                                                                key={`cell-${index}`}
                                                                fill={
                                                                    entry.color
                                                                }
                                                            />
                                                        )
                                                    )}
                                                </Pie>
                                                <Tooltip />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2 mt-3 sm:mt-4">
                                        {categoryData.map((item, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center text-xs sm:text-sm"
                                            >
                                                <div
                                                    className="w-3 h-3 rounded-full mr-2 flex-shrink-0"
                                                    style={{
                                                        backgroundColor:
                                                            item.color,
                                                    }}
                                                />
                                                <span className="truncate flex-1">
                                                    {item.name}
                                                </span>
                                                <span className="ml-2 font-medium">
                                                    {item.value}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div className="h-48 sm:h-64 flex items-center justify-center text-muted-foreground">
                                    <div className="text-center">
                                        <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
                                        <p>No category data available</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3 sm:pb-4">
                            <CardTitle className="text-base sm:text-lg">
                                Department Performance
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {departmentPerformance.length > 0 ? (
                                departmentPerformance.map((dept, index) => (
                                    <div key={index} className="space-y-2">
                                        <div className="flex justify-between text-xs sm:text-sm">
                                            <span className="font-medium truncate pr-2">
                                                {dept.department}
                                            </span>
                                            <span className="flex-shrink-0">
                                                {dept.efficiency}%
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <span className="flex-shrink-0">
                                                {dept.completed}/{dept.assigned}{" "}
                                                completed
                                            </span>
                                            <Progress
                                                value={dept.efficiency}
                                                className="h-1 flex-1"
                                            />
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center text-muted-foreground py-4">
                                    <p>No department data available</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Charts and Recent Activity */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
                    <Card>
                        <CardHeader className="pb-3 sm:pb-4">
                            <CardTitle className="text-base sm:text-lg">
                                Monthly Trends
                            </CardTitle>
                            <CardDescription className="text-sm">
                                Issues reported vs resolved over time
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {monthlyTrends.length > 0 ? (
                                <div className="h-64 sm:h-80">
                                    <ResponsiveContainer
                                        width="100%"
                                        height="100%"
                                    >
                                        <LineChart data={monthlyTrends}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="month" />
                                            <YAxis />
                                            <Tooltip />
                                            <Line
                                                type="monotone"
                                                dataKey="reported"
                                                stroke="#8b5cf6"
                                                strokeWidth={2}
                                                name="Reported"
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="resolved"
                                                stroke="#10b981"
                                                strokeWidth={2}
                                                name="Resolved"
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div className="h-64 sm:h-80 flex items-center justify-center text-muted-foreground">
                                    <div className="text-center">
                                        <TrendingUp className="w-8 h-8 mx-auto mb-2" />
                                        <p>No trend data available</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3 sm:pb-4">
                            <CardTitle className="text-base sm:text-lg">
                                Recent Issues
                            </CardTitle>
                            <CardDescription className="text-sm">
                                Latest reports requiring attention
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3 sm:space-y-4">
                            {recentIssues.length > 0 ? (
                                <>
                                    {recentIssues.map((issue) => (
                                        <div
                                            key={issue.id}
                                            className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-lg border"
                                        >
                                            <div className="flex-1 min-w-0">
                                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                                                    <h4 className="font-medium text-sm truncate flex-1">
                                                        {issue.title}
                                                    </h4>
                                                    <Badge
                                                        className={`${getStatusColor(
                                                            issue.status
                                                        )} self-start sm:self-center text-xs`}
                                                        variant="secondary"
                                                    >
                                                        {issue.status.replace(
                                                            "-",
                                                            " "
                                                        )}
                                                    </Badge>
                                                </div>
                                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs text-muted-foreground">
                                                    <span className="flex items-center">
                                                        <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                                                        <span className="truncate">
                                                            {issue.location_address ||
                                                                "No location"}
                                                        </span>
                                                    </span>
                                                    <span className="flex items-center">
                                                        <Calendar className="w-3 h-3 mr-1 flex-shrink-0" />
                                                        {new Date(
                                                            issue.created_at
                                                        ).toLocaleDateString()}
                                                    </span>
                                                    <Badge
                                                        className={getPriorityColor(
                                                            issue.priority ||
                                                                "medium"
                                                        )}
                                                        variant="outline"
                                                    >
                                                        {issue.priority ||
                                                            "medium"}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                asChild
                                                className="w-full sm:w-auto h-9 bg-transparent"
                                            >
                                                <Link
                                                    href={`/admin/issues/${issue.id}`}
                                                >
                                                    View
                                                </Link>
                                            </Button>
                                        </div>
                                    ))}
                                    <div className="text-center pt-2">
                                        <Button
                                            variant="outline"
                                            asChild
                                            className="w-full sm:w-auto bg-transparent"
                                        >
                                            <Link href="/admin/issues">
                                                View All Issues
                                            </Link>
                                        </Button>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center text-muted-foreground py-8">
                                    <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
                                    <p>No recent issues found</p>
                                    <p className="text-xs mt-1">
                                        Issues will appear here once citizens
                                        start reporting them
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Comprehensive Analytics Charts Section */}
                <div className="mt-4 sm:mt-6">
                    <Card>
                        <CardHeader className="pb-3 sm:pb-4">
                            <CardTitle className="text-base sm:text-lg">
                                Detailed Analytics
                            </CardTitle>
                            <CardDescription className="text-sm">
                                Comprehensive data visualization and insights
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <AnalyticsCharts
                                monthlyData={analyticsMonthlyData}
                                categoryData={analyticsCategoryData}
                                responseTimeData={analyticsResponseTimeData}
                                resolutionTrendData={
                                    analyticsResolutionTrendData
                                }
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
