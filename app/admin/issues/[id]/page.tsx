"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
        <div className="min-h-screen bg-black text-white relative overflow-hidden">
            {/* Animated Background */}
            <div className="fixed inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-br from-[#2E6A56]/20 via-black to-[#5C9479]/20" />
                <motion.div
                    animate={{
                        backgroundPosition: ["0% 0%", "100% 100%"],
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        repeatType: "reverse",
                    }}
                    className="absolute inset-0 opacity-20"
                    style={{
                        backgroundImage:
                            "radial-gradient(circle at 20% 50%, #2E6A56 0%, transparent 50%), radial-gradient(circle at 80% 80%, #5C9479 0%, transparent 50%)",
                        backgroundSize: "100% 100%",
                    }}
                />
            </div>

            {/* Compact Top Bar */}
            <motion.div
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-2xl border-b border-white/10"
            >
                <div className="max-w-[1600px] mx-auto px-6 py-3">
                    <div className="flex items-center justify-between">
                        <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            className="text-white/80 hover:text-white hover:bg-white/10"
                        >
                            <Link
                                href="/admin/issues"
                                className="flex items-center gap-2"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Issues
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

            {/* Main Content - Bento Grid Style */}
            <div className="relative z-10 pt-20 px-6 max-w-[1600px] mx-auto">
                {/* Title Section - Diagonal Layout */}
                <motion.div
                    initial={{ opacity: 0, x: -100 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="mb-8"
                >
                    <div className="relative">
                        <div className="absolute -left-4 top-0 w-1 h-full bg-gradient-to-b from-[#2E6A56] to-[#5C9479]" />
                        <div className="pl-8">
                            <div className="flex items-center gap-3 mb-3">
                                <Settings className="w-5 h-5 text-yellow-400" />
                                <span className="text-[#5C9479] text-sm font-mono">
                                    Admin • #{issue.id.slice(0, 8)}
                                </span>
                                <span className="text-white/40">•</span>
                                <span className="text-white/60 text-sm">
                                    {new Date(
                                        issue.created_at
                                    ).toLocaleDateString()}
                                </span>
                            </div>
                            <h1 className="text-5xl md:text-7xl font-black mb-4 leading-tight text-white">
                                {issue.title}
                            </h1>
                            <p className="text-xl text-white/70 max-w-3xl leading-relaxed">
                                {issue.description}
                            </p>
                            <div className="flex items-center gap-4 mt-4 text-sm text-white/50">
                                <span className="flex items-center gap-2">
                                    <User className="w-4 h-4" />
                                    {issue.profiles?.full_name || "Unknown"}
                                </span>
                                <span>•</span>
                                <span className="capitalize">
                                    {issue.category.replace("-", " ")}
                                </span>
                                {issue.votes_count && issue.votes_count > 0 && (
                                    <>
                                        <span>•</span>
                                        <span className="flex items-center gap-1">
                                            <TrendingUp className="w-4 h-4" />
                                            {issue.votes_count} votes
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Bento Grid */}
                <div className="grid grid-cols-12 gap-4">
                    {/* Image - 7 columns */}
                    {issue.image_url && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                            className="col-span-12 lg:col-span-7 relative group cursor-pointer h-[350px]"
                            onClick={() =>
                                window.open(issue.image_url, "_blank")
                            }
                        >
                            <div className="absolute inset-0 bg-white/5 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-xl">
                                <motion.img
                                    whileHover={{ scale: 1.05 }}
                                    transition={{ duration: 0.6 }}
                                    src={issue.image_url}
                                    alt="Issue"
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    whileHover={{ opacity: 1, y: 0 }}
                                    className="absolute bottom-6 left-6 right-6 flex items-center justify-between"
                                >
                                    <span className="text-white font-bold text-xl">
                                        View Full Size
                                    </span>
                                    <ExternalLink className="w-6 h-6 text-white" />
                                </motion.div>
                            </div>
                        </motion.div>
                    )}

                    {/* Details - 5 columns */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="col-span-12 lg:col-span-5 space-y-4"
                    >
                        {/* Issue Details */}
                        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
                            <div className="flex items-center gap-2 mb-4">
                                <FileText className="w-6 h-6 text-[#5C9479]" />
                                <h3 className="text-xl font-bold text-white">
                                    Issue Details
                                </h3>
                            </div>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="text-xs text-white/40">
                                        Category
                                    </div>
                                    <div className="text-white font-semibold capitalize">
                                        {issue.category.replace("-", " ")}
                                    </div>
                                    <div className="text-xs text-white/40">
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
                                    <div className="text-xs text-white/40">
                                        Reporter
                                    </div>
                                    <div className="text-white font-medium">
                                        {issue.profiles?.full_name || "Unknown"}
                                    </div>
                                    <div className="text-xs text-white/40">
                                        Email
                                    </div>
                                    <div className="text-white/70 text-sm">
                                        {issue.profiles?.email}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Assignment & Audio */}
                        {issue.department && (
                            <div className="bg-purple-500/20 border border-purple-500/30 rounded-3xl p-6 backdrop-blur-xl">
                                <Building2 className="w-6 h-6 text-purple-400 mb-3" />
                                <div className="text-sm text-purple-300 mb-1">
                                    Assigned To
                                </div>
                                <div className="text-lg font-bold text-white mb-1">
                                    {issue.department.name}
                                </div>
                                {issue.department.email && (
                                    <div className="text-sm text-white/60">
                                        {issue.department.email}
                                    </div>
                                )}
                            </div>
                        )}

                        {issue.assigned_profile && (
                            <div className="bg-emerald-500/20 border border-emerald-500/30 rounded-3xl p-6 backdrop-blur-xl">
                                <User className="w-6 h-6 text-emerald-400 mb-3" />
                                <div className="text-sm text-emerald-300 mb-1">
                                    Officer
                                </div>
                                <div className="text-lg font-bold text-white mb-1">
                                    {issue.assigned_profile.full_name}
                                </div>
                                <div className="text-sm text-white/60">
                                    {issue.assigned_profile.email}
                                </div>
                            </div>
                        )}

                        {issue.audio_url && (
                            <div className="bg-blue-500/20 border border-blue-500/30 rounded-3xl p-6 backdrop-blur-xl">
                                <FileText className="w-6 h-6 text-blue-400 mb-3" />
                                <div className="text-sm text-blue-300 mb-2">
                                    Audio Recording
                                </div>
                                <audio
                                    src={issue.audio_url}
                                    controls
                                    className="w-full"
                                />
                            </div>
                        )}
                    </motion.div>

                    {/* Map - 7 columns */}
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="col-span-12 lg:col-span-7 relative h-[350px]"
                    >
                        <div className="absolute inset-0 rounded-3xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-xl">
                            <InteractiveGoogleMap
                                lat={issue.location_lat}
                                lng={issue.location_lng}
                                address={issue.location_address}
                                height={350}
                                zoom={16}
                            />
                            <div className="absolute bottom-6 left-6 right-6 bg-black/80 backdrop-blur-2xl rounded-2xl p-4 border border-white/20">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 text-[#5C9479] text-sm mb-2">
                                            <MapPin className="w-4 h-4" />
                                            <span className="font-mono">
                                                Location
                                            </span>
                                        </div>
                                        <div className="text-white font-medium text-sm">
                                            {issue.location_address}
                                        </div>
                                        {issue.landmark && (
                                            <div className="text-white/60 text-xs mt-1">
                                                📍 {issue.landmark}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex gap-2 ml-4">
                                        <motion.a
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            href={`https://maps.google.com/?q=${issue.location_lat},${issue.location_lng}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                                        >
                                            <ExternalLink className="w-4 h-4 text-white" />
                                        </motion.a>
                                        <motion.a
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            href={`https://www.google.com/maps/dir/?api=1&destination=${issue.location_lat},${issue.location_lng}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 bg-[#2E6A56] hover:bg-[#5C9479] rounded-lg transition-colors"
                                        >
                                            <MapIcon className="w-4 h-4 text-white" />
                                        </motion.a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* User Assignment - 5 columns */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                        className="col-span-12 lg:col-span-5"
                    >
                        <AdminUserAssigner
                            issueId={issue.id}
                            departmentId={issue.department?.id}
                            currentAssignee={issue.assigned_profile || null}
                            onAssigned={handleUserAssigned}
                        />
                    </motion.div>
                </div>

                {/* Department Assignment & Quick Actions - Full Width Below */}
                <div className="grid grid-cols-12 gap-4 mt-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="col-span-12 lg:col-span-6"
                    >
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
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                        className="col-span-12 lg:col-span-6"
                    >
                        {/* Quick Actions */}
                        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl sticky top-24">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-[#2E6A56]/30 rounded-xl">
                                    <AlertCircle className="w-5 h-5 text-[#5C9479]" />
                                </div>
                                <h3 className="text-xl font-black text-white">
                                    Quick Actions
                                </h3>
                            </div>
                            <div className="space-y-3">
                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start bg-white/5 hover:bg-[#2E6A56] text-white border-white/20 hover:border-[#2E6A56] transition-all"
                                        asChild
                                    >
                                        <Link href="/admin/issues">
                                            <FileText className="w-4 h-4 mr-2" />
                                            View All Issues
                                        </Link>
                                    </Button>
                                </motion.div>

                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start bg-white/5 hover:bg-[#5C9479] text-white border-white/20 hover:border-[#5C9479] transition-all"
                                        asChild
                                    >
                                        <Link href="/admin/dashboard">
                                            <AlertCircle className="w-4 h-4 mr-2" />
                                            Admin Dashboard
                                        </Link>
                                    </Button>
                                </motion.div>

                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start bg-gradient-to-r from-[#2E6A56] to-[#5C9479] text-white border-0 hover:opacity-80 transition-all"
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
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
