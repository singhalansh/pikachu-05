"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    ArrowLeft,
    MapPin,
    Calendar,
    User,
    AlertCircle,
    ThumbsUp,
    MessageCircle,
    ExternalLink,
    Map as MapIcon,
    Phone,
    FileText,
    Image as ImageIcon,
    Info,
    MapPinned,
    Building2,
    Send,
    Clock,
    CheckCircle,
} from "lucide-react";
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

interface Comment {
    id: string;
    content: string;
    created_at: string;
    profiles: {
        full_name: string;
        email: string;
    };
    user_id: string;
}

const priorityColors = {
    low: "bg-green-100 text-green-700 border-green-300",
    medium: "bg-yellow-100 text-yellow-700 border-yellow-300",
    high: "bg-orange-100 text-orange-700 border-orange-300",
    urgent: "bg-red-100 text-red-700 border-red-400",
};

const statusColors = {
    submitted: "bg-blue-100 text-blue-700 border-blue-300",
    assigned: "bg-purple-100 text-purple-700 border-purple-300",
    in_progress: "bg-[#5C9479]/20 text-[#2E6A56] border-[#5C9479]/30",
    resolved: "bg-green-100 text-green-700 border-green-400",
    closed: "bg-gray-100 text-gray-700 border-gray-300",
};

