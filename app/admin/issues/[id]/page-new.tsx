"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    ArrowLeft,
    MapPin,
    Calendar,
    User,
    Building2,
    AlertCircle,
    Clock,
    CheckCircle,
    FileText,
    ExternalLink,
    Map as MapIcon,
    MessageCircle,
    Shield,
    Settings,
    TrendingUp,
    Sparkles,
    Users,
} from "lucide-react";
import AdminIssueStatusUpdater from "@/components/admin-issue-status-updater";
import AdminDepartmentAssigner from "@/components/admin-department-assigner";
import AdminUserAssigner from "@/components/admin-user-assigner";
import CitizenComments from "@/components/citizen-comments";
import InteractiveGoogleMap from "@/components/interactive-google-map";

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
    audio_url?: string;
    created_at: string;
    updated_at: string;
    completed_at?: string;
    estimated_completion?: string;
    profiles?: {
        full_name: string;
        email: string;
    };
    department?: {
        id: string;
        name: string;
        email: string;
        description?: string;
    };
    assigned_profile?: {
        full_name: string;
        email: string;
    };
    comments_count?: number;
    votes_count?: number;
}

const priorityColors = {
    low: "bg-emerald-100 text-emerald-700 border-emerald-300",
    medium: "bg-amber-100 text-amber-700 border-amber-300",
    high: "bg-orange-100 text-orange-700 border-orange-300",
    urgent: "bg-red-100 text-red-700 border-red-400",
};

const statusColors = {
    submitted: "bg-sky-100 text-sky-700 border-sky-300",
    assigned: "bg-purple-100 text-purple-700 border-purple-300",
    in_progress: "bg-[#5C9479]/20 text-[#2E6A56] border-[#5C9479]/30",
    resolved: "bg-green-100 text-green-700 border-green-400",
    closed: "bg-gray-100 text-gray-700 border-gray-300",
};

