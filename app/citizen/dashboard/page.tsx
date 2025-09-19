
"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  MapPin,
  Plus,
  Search,
  Map,
  List,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  ThumbsUp,
  MessageCircle,
} from "lucide-react"
import InteractiveMap from "@/components/interactive-map"

type Issue = {
  id: string
  title: string
  description: string
  category: string
  status: string
  location_address: string | null
  location_lat: number | null
  location_lng: number | null
  image_url: string | null
  created_at: string
  upvotes?: number | null
}

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

const getCategoryLabel = (category: string) => {
  switch (category) {
    case "pothole":
      return "Pothole"
    case "streetlight":
      return "Streetlight"
    case "garbage":
      return "Garbage"
    case "water-leakage":
      return "Water Leakage"
    default:
      return "Other"
  }
}

export default function CitizenDashboard() {
  const [viewMode, setViewMode] = useState<"list" | "map">("list")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [issues, setIssues] = useState<Issue[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        setLoading(true)
        setError(null)
        const params = new URLSearchParams({ page: "1", limit: "50" })
        const res = await fetch(`/api/issues?${params.toString()}`, { credentials: 'include' })
        const json = await res.json()
        if (!res.ok) throw new Error(json.error || 'Failed to fetch issues')
        setIssues(json.issues || [])
      } catch (e: any) {
        setError(e.message || 'Failed to fetch issues')
      } finally {
        setLoading(false)
      }
    }
    fetchIssues()
  }, [])

  const filteredIssues = useMemo(() => {
    return issues.filter((issue) => {
      const loc = (issue.location_address || '').toLowerCase()
      const matchesSearch =
        issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loc.includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === "all" || issue.status === statusFilter
      const matchesCategory = categoryFilter === "all" || issue.category === categoryFilter
      return matchesSearch && matchesStatus && matchesCategory
    })
  }, [issues, searchTerm, statusFilter, categoryFilter])

  const stats = useMemo(() => {
    const total = issues.length
    const inProgress = issues.filter(i => i.status === 'in_progress' || i.status === 'in-progress').length
    const resolved = issues.filter(i => i.status === 'resolved').length
    const createdThisMonth = issues.filter(i => {
      const d = new Date(i.created_at)
      const now = new Date()
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    }).length
    return { total, inProgress, resolved, createdThisMonth }
  }, [issues])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <MapPin className="w-6 h-6 sm:w-8 sm:h-8 text-accent flex-shrink-0" />
              <div>
                <h1 className="text-xl sm:text-2xl font-bold">Civic Issues Dashboard</h1>
                <p className="text-sm sm:text-base text-muted-foreground">Track and report community issues</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
              <Button asChild className="w-full sm:w-auto">
                <Link href="/citizen/report">
                  <Plus className="w-4 h-4 mr-2" />
                  Report Issue
                </Link>
              </Button>
              <Button variant="outline" asChild className="w-full sm:w-auto bg-transparent">
                <Link href="/citizen/my-issues">My Issues</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4 sm:py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Total Issues</p>
                  <p className="text-lg sm:text-2xl font-bold">{stats.total}</p>
                </div>
                <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">In Progress</p>
                  <p className="text-lg sm:text-2xl font-bold status-progress">{stats.inProgress}</p>
                </div>
                <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-status-progress" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Resolved</p>
                  <p className="text-lg sm:text-2xl font-bold status-resolved">{stats.resolved}</p>
                </div>
                <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-status-resolved" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">This Month</p>
                  <p className="text-lg sm:text-2xl font-bold">{stats.createdThisMonth}</p>
                </div>
                <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-4 sm:mb-6">
          <CardContent className="p-3 sm:p-4">
            <div className="space-y-3 sm:space-y-4">
              {/* Search - Full width on mobile */}
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search issues or locations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-11 sm:h-10"
                />
              </div>

              {/* Filters - Stacked on mobile, row on desktop */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-11 sm:h-10 sm:w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="submitted">Submitted</SelectItem>
                    <SelectItem value="in-review">In Review</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="h-11 sm:h-10 sm:w-40">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="pothole">Pothole</SelectItem>
                    <SelectItem value="streetlight">Streetlight</SelectItem>
                    <SelectItem value="garbage">Garbage</SelectItem>
                    <SelectItem value="water-leakage">Water Leakage</SelectItem>
                  </SelectContent>
                </Select>

                {/* View toggle - Right aligned on desktop, full width on mobile */}
                <div className="flex sm:ml-auto">
                  <div className="flex items-center space-x-1 bg-muted p-1 rounded-lg">
                    <Button
                      variant={viewMode === "list" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("list")}
                      className="h-9 px-3"
                    >
                      <List className="w-4 h-4 mr-1 sm:mr-0" />
                      <span className="sm:hidden">List</span>
                    </Button>
                    <Button
                      variant={viewMode === "map" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("map")}
                      className="h-9 px-3"
                    >
                      <Map className="w-4 h-4 mr-1 sm:mr-0" />
                      <span className="sm:hidden">Map</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content */}
        {viewMode === "list" ? (
          <div className="grid gap-3 sm:gap-4">
            {loading && (
              <div className="text-sm text-muted-foreground">Loading issues...</div>
            )}
            {error && (
              <div className="text-sm text-red-600">{error}</div>
            )}
            {!loading && !error && filteredIssues.map((issue) => (
              <Card key={issue.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col gap-4">
                    <div className="flex gap-3 sm:gap-4">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={issue.image_url || "/placeholder.svg"}
                          alt={issue.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <Link
                            href={`/citizen/issues/${issue.id}`}
                            className="hover:underline min-h-[44px] flex items-start"
                          >
                            <h3 className="font-semibold text-sm sm:text-base line-clamp-2 text-balance leading-tight">
                              {issue.title}
                            </h3>
                          </Link>
                          <Badge className={`${getStatusColor(issue.status)} flex-shrink-0 text-xs h-6`}>
                            {getStatusIcon(issue.status)}
                            <span className="ml-1 hidden sm:inline capitalize">{issue.status.replace("-", " ")}</span>
                          </Badge>
                        </div>

                        <p className="text-xs sm:text-sm text-muted-foreground mb-3 line-clamp-2 leading-relaxed">
                          {issue.description}
                        </p>

                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <div className="flex items-center">
                              <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                              <span className="truncate max-w-[140px] sm:max-w-none">{issue.location_address || 'N/A'}</span>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {getCategoryLabel(issue.category)}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t">
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          <span className="hidden sm:inline">{new Date(issue.created_at).toLocaleDateString()}</span>
                          <span className="sm:hidden">
                            {new Date(issue.created_at).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <ThumbsUp className="w-3 h-3 mr-1" />
                          {(issue as any).votes_count ?? issue.upvotes ?? 0}
                        </div>
                        <div className="flex items-center">
                          <MessageCircle className="w-3 h-3 mr-1" />
                          {(issue as any).comments_count ?? 0}
                        </div>
                      </div>

                      <Button variant="ghost" size="sm" asChild className="h-9 px-3">
                        <Link href={`/citizen/issues/${issue.id}`}>
                          <span className="hidden sm:inline">View Details</span>
                          <span className="sm:hidden">View</span>
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="h-[60vh] sm:h-[70vh]">
            <InteractiveMap />
          </div>
        )}
      </div>
    </div>
  )
}
