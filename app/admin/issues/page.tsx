"use client";

import { useState, useEffect } from "react";
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
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    ArrowLeft,
    Search,
    Eye,
    Edit,
    MapPin,
    Calendar,
    User,
    Clock,
    AlertTriangle,
    CheckCircle,
    MoreHorizontal,
    Building2,
    ThumbsUp,
    Filter,
    X,
    TrendingUp,
    Users,
} from "lucide-react";
import SimpleAdminActions from "@/components/simple-admin-actions";
import { useAuth } from "@/contexts/auth-context";
import AIUrgencyBadge from "@/components/ai-urgency-badge";

interface Issue {
    id: string;
    title: string;
    description: string;
    category: string;
    priority: string;
    status: string;
    location_address: string;
    location_lat: number;
    location_lng: number;
    landmark?: string;
    image_url?: string;
    upvotes: number;
    ai_urgency?: "low" | "medium" | "high";
    ai_confidence?: number;
    created_at: string;
    updated_at: string;
    profiles?: {
        full_name: string;
        email: string;
    };
    department?: {
        name: string;
        email: string;
    };
    assigned_profile?: {
        full_name: string;
        email: string;
    };
    comments_count?: number;
    votes_count?: number;
}

const getStatusColor = (status: string) => {
    switch (status) {
        case "submitted":
            return "bg-blue-500 hover:bg-blue-600 text-white";
        case "assigned":
            return "bg-amber-500 hover:bg-amber-600 text-white";
        case "in_progress":
            return "bg-orange-500 hover:bg-orange-600 text-white";
        case "resolved":
            return "bg-emerald-500 hover:bg-emerald-600 text-white";
        case "closed":
            return "bg-slate-500 hover:bg-slate-600 text-white";
        default:
            return "bg-gray-100 text-gray-700";
    }
};

const getPriorityColor = (priority: string) => {
    switch (priority) {
        case "high":
            return "bg-red-50 text-red-700 border-red-200";
        case "medium":
            return "bg-yellow-50 text-yellow-700 border-yellow-200";
        case "low":
            return "bg-green-50 text-green-700 border-green-200";
        default:
            return "bg-gray-50 text-gray-700 border-gray-200";
    }
};

const getStatusIcon = (status: string) => {
    switch (status) {
        case "submitted":
            return <Clock className="w-4 h-4" />;
        case "assigned":
            return <User className="w-4 h-4" />;
        case "in_progress":
            return <AlertTriangle className="w-4 h-4" />;
        case "resolved":
            return <CheckCircle className="w-4 h-4" />;
        case "closed":
            return <CheckCircle className="w-4 h-4" />;
        default:
            return <Clock className="w-4 h-4" />;
    }
};

const getCategoryLabel = (category: string) => {
    switch (category) {
        case "roads":
            return "Roads & Infrastructure";
        case "potholes":
            return "Potholes";
        case "streetlights":
            return "Street Lighting";
        case "garbage":
            return "Waste Management";
        case "water":
            return "Water Supply";
        case "drainage":
            return "Drainage";
        case "parks":
            return "Parks & Recreation";
        case "traffic":
            return "Traffic Management";
        default:
            return "Other";
    }
};

const getCategoryIcon = (category: string) => {
    switch (category) {
        case "roads":
        case "potholes":
            return "🛣️";
        case "streetlights":
            return "💡";
        case "garbage":
            return "🗑️";
        case "water":
            return "💧";
        case "drainage":
            return "🌊";
        case "parks":
            return "🌳";
        case "traffic":
            return "🚦";
        default:
            return "📋";
    }
};

