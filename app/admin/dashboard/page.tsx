"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import AdminSidebar from "@/components/admin-sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
    AlertTriangle,
    CheckCircle,
    Clock,
    Eye,
    Bell,
    FileText,
    Loader2,
    LayoutDashboard,
    Map,
    Building,
    Users,
    Settings,
    Search,
    BarChart3,
    PieChart,
    LineChartIcon,
    Download,
    Gavel,
    LogOut,
    Shield,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { isIssueForDepartment, getDepartmentName } from "@/lib/departments";
import { Input } from "@/components/ui/input";
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart as RechartsPieChart,
    Pie,
    Cell,
    LineChart as RechartsLineChart,
    Line,
} from "recharts";

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

const AdminDashboard = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const supabase = createClient();

    const [currentUser, setCurrentUser] = useState<any>(null);
    const [currentUserProfile, setCurrentUserProfile] = useState<any>(null);
    const [userDepartment, setUserDepartment] = useState<string | null>(null);
    const [userDepartmentName, setUserDepartmentName] = useState<string>("");
    const [userRole, setUserRole] = useState<string>("");

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
    const [categoryData, setCategoryData] = useState<any[]>([]);
    const [monthlyTrends, setMonthlyTrends] = useState<any[]>([]);
    const [departmentPerformance, setDepartmentPerformance] = useState<any[]>(
        []
    );
    const [recentIssues, setRecentIssues] = useState<Issue[]>([]);
    const [notifications, setNotifications] = useState(0);

    useEffect(() => {
        const checkAuth = async () => {
            const {
                data: { user },
                error,
            } = await supabase.auth.getUser();

            if (error || !user) {
                (router as any).push("/admin/login");
                return;
            }

            const role = user.user_metadata?.role || user.role || "citizen";
            setUserRole(role);
            if (role === "citizen") {
                (router as any).push("/citizen/dashboard");
                return;
            }

            setCurrentUser(user);

            const { data: profile } = await (supabase as any)
                .from("profiles")
                .select("*")
                .eq("id", user.id)
                .single();
            setCurrentUserProfile(profile);

            const department = user.user_metadata?.department;
            setUserDepartment(department);

            if (department) {
                const departmentName = await getDepartmentName(department);
                setUserDepartmentName(departmentName);
            }

            await loadDashboardData();
        };

        checkAuth();
    }, [router]);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);

            const [
                statsResult,
                categoriesResult,
                trendsResult,
                departmentsResult,
                recentResult,
                notificationsResult,
            ] = await Promise.all([
                fetchOverviewStats(),
                fetchCategoryData(),
                fetchMonthlyTrends(),
                fetchDepartmentPerformance(),
                fetchRecentIssues(),
                fetchNotificationCount(),
            ]);

            setOverviewStats(statsResult);
            setCategoryData(categoriesResult);
            setMonthlyTrends(trendsResult);
            setDepartmentPerformance(departmentsResult);
            setRecentIssues(recentResult);
            setNotifications(notificationsResult);
        } catch (err: any) {
            console.error("Error loading dashboard data:", err);
            setError(err.message || "Failed to load dashboard data");
        } finally {
            setLoading(false);
        }
    };

    const fetchOverviewStats = async (): Promise<DashboardStats> => {
        const { data: allIssues, error } = await supabase
            .from("issues")
            .select(
                "status, created_at, updated_at, title, description, category"
            );

        if (error) throw error;

        let typedIssues = (allIssues || []) as any[];

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

        const resolvedWithTimes =
            typedIssues.filter(
                (i) => i.status === "resolved" && i.updated_at
            ) || [];

        const avgResolutionTime =
            resolvedWithTimes.length > 0
                ? resolvedWithTimes.reduce((sum, issue) => {
                      const created = new Date(issue.created_at);
                      const resolved = new Date(issue.updated_at);
                      const days =
                          (resolved.getTime() - created.getTime()) /
                          (1000 * 60 * 60 * 24);
                      return sum + days;
                  }, 0) / resolvedWithTimes.length
                : 0;

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

    const fetchCategoryData = async () => {
        const { data: issues, error } = await supabase
            .from("issues")
            .select("category");

        if (error) throw error;

        const categoryColors: { [key: string]: string } = {
            pothole: "#059669",
            streetlight: "#0891b2",
            garbage: "#16a34a",
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

    const fetchMonthlyTrends = async () => {
        const { data: issues, error } = await supabase
            .from("issues")
            .select("created_at, updated_at, status");

        if (error) throw error;

        const months = [];
        const now = new Date();
        for (let i = 11; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            months.push({
                date,
                name: date.toLocaleDateString("en-US", { month: "short" }),
            });
        }

        const typedIssues = (issues || []) as any[];

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

    const fetchDepartmentPerformance = async () => {
        const { data: issues, error } = await supabase
            .from("issues")
            .select("category, status");

        if (error) throw error;

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

        const typedIssues = (issues || []) as any[];
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
            .limit(50);

        if (error) throw error;

        let filteredIssues = (issues || []) as Issue[];

        if (userDepartment) {
            const departmentFilteredIssues = [];
            for (const issue of filteredIssues) {
                if (await isIssueForDepartment(issue, userDepartment)) {
                    departmentFilteredIssues.push(issue);
                }
            }
            filteredIssues = departmentFilteredIssues;
        }

        return filteredIssues.slice(0, 8);
    };

    const fetchNotificationCount = async (): Promise<number> => {
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

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-[#5C9479]" />
                    <p className="text-white/60">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen pt-16 md:pt-0 bg-black">
            <AdminSidebar pendingIssues={overviewStats.pendingIssues} />

            <div className="flex-1 overflow-auto bg-black relative">
                {/* Animated Background */}
                <div className="fixed inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#2E6A56]/20 via-black to-[#5C9479]/20" />
                </div>

                {/* Header */}
                <div className="sticky top-0 bg-black/80 backdrop-blur-2xl border-b border-white/10 p-4 md:p-6 flex items-center justify-between z-10">
                    <div className="flex-1">
                        <h1 className="text-2xl md:text-3xl font-bold text-white">
                            Dashboard Overview
                        </h1>
                        <p className="text-sm text-white/60 mt-1">
                            Welcome back! Here's your real-time analytics 📈
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative hidden md:block">
                            <Search className="absolute left-3 top-2.5 w-4 h-4 text-white/40" />
                            <Input
                                placeholder="Search..."
                                className="pl-10 w-64 bg-white/10 border-white/20 text-white placeholder:text-white/40 shadow-sm"
                            />
                        </div>
                        <button className="relative p-2 hover:bg-white/10 rounded-lg transition-colors shadow-sm">
                            <Bell size={20} className="text-[#5C9479]" />
                            {notifications > 0 && (
                                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="p-4 md:p-6 space-y-6">
                    {error && (
                        <Card className="bg-red-500/20 border border-red-500/30 shadow-md backdrop-blur-xl">
                            <CardContent className="p-4">
                                <p className="text-red-300">{error}</p>
                            </CardContent>
                        </Card>
                    )}

                    {/* KPI Cards - Bento Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            {
                                title: "Total Issues",
                                value: overviewStats.totalIssues.toLocaleString(),
                                icon: AlertTriangle,
                                color: "bg-orange-500/20 border-orange-500/30",
                                textColor: "text-orange-400",
                                change: `+${overviewStats.newThisWeek} this week`,
                            },
                            {
                                title: "Pending",
                                value: overviewStats.pendingIssues.toLocaleString(),
                                icon: Clock,
                                color: "bg-yellow-500/20 border-yellow-500/30",
                                textColor: "text-yellow-400",
                                change: "Awaiting review",
                            },
                            {
                                title: "In Progress",
                                value: overviewStats.inProgressIssues.toLocaleString(),
                                icon: Eye,
                                color: "bg-blue-500/20 border-blue-500/30",
                                textColor: "text-blue-400",
                                change: "Being worked on",
                            },
                            {
                                title: "Resolved",
                                value: overviewStats.resolvedIssues.toLocaleString(),
                                icon: CheckCircle,
                                color: "bg-emerald-500/20 border-emerald-500/30",
                                textColor: "text-emerald-400",
                                change: `+${overviewStats.resolvedThisWeek} this week`,
                            },
                        ].map((kpi, idx) => {
                            const Icon = kpi.icon;
                            return (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    whileHover={{ scale: 1.05, y: -5 }}
                                    className={`${kpi.color} border rounded-3xl p-6 backdrop-blur-xl relative overflow-hidden group`}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="relative z-10">
                                        <div className="flex items-start justify-between mb-4">
                                            <p className="text-sm text-white/60">
                                                {kpi.title}
                                            </p>
                                            <Icon
                                                className={`w-8 h-8 ${kpi.textColor}`}
                                            />
                                        </div>
                                        <p
                                            className={`text-4xl font-black ${kpi.textColor} mb-2`}
                                        >
                                            {kpi.value}
                                        </p>
                                        <p className="text-xs text-white/50">
                                            {kpi.change}
                                        </p>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Charts Section - Bento Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        {/* Monthly Trends */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="lg:col-span-2 bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-[#2E6A56]/30 rounded-xl">
                                        <LineChartIcon className="w-5 h-5 text-[#5C9479]" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white">
                                        Monthly Trends
                                    </h3>
                                </div>
                                <select className="text-sm border border-white/20 rounded-lg px-3 py-2 bg-white/10 text-white">
                                    <option className="bg-black text-white">Last 12 Months</option>
                                    <option className="bg-black text-white">Last 6 Months</option>
                                    <option className="bg-black text-white">Last 3 Months</option>
                                </select>
                            </div>
                            <div>
                                <ResponsiveContainer width="100%" height={300}>
                                    <RechartsLineChart data={monthlyTrends}>
                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            stroke="rgba(255,255,255,0.1)"
                                        />
                                        <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" />
                                        <YAxis stroke="rgba(255,255,255,0.5)" />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: "#fff",
                                                border: "1px solid #ccc",
                                                borderRadius: "8px",
                                            }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="reported"
                                            stroke="#f59e0b"
                                            strokeWidth={2}
                                            dot={{ fill: "#f59e0b", r: 4 }}
                                            activeDot={{ r: 6 }}
                                            name="Reported"
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="resolved"
                                            stroke="#5C9479"
                                            strokeWidth={3}
                                            dot={{ fill: "#5C9479", r: 5 }}
                                            activeDot={{ r: 8 }}
                                            name="Resolved"
                                        />
                                    </RechartsLineChart>
                                </ResponsiveContainer>
                            </div>
                        </motion.div>

                        {/* Category Distribution */}
                        <Card className="bg-white/5 border border-white/10 backdrop-blur-xl">
                            <CardHeader className="pb-4">
                                <CardTitle className="flex items-center gap-2 text-white">
                                    <PieChart className="w-5 h-5" />
                                    Issues by Category
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {categoryData.length > 0 ? (
                                    <ResponsiveContainer
                                        width="100%"
                                        height={300}
                                    >
                                        <RechartsPieChart>
                                            <Pie
                                                data={categoryData}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({ name, value }) =>
                                                    `${name}: ${value}`
                                                }
                                                outerRadius={80}
                                                fill="#8884d8"
                                                dataKey="value"
                                            >
                                                {categoryData.map(
                                                    (entry, index) => (
                                                        <Cell
                                                            key={`cell-${index}`}
                                                            fill={entry.color}
                                                        />
                                                    )
                                                )}
                                            </Pie>
                                            <Tooltip />
                                        </RechartsPieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-[300px] flex items-center justify-center text-white/60">
                                        No data available
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Department Performance */}
                    <Card className="bg-white/5 border border-white/10 backdrop-blur-xl">
                        <CardHeader className="pb-4">
                            <CardTitle className="flex items-center gap-2 text-white">
                                <BarChart3 className="w-5 h-5" />
                                Department Performance & Efficiency
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {departmentPerformance.map((dept, idx) => (
                                    <div key={idx} className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium text-white">
                                                    {dept.department}
                                                </p>
                                                <p className="text-sm text-white/60">
                                                    {dept.completed} of{" "}
                                                    {dept.assigned} resolved
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-lg text-[#5C9479]">
                                                    {dept.efficiency}%
                                                </p>
                                                <p className="text-xs text-white/60">
                                                    Efficiency
                                                </p>
                                            </div>
                                        </div>
                                        <Progress
                                            value={dept.efficiency}
                                            className="h-2"
                                        />
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Issues */}
                    <Card className="bg-white/5 border border-white/10 backdrop-blur-xl">
                        <CardHeader className="pb-4">
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2 text-white">
                                    <AlertTriangle className="w-5 h-5" />
                                    Recent Issues
                                </CardTitle>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    asChild
                                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                                >
                                    <a href="/admin/issues">View All</a>
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {recentIssues.map((issue) => (
                                    <div
                                        key={issue.id}
                                        className="flex items-center justify-between p-3 border border-white/10 rounded-lg hover:bg-white/5 transition-colors"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate text-white">
                                                {issue.title}
                                            </p>
                                            <p className="text-sm text-white/60">
                                                {issue.location_address ||
                                                    "No location"}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2 ml-4">
                                            <Badge
                                                className={getStatusColor(
                                                    issue.status
                                                )}
                                            >
                                                {issue.status}
                                            </Badge>
                                            {issue.priority && (
                                                <Badge
                                                    className={getPriorityColor(
                                                        issue.priority
                                                    )}
                                                >
                                                    {issue.priority}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
