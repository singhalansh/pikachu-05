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
import { Badge } from "@/components/ui/badge";
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
    const [votingInProgress, setVotingInProgress] = useState(false);

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
        if (votingInProgress) return;

        setVotingInProgress(true);
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
        } finally {
            setVotingInProgress(false);
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
                <div className="max-w-[1600px] mx-auto px-6 py-3 flex items-center justify-between">
                    <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="text-white/80 hover:text-white hover:bg-white/10"
                    >
                        <Link href="/citizen/dashboard">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back
                        </Link>
                    </Button>
                    <div className="flex items-center gap-3">
                        <Badge
                            className={`${
                                priorityColors[
                                    issue.priority as keyof typeof priorityColors
                                ]
                            } backdrop-blur-sm`}
                        >
                            {issue.priority}
                        </Badge>
                        <Badge
                            className={`${
                                statusColors[
                                    issue.status as keyof typeof statusColors
                                ]
                            } backdrop-blur-sm`}
                        >
                            {issue.status.replace("_", " ")}
                        </Badge>
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={handleUpvote}
                            disabled={votingInProgress}
                            className={`relative px-4 py-2 rounded-full font-bold transition-all ${
                                hasUpvoted
                                    ? "bg-emerald-600 shadow-lg"
                                    : "bg-white/10 hover:bg-white/20"
                            }`}
                        >
                            <ThumbsUp
                                className={`w-4 h-4 inline mr-2 ${
                                    hasUpvoted ? "fill-current" : ""
                                }`}
                            />
                            {upvotes}
                        </motion.button>
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
                                <span className="text-[#5C9479] text-sm font-mono">
                                    #{issue.id.slice(0, 8)}
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
                                    {issue.profiles?.full_name || "Anonymous"}
                                </span>
                                <span>•</span>
                                <span className="capitalize">
                                    {issue.category.replace("-", " ")}
                                </span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Asymmetric Bento Grid */}
                <div className="grid grid-cols-12 gap-4 mb-8">
                    {/* Large Image - Takes 7 columns, reduced height */}
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

                    {/* Stats - 5 columns, vertical layout */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="col-span-12 lg:col-span-5 flex flex-col gap-4"
                    >
                        {/* Upvotes */}
                        <div className="relative bg-gradient-to-br from-[#2E6A56] to-[#5C9479] rounded-3xl p-6 overflow-hidden group hover:shadow-2xl hover:shadow-[#2E6A56]/50 transition-all">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
                            <TrendingUp className="w-8 h-8 text-white/80 mb-3" />
                            <div className="text-6xl font-black text-white mb-1">
                                {upvotes}
                            </div>
                            <div className="text-white/80 font-medium">
                                Community Votes
                            </div>
                        </div>

                        {/* Comments */}
                        <div className="relative bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl group hover:bg-white/10 transition-all">
                            <MessageCircle className="w-8 h-8 text-[#5C9479] mb-3" />
                            <div className="text-6xl font-black text-white mb-1">
                                {comments.length}
                            </div>
                            <div className="text-white/60 font-medium">
                                Comments
                            </div>
                        </div>

                        {/* Department Badge */}
                        {issue.department && (
                            <div className="relative bg-purple-500/20 border border-purple-500/30 rounded-3xl p-6 backdrop-blur-xl">
                                <Building2 className="w-8 h-8 text-purple-400 mb-3" />
                                <div className="text-sm text-purple-300 mb-1">
                                    Assigned To
                                </div>
                                <div className="text-lg font-bold text-white">
                                    {issue.department.name}
                                </div>
                            </div>
                        )}
                    </motion.div>

                    {/* Map - Wide 7 columns */}
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

                    {/* Audio Player - 5 columns */}
                    {issue.audio_url && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5 }}
                            className="col-span-12 lg:col-span-5 relative"
                        >
                            <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-3xl p-6 backdrop-blur-xl h-full flex flex-col justify-center">
                                <FileText className="w-8 h-8 text-blue-400 mb-4" />
                                <div className="text-sm text-blue-300 mb-2">
                                    Audio Recording
                                </div>
                                <audio
                                    src={issue.audio_url}
                                    controls
                                    className="w-full"
                                />
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Comments Section - Full Width */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="mb-12"
                >
                    <div className="relative">
                        <div className="absolute -left-4 top-0 w-1 h-full bg-gradient-to-b from-indigo-500 to-purple-500" />
                        <div className="pl-8">
                            <h2 className="text-3xl font-black text-white mb-8 flex items-center gap-3">
                                <MessageCircle className="w-8 h-8 text-[#5C9479]" />
                                Community Discussion
                                <span className="text-white/40 text-2xl">
                                    ({comments.length})
                                </span>
                            </h2>

                            {/* Comment Input */}
                            <div className="mb-8 relative">
                                <Textarea
                                    placeholder="Share your thoughts on this issue..."
                                    value={newComment}
                                    onChange={(e) =>
                                        setNewComment(e.target.value)
                                    }
                                    className="w-full bg-white/5 border-2 border-white/10 rounded-2xl p-6 text-white placeholder:text-white/40 min-h-[120px] resize-none focus:border-[#5C9479] focus:bg-white/10 transition-all backdrop-blur-xl"
                                />
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleSubmitComment}
                                    disabled={
                                        !newComment.trim() || submittingComment
                                    }
                                    className="absolute bottom-4 right-4 px-6 py-3 bg-emerald-600 rounded-xl font-bold text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-2xl transition-all"
                                >
                                    {submittingComment ? (
                                        <>
                                            <Clock className="w-5 h-5 inline mr-2 animate-spin" />
                                            Posting...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-5 h-5 inline mr-2" />
                                            Post
                                        </>
                                    )}
                                </motion.button>
                            </div>

                            {/* Comments Grid - Masonry Style */}
                            {comments.length === 0 ? (
                                <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-xl">
                                    <MessageCircle className="w-16 h-16 text-white/20 mx-auto mb-4" />
                                    <p className="text-white/60 text-xl font-medium">
                                        No comments yet
                                    </p>
                                    <p className="text-white/40 text-sm mt-2">
                                        Be the first to share your thoughts!
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <AnimatePresence>
                                        {comments.map((comment, index) => (
                                            <motion.div
                                                key={comment.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{
                                                    opacity: 0,
                                                    scale: 0.9,
                                                }}
                                                transition={{
                                                    delay: index * 0.05,
                                                }}
                                                className="group relative bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl hover:bg-white/10 hover:border-white/20 transition-all"
                                            >
                                                <div className="flex items-start gap-4">
                                                    <Avatar className="h-12 w-12 border-2 border-[#5C9479]/50">
                                                        <AvatarFallback className="bg-gradient-to-br from-[#2E6A56] to-[#5C9479] text-white font-bold text-lg">
                                                            {comment.profiles.full_name[0].toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <span className="font-bold text-white">
                                                                {
                                                                    comment
                                                                        .profiles
                                                                        .full_name
                                                                }
                                                            </span>
                                                            <span className="text-xs text-white/40 font-mono">
                                                                {new Date(
                                                                    comment.created_at
                                                                ).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                        <p className="text-white/80 leading-relaxed">
                                                            {comment.content}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="absolute top-0 right-0 w-20 h-20 bg-[#5C9479]/10 rounded-full -translate-y-10 translate-x-10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