export default function CitizenIssueDetailPage() {
    const params = useParams();
    const [issue, setIssue] = useState<Issue | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [hasUpvoted, setHasUpvoted] = useState(false);
    const [upvotes, setUpvotes] = useState(0);
    const [submittingComment, setSubmittingComment] = useState(false);

    const issueId = params.id as string;

    useEffect(() => {
        const fetchIssue = async () => {
            try {
                const response = await fetch(`/api/issues?id=${issueId}`);
                if (response.ok) {
                    const data = await response.json();
                    setIssue(data.issue);
                    setUpvotes(data.issue.votes_count || 0);
                } else {
                    setError("Issue not found");
                }

                // Fetch comments
                const commentsResponse = await fetch(
                    `/api/issues/${issueId}/comments`
                );
                if (commentsResponse.ok) {
                    const commentsData = await commentsResponse.json();
                    setComments(commentsData.comments || []);
                }

                // Fetch vote status
                const voteResponse = await fetch(`/api/issues/${issueId}/vote`);
                if (voteResponse.ok) {
                    const voteData = await voteResponse.json();
                    setHasUpvoted(voteData.hasVoted || false);
                }
            } catch (error) {
                console.error("Error fetching issue:", error);
                setError("Failed to load issue");
            } finally {
                setLoading(false);
            }
        };
        fetchIssue();
    }, [issueId]);

    const handleUpvote = async () => {
        try {
            if (hasUpvoted) {
                const response = await fetch(`/api/issues/${issueId}/vote`, {
                    method: "DELETE",
                });
                if (response.ok) {
                    setHasUpvoted(false);
                    setUpvotes((prev) => Math.max(0, prev - 1));
                }
            } else {
                const response = await fetch(`/api/issues/${issueId}/vote`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ vote_type: "up" }),
                });
                if (response.ok) {
                    setHasUpvoted(true);
                    setUpvotes((prev) => prev + 1);
                }
            }
        } catch (error) {
            console.error("Error voting:", error);
        }
    };

    const handleSubmitComment = async () => {
        if (!newComment.trim() || submittingComment) return;

        setSubmittingComment(true);
        try {
            const response = await fetch(`/api/issues/${issueId}/comments`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: newComment.trim() }),
            });

            if (response.ok) {
                const data = await response.json();
                setComments([...comments, data.comment]);
                setNewComment("");
            }
        } catch (error) {
            console.error("Error posting comment:", error);
        } finally {
            setSubmittingComment(false);
        }
    };

    if (loading) {
        return (
            <div className="fixed inset-0 bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
                <div className="animate-pulse space-y-4 text-center">
                    <div className="h-8 w-64 bg-gray-200 rounded-lg mx-auto"></div>
                    <div className="h-4 w-48 bg-gray-200 rounded-lg mx-auto"></div>
                </div>
            </div>
        );
    }

    if (error || !issue) {
        return (
            <div className="fixed inset-0 bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
                <div className="text-center py-12">
                    <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
                    <h1 className="text-3xl font-bold mb-3">Issue Not Found</h1>
                    <p className="text-gray-600 mb-6">
                        {error ||
                            "The issue you are looking for does not exist."}
                    </p>
                    <Button
                        asChild
                        className="bg-gradient-to-r from-[#2E6A56] to-[#5C9479] hover:from-[#1f4a3a] hover:to-[#4a7d63]"
                    >
                        <Link href="/citizen/issues">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Issues
                        </Link>
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-gradient-to-br from-gray-50 via-white to-[#2E6A56]/5 overflow-hidden flex flex-col">
            {/* Top Header Bar */}
            <div className="border-b bg-white/80 backdrop-blur-sm shadow-sm">
                <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                    <Button
                        variant="ghost"
                        asChild
                        className="hover:bg-[#2E6A56]/10 hover:text-[#2E6A56] transition-colors"
                    >
                        <Link href="/citizen/issues">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Issues
                        </Link>
                    </Button>
                    <span className="text-sm text-gray-600">
                        Issue #{issue.id.slice(0, 8)}
                    </span>
                </div>
            </div>

            {/* Main Content Area - Full Screen */}
            <div className="flex-1 overflow-hidden">
                <div className="h-full flex flex-col">
                    {/* Hero Section */}
                    <div className="bg-gradient-to-r from-[#2E6A56] to-[#5C9479] text-white p-6 shadow-lg">
                        <div className="container mx-auto">
                            <div className="flex items-start justify-between gap-4 flex-wrap">
                                <div className="flex-1 min-w-0">
                                    <h1 className="text-3xl md:text-4xl font-bold mb-2">
                                        {issue.title}
                                    </h1>
                                    <div className="flex items-center gap-3 text-white/80 flex-wrap text-sm">
                                        <span className="flex items-center gap-1.5">
                                            <Calendar className="w-4 h-4" />
                                            Reported{" "}
                                            {new Date(
                                                issue.created_at
                                            ).toLocaleDateString()}
                                        </span>
                                        <span>•</span>
                                        <span className="capitalize">
                                            {issue.category.replace("-", " ")}
                                        </span>
                                        <span>•</span>
                                        <span className="flex items-center gap-1.5">
                                            <User className="w-4 h-4" />
                                            {issue.profiles?.full_name ||
                                                "Anonymous"}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30 px-3 py-1">
                                        {issue.priority
                                            .charAt(0)
                                            .toUpperCase() +
                                            issue.priority.slice(1)}{" "}
                                        Priority
                                    </Badge>
                                    <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30 px-3 py-1">
                                        {issue.status
                                            .replace("_", " ")
                                            .charAt(0)
                                            .toUpperCase() +
                                            issue.status
                                                .replace("_", " ")
                                                .slice(1)}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tabs Section */}
                    <div className="flex-1 overflow-hidden">
                        <Tabs
                            defaultValue="details"
                            className="h-full flex flex-col"
                        >
                            <div className="border-b bg-white/50 backdrop-blur-sm">
                                <div className="container mx-auto px-4">
                                    <TabsList className="bg-transparent h-12">
                                        <TabsTrigger
                                            value="details"
                                            className="data-[state=active]:bg-white data-[state=active]:shadow-sm gap-2"
                                        >
                                            <Info className="w-4 h-4" />
                                            Details
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="location"
                                            className="data-[state=active]:bg-white data-[state=active]:shadow-sm gap-2"
                                        >
                                            <MapPinned className="w-4 h-4" />
                                            Location
                                        </TabsTrigger>
                                        {issue.image_url && (
                                            <TabsTrigger
                                                value="media"
                                                className="data-[state=active]:bg-white data-[state=active]:shadow-sm gap-2"
                                            >
                                                <ImageIcon className="w-4 h-4" />
                                                Media
                                            </TabsTrigger>
                                        )}
                                        <TabsTrigger
                                            value="comments"
                                            className="data-[state=active]:bg-white data-[state=active]:shadow-sm gap-2"
                                        >
                                            <MessageCircle className="w-4 h-4" />
                                            Comments
                                            {comments.length > 0 && (
                                                <span className="ml-1 text-xs bg-[#2E6A56] text-white rounded-full px-1.5 py-0.5">
                                                    {comments.length}
                                                </span>
                                            )}
                                        </TabsTrigger>
                                    </TabsList>
                                </div>
                            </div>

                            {/* Tab Content - Scrollable */}
                            <div className="flex-1 overflow-y-auto">
                                <div className="container mx-auto px-4 py-6">
                                    {/* Details Tab */}
                                    <TabsContent
                                        value="details"
                                        className="mt-0 space-y-6"
                                    >
                                        <div className="grid gap-6 lg:grid-cols-3">
                                            <div className="lg:col-span-2 space-y-6">
                                                {/* Description Card */}
                                                <Card className="border-2 shadow-lg">
                                                    <CardHeader className="bg-gradient-to-r from-[#2E6A56]/5 to-[#5C9479]/5">
                                                        <CardTitle className="flex items-center gap-2">
                                                            <FileText className="w-5 h-5 text-[#2E6A56]" />
                                                            Description
                                                        </CardTitle>
                                                    </CardHeader>
                                                    <CardContent className="p-6">
                                                        <p className="text-gray-700 leading-relaxed">
                                                            {issue.description}
                                                        </p>
                                                        {issue.audio_url && (
                                                            <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                                                                <h4 className="font-semibold mb-3 text-[#2E6A56]">
                                                                    Audio
                                                                    Recording
                                                                </h4>
                                                                <audio
                                                                    src={
                                                                        issue.audio_url
                                                                    }
                                                                    controls
                                                                    className="w-full"
                                                                />
                                                            </div>
                                                        )}
                                                    </CardContent>
                                                </Card>

                                                {/* Status Info Card */}
                                                {issue.department && (
                                                    <Card className="border-2 shadow-lg">
                                                        <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50">
                                                            <CardTitle className="flex items-center gap-2">
                                                                <Building2 className="w-5 h-5 text-purple-600" />
                                                                Assignment
                                                                Information
                                                            </CardTitle>
                                                        </CardHeader>
                                                        <CardContent className="p-6 space-y-4">
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                <div className="p-4 bg-gradient-to-br from-[#2E6A56]/10 to-[#5C9479]/10 rounded-xl">
                                                                    <h4 className="font-semibold mb-2 text-[#2E6A56]">
                                                                        Department
                                                                    </h4>
                                                                    <p className="text-gray-800 font-medium">
                                                                        {
                                                                            issue
                                                                                .department
                                                                                .name
                                                                        }
                                                                    </p>
                                                                    {issue
                                                                        .department
                                                                        .email && (
                                                                        <p className="text-sm text-gray-600 mt-1">
                                                                            {
                                                                                issue
                                                                                    .department
                                                                                    .email
                                                                            }
                                                                        </p>
                                                                    )}
                                                                </div>
                                                                {issue.assigned_profile && (
                                                                    <div className="p-4 bg-gradient-to-br from-indigo-50 to-white rounded-xl">
                                                                        <h4 className="font-semibold mb-2 text-indigo-700">
                                                                            Assigned
                                                                            To
                                                                        </h4>
                                                                        <p className="text-gray-800 font-medium">
                                                                            {
                                                                                issue
                                                                                    .assigned_profile
                                                                                    .full_name
                                                                            }
                                                                        </p>
                                                                        <p className="text-sm text-gray-600 mt-1">
                                                                            {
                                                                                issue
                                                                                    .assigned_profile
                                                                                    .email
                                                                            }
                                                                        </p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                )}
                                            </div>

                                            {/* Sidebar - Actions */}
                                            <div className="space-y-6">
                                                <Card className="border-2 shadow-lg">
                                                    <CardHeader className="bg-gradient-to-r from-[#5C9479]/10 to-[#2E6A56]/10">
                                                        <CardTitle className="text-lg">
                                                            Community Actions
                                                        </CardTitle>
                                                    </CardHeader>
                                                    <CardContent className="p-4 space-y-3">
                                                        <Button
                                                            variant={
                                                                hasUpvoted
                                                                    ? "default"
                                                                    : "outline"
                                                            }
                                                            className={`w-full justify-start ${
                                                                hasUpvoted
                                                                    ? "bg-[#2E6A56] hover:bg-[#1f4a3a]"
                                                                    : ""
                                                            }`}
                                                            onClick={
                                                                handleUpvote
                                                            }
                                                        >
                                                            <ThumbsUp
                                                                className={`w-4 h-4 mr-2 ${
                                                                    hasUpvoted
                                                                        ? "fill-current"
                                                                        : ""
                                                                }`}
                                                            />
                                                            {hasUpvoted
                                                                ? "Upvoted"
                                                                : "Upvote"}{" "}
                                                            ({upvotes})
                                                        </Button>
                                                    </CardContent>
                                                </Card>

                                                {/* Issue Info */}
                                                <Card className="border-2 shadow-lg">
                                                    <CardHeader className="bg-gradient-to-r from-gray-50 to-white">
                                                        <CardTitle className="text-lg">
                                                            Issue Details
                                                        </CardTitle>
                                                    </CardHeader>
                                                    <CardContent className="p-4 space-y-3 text-sm">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-gray-600">
                                                                Category
                                                            </span>
                                                            <span className="font-medium capitalize">
                                                                {issue.category.replace(
                                                                    "-",
                                                                    " "
                                                                )}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-gray-600">
                                                                Priority
                                                            </span>
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
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-gray-600">
                                                                Status
                                                            </span>
                                                            <Badge
                                                                className={
                                                                    statusColors[
                                                                        issue.status as keyof typeof statusColors
                                                                    ]
                                                                }
                                                            >
                                                                {issue.status.replace(
                                                                    "_",
                                                                    " "
                                                                )}
                                                            </Badge>
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-gray-600">
                                                                Votes
                                                            </span>
                                                            <span className="font-medium">
                                                                {upvotes}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-gray-600">
                                                                Comments
                                                            </span>
                                                            <span className="font-medium">
                                                                {
                                                                    comments.length
                                                                }
                                                            </span>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </div>
                                        </div>
                                    </TabsContent>

                                    {/* Location Tab */}
                                    <TabsContent
                                        value="location"
                                        className="mt-0"
                                    >
                                        <Card className="border-2 shadow-lg">
                                            <CardHeader className="bg-gradient-to-r from-[#2E6A56]/5 to-[#5C9479]/5">
                                                <CardTitle className="flex items-center gap-2">
                                                    <MapPin className="w-5 h-5 text-[#2E6A56]" />
                                                    Location Details
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="p-6 space-y-4">
                                                <div>
                                                    <h4 className="font-semibold mb-2 text-lg">
                                                        Address
                                                    </h4>
                                                    <p className="text-gray-700">
                                                        {issue.location_address}
                                                    </p>
                                                    {issue.landmark && (
                                                        <p className="text-sm text-gray-600 mt-2">
                                                            <span className="font-medium">
                                                                Landmark:
                                                            </span>{" "}
                                                            {issue.landmark}
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="h-96 rounded-xl overflow-hidden border-2 border-[#2E6A56]/30">
                                                    <InteractiveGoogleMap
                                                        lat={issue.location_lat}
                                                        lng={issue.location_lng}
                                                        address={
                                                            issue.location_address
                                                        }
                                                        height={384}
                                                        zoom={16}
                                                    />
                                                </div>

                                                <div className="flex gap-3 flex-wrap">
                                                    <Button
                                                        variant="outline"
                                                        asChild
                                                        className="flex-1"
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
                                                        asChild
                                                        className="flex-1"
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
                                            </CardContent>
                                        </Card>
                                    </TabsContent>

                                    {/* Media Tab */}
                                    {issue.image_url && (
                                        <TabsContent
                                            value="media"
                                            className="mt-0"
                                        >
                                            <Card className="border-2 shadow-lg">
                                                <CardHeader className="bg-gradient-to-r from-gray-50 to-white">
                                                    <CardTitle className="flex items-center gap-2">
                                                        <ImageIcon className="w-5 h-5 text-[#2E6A56]" />
                                                        Photo Evidence
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent className="p-6">
                                                    <div className="relative group">
                                                        <img
                                                            src={
                                                                issue.image_url
                                                            }
                                                            alt="Issue photo"
                                                            className="rounded-xl max-w-full h-auto max-h-[600px] w-full object-contain cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-gray-200"
                                                            onClick={() =>
                                                                window.open(
                                                                    issue.image_url,
                                                                    "_blank"
                                                                )
                                                            }
                                                        />
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </TabsContent>
                                    )}

                                    {/* Comments Tab */}
                                    <TabsContent
                                        value="comments"
                                        className="mt-0 space-y-6"
                                    >
                                        <Card className="border-2 shadow-lg">
                                            <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
                                                <CardTitle className="flex items-center gap-2">
                                                    <MessageCircle className="w-5 h-5 text-indigo-600" />
                                                    Comments ({comments.length})
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="p-6 space-y-6">
                                                {/* Add Comment */}
                                                <div className="space-y-3">
                                                    <Textarea
                                                        placeholder="Add your comment..."
                                                        value={newComment}
                                                        onChange={(e) =>
                                                            setNewComment(
                                                                e.target.value
                                                            )
                                                        }
                                                        className="min-h-[100px]"
                                                    />
                                                    <Button
                                                        onClick={
                                                            handleSubmitComment
                                                        }
                                                        disabled={
                                                            !newComment.trim() ||
                                                            submittingComment
                                                        }
                                                        className="bg-gradient-to-r from-[#2E6A56] to-[#5C9479] hover:from-[#1f4a3a] hover:to-[#4a7d63]"
                                                    >
                                                        <Send className="w-4 h-4 mr-2" />
                                                        {submittingComment
                                                            ? "Posting..."
                                                            : "Post Comment"}
                                                    </Button>
                                                </div>

                                                {/* Comments List */}
                                                <div className="space-y-4">
                                                    {comments.length === 0 ? (
                                                        <p className="text-center text-gray-500 py-8">
                                                            No comments yet. Be
                                                            the first to
                                                            comment!
                                                        </p>
                                                    ) : (
                                                        comments.map(
                                                            (comment) => (
                                                                <div
                                                                    key={
                                                                        comment.id
                                                                    }
                                                                    className="border rounded-lg p-4 bg-white"
                                                                >
                                                                    <div className="flex items-start gap-3">
                                                                        <Avatar className="h-10 w-10">
                                                                            <AvatarFallback>
                                                                                {
                                                                                    comment
                                                                                        .profiles
                                                                                        .full_name[0]
                                                                                }
                                                                            </AvatarFallback>
                                                                        </Avatar>
                                                                        <div className="flex-1">
                                                                            <div className="flex items-center gap-2 mb-1">
                                                                                <span className="font-semibold">
                                                                                    {
                                                                                        comment
                                                                                            .profiles
                                                                                            .full_name
                                                                                    }
                                                                                </span>
                                                                                <span className="text-xs text-gray-500">
                                                                                    {new Date(
                                                                                        comment.created_at
                                                                                    ).toLocaleDateString()}
                                                                                </span>
                                                                            </div>
                                                                            <p className="text-gray-700">
                                                                                {
                                                                                    comment.content
                                                                                }
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )
                                                        )
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </TabsContent>
                                </div>
                            </div>
                        </Tabs>
                    </div>
                </div>
            </div>
        </div>
    );
}