export default function AdminIssueDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [issue, setIssue] = useState<Issue | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const issueId = params.id as string;

    const fetchIssue = async () => {
        try {
            const response = await fetch(`/api/issues?id=${issueId}`);
            if (response.ok) {
                const data = await response.json();
                setIssue(data.issue);
            } else {
                setError("Issue not found");
            }
        } catch (error) {
            console.error("Error fetching issue:", error);
            setError("Failed to load issue");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = (newStatus: string, assignedTo?: string) => {
        if (issue) {
            setIssue({
                ...issue,
                status: newStatus,
                assigned_profile: assignedTo
                    ? { full_name: "Updated", email: "" }
                    : issue.assigned_profile,
            });
        }
    };

    const handleDepartmentAssigned = (department: any) => {
        if (issue) {
            setIssue({
                ...issue,
                department: {
                    id: department.id,
                    name: department.name,
                    email: department.email || "",
                    description: department.description,
                },
            });
        }
    };

    const handleUserAssigned = (
        user: { id: string; full_name: string | null; email: string } | null
    ) => {
        if (issue) {
            setIssue({
                ...issue,
                assigned_profile: user
                    ? { full_name: user.full_name || "", email: user.email }
                    : undefined,
            });
        }
    };

    useEffect(() => {
        if (issueId) {
            fetchIssue();
        }
    }, [issueId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center"
                >
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "linear",
                        }}
                        className="w-16 h-16 border-4 border-[#2E6A56] border-t-transparent rounded-full mx-auto mb-4"
                    />
                    <p className="text-gray-600 font-medium">
                        Loading issue details...
                    </p>
                </motion.div>
            </div>
        );
    }

    if (error || !issue) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center max-w-md"
                >
                    <AlertCircle className="w-20 h-20 text-red-500 mx-auto mb-6" />
                    <h1 className="text-4xl font-bold mb-3 text-gray-900">
                        Issue Not Found
                    </h1>
                    <p className="text-gray-600 mb-8 text-lg">
                        {error ||
                            "The issue you are looking for does not exist."}
                    </p>
                    <Button
                        asChild
                        size="lg"
                        className="bg-gradient-to-r from-[#2E6A56] to-[#5C9479] hover:from-[#1f4a3a] hover:to-[#4a7d63] shadow-lg"
                    >
                        <Link href="/admin/issues">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Issues
                        </Link>
                    </Button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30">
            {/* Floating Glass Header */}
            <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 border-b border-white/20 shadow-lg shadow-black/5"
            >
                <div className="container mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <Button
                            variant="ghost"
                            asChild
                            className="hover:bg-gradient-to-r hover:from-[#2E6A56]/10 hover:to-[#5C9479]/10 transition-all duration-300"
                        >
                            <Link
                                href="/admin/issues"
                                className="flex items-center gap-2"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                <span className="font-medium">
                                    Back to Admin Issues
                                </span>
                            </Link>
                        </Button>
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.1 }}
                            className="flex items-center gap-3"
                        >
                            <Badge
                                variant="outline"
                                className={
                                    priorityColors[
                                        issue.priority as keyof typeof priorityColors
                                    ]
                                }
                            >
                                <Shield className="w-3 h-3 mr-1" />
                                {issue.priority}
                            </Badge>
                            <Badge
                                variant="outline"
                                className={
                                    statusColors[
                                        issue.status as keyof typeof statusColors
                                    ]
                                }
                            >
                                <CheckCircle className="w-3 h-3 mr-1" />
                                {issue.status.replace("_", " ")}
                            </Badge>
                            <span className="text-sm text-gray-600">
                                #{issue.id.slice(0, 8)}
                            </span>
                        </motion.div>
                    </div>
                </div>
            </motion.div>

            {/* Hero Section with Gradient Background */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="relative overflow-hidden bg-gradient-to-br from-[#2E6A56] via-[#5C9479] to-[#2E6A56] py-16 md:py-20"
            >
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
                <motion.div
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="container mx-auto px-6 relative z-10"
                >
                    <div className="max-w-4xl mx-auto">
                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            className="flex items-center gap-3 mb-4"
                        >
                            <Settings className="w-6 h-6 text-yellow-300 animate-pulse" />
                            <span className="text-white/80 text-sm font-medium">
                                Admin View • Issue #{issue.id.slice(0, 8)}
                            </span>
                        </motion.div>
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                            {issue.title}
                        </h1>
                        <p className="text-white/90 text-lg md:text-xl leading-relaxed mb-8">
                            {issue.description}
                        </p>
                        <div className="flex items-center gap-6 text-white/80 flex-wrap text-sm md:text-base">
                            <div className="flex items-center gap-2">
                                <User className="w-5 h-5" />
                                <span className="font-medium">
                                    Reporter:{" "}
                                    {issue.profiles?.full_name || "Unknown"}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="w-5 h-5" />
                                <span>
                                    {new Date(
                                        issue.created_at
                                    ).toLocaleDateString()}
                                </span>
                            </div>
                            {issue.votes_count != null &&
                                issue.votes_count > 0 && (
                                    <div className="flex items-center gap-2">
                                        <TrendingUp className="w-5 h-5" />
                                        <span className="font-semibold">
                                            {issue.votes_count} votes
                                        </span>
                                    </div>
                                )}
                        </div>
                    </div>
                </motion.div>
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
            </motion.div>

            {/* Main Content Grid */}
            <div className="container mx-auto px-6 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    {/* Left Column - Issue Details */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="lg:col-span-2 space-y-6"
                    >
                        {/* Image Card */}
                        {issue.image_url && (
                            <Card className="border-2 shadow-2xl overflow-hidden group">
                                <div className="relative">
                                    <motion.img
                                        whileHover={{ scale: 1.05 }}
                                        transition={{ duration: 0.3 }}
                                        src={issue.image_url}
                                        alt="Issue"
                                        className="w-full h-96 object-cover cursor-pointer"
                                        onClick={() =>
                                            window.open(
                                                issue.image_url,
                                                "_blank"
                                            )
                                        }
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
                                        <Button
                                            size="sm"
                                            className="bg-white text-gray-900 hover:bg-gray-100 shadow-xl"
                                        >
                                            <ExternalLink className="w-4 h-4 mr-2" />
                                            View Full Size
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        )}

                        {/* Issue Details Card */}
                        <Card className="border-2 shadow-xl">
                            <div className="h-1 bg-gradient-to-r from-[#2E6A56] via-[#5C9479] to-[#2E6A56]" />
                            <CardHeader className="bg-gradient-to-br from-[#2E6A56]/5 to-[#5C9479]/5">
                                <CardTitle className="text-2xl flex items-center gap-2">
                                    <FileText className="w-6 h-6 text-[#2E6A56]" />
                                    Issue Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border-2">
                                        <div className="text-xs text-gray-500 mb-1">
                                            Category
                                        </div>
                                        <div className="font-semibold capitalize">
                                            {issue.category.replace("-", " ")}
                                        </div>
                                    </div>
                                    <div className="p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border-2">
                                        <div className="text-xs text-gray-500 mb-1">
                                            Priority
                                        </div>
                                        <Badge
                                            className={
                                                priorityColors[
                                                    issue.priority as keyof typeof priorityColors
                                                ]
                                            }
                                        >
                                            {issue.priority}
                                        </Badge>
                                    </div>
                                </div>

                                {issue.audio_url && (
                                    <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-100">
                                        <div className="flex items-center gap-2 mb-3">
                                            <FileText className="w-5 h-5 text-blue-600" />
                                            <span className="font-semibold text-blue-900">
                                                Audio Recording
                                            </span>
                                        </div>
                                        <audio
                                            src={issue.audio_url}
                                            controls
                                            className="w-full"
                                        />
                                    </div>
                                )}

                                <Separator />

                                {/* Reporter Info */}
                                <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-100">
                                    <div className="flex items-center gap-2 mb-3">
                                        <User className="w-5 h-5 text-blue-600" />
                                        <span className="font-semibold text-blue-900">
                                            Reporter Information
                                        </span>
                                    </div>
                                    <div className="space-y-2">
                                        <div>
                                            <div className="text-xs text-gray-500">
                                                Name
                                            </div>
                                            <div className="font-medium">
                                                {issue.profiles?.full_name ||
                                                    "Unknown"}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-500">
                                                Email
                                            </div>
                                            <div className="font-medium">
                                                {issue.profiles?.email}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Assignment Info */}
                                {(issue.department ||
                                    issue.assigned_profile) && (
                                    <div className="space-y-4">
                                        {issue.department && (
                                            <div className="p-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border-2 border-purple-100">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Building2 className="w-5 h-5 text-purple-600" />
                                                    <span className="font-semibold text-purple-900">
                                                        Assigned Department
                                                    </span>
                                                </div>
                                                <p className="text-purple-800 font-medium">
                                                    {issue.department.name}
                                                </p>
                                                {issue.department.email && (
                                                    <p className="text-sm text-purple-600 mt-1">
                                                        {issue.department.email}
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                        {issue.assigned_profile && (
                                            <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border-2 border-emerald-100">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <User className="w-5 h-5 text-emerald-600" />
                                                    <span className="font-semibold text-emerald-900">
                                                        Assigned To
                                                    </span>
                                                </div>
                                                <p className="text-emerald-800 font-medium">
                                                    {
                                                        issue.assigned_profile
                                                            .full_name
                                                    }
                                                </p>
                                                <p className="text-sm text-emerald-600 mt-1">
                                                    {
                                                        issue.assigned_profile
                                                            .email
                                                    }
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Location Card */}
                        <Card className="border-2 shadow-xl">
                            <div className="h-1 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500" />
                            <CardHeader className="bg-gradient-to-br from-green-50 to-emerald-50">
                                <CardTitle className="text-2xl flex items-center gap-2">
                                    <MapPin className="w-6 h-6 text-green-600" />
                                    Location
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4">
                                <div className="flex items-start gap-3">
                                    <MapPin className="w-5 h-5 text-gray-500 flex-shrink-0 mt-1" />
                                    <div>
                                        <p className="text-gray-900 font-medium">
                                            {issue.location_address}
                                        </p>
                                        {issue.landmark && (
                                            <p className="text-sm text-gray-600 mt-1 flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                                Landmark: {issue.landmark}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="rounded-xl overflow-hidden border-4 border-gray-100 shadow-lg">
                                    <InteractiveGoogleMap
                                        lat={issue.location_lat}
                                        lng={issue.location_lng}
                                        address={issue.location_address}
                                        height={400}
                                        zoom={16}
                                    />
                                </div>

                                <div className="flex gap-3">
                                    <Button
                                        variant="outline"
                                        className="flex-1 bg-gradient-to-r from-white to-gray-50 hover:from-[#2E6A56] hover:to-[#5C9479] hover:text-white border-2 transition-all duration-300"
                                        asChild
                                    >
                                        <a
                                            href={`https://maps.google.com/?q=${issue.location_lat},${issue.location_lng}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <ExternalLink className="w-4 h-4 mr-2" />
                                            Open in Maps
                                        </a>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="flex-1 bg-gradient-to-r from-white to-gray-50 hover:from-[#2E6A56] hover:to-[#5C9479] hover:text-white border-2 transition-all duration-300"
                                        asChild
                                    >
                                        <a
                                            href={`https://www.google.com/maps/dir/?api=1&destination=${issue.location_lat},${issue.location_lng}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <MapIcon className="w-4 h-4 mr-2" />
                                            Directions
                                        </a>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Comments Section */}
                        <Card className="border-2 shadow-xl">
                            <div className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
                            <CardHeader className="bg-gradient-to-br from-indigo-50 to-purple-50">
                                <CardTitle className="text-2xl flex items-center gap-2">
                                    <MessageCircle className="w-6 h-6 text-indigo-600" />
                                    Citizen Comments
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <CitizenComments issueId={issue.id} />
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Right Column - Admin Actions */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="space-y-6"
                    >
                        {/* Department Assignment */}
                        <AdminDepartmentAssigner
                            issueId={issue.id}
                            issueCategory={issue.category}
                            currentDepartment={
                                issue.department
                                    ? {
                                          id: issue.department.id,
                                          name: issue.department.name,
                                      }
                                    : undefined
                            }
                            onDepartmentAssigned={handleDepartmentAssigned}
                        />

                        {/* User Assignment */}
                        <AdminUserAssigner
                            issueId={issue.id}
                            departmentId={issue.department?.id}
                            currentAssignee={issue.assigned_profile || null}
                            onAssigned={handleUserAssigned}
                        />

                        {/* Quick Actions */}
                        <Card className="border-2 shadow-xl sticky top-24">
                            <div className="h-1 bg-gradient-to-r from-[#5C9479] to-[#2E6A56]" />
                            <CardHeader className="bg-gradient-to-br from-[#5C9479]/10 to-[#2E6A56]/10">
                                <CardTitle className="text-xl flex items-center gap-2">
                                    <AlertCircle className="w-5 h-5 text-[#2E6A56]" />
                                    Quick Actions
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 p-4">
                                <Button
                                    variant="outline"
                                    className="w-full justify-start hover:bg-[#2E6A56] hover:text-white hover:border-[#2E6A56] transition-all border-2 shadow-sm"
                                    asChild
                                >
                                    <Link href="/admin/issues">
                                        <FileText className="w-4 h-4 mr-2" />
                                        View All Issues
                                    </Link>
                                </Button>

                                <Button
                                    variant="outline"
                                    className="w-full justify-start hover:bg-[#5C9479] hover:text-white hover:border-[#5C9479] transition-all border-2 shadow-sm"
                                    asChild
                                >
                                    <Link href="/admin/dashboard">
                                        <AlertCircle className="w-4 h-4 mr-2" />
                                        Admin Dashboard
                                    </Link>
                                </Button>

                                <Button
                                    variant="outline"
                                    className="w-full justify-start hover:bg-gradient-to-r hover:from-[#2E6A56] hover:to-[#5C9479] hover:text-white hover:border-[#2E6A56] transition-all border-2 shadow-sm"
                                    asChild
                                >
                                    <a
                                        href={`https://maps.google.com/maps/dir/?api=1&destination=${issue.location_lat},${issue.location_lng}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <MapIcon className="w-4 h-4 mr-2" />
                                        Navigate to Location
                                    </a>
                                </Button>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
