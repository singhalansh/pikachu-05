"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
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
} from "lucide-react";
import AdminIssueStatusUpdater from "@/components/admin-issue-status-updater";
import AdminDepartmentAssigner from "@/components/admin-department-assigner";
import AdminUserAssigner from "@/components/admin-user-assigner";
import CitizenComments from "@/components/citizen-comments";
import GoogleMapsEmbed from "@/components/google-maps-embed";
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
    low: "bg-gradient-to-r from-[#2E6A56]/20 to-[#5C9479]/20 text-[#2E6A56] border border-[#2E6A56]/30",
    medium: "bg-gradient-to-r from-yellow-50 to-yellow-100 text-yellow-700 border border-yellow-300",
    high: "bg-gradient-to-r from-orange-50 to-orange-100 text-orange-700 border border-orange-300",
    urgent: "bg-gradient-to-r from-red-50 to-red-100 text-red-700 border border-red-400 shadow-md",
};

const statusColors = {
    submitted: "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border border-blue-300",
    assigned: "bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 border border-purple-300",
    in_progress: "bg-gradient-to-r from-[#5C9479]/20 to-[#2E6A56]/20 text-[#2E6A56] border border-[#5C9479]/30",
    resolved: "bg-gradient-to-r from-green-50 to-green-100 text-green-700 border border-green-400 shadow-sm",
    closed: "bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 border border-gray-300",
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
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
                <div className="container mx-auto px-4 py-8 max-w-6xl">
                    <div className="animate-pulse space-y-6">
                        <div className="h-8 bg-gradient-to-r from-[#2E6A56]/20 to-[#5C9479]/20 rounded-lg w-1/3"></div>
                        <div className="grid gap-6 lg:grid-cols-3">
                            <div className="lg:col-span-2 space-y-6">
                                <div className="h-64 bg-white border-2 border-gray-100 rounded-xl shadow-sm"></div>
                                <div className="h-32 bg-white border-2 border-gray-100 rounded-xl shadow-sm"></div>
                            </div>
                            <div className="h-96 bg-white border-2 border-gray-100 rounded-xl shadow-sm"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !issue) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
                <div className="container mx-auto px-4 py-8 max-w-6xl">
                    <div className="text-center py-12">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center mx-auto mb-6 shadow-lg">
                            <AlertCircle className="w-10 h-10 text-red-600" />
                        </div>
                        <h1 className="text-3xl font-bold mb-3 bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">Issue Not Found</h1>
                        <p className="text-gray-600 mb-6 text-lg">
                            {error ||
                                "The issue you are looking for does not exist."}
                        </p>
                        <Button className="bg-gradient-to-r from-[#2E6A56] to-[#5C9479] hover:from-[#1f4a3a] hover:to-[#4a7d63] text-white shadow-lg" asChild>
                            <Link href="/admin/issues">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Issues
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-[#2E6A56]/5">
            <div className="container mx-auto px-4 py-8 max-w-6xl">
                {/* Header */}
                <div className="mb-8">
                    <Button variant="ghost" asChild className="mb-6 hover:bg-[#2E6A56]/10 hover:text-[#2E6A56] transition-colors">
                        <Link href="/admin/issues">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Issues
                        </Link>
                    </Button>

                    <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-8 mb-6">
                        <div className="flex items-start justify-between gap-4 flex-wrap">
                            <div className="flex-1 min-w-0">
                                <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-[#2E6A56] to-[#5C9479] bg-clip-text text-transparent">
                                    {issue.title}
                                </h1>
                                <div className="flex items-center gap-3 text-gray-600 flex-wrap">
                                    <span className="px-3 py-1 bg-gray-100 rounded-full text-sm font-medium">Issue #{issue.id.slice(0, 8)}</span>
                                    <span className="text-gray-400">•</span>
                                    <span className="flex items-center gap-1.5">
                                        <Calendar className="w-4 h-4" />
                                        Reported {new Date(issue.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 flex-wrap">
                                <Badge
                                    className={
                                        `${priorityColors[
                                            issue.priority as keyof typeof priorityColors
                                        ]} font-semibold px-4 py-2 text-sm`
                                    }
                                >
                                    {issue.priority.charAt(0).toUpperCase() +
                                        issue.priority.slice(1)}{" "}
                                    Priority
                                </Badge>
                                <Badge
                                    className={
                                        `${statusColors[
                                            issue.status as keyof typeof statusColors
                                        ]} font-semibold px-4 py-2 text-sm`
                                    }
                                >
                                    {issue.status
                                        .replace("_", " ")
                                        .charAt(0)
                                        .toUpperCase() +
                                        issue.status.replace("_", " ").slice(1)}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Issue Details */}
                    <Card className="border-2 border-gray-100 shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-xl overflow-hidden">
                        <div className="h-2 bg-gradient-to-r from-[#2E6A56] via-[#5C9479] to-[#2E6A56]" />
                        <CardHeader className="bg-gradient-to-r from-[#2E6A56]/5 to-[#5C9479]/5">
                            <CardTitle className="text-2xl flex items-center gap-2">
                                <FileText className="w-6 h-6 text-[#2E6A56]" />
                                Issue Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6 p-6">
                            <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border-2 border-gray-100">
                                <h3 className="font-semibold mb-3 text-lg text-[#2E6A56] flex items-center gap-2">
                                    <MessageCircle className="w-5 h-5" />
                                    Description
                                </h3>
                                <p className="text-gray-700 leading-relaxed">
                                    {issue.description}
                                </p>
                            </div>

                            {issue.audio_url && (
                                <div className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-xl border-2 border-blue-100">
                                    <h3 className="font-semibold mb-3 text-lg text-[#2E6A56] flex items-center gap-2">
                                        <FileText className="w-5 h-5" />
                                        Audio Recording
                                    </h3>
                                    <audio
                                        src={issue.audio_url}
                                        controls
                                        className="w-full rounded-lg"
                                        preload="metadata"
                                    />
                                </div>
                            )}

                            <Separator />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-gradient-to-br from-[#2E6A56]/10 to-[#5C9479]/10 p-4 rounded-xl border border-[#2E6A56]/20">
                                    <h4 className="font-semibold mb-2 text-[#2E6A56] text-sm uppercase tracking-wide">
                                        Category
                                    </h4>
                                    <p className="text-gray-700 capitalize font-medium text-lg">
                                        {issue.category.replace("-", " ")}
                                    </p>
                                </div>

                                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
                                    <h4 className="font-semibold mb-2 text-purple-700 text-sm uppercase tracking-wide">
                                        Priority
                                    </h4>
                                    <p className="text-gray-700 capitalize font-medium text-lg">
                                        {issue.priority}
                                    </p>
                                </div>
                            </div>

                            <Separator />

                            {/* Location with Map */}
                            <div className="bg-gradient-to-br from-[#2E6A56]/5 to-[#5C9479]/5 p-6 rounded-xl border-2 border-[#2E6A56]/20">
                                <h4 className="font-semibold mb-4 text-xl flex items-center gap-2 text-[#2E6A56]">
                                    <MapPin className="w-6 h-6" />
                                    Location
                                </h4>
                                <p className="text-gray-700 mb-2 font-medium">
                                    {issue.location_address}
                                </p>
                                {issue.landmark && (
                                    <p className="text-sm text-gray-600 mb-4 flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-[#5C9479]"></span>
                                        Landmark: {issue.landmark}
                                    </p>
                                )}

                                {/* Interactive Map */}
                                <div className="mb-4 rounded-xl overflow-hidden border-2 border-[#2E6A56]/30 shadow-md">
                                    <InteractiveGoogleMap
                                        lat={issue.location_lat}
                                        lng={issue.location_lng}
                                        address={issue.location_address}
                                        height={300}
                                        zoom={16}
                                    />
                                </div>

                                {/* Map Action Buttons */}
                                <div className="flex gap-3 flex-wrap">
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="bg-white hover:bg-[#2E6A56] hover:text-white hover:border-[#2E6A56] transition-all border-2" 
                                        asChild
                                    >
                                        <a
                                            href={`https://maps.google.com/?q=${issue.location_lat},${issue.location_lng}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <ExternalLink className="w-4 h-4 mr-2" />
                                            Open in Google Maps
                                        </a>
                                    </Button>

                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="bg-white hover:bg-[#5C9479] hover:text-white hover:border-[#5C9479] transition-all border-2"
                                        asChild
                                    >
                                        <a
                                            href={`https://www.google.com/maps/dir/?api=1&destination=${issue.location_lat},${issue.location_lng}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <MapIcon className="w-4 h-4 mr-2" />
                                            Get Directions
                                        </a>
                                    </Button>
                                </div>
                            </div>

                            {issue.image_url && (
                                <>
                                    <Separator className="my-6" />
                                    <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border-2 border-gray-100">
                                        <h4 className="font-semibold mb-4 text-lg text-[#2E6A56] flex items-center gap-2">
                                            <FileText className="w-5 h-5" />
                                            Photo Evidence
                                        </h4>
                                        <div className="relative group">
                                            <img
                                                src={issue.image_url}
                                                alt="Issue photo"
                                                className="rounded-xl max-w-full h-auto max-h-96 object-cover cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-gray-200 group-hover:scale-[1.02]"
                                                onClick={() =>
                                                    window.open(
                                                        issue.image_url,
                                                        "_blank"
                                                    )
                                                }
                                            />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-xl transition-all duration-300 flex items-center justify-center">
                                                <ExternalLink className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {/* Reporter Info */}
                    <Card className="border-2 border-gray-100 shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-xl overflow-hidden">
                        <div className="h-2 bg-gradient-to-r from-blue-500 to-blue-600" />
                        <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100/50">
                            <CardTitle className="text-2xl flex items-center gap-2">
                                <User className="w-6 h-6 text-blue-600" />
                                Reporter Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-gradient-to-br from-blue-50 to-white p-4 rounded-xl border-2 border-blue-100">
                                    <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-700">
                                        <User className="w-5 h-5" />
                                        Reporter
                                    </h4>
                                    <p className="text-gray-800 font-medium">
                                        {issue.profiles?.full_name || "Unknown"}
                                    </p>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {issue.profiles?.email}
                                    </p>
                                </div>

                                <div className="bg-gradient-to-br from-purple-50 to-white p-4 rounded-xl border-2 border-purple-100">
                                    <h4 className="font-semibold mb-2 flex items-center gap-2 text-purple-700">
                                        <Calendar className="w-5 h-5" />
                                        Reported Date
                                    </h4>
                                    <p className="text-gray-800 font-medium">
                                        {new Date(
                                            issue.created_at
                                        ).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Assignment Info */}
                    <Card className="border-2 border-gray-100 shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-xl overflow-hidden">
                        <div className="h-2 bg-gradient-to-r from-[#2E6A56] to-[#5C9479]" />
                        <CardHeader className="bg-gradient-to-r from-[#2E6A56]/5 to-[#5C9479]/5">
                            <CardTitle className="text-2xl flex items-center gap-2">
                                <Building2 className="w-6 h-6 text-[#2E6A56]" />
                                Assignment Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6 p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {issue.department && (
                                    <div className="bg-gradient-to-br from-[#2E6A56]/10 to-[#5C9479]/10 p-5 rounded-xl border-2 border-[#2E6A56]/20">
                                        <h4 className="font-semibold mb-2 flex items-center gap-2 text-[#2E6A56]">
                                            <Building2 className="w-5 h-5" />
                                            Department
                                        </h4>
                                        <p className="text-gray-800 font-medium text-lg">
                                            {issue.department.name}
                                        </p>
                                        {issue.department.email && (
                                            <p className="text-sm text-gray-600 mt-1">
                                                {issue.department.email}
                                            </p>
                                        )}
                                    </div>
                                )}

                                <div className="bg-gradient-to-br from-indigo-50 to-white p-5 rounded-xl border-2 border-indigo-100">
                                    <h4 className="font-semibold mb-2 flex items-center gap-2 text-indigo-700">
                                        <User className="w-5 h-5" />
                                        Assigned To
                                    </h4>
                                    {issue.assigned_profile ? (
                                        <>
                                            <p className="text-gray-800 font-medium text-lg">
                                                {
                                                    issue.assigned_profile
                                                        .full_name
                                                }
                                            </p>
                                            <p className="text-sm text-gray-600 mt-1">
                                                {issue.assigned_profile.email}
                                            </p>
                                        </>
                                    ) : (
                                        <p className="text-gray-500 italic">
                                            Not assigned yet
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Timeline Information */}
                            <Separator className="my-6" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {issue.estimated_completion && (
                                    <div className="bg-gradient-to-br from-amber-50 to-white p-5 rounded-xl border-2 border-amber-100">
                                        <h4 className="font-semibold mb-2 flex items-center gap-2 text-amber-700">
                                            <Calendar className="w-5 h-5" />
                                            Estimated Completion
                                        </h4>
                                        <p className="text-gray-800 font-medium text-lg">
                                            {new Date(
                                                issue.estimated_completion
                                            ).toLocaleDateString()}
                                        </p>
                                    </div>
                                )}

                                {issue.completed_at && (
                                    <div className="bg-gradient-to-br from-green-50 to-white p-5 rounded-xl border-2 border-green-200 shadow-md">
                                        <h4 className="font-semibold mb-2 flex items-center gap-2 text-green-700">
                                            <CheckCircle className="w-5 h-5" />
                                            Completed On
                                        </h4>
                                        <p className="text-gray-800 font-medium">
                                            {new Date(
                                                issue.completed_at
                                            ).toLocaleDateString()}{" "}
                                            at{" "}
                                            {new Date(
                                                issue.completed_at
                                            ).toLocaleTimeString()}
                                        </p>
                                        <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white mt-2 shadow-sm">
                                            ✓ Resolved
                                        </Badge>
                                    </div>
                                )}
                            </div>

                            {!issue.department && !issue.assigned_profile && (
                                <div className="text-center py-8 bg-gradient-to-br from-gray-50 to-white rounded-xl border-2 border-dashed border-gray-300">
                                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mx-auto mb-3">
                                        <Clock className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <p className="text-gray-600 font-medium">
                                        This issue is awaiting assignment to a department.
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                    {/* Citizen Comments */}
                    <Card className="border-2 border-gray-100 shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-xl overflow-hidden">
                        <div className="h-2 bg-gradient-to-r from-indigo-500 to-purple-500" />
                        <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
                            <CardTitle className="text-2xl flex items-center gap-2">
                                <MessageCircle className="w-6 h-6 text-indigo-600" />
                                Citizen Comments
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <CitizenComments issueId={issue.id} />
                        </CardContent>
                    </Card>
                </div>

                {/* Status Update Sidebar */}
                <div className="space-y-6">
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

                    <AdminUserAssigner
                        issueId={issue.id}
                        departmentId={issue.department?.id}
                        currentAssignee={issue.assigned_profile || null}
                        onAssigned={handleUserAssigned}
                    />
                    {/* 
                    <AdminIssueStatusUpdater
                        issueId={issue.id}
                        currentStatus={issue.status}
                        currentAssignedTo={undefined}
                        departmentId={issue.department?.id}
                        onStatusUpdate={handleStatusUpdate}
                    /> */}

                    {/* Quick Actions */}
                    <Card className="border-2 border-gray-100 shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-xl overflow-hidden sticky top-4">
                        <div className="h-2 bg-gradient-to-r from-[#5C9479] to-[#2E6A56]" />
                        <CardHeader className="bg-gradient-to-r from-[#5C9479]/10 to-[#2E6A56]/10">
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
                </div>
            </div>
            </div>
        </div>
    );
}