export default function AdminIssuesPage() {
    const { user } = useAuth();
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [priorityFilter, setPriorityFilter] = useState("all");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [selectedIssues, setSelectedIssues] = useState<string[]>([]);
    const [allIssues, setAllIssues] = useState<Issue[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [processingIssue, setProcessingIssue] = useState<string | null>(null);
    const [expandedUserIds, setExpandedUserIds] = useState<Set<string>>(
        new Set()
    );
    const [showFilters, setShowFilters] = useState(false);

    // Fetch issues from API
    useEffect(() => {
        const fetchIssues = async () => {
            try {
                setLoading(true);

                const response = await fetch("/api/issues?limit=100", {
                    credentials: "include",
                });
                if (response.ok) {
                    const data = await response.json();
                    let issues = data.issues || [];

                    console.log("Total issues loaded:", issues.length);

                    setAllIssues(issues);
                } else {
                    setError("Failed to fetch issues");
                }
            } catch (error) {
                console.error("Error fetching issues:", error);
                setError("Error loading issues");
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchIssues();
        }
    }, [user]);

    // Filtered issues
    const filteredIssues = allIssues
        .filter((issue) => {
            const matchesSearch =
                issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                issue.location_address
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                issue.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (issue.profiles?.full_name || "")
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase());

            const matchesStatus =
                statusFilter === "all" || issue.status === statusFilter;
            const matchesPriority =
                priorityFilter === "all" || issue.priority === priorityFilter;
            const matchesCategory =
                categoryFilter === "all" || issue.category === categoryFilter;

            return (
                matchesSearch &&
                matchesStatus &&
                matchesPriority &&
                matchesCategory
            );
        })
        .sort((a, b) => {
            // Sort by upvotes (descending) then by creation date
            const aUpvotes = Number(a.upvotes) || 0;
            const bUpvotes = Number(b.upvotes) || 0;
            const upvoteDiff = bUpvotes - aUpvotes;
            if (upvoteDiff !== 0) return upvoteDiff;

            return (
                new Date(b.created_at).getTime() -
                new Date(a.created_at).getTime()
            );
        });

    const statusCounts = {
        all: allIssues.length,
        submitted: allIssues.filter((i) => i.status === "submitted").length,
        assigned: allIssues.filter((i) => i.status === "assigned").length,
        in_progress: allIssues.filter((i) => i.status === "in_progress").length,
        resolved: allIssues.filter((i) => i.status === "resolved").length,
        closed: allIssues.filter((i) => i.status === "closed").length,
    };

    // Get unique categories from issues
    const categories = Array.from(
        new Set(allIssues.map((issue) => issue.category))
    ).sort();

    const clearFilters = () => {
        setSearchTerm("");
        setStatusFilter("all");
        setPriorityFilter("all");
        setCategoryFilter("all");
    };

    const hasActiveFilters =
        searchTerm ||
        statusFilter !== "all" ||
        priorityFilter !== "all" ||
        categoryFilter !== "all";

    const handleBulkAction = (action: string) => {
        setSelectedIssues([]);
    };

    const handleStatusUpdate = async (
        issueId: string,
        newStatus: string,
        notes?: string
    ) => {
        try {
            const response = await fetch(
                `/api/issues/${issueId}/simple-status`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        status: newStatus,
                        notes:
                            notes || `Status changed to ${newStatus} by admin`,
                    }),
                }
            );

            if (response.ok) {
                setAllIssues((prevIssues) =>
                    prevIssues.map((issue) =>
                        issue.id === issueId
                            ? {
                                  ...issue,
                                  status: newStatus,
                                  updated_at: new Date().toISOString(),
                              }
                            : issue
                    )
                );

                const statusMessages = {
                    assigned: "Issue accepted and assigned",
                    in_progress: "Work started on issue",
                    resolved: "Issue marked as resolved",
                    closed: "Issue closed",
                };

                const message =
                    statusMessages[newStatus as keyof typeof statusMessages] ||
                    `Status updated to ${newStatus}`;

                const toast = document.createElement("div");
                toast.className =
                    "fixed top-4 right-4 bg-emerald-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center space-x-2";
                toast.innerHTML = `<CheckCircle class="w-4 h-4" /> <span>${message}</span>`;
                document.body.appendChild(toast);
                setTimeout(() => document.body.removeChild(toast), 3000);
            } else {
                throw new Error("Failed to update status");
            }
        } catch (error) {
            console.error("Error updating status:", error);
            const errorToast = document.createElement("div");
            errorToast.className =
                "fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center space-x-2";
            errorToast.innerHTML = `<AlertTriangle class="w-4 h-4" /> <span>Failed to update issue status</span>`;
            document.body.appendChild(errorToast);
            setTimeout(() => document.body.removeChild(errorToast), 3000);
        }
    };

    const handleIssueAction = async (
        action: string,
        issueId: string,
        currentStatus: string
    ) => {
        if (processingIssue) return;

        try {
            setProcessingIssue(issueId);

            switch (action) {
                case "accept":
                    await handleStatusUpdate(
                        issueId,
                        "assigned",
                        "Issue accepted and assigned to department"
                    );
                    break;
                case "reject":
                    await handleStatusUpdate(
                        issueId,
                        "closed",
                        "Issue rejected by admin"
                    );
                    break;
                case "in_progress":
                    await handleStatusUpdate(
                        issueId,
                        "in_progress",
                        "Work started on this issue"
                    );
                    break;
                case "resolve":
                    await handleStatusUpdate(
                        issueId,
                        "resolved",
                        "Issue has been resolved"
                    );
                    break;
                case "close":
                    await handleStatusUpdate(
                        issueId,
                        "closed",
                        "Issue closed by admin"
                    );
                    break;
                case "view":
                    setProcessingIssue(null);
                    window.location.href = `/admin/issues/${issueId}`;
                    return;
                case "edit":
                    setProcessingIssue(null);
                    window.location.href = `/admin/issues/${issueId}`;
                    return;
                case "assign":
                    setProcessingIssue(null);
                    window.location.href = `/admin/issues/${issueId}`;
                    return;
                case "priority":
                    setProcessingIssue(null);
                    window.location.href = `/admin/issues/${issueId}`;
                    return;
                default:
                    break;
            }

            await new Promise((resolve) => setTimeout(resolve, 500));
        } catch (error) {
            console.error("Error performing action:", error);
        } finally {
            setProcessingIssue(null);
        }
    };

    const handleUserIdClick = (issueId: string) => {
        setExpandedUserIds((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(issueId)) {
                newSet.delete(issueId);
            } else {
                newSet.add(issueId);
            }
            return newSet;
        });
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:py-6 lg:py-8">
                {/* Action Buttons */}
                <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <div className="flex flex-col xs:flex-row xs:items-center gap-2 sm:gap-3">
                            <Link href="/admin/dashboard">
                            <Button variant="outline" size="sm" className="w-full xs:w-auto border-gray-200 text-gray-700 hover:bg-gray-50 transition-all duration-200 hover:scale-105">
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                <span className="hidden xs:inline">Dashboard</span>
                                <span className="xs:hidden">Back to Dashboard</span>
                                </Button>
                            </Link>
                        <Link href="/admin/issues/map">
                            <Button className="w-full xs:w-auto bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200 hover:scale-105">
                                <MapPin className="w-4 h-4 mr-2" />
                                <span className="hidden xs:inline">Map View</span>
                                <span className="xs:hidden">View on Map</span>
                            </Button>
                        </Link>
                            </div>
                            {selectedIssues.length > 0 && (
                        <Button variant="secondary" size="sm" className="w-full xs:w-auto bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all duration-200 hover:scale-105">
                                    <Users className="w-4 h-4 mr-2" />
                            <span className="hidden xs:inline">Bulk Actions ({selectedIssues.length})</span>
                            <span className="xs:hidden">Actions ({selectedIssues.length})</span>
                                </Button>
                            )}
                    </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6 md:mb-8">
                    <Card className="bg-white border-0 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 animate-fade-in group">
                        <CardContent className="p-3 sm:p-4 md:p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center space-x-1 sm:space-x-2 mb-1 sm:mb-2">
                                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-600 rounded-full animate-pulse flex-shrink-0"></div>
                                        <p className="text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wide truncate">
                                    Total Issues
                                        </p>
                                    </div>
                                    <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1 transition-all duration-300 group-hover:text-blue-600">
                                        {statusCounts.all.toLocaleString()}
                                    </p>
                                </div>
                                <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-blue-100 rounded-lg sm:rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                                    <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-blue-600" />
                                </div>
                                </div>
                            </CardContent>
                        </Card>
                    <Card className="bg-white border-0 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 animate-fade-in group">
                        <CardContent className="p-3 sm:p-4 md:p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center space-x-1 sm:space-x-2 mb-1 sm:mb-2">
                                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-amber-500 rounded-full animate-pulse flex-shrink-0"></div>
                                        <p className="text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wide truncate">
                                            Pending
                                        </p>
                                    </div>
                                    <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1 transition-all duration-300 group-hover:text-amber-600">
                                    {statusCounts.submitted}
                                    </p>
                                </div>
                                <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-amber-100 rounded-lg sm:rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                                    <Clock className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-amber-600" />
                                </div>
                                </div>
                            </CardContent>
                        </Card>

                    <Card className="bg-white border-0 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 animate-fade-in group">
                        <CardContent className="p-3 sm:p-4 md:p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center space-x-1 sm:space-x-2 mb-1 sm:mb-2">
                                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full animate-pulse flex-shrink-0"></div>
                                        <p className="text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wide truncate">
                                            Assigned
                                        </p>
                                    </div>
                                    <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1 transition-all duration-300 group-hover:text-blue-600">
                                    {statusCounts.assigned}
                                    </p>
                                </div>
                                <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-blue-100 rounded-lg sm:rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                                    <User className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-blue-600" />
                                </div>
                                </div>
                            </CardContent>
                        </Card>

                    <Card className="bg-white border-0 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 animate-fade-in group">
                        <CardContent className="p-3 sm:p-4 md:p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center space-x-1 sm:space-x-2 mb-1 sm:mb-2">
                                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-purple-500 rounded-full animate-pulse flex-shrink-0"></div>
                                        <p className="text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wide truncate">
                                            In Progress
                                        </p>
                                    </div>
                                    <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1 transition-all duration-300 group-hover:text-purple-600">
                                    {statusCounts.in_progress}
                                    </p>
                                </div>
                                <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-purple-100 rounded-lg sm:rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                                    <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-purple-600" />
                                </div>
                                </div>
                            </CardContent>
                        </Card>

                    <Card className="bg-white border-0 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 animate-fade-in group">
                        <CardContent className="p-3 sm:p-4 md:p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center space-x-1 sm:space-x-2 mb-1 sm:mb-2">
                                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-500 rounded-full animate-pulse flex-shrink-0"></div>
                                        <p className="text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wide truncate">
                                            Resolved
                                        </p>
                                    </div>
                                    <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1 transition-all duration-300 group-hover:text-emerald-600">
                                    {statusCounts.resolved}
                                    </p>
                                </div>
                                <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-emerald-100 rounded-lg sm:rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-emerald-600" />
                                </div>
                                </div>
                            </CardContent>
                        </Card>

                    <Card className="bg-white border-0 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 animate-fade-in group">
                        <CardContent className="p-3 sm:p-4 md:p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center space-x-1 sm:space-x-2 mb-1 sm:mb-2">
                                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-500 rounded-full animate-pulse flex-shrink-0"></div>
                                        <p className="text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wide truncate">
                                            Closed
                                        </p>
                                    </div>
                                    <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1 transition-all duration-300 group-hover:text-gray-600">
                                    {statusCounts.closed}
                                    </p>
                                </div>
                                <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gray-100 rounded-lg sm:rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-gray-600" />
                                </div>
                                </div>
                            </CardContent>
                        </Card>
            </div>

                {/* Search and Filters */}
                <Card className="bg-white border-0 shadow-sm hover:shadow-lg transition-all duration-300 animate-fade-in mb-4 sm:mb-6">
                    <CardContent className="p-3 sm:p-4 md:p-6">
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                            {/* Search */}
                            <div className="flex-1 min-w-0">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <Input
                                        placeholder="Search issues by title, location, ID, or reporter..."
                                    value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500 w-full"
                                    />
                                </div>
                            </div>

                            {/* Filter Toggle */}
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowFilters(!showFilters)}
                                    className="border-gray-200 text-gray-600 hover:bg-gray-50 transition-all duration-200 hover:scale-105 w-full sm:w-auto"
                                >
                                    <Filter className="w-4 h-4 mr-2" />
                                    <span className="hidden xs:inline">Filters</span>
                                    <span className="xs:hidden">Filter</span>
                                    {hasActiveFilters && (
                                        <div className="w-2 h-2 bg-blue-500 rounded-full ml-2"></div>
                                    )}
                                </Button>

                                {hasActiveFilters && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={clearFilters}
                                        className="text-gray-500 hover:text-gray-700 w-full sm:w-auto"
                                    >
                                        <X className="w-4 h-4 mr-1" />
                                        <span className="hidden xs:inline">Clear</span>
                                        <span className="xs:hidden">Reset</span>
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Filters */}
                        {showFilters && (
                            <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200">
                                <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                                <div>
                                        <label className="text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2 block">
                                        Status
                                    </label>
                                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                                            <SelectTrigger className="border-gray-200 h-9 sm:h-10">
                                                <SelectValue placeholder="All Statuses" />
                                        </SelectTrigger>
                                        <SelectContent>
                                                <SelectItem value="all">All Statuses</SelectItem>
                                                <SelectItem value="submitted">Submitted</SelectItem>
                                                <SelectItem value="assigned">Assigned</SelectItem>
                                                <SelectItem value="in_progress">In Progress</SelectItem>
                                                <SelectItem value="resolved">Resolved</SelectItem>
                                                <SelectItem value="closed">Closed</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                        <label className="text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2 block">
                                        Priority
                                    </label>
                                        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                                            <SelectTrigger className="border-gray-200 h-9 sm:h-10">
                                                <SelectValue placeholder="All Priorities" />
                                        </SelectTrigger>
                                        <SelectContent>
                                                <SelectItem value="all">All Priorities</SelectItem>
                                                <SelectItem value="high">High</SelectItem>
                                                <SelectItem value="medium">Medium</SelectItem>
                                                <SelectItem value="low">Low</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                    <div className="xs:col-span-2 lg:col-span-1">
                                        <label className="text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2 block">
                                        Category
                                    </label>
                                        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                            <SelectTrigger className="border-gray-200 h-9 sm:h-10">
                                            <SelectValue placeholder="All Categories" />
                                        </SelectTrigger>
                                        <SelectContent>
                                                <SelectItem value="all">All Categories</SelectItem>
                                                {Array.from(new Set(allIssues.map(issue => issue.category))).map(category => (
                                                    <SelectItem key={category} value={category}>
                                                    {getCategoryLabel(category)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Loading State */}
                {loading && (
                    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600 font-medium animate-pulse">
                                Loading issues...
                            </p>
                        </div>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                        <div className="text-center animate-fade-in">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertTriangle className="w-8 h-8 text-red-500" />
                            </div>
                            <p className="text-red-600 mb-4 font-medium">{error}</p>
                            <Button 
                                onClick={() => window.location.reload()} 
                                className="bg-blue-600 hover:bg-blue-700 transition-all duration-200 transform hover:scale-105"
                            >
                                Retry
                            </Button>
                        </div>
                    </div>
                )}

                {/* Issues List */}
                {!loading && !error && (
                    <Card className="bg-white border-0 shadow-sm hover:shadow-lg transition-all duration-300 animate-fade-in">
                        <CardHeader className="pb-3 sm:pb-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
                                <div className="min-w-0 flex-1">
                                    <CardTitle className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                                                Issues ({filteredIssues.length})
                                            </CardTitle>
                                    <CardDescription className="text-xs sm:text-sm text-gray-500 mt-1 truncate">
                                        {hasActiveFilters ? 'Filtered results' : 'All reported issues'}
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                        <CardContent className="pt-0">
                            {filteredIssues.length === 0 ? (
                                <div className="text-center py-8 sm:py-12">
                                    <div className="animate-bounce">
                                        <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 sm:mb-3 text-gray-400" />
                                                                            </div>
                                    <p className="font-medium text-gray-500 text-sm sm:text-base">No issues found</p>
                                    <p className="text-xs mt-1 text-gray-400 px-4">
                                        {hasActiveFilters ? 'Try adjusting your filters' : 'Issues will appear here once citizens start reporting them'}
                                    </p>
                                                                        </div>
                            ) : (
                                <div className="space-y-3 sm:space-y-4">
                                    {filteredIssues.map((issue, index) => (
                                        <div 
                                            key={issue.id} 
                                            className="p-3 sm:p-4 md:p-6 border border-gray-100 rounded-lg sm:rounded-xl hover:border-gray-200 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 animate-fade-in"
                                        >
                                            <div className="flex flex-col gap-3 sm:gap-4">
                                                <div className="flex flex-col xs:flex-row xs:items-start justify-between gap-2 sm:gap-3">
                                                    <h3 className="font-medium text-gray-900 text-sm sm:text-base leading-tight flex-1 min-w-0">
                                                        <span className="line-clamp-2">{issue.title}</span>
                                                    </h3>
                                                    <div className="flex items-center gap-1 sm:gap-2 flex-wrap flex-shrink-0">
                                                        <Badge className={`${getStatusColor(issue.status)} text-xs font-medium px-2 py-1`}>
                                                            {issue.status.replace("-", " ")}
                                                                    </Badge>
                                                        <Badge className={`${getPriorityColor(issue.priority)} text-xs font-medium px-2 py-1`}>
                                                            {issue.priority}
                                                                        </Badge>
                                        </div>
                                    </div>

                                                <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">
                                                    {issue.description}
                                                </p>

                                                <div className="flex flex-col xs:flex-row xs:items-center gap-2 sm:gap-3 text-xs text-gray-500">
                                                    <span className="flex items-center min-w-0">
                                                        <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                                                        <span className="truncate">
                                                            {issue.location_address.length > 40 
                                                                ? issue.location_address.substring(0, 40) + "..." 
                                                                : issue.location_address}
                                                                        </span>
                                                                        </span>
                                                    <span className="flex items-center flex-shrink-0">
                                                        <Calendar className="w-3 h-3 mr-1" />
                                                        {new Date(issue.created_at).toLocaleDateString()}
                                                                    </span>
                                                    {issue.profiles && (
                                                        <span className="flex items-center min-w-0">
                                                            <User className="w-3 h-3 mr-1 flex-shrink-0" />
                                                            <span className="truncate">{issue.profiles.full_name}</span>
                                                                            </span>
                                                                        )}
                                                            </div>

                                                <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2 sm:gap-3">
                                                    <div className="flex items-center gap-3 sm:gap-4 text-xs text-gray-500">
                                                        <span className="flex items-center">
                                                            <ThumbsUp className="w-3 h-3 mr-1" />
                                                            {issue.upvotes || 0} votes
                                                                    </span>
                                                        {issue.department && (
                                                            <span className="flex items-center min-w-0">
                                                                <Building2 className="w-3 h-3 mr-1 flex-shrink-0" />
                                                                <span className="truncate">{issue.department.name}</span>
                                                            </span>
                                                        )}
                                    </div>

                                                <Button
                                                    variant="outline"
                                                        size="sm"
                                                        className="text-xs border-gray-200 text-gray-700 hover:bg-gray-50 transition-all duration-200 hover:scale-105 w-full xs:w-auto"
                                                        asChild
                                                    >
                                                        <Link href={`/admin/issues/${issue.id}`}>
                                                            <Eye className="w-3 h-3 mr-1" />
                                                            <span className="hidden xs:inline">View</span>
                                                            <span className="xs:hidden">View Details</span>
                                                        </Link>
                                                </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                )}
            </div>
        </div>
    );
}
