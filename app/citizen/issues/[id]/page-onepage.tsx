"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
    motion,
    useScroll,
    useTransform,
    AnimatePresence,
} from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
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
    FileText,
    Image as ImageIcon,
    Building2,
    Send,
    Clock,
    CheckCircle,
    Eye,
    TrendingUp,
    Shield,
    Sparkles,
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
    const { scrollYProgress } = useScroll();
    const headerOpacity = useTransform(scrollYProgress, [0, 0.1], [0, 1]);
    const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -50]);

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

                const commentsResponse = await fetch(
                    `/api/issues/${issueId}/comments`
                );
                if (commentsResponse.ok) {
                    const commentsData = await commentsResponse.json();
                    setComments(commentsData.comments || []);
                }

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
            <div className="min-h-screen bg-gradient-to-br from-[#2E6A56]/5 via-white to-[#5C9479]/5 flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center space-y-4"
                >
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "linear",
                        }}
                        className="w-16 h-16 border-4 border-[#2E6A56] border-t-transparent rounded-full mx-auto"
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
                        className="bg-emerald-600 hover:bg-emerald-700 shadow-lg"
                    >
                        <Link href="/citizen/issues">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Issues
                        </Link>
                    </Button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#2E6A56]/5 via-white to-[#5C9479]/5">
            {/* Floating Header - Appears on scroll */}
            <motion.div
                style={{ opacity: headerOpacity }}
                className="fixed top-0 left-0 right-0 z-50 border-b bg-white/95 backdrop-blur-xl shadow-lg"
            >
                <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                    <Button
                        variant="ghost"
                        asChild
                        className="hover:bg-[#2E6A56]/10 hover:text-[#2E6A56]"
                    >
                        <Link href="/citizen/issues">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back
                        </Link>
                    </Button>
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-gray-800 hidden sm:inline truncate max-w-[200px] lg:max-w-md">
                            {issue.title}
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
                </div>
            </motion.div>

            {/* Hero Section with Parallax */}
            <motion.div
                style={{ y: heroY }}
                className="relative overflow-hidden"
            >
                <div className="absolute inset-0 bg-gradient-to-br from-[#2E6A56] via-[#5C9479] to-[#2E6A56] opacity-90" />
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />

                <div className="relative container mx-auto px-4 py-16 md:py-24">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <Button
                            variant="ghost"
                            asChild
                            className="mb-8 text-white/90 hover:text-white hover:bg-white/10"
                        >
                            <Link href="/citizen/issues">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Issues
                            </Link>
                        </Button>

                        <div className="flex items-start gap-3 mb-6 flex-wrap">
                            <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30 px-3 py-1.5 text-sm">
                                #{issue.id.slice(0, 8)}
                            </Badge>
                            <Badge
                                className={`${
                                    priorityColors[
                                        issue.priority as keyof typeof priorityColors
                                    ]
                                } backdrop-blur-sm px-3 py-1.5`}
                            >
                                {issue.priority} Priority
                            </Badge>
                            <Badge
                                className={`${
                                    statusColors[
                                        issue.status as keyof typeof statusColors
                                    ]
                                } backdrop-blur-sm px-3 py-1.5`}
                            >
                                {issue.status.replace("_", " ")}
                            </Badge>
                        </div>

                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                            {issue.title}
                        </h1>

                        <div className="flex items-center gap-6 text-white/80 flex-wrap text-sm md:text-base">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span>
                                    {new Date(
                                        issue.created_at
                                    ).toLocaleDateString()}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <User className="w-4 h-4" />
                                <span>
                                    {issue.profiles?.full_name || "Anonymous"}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                <span className="capitalize">
                                    {issue.category.replace("-", " ")}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 mt-8">
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Button
                                    size="lg"
                                    variant={hasUpvoted ? "default" : "outline"}
                                    onClick={handleUpvote}
                                    className={
                                        hasUpvoted
                                            ? "bg-white text-[#2E6A56] hover:bg-white/90 shadow-xl"
                                            : "bg-white/10 backdrop-blur-sm text-white border-white/30 hover:bg-white/20"
                                    }
                                >
                                    <ThumbsUp
                                        className={`w-5 h-5 mr-2 ${
                                            hasUpvoted ? "fill-current" : ""
                                        }`}
                                    />
                                    {upvotes} Upvotes
                                </Button>
                            </motion.div>
                            <div className="flex items-center gap-2 text-white/80">
                                <MessageCircle className="w-5 h-5" />
                                <span className="font-medium">
                                    {comments.length} Comments
                                </span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </motion.div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-12">
                <div className="grid gap-8 lg:grid-cols-3">
                    {/* Main Column */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Description Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                        >
                            <Card className="border-2 shadow-xl hover:shadow-2xl transition-shadow duration-300 overflow-hidden">
                                <div className="h-1 bg-emerald-600" />
                                <CardHeader className="bg-gradient-to-br from-[#2E6A56]/5 to-[#5C9479]/5">
                                    <CardTitle className="flex items-center gap-3 text-2xl">
                                        <div className="p-2 bg-[#2E6A56] rounded-lg">
                                            <FileText className="w-5 h-5 text-white" />
                                        </div>
                                        Description
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <p className="text-gray-700 leading-relaxed text-lg whitespace-pre-line">
                                        {issue.description}
                                    </p>
                                    {issue.audio_url && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="mt-6 p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-100"
                                        >
                                            <h4 className="font-semibold mb-3 text-[#2E6A56] flex items-center gap-2">
                                                <Sparkles className="w-4 h-4" />
                                                Audio Recording
                                            </h4>
                                            <audio
                                                src={issue.audio_url}
                                                controls
                                                className="w-full"
                                            />
                                        </motion.div>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Photo Evidence */}
                        {issue.image_url && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                            >
                                <Card className="border-2 shadow-xl hover:shadow-2xl transition-shadow duration-300 overflow-hidden">
                                    <div className="h-1 bg-gradient-to-r from-purple-500 to-pink-500" />
                                    <CardHeader className="bg-gradient-to-br from-purple-50 to-pink-50">
                                        <CardTitle className="flex items-center gap-3 text-2xl">
                                            <div className="p-2 bg-purple-600 rounded-lg">
                                                <ImageIcon className="w-5 h-5 text-white" />
                                            </div>
                                            Photo Evidence
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-6">
                                        <motion.div
                                            whileHover={{ scale: 1.02 }}
                                            className="relative group cursor-pointer"
                                            onClick={() =>
                                                window.open(
                                                    issue.image_url,
                                                    "_blank"
                                                )
                                            }
                                        >
                                            <img
                                                src={issue.image_url}
                                                alt="Issue photo"
                                                className="rounded-xl w-full h-auto shadow-lg border-2 border-gray-200"
                                            />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-xl transition-all duration-300 flex items-center justify-center">
                                                <ExternalLink className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
                                            </div>
                                        </motion.div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )}

                        {/* Location Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            <Card className="border-2 shadow-xl hover:shadow-2xl transition-shadow duration-300 overflow-hidden">
                                <div className="h-1 bg-gradient-to-r from-green-500 to-emerald-500" />
                                <CardHeader className="bg-gradient-to-br from-green-50 to-emerald-50">
                                    <CardTitle className="flex items-center gap-3 text-2xl">
                                        <div className="p-2 bg-green-600 rounded-lg">
                                            <MapPin className="w-5 h-5 text-white" />
                                        </div>
                                        Location
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 space-y-4">
                                    <div className="p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200">
                                        <p className="text-gray-700 font-medium mb-2">
                                            {issue.location_address}
                                        </p>
                                        {issue.landmark && (
                                            <p className="text-sm text-gray-600 flex items-center gap-2">
                                                <MapPin className="w-4 h-4 text-[#5C9479]" />
                                                <span className="font-medium">
                                                    Landmark:
                                                </span>{" "}
                                                {issue.landmark}
                                            </p>
                                        )}
                                    </div>

                                    <div className="h-96 rounded-xl overflow-hidden border-2 border-[#2E6A56]/30 shadow-lg">
                                        <InteractiveGoogleMap
                                            lat={issue.location_lat}
                                            lng={issue.location_lng}
                                            address={issue.location_address}
                                            height={384}
                                            zoom={16}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <Button
                                            variant="outline"
                                            asChild
                                            className="hover:bg-[#2E6A56] hover:text-white transition-all"
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
                                            asChild
                                            className="hover:bg-[#5C9479] hover:text-white transition-all"
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
                        </motion.div>

                        {/* Comments Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                        >
                            <Card className="border-2 shadow-xl hover:shadow-2xl transition-shadow duration-300 overflow-hidden">
                                <div className="h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />
                                <CardHeader className="bg-gradient-to-br from-indigo-50 to-purple-50">
                                    <CardTitle className="flex items-center gap-3 text-2xl">
                                        <div className="p-2 bg-indigo-600 rounded-lg">
                                            <MessageCircle className="w-5 h-5 text-white" />
                                        </div>
                                        Comments ({comments.length})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 space-y-6">
                                    {/* Add Comment */}
                                    <div className="space-y-3 p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border-2 border-gray-100">
                                        <Textarea
                                            placeholder="Share your thoughts or updates..."
                                            value={newComment}
                                            onChange={(e) =>
                                                setNewComment(e.target.value)
                                            }
                                            className="min-h-[120px] border-2 focus:border-[#2E6A56]"
                                        />
                                        <Button
                                            onClick={handleSubmitComment}
                                            disabled={
                                                !newComment.trim() ||
                                                submittingComment
                                            }
                                            size="lg"
                                            className="w-full bg-emerald-600 hover:bg-emerald-700 shadow-lg"
                                        >
                                            <Send className="w-4 h-4 mr-2" />
                                            {submittingComment
                                                ? "Posting..."
                                                : "Post Comment"}
                                        </Button>
                                    </div>

                                    {/* Comments List */}
                                    <Separator />
                                    <div className="space-y-4">
                                        {comments.length === 0 ? (
                                            <div className="text-center py-12">
                                                <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                                <p className="text-gray-500 text-lg">
                                                    No comments yet. Be the
                                                    first to comment!
                                                </p>
                                            </div>
                                        ) : (
                                            <AnimatePresence>
                                                {comments.map(
                                                    (comment, index) => (
                                                        <motion.div
                                                            key={comment.id}
                                                            initial={{
                                                                opacity: 0,
                                                                x: -20,
                                                            }}
                                                            animate={{
                                                                opacity: 1,
                                                                x: 0,
                                                            }}
                                                            transition={{
                                                                delay:
                                                                    index * 0.1,
                                                            }}
                                                            className="border-2 border-white/10 rounded-xl p-4 bg-white/5 hover:shadow-md transition-shadow backdrop-blur-xl"
                                                        >
                                                            <div className="flex items-start gap-4">
                                                                <Avatar className="h-12 w-12 border-2 border-[#2E6A56]/20">
                                                                    <AvatarFallback className="bg-gradient-to-br from-[#2E6A56] to-[#5C9479] text-white font-bold">
                                                                        {
                                                                            comment
                                                                                .profiles
                                                                                .full_name[0]
                                                                        }
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                                <div className="flex-1">
                                                                    <div className="flex items-center gap-2 mb-2">
                                                                        <span className="font-semibold text-gray-900">
                                                                            {
                                                                                comment
                                                                                    .profiles
                                                                                    .full_name
                                                                            }
                                                                        </span>
                                                                        <span className="text-xs text-gray-500 flex items-center gap-1">
                                                                            <Clock className="w-3 h-3" />
                                                                            {new Date(
                                                                                comment.created_at
                                                                            ).toLocaleDateString()}
                                                                        </span>
                                                                    </div>
                                                                    <p className="text-gray-700 leading-relaxed">
                                                                        {
                                                                            comment.content
                                                                        }
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    )
                                                )}
                                            </AnimatePresence>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Quick Stats */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                            className="sticky top-24"
                        >
                            <Card className="border-2 shadow-xl overflow-hidden">
                                <div className="h-1 bg-emerald-600" />
                                <CardHeader className="bg-gradient-to-br from-[#2E6A56]/5 to-[#5C9479]/5">
                                    <CardTitle className="text-xl">
                                        Issue Details
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-5 space-y-4">
                                    <div className="flex items-center justify-between p-3 bg-gradient-to-br from-gray-50 to-white rounded-lg border">
                                        <span className="text-sm text-gray-600 flex items-center gap-2">
                                            <FileText className="w-4 h-4" />
                                            Category
                                        </span>
                                        <span className="font-semibold text-gray-900 capitalize">
                                            {issue.category.replace("-", " ")}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between p-3 bg-gradient-to-br from-gray-50 to-white rounded-lg border">
                                        <span className="text-sm text-gray-600 flex items-center gap-2">
                                            <Shield className="w-4 h-4" />
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

                                    <div className="flex items-center justify-between p-3 bg-gradient-to-br from-gray-50 to-white rounded-lg border">
                                        <span className="text-sm text-gray-600 flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4" />
                                            Status
                                        </span>
                                        <Badge
                                            className={
                                                statusColors[
                                                    issue.status as keyof typeof statusColors
                                                ]
                                            }
                                        >
                                            {issue.status.replace("_", " ")}
                                        </Badge>
                                    </div>

                                    <div className="flex items-center justify-between p-3 bg-gradient-to-br from-gray-50 to-white rounded-lg border">
                                        <span className="text-sm text-gray-600 flex items-center gap-2">
                                            <TrendingUp className="w-4 h-4" />
                                            Upvotes
                                        </span>
                                        <span className="font-bold text-[#2E6A56]">
                                            {upvotes}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between p-3 bg-gradient-to-br from-gray-50 to-white rounded-lg border">
                                        <span className="text-sm text-gray-600 flex items-center gap-2">
                                            <MessageCircle className="w-4 h-4" />
                                            Comments
                                        </span>
                                        <span className="font-bold text-[#5C9479]">
                                            {comments.length}
                                        </span>
                                    </div>

                                    <Separator />

                                    {issue.department && (
                                        <div className="p-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg border-2 border-purple-100">
                                            <h4 className="font-semibold mb-2 text-purple-900 flex items-center gap-2">
                                                <Building2 className="w-4 h-4" />
                                                Assigned Department
                                            </h4>
                                            <p className="text-sm text-purple-800 font-medium">
                                                {issue.department.name}
                                            </p>
                                            {issue.department.email && (
                                                <p className="text-xs text-purple-600 mt-1">
                                                    {issue.department.email}
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {issue.assigned_profile && (
                                        <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border-2 border-blue-100">
                                            <h4 className="font-semibold mb-2 text-blue-900 flex items-center gap-2">
                                                <User className="w-4 h-4" />
                                                Assigned To
                                            </h4>
                                            <p className="text-sm text-blue-800 font-medium">
                                                {
                                                    issue.assigned_profile
                                                        .full_name
                                                }
                                            </p>
                                            <p className="text-xs text-blue-600 mt-1">
                                                {issue.assigned_profile.email}
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}
