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
    Settings,
    ChevronDown,
    MoreHorizontal,
    ArrowUpRight,
    ArrowDownRight,
} from "lucide-react";
import AnalyticsCharts from "@/components/analytics-charts";
import { createClient } from "@/lib/supabase/client";
import { isIssueForDepartment, getDepartmentName } from "@/lib/departments";

// Types for our data (unchanged)
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

// Helper functions (unchanged)
const getStatusColor = (status: string) => {
    switch (status) {
        case "submitted":
            return "bg-amber-100 text-amber-800 border-amber-200";
        case "in-review":
            return "bg-blue-100 text-blue-800 border-blue-200";
        case "in-progress":
            return "bg-purple-100 text-purple-800 border-purple-200";
        case "resolved":
            return "bg-emerald-100 text-emerald-800 border-emerald-200";
        default:
            return "bg-gray-100 text-gray-800 border-gray-200";
    }
};

const getPriorityColor = (priority: string) => {
    switch (priority) {
        case "high":
            return "bg-red-100 text-red-800 border-red-200";
        case "medium":
            return "bg-yellow-100 text-yellow-800 border-yellow-200";
        case "low":
            return "bg-green-100 text-green-800 border-green-200";
        default:
            return "bg-gray-100 text-gray-800 border-gray-200";
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
    const [userDepartment, setUserDepartment] = useState<string | null>(null);
    const [userDepartmentName, setUserDepartmentName] = useState<string>("");

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
            if (role === "citizen") {
                router.push("/citizen/dashboard");
                return;
            }

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
            pothole: "#3b82f6",
            streetlight: "#f59e0b",
            garbage: "#10b981",
            "water-leakage": "#8b5cf6",
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
            .select("category, status");

        if (error) throw error;

        // Type assertion for department performance data
        type DeptIssueData = {
            category: string;
            status: string;
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
                ["in-progress", "resolved", "assigned"].includes(issue.status)
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
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium animate-pulse">
                        Loading dashboard...
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="text-center animate-fadeIn">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle className="w-8 h-8 text-red-500" />
                    </div>
                    <p className="text-red-600 mb-4 font-medium">{error}</p>
                    <Button 
                        onClick={loadDashboardData} 
                        className="bg-blue-600 hover:bg-blue-700 transition-all duration-200 transform hover:scale-105"
                    >
                        Retry
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
                {/* Overview Stats - Animated Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
                     <Card className="bg-white border-0 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 animate-fade-in group">
                        <CardContent className="p-4 sm:p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-2">
                                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                                        <p className="text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wide">
                                            Total Issues
                                        </p>
                                    </div>
                                    <p className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 transition-all duration-300 group-hover:text-blue-600">
                                        {overviewStats.totalIssues.toLocaleString()}
                                    </p>
                                    <div className="flex items-center space-x-1">
                                        <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-500" />
                                        <span className="text-xs sm:text-sm font-medium text-emerald-600">
                                            +{overviewStats.newThisWeek}
                                        </span>
                                        <span className="text-xs sm:text-sm text-gray-500">this week</span>
                                    </div>
                                </div>
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                    <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                     <Card className="bg-white border-0 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 animate-fade-in group">
                        <CardContent className="p-4 sm:p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-2">
                                        <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                                        <p className="text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wide">
                                            Pending
                                        </p>
                                    </div>
                                    <p className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 transition-all duration-300 group-hover:text-amber-600">
                                        {overviewStats.pendingIssues}
                                    </p>
                                    <p className="text-xs sm:text-sm text-gray-500">
                                        Awaiting assignment
                                    </p>
                                </div>
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                    <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                     <Card className="bg-white border-0 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 animate-fade-in group">
                        <CardContent className="p-4 sm:p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-2">
                                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                                        <p className="text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wide">
                                            In Progress
                                        </p>
                                    </div>
                                    <p className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 transition-all duration-300 group-hover:text-purple-600">
                                        {overviewStats.inProgressIssues}
                                    </p>
                                    <p className="text-xs sm:text-sm text-gray-500">
                                        Being worked on
                                    </p>
                                </div>
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                    <Eye className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                     <Card className="bg-white border-0 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 animate-fade-in group">
                        <CardContent className="p-4 sm:p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-2">
                                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                                        <p className="text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wide">
                                            Resolved
                                        </p>
                                    </div>
                                    <p className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 transition-all duration-300 group-hover:text-emerald-600">
                                        {overviewStats.resolvedIssues}
                                    </p>
                                    <div className="flex items-center space-x-1">
                                        <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-500" />
                                        <span className="text-xs sm:text-sm font-medium text-emerald-600">
                                            +{overviewStats.resolvedThisWeek}
                                        </span>
                                        <span className="text-xs sm:text-sm text-gray-500">this week</span>
                                    </div>
                                </div>
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                    <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Performance Metrics - Responsive Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                     <Card className="bg-white border-0 shadow-sm hover:shadow-lg transition-all duration-300 animate-fade-in">
                        <CardHeader className="pb-4">
                            <CardTitle className="flex items-center text-lg font-semibold text-gray-900">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-3 shadow-lg">
                                    <TrendingUp className="w-4 h-4 text-white" />
                                </div>
                                Key Metrics
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 sm:space-y-6">
                            <div className="flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:from-blue-50 hover:to-blue-100 transition-all duration-300">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Avg. Resolution Time</p>
                                    <p className="text-xl sm:text-2xl font-bold text-gray-900">{overviewStats.averageResolutionTime}</p>
                                    <p className="text-xs text-gray-500">days</p>
                                </div>
                            </div>
                            
                            <div className="flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:from-green-50 hover:to-green-100 transition-all duration-300">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Citizen Satisfaction</p>
                                    <p className="text-xl sm:text-2xl font-bold text-gray-900">{overviewStats.citizenSatisfaction}%</p>
                                </div>
                            </div>
                            
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-gray-700">Resolution Rate</span>
                                    <span className="text-sm font-semibold text-gray-900">
                                        {overviewStats.totalIssues > 0
                                            ? Math.round((overviewStats.resolvedIssues / overviewStats.totalIssues) * 100)
                                            : 0}%
                                    </span>
                                </div>
                                <Progress
                                    value={overviewStats.totalIssues > 0
                                        ? (overviewStats.resolvedIssues / overviewStats.totalIssues) * 100
                                        : 0}
                                    className="h-2 bg-gray-200 transition-all duration-500"
                                />
                            </div>
                            
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-gray-700">Response Rate</span>
                                    <span className="text-sm font-semibold text-gray-900">
                                        {overviewStats.totalIssues > 0
                                            ? Math.round(((overviewStats.inProgressIssues + overviewStats.resolvedIssues) / overviewStats.totalIssues) * 100)
                                            : 0}%
                                    </span>
                                </div>
                                <Progress
                                    value={overviewStats.totalIssues > 0
                                        ? ((overviewStats.inProgressIssues + overviewStats.resolvedIssues) / overviewStats.totalIssues) * 100
                                        : 0}
                                    className="h-2 bg-gray-200 transition-all duration-500"
                                />
                            </div>
                        </CardContent>
                    </Card>

                     <Card className="bg-white border-0 shadow-sm hover:shadow-lg transition-all duration-300 animate-fade-in">
                        <CardHeader className="pb-4">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg font-semibold text-gray-900">
                                    Issues by Category
                                </CardTitle>
                                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600 transition-colors duration-200">
                                    <MoreHorizontal className="w-4 h-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {categoryData.length > 0 ? (
                                <>
                                    <div className="h-40 sm:h-48 mb-4 sm:mb-6">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={categoryData}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={window.innerWidth < 640 ? 35 : 45}
                                                    outerRadius={window.innerWidth < 640 ? 65 : 75}
                                                    paddingAngle={2}
                                                    dataKey="value"
                                                >
                                                    {categoryData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <Tooltip 
                                                    contentStyle={{
                                                        backgroundColor: 'white',
                                                        border: '1px solid #e5e7eb',
                                                        borderRadius: '8px',
                                                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                                    }}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="space-y-2 sm:space-y-3">
                                        {categoryData.map((item, index) => (
                                            <div key={index} className="flex items-center justify-between py-1 hover:bg-gray-50 rounded-lg px-2 transition-all duration-200">
                                                <div className="flex items-center space-x-3">
                                                    <div
                                                        className="w-3 h-3 rounded-full animate-pulse"
                                                        style={{ backgroundColor: item.color }}
                                                    />
                                                    <span className="text-sm font-medium text-gray-700">
                                                        {item.name}
                                                    </span>
                                                </div>
                                                <span className="text-sm font-semibold text-gray-900 bg-gray-100 px-2 py-1 rounded-full">
                                                    {item.value}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div className="h-40 sm:h-48 flex items-center justify-center text-gray-400">
                                    <div className="text-center animate-pulse">
                                        <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
                                        <p>No category data available</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                     <Card className="bg-white border-0 shadow-sm hover:shadow-lg transition-all duration-300 animate-fade-in">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg font-semibold text-gray-900">
                                Department Performance
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 sm:space-y-4">
                            {departmentPerformance.length > 0 ? (
                                departmentPerformance.map((dept, index) => (
                                    <div key={index} className="p-3 sm:p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:from-purple-50 hover:to-purple-100 transition-all duration-300 transform hover:scale-105">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="font-medium text-gray-900 text-sm truncate">
                                                {dept.department}
                                            </span>
                                            <span className="text-lg sm:text-xl font-bold text-gray-900">
                                                {dept.efficiency}%
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                                            <span>{dept.completed}/{dept.assigned} completed</span>
                                        </div>
                                        <Progress
                                            value={dept.efficiency}
                                            className="h-2 bg-gray-200 transition-all duration-500"
                                        />
                                    </div>
                                ))
                            ) : (
                                <div className="text-center text-gray-400 py-8 animate-pulse">
                                    <p>No department data available</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Charts and Recent Activity - Enhanced Mobile Layout */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
                     <Card className="bg-white border-0 shadow-sm hover:shadow-lg transition-all duration-300 animate-fade-in">
                        <CardHeader className="pb-4 border-b border-gray-100">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div>
                                    <CardTitle className="text-lg font-semibold text-gray-900">
                                        Monthly Trends
                                    </CardTitle>
                                    <CardDescription className="text-sm text-gray-500 mt-1">
                                        Issues reported vs resolved over time
                                    </CardDescription>
                                </div>
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="border-gray-200 text-gray-600 hover:bg-gray-50 transition-all duration-200 hover:scale-105 w-full sm:w-auto"
                                >
                                    <span className="hidden sm:inline">Last 7 months</span>
                                    <span className="sm:hidden">7 months</span>
                                    <ChevronDown className="w-4 h-4 ml-2" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6">
                            {monthlyTrends.length > 0 ? (
                                <div className="h-64 sm:h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={monthlyTrends}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                                            <XAxis 
                                                dataKey="month" 
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: '#6b7280', fontSize: window.innerWidth < 640 ? 11 : 12 }}
                                            />
                                            <YAxis 
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: '#6b7280', fontSize: window.innerWidth < 640 ? 11 : 12 }}
                                            />
                                            <Tooltip 
                                                contentStyle={{
                                                    backgroundColor: 'white',
                                                    border: '1px solid #e5e7eb',
                                                    borderRadius: '8px',
                                                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                                    fontSize: '14px'
                                                }}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="reported"
                                                stroke="#3b82f6"
                                                strokeWidth={3}
                                                name="Reported"
                                                dot={{ fill: '#3b82f6', strokeWidth: 0, r: 4 }}
                                                activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2, fill: 'white' }}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="resolved"
                                                stroke="#10b981"
                                                strokeWidth={3}
                                                name="Resolved"
                                                dot={{ fill: '#10b981', strokeWidth: 0, r: 4 }}
                                                activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2, fill: 'white' }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div className="h-64 sm:h-80 flex items-center justify-center text-gray-400">
                                    <div className="text-center animate-pulse">
                                        <TrendingUp className="w-8 h-8 mx-auto mb-2" />
                                        <p>No trend data available</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                     <Card className="bg-white border-0 shadow-sm hover:shadow-lg transition-all duration-300 animate-fade-in">
                        <CardHeader className="pb-4 border-b border-gray-100">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div>
                                    <CardTitle className="text-lg font-semibold text-gray-900">
                                        Recent Issues
                                    </CardTitle>
                                    <CardDescription className="text-sm text-gray-500 mt-1">
                                        Latest reports requiring attention
                                    </CardDescription>
                                </div>
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-all duration-200 w-full sm:w-auto"
                                    asChild
                                >
                                    <Link href="/admin/issues">
                                        View all
                                    </Link>
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4">
                            {recentIssues.length > 0 ? (
                                <div className="space-y-3 sm:space-y-4 max-h-96 overflow-y-auto">
                                    {recentIssues.map((issue, index) => (
                                         <div 
                                             key={issue.id} 
                                             className="p-3 sm:p-4 border border-gray-100 rounded-xl hover:border-gray-200 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 animate-fade-in"
                                         >
                                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                                                <h4 className="font-medium text-gray-900 text-sm leading-tight flex-1">
                                                    {issue.title}
                                                </h4>
                                                <Badge className={`${getStatusColor(issue.status)} text-xs font-medium px-2 py-1 self-start`}>
                                                    {issue.status.replace("-", " ")}
                                                </Badge>
                                            </div>
                                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs text-gray-500 mb-3">
                                                <span className="flex items-center truncate">
                                                    <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                                                    {issue.location_address ? 
                                                        (window.innerWidth < 640 ? 
                                                            issue.location_address.substring(0, 20) + "..." :
                                                            issue.location_address.substring(0, 30) + "..."
                                                        ) : "No location"}
                                                </span>
                                                <span className="flex items-center">
                                                    <Calendar className="w-3 h-3 mr-1 flex-shrink-0" />
                                                    {new Date(issue.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <Badge className={`${getPriorityColor(issue.priority || "medium")} text-xs`}>
                                                    {issue.priority || "medium"}
                                                </Badge>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-xs border-gray-200 text-gray-700 hover:bg-gray-50 transition-all duration-200 hover:scale-105"
                                                    asChild
                                                >
                                                    <Link href={`/admin/issues/${issue.id}`}>
                                                        <span className="hidden sm:inline">View Details</span>
                                                        <span className="sm:hidden">View</span>
                                                    </Link>
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center text-gray-400 py-12">
                                    <div className="animate-bounce">
                                        <AlertTriangle className="w-8 h-8 mx-auto mb-3" />
                                    </div>
                                    <p className="font-medium">No recent issues found</p>
                                    <p className="text-xs mt-1 text-gray-400">
                                        Issues will appear here once citizens start reporting them
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Comprehensive Analytics Charts Section */}
                 <Card className="bg-white border-0 shadow-sm hover:shadow-lg transition-all duration-300 animate-fade-in">
                    <CardHeader className="pb-4 border-b border-gray-100">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                                <CardTitle className="text-lg font-semibold text-gray-900">
                                    Detailed Analytics
                                </CardTitle>
                                <CardDescription className="text-sm text-gray-500 mt-1">
                                    Comprehensive data visualization and insights
                                </CardDescription>
                            </div>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="border-gray-200 text-gray-600 hover:bg-gray-50 transition-all duration-200 hover:scale-105 w-full sm:w-auto"
                            >
                                <Settings className="w-4 h-4 mr-2" />
                                Configure
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                         <div className="animate-fade-in">
                            <AnalyticsCharts
                                monthlyData={analyticsMonthlyData}
                                categoryData={analyticsCategoryData}
                                responseTimeData={analyticsResponseTimeData}
                                resolutionTrendData={analyticsResolutionTrendData}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
