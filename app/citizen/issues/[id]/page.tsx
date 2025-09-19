"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  MapPin,
  Calendar,
  User,
  ThumbsUp,
  MessageCircle,
  Share2,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  Send,
  Heart,
  Flag,
} from "lucide-react"
import MapPicker from "@/components/map-picker"

const getStatusColor = (status: string) => {
  switch (status) {
    case "submitted":
      return "bg-status-submitted text-white"
    case "in-review":
      return "bg-status-review text-white"
    case "in-progress":
      return "bg-status-progress text-white"
    case "resolved":
      return "bg-status-resolved text-white"
    default:
      return "bg-muted text-muted-foreground"
  }
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "low":
      return "bg-green-100 text-green-800 border-green-200"
    case "medium":
      return "bg-yellow-100 text-yellow-800 border-yellow-200"
    case "high":
      return "bg-red-100 text-red-800 border-red-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case "submitted":
      return <Clock className="w-4 h-4" />
    case "in-review":
      return <Eye className="w-4 h-4" />
    case "in-progress":
      return <AlertTriangle className="w-4 h-4" />
    case "resolved":
      return <CheckCircle className="w-4 h-4" />
    default:
      return <Clock className="w-4 h-4" />
  }
}

export default function IssueDetailPage() {
  const params = useParams()
  const [issue, setIssue] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasUpvoted, setHasUpvoted] = useState(false)
  const [upvotes, setUpvotes] = useState(0)
  const [isFollowing, setIsFollowing] = useState(false)
  const [followers, setFollowers] = useState(0)
  const [newComment, setNewComment] = useState("")
  const [comments, setComments] = useState<any[]>([])
  const [timeline, setTimeline] = useState<any[]>([])

  useEffect(() => {
    const id = Array.isArray(params?.id) ? params?.id[0] : (params as any)?.id
    if (!id) return
    const fetchIssue = async () => {
      try {
        setLoading(true)
        setError(null)
        const [issueRes, voteRes, commentsRes] = await Promise.all([
          fetch(`/api/issues?id=${id}`, { credentials: 'include' }),
          fetch(`/api/issues/${id}/vote`, { credentials: 'include' }),
          fetch(`/api/issues/${id}/comments`, { credentials: 'include' })
        ])
        const issueJson = await issueRes.json()
        const voteJson = await voteRes.json()
        const commentsJson = await commentsRes.json()
        if (!issueRes.ok) throw new Error(issueJson.error || 'Failed to load issue')
        setIssue(issueJson.issue)
        setTimeline((issueJson.meta && issueJson.meta.timeline) || [])
        setUpvotes((voteJson && typeof voteJson.votesCount === 'number') ? voteJson.votesCount : (issueJson.issue.upvotes || 0))
        setHasUpvoted(!!(voteJson && voteJson.hasVoted))
        setComments(commentsJson.comments || [])
      } catch (e: any) {
        setError(e.message || 'Failed to load issue')
      } finally {
        setLoading(false)
      }
    }
    fetchIssue()
  }, [params])

  const handleUpvote = async () => {
    if (!issue?.id) return
    try {
      if (hasUpvoted) {
        const res = await fetch(`/api/issues/${issue.id}/vote`, { method: 'DELETE', credentials: 'include' })
        if (!res.ok) throw new Error('Failed to remove vote')
        setHasUpvoted(false)
        setUpvotes((prev) => Math.max(0, prev - 1))
      } else {
        const res = await fetch(`/api/issues/${issue.id}/vote`, { method: 'POST', credentials: 'include' })
        if (!res.ok) throw new Error('Failed to add vote')
        setHasUpvoted(true)
        setUpvotes((prev) => prev + 1)
      }
    } catch (e) {
      // Optionally show a toast
      console.error(e)
    }
  }

  const handleFollow = () => {
    if (isFollowing) {
      setFollowers((prev) => prev - 1)
      setIsFollowing(false)
    } else {
      setFollowers((prev) => prev + 1)
      setIsFollowing(true)
    }
  }

  const handleSubmitComment = async () => {
    if (!issue?.id) return
    const content = newComment.trim()
    if (!content) return
    try {
      const res = await fetch(`/api/issues/${issue.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ content })
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to add comment')
      setComments(prev => [...prev, json.comment])
      setNewComment('')
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile-first header */}
      <div className="sticky top-0 z-10 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/citizen/dashboard">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Link>
            </Button>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm">
                <Share2 className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Flag className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Issue Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-balance">{issue?.title || (loading ? 'Loading…' : 'Issue')}</h1>
              <div className="flex flex-wrap gap-2 mb-3">
                {issue && (
                  <Badge className={getStatusColor(String(issue.status).replace('_','-'))}>
                    {getStatusIcon(issue.status)}
                    <span className="ml-1 capitalize">{String(issue.status).replace(/[_-]/g, ' ')}</span>
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons - mobile optimized */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <Button variant={hasUpvoted ? "default" : "outline"} onClick={handleUpvote} className="flex-1 sm:flex-none">
              <ThumbsUp className={`w-4 h-4 mr-2 ${hasUpvoted ? "fill-current" : ""}`} />
              {hasUpvoted ? "Upvoted" : "Upvote"} ({upvotes})
            </Button>
            <Button
              variant={isFollowing ? "default" : "outline"}
              onClick={handleFollow}
              className="flex-1 sm:flex-none"
            >
              <Heart className={`w-4 h-4 mr-2 ${isFollowing ? "fill-current" : ""}`} />
              {isFollowing ? "Following" : "Follow"} ({followers})
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Issue Image */}
            <Card>
              <CardContent className="p-0">
                <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                  <img
                    src={issue?.image_url || "/placeholder.svg"}
                    alt={issue?.title || 'Issue image'}
                    className="w-full h-full object-cover"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  Issue Description
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{issue?.description || 'No description'}</p>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Progress Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                {timeline.length === 0 ? (
                  <div className="text-sm text-muted-foreground">No updates yet.</div>
                ) : (
                  <div className="space-y-4">
                    {timeline.map((ev: any, idx: number) => (
                      <div key={ev.id || idx} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getStatusColor(ev.status || 'submitted')}`}>
                            {getStatusIcon(ev.status || 'submitted')}
                          </div>
                          {idx < timeline.length - 1 && <div className="w-px h-8 bg-border mt-2" />}
                        </div>
                        <div className="flex-1 pb-4">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                            <h4 className="font-medium capitalize">{String(ev.status || '').replace(/[_-]/g,' ') || 'update'}</h4>
                            <span className="text-sm text-muted-foreground">{ev.created_at ? new Date(ev.created_at).toLocaleString() : ''}</span>
                          </div>
                          {ev.comment && (<p className="text-sm text-muted-foreground mt-1">{ev.comment}</p>)}
                          <p className="text-xs text-muted-foreground mt-1">by {ev.profiles?.full_name || 'User'}{ev.profiles?.email ? ` • ${ev.profiles.email}` : ''}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Comments Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Comments ({comments.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Add Comment */}
                <div className="space-y-3">
                  <Textarea
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="min-h-[80px]"
                  />
                  <Button onClick={handleSubmitComment} disabled={!newComment.trim()}>
                    <Send className="w-4 h-4 mr-2" />
                    Post Comment
                  </Button>
                </div>

                <Separator />

                {/* Comments List */}
                <div className="space-y-4">
                  {comments.length === 0 ? (
                    <div className="text-sm text-muted-foreground">No comments yet.</div>
                  ) : (
                    comments.map((c: any) => (
                      <div key={c.id} className="flex gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={"/placeholder.svg"} />
                          <AvatarFallback>{(c.profiles?.full_name || 'U')[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-2">
                          <div className="bg-muted rounded-lg p-3">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-sm">{c.profiles?.full_name || 'User'}</span>
                              <Badge variant={c.is_admin ? 'default' : 'secondary'} className="text-xs">
                                {c.is_admin ? 'admin' : 'citizen'}
                              </Badge>
                            </div>
                            <p className="text-sm">{c.content}</p>
                          </div>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{new Date(c.created_at).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Issue Details */}
            <Card>
              <CardHeader>
                <CardTitle>Issue Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center text-sm">
                  <MapPin className="w-4 h-4 mr-2 text-muted-foreground" />
                  <span>{issue?.location_address || 'N/A'}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                  <span>Reported {issue ? new Date(issue.created_at).toLocaleDateString() : '-'}</span>
                </div>
                {issue?.assigned_profile && (
                  <div className="flex items-center text-sm">
                    <User className="w-4 h-4 mr-2 text-muted-foreground" />
                    <span>POC: {issue.assigned_profile.full_name}{issue.assigned_profile.email ? ` • ${issue.assigned_profile.email}` : ''}</span>
                  </div>
                )}
                {issue?.landmark && (
                  <div className="flex items-center text-sm">
                    <User className="w-4 h-4 mr-2 text-muted-foreground" />
                    <span>Landmark: {issue.landmark}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Reporter Info */}
            <Card>
              <CardHeader>
                <CardTitle>Reported By</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={"/placeholder.svg"} />
                    <AvatarFallback>{(issue?.profiles?.full_name || 'U')[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{issue?.profiles?.full_name || 'User'}</p>
                    <p className="text-sm text-muted-foreground">{issue?.profiles?.email || ''}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Map */}
            <Card>
              <CardHeader>
                <CardTitle>Location</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="p-3">
                  <MapPicker
                    value={{
                      address: issue?.location_address || '',
                      lat: issue?.location_lat ?? null,
                      lng: issue?.location_lng ?? null,
                    }}
                    onChange={() => { /* read-only map on detail page */ }}
                    height={320}
                    showSearch={false}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
