"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Calendar, MapPin, Clock, Eye, AlertTriangle, CheckCircle, Plus } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

type Issue = {
  id: string
  title: string
  description: string
  category: string
  status: string
  location_address: string | null
  image_url: string | null
  created_at: string
  updated_at: string
  user_id: string
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

const getProgressPercentage = (status: string) => {
  switch (status) {
    case "submitted":
      return 25
    case "in-review":
      return 50
    case "in-progress":
      return 75
    case "resolved":
      return 100
    default:
      return 0
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
    default:
      return "Other"
  }
}

export default function MyIssuesPage() {
  const [selectedIssue, setSelectedIssue] = useState<string | null>(null)
  const [issues, setIssues] = useState<Issue[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    const fetchMine = async () => {
      if (!user?.id) return
      try {
        setLoading(true)
        setError(null)
        const res = await fetch(`/api/issues?page=1&limit=100`, { credentials: 'include' })
        const json = await res.json()
        if (!res.ok) throw new Error(json.error || 'Failed to fetch issues')
        const mine = (json.issues || []).filter((i: Issue) => i.user_id === user.id)
        setIssues(mine)
      } catch (e: any) {
        setError(e.message || 'Failed to load your issues')
      } finally {
        setLoading(false)
      }
    }
    fetchMine()
  }, [user?.id])

  const activeIssues = useMemo(() => issues.filter(i => (i.status === 'resolved') === false), [issues])
  const resolvedIssues = useMemo(() => issues.filter(i => i.status === 'resolved'), [issues])

  const selectedIssueData = issues.find((issue) => issue.id === selectedIssue) || null

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/citizen/dashboard">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold">My Issues</h1>
                <p className="text-muted-foreground">Track the progress of your reported issues</p>
              </div>
            </div>
            <Button asChild>
              <Link href="/citizen/report">
                <Plus className="w-4 h-4 mr-2" />
                Report New Issue
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Issues List */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="active" className="space-y-4">
              <TabsList>
                <TabsTrigger value="active">Active Issues ({activeIssues.length})</TabsTrigger>
                <TabsTrigger value="resolved">Resolved ({resolvedIssues.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="active" className="space-y-4">
                {loading && (
                  <Card><CardContent className="p-6 text-sm text-muted-foreground">Loading your issues...</CardContent></Card>
                )}
                {error && (
                  <Card><CardContent className="p-6 text-sm text-red-600">{error}</CardContent></Card>
                )}
                {!loading && !error && activeIssues.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Active Issues</h3>
                      <p className="text-muted-foreground mb-4">You don't have any active issues at the moment.</p>
                      <Button asChild>
                        <Link href="/citizen/report">Report Your First Issue</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  activeIssues.map((issue) => (
                    <Card
                      key={issue.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedIssue === issue.id ? "ring-2 ring-accent" : ""
                      }`}
                      onClick={() => setSelectedIssue(issue.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          <div className="w-20 h-20 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                            <img
                              src={issue.image_url || "/placeholder.svg"}
                              alt={issue.title}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold truncate">{issue.title}</h3>
                                <p className="text-sm text-muted-foreground">ID: {issue.id}</p>
                              </div>
                              <Badge className={getStatusColor(issue.status.replace('_','-'))}>
                                {getStatusIcon(issue.status)}
                                <span className="ml-1 capitalize">{issue.status.replace(/[_-]/g, " ")}</span>
                              </Badge>
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center text-sm text-muted-foreground">
                                <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                                <span className="truncate">{issue.location_address || 'N/A'}</span>
                              </div>

                              <div className="flex items-center justify-between text-sm text-muted-foreground">
                                <div className="flex items-center">
                                  <Calendar className="w-4 h-4 mr-1" />
                                  {new Date(issue.created_at).toLocaleDateString()}
                                </div>
                                <Badge variant="outline">{getCategoryLabel(issue.category)}</Badge>
                              </div>

                              <div className="space-y-1">
                                <div className="flex justify-between text-sm">
                                  <span>Progress</span>
                                  <span>{getProgressPercentage(issue.status.replace('_','-'))}%</span>
                                </div>
                                <Progress value={getProgressPercentage(issue.status.replace('_','-'))} className="h-2" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="resolved" className="space-y-4">
                {resolvedIssues.map((issue) => (
                  <Card
                    key={issue.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedIssue === issue.id ? "ring-2 ring-accent" : ""
                    }`}
                    onClick={() => setSelectedIssue(issue.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <div className="w-20 h-20 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={issue.image_url || "/placeholder.svg"}
                            alt={issue.title}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-semibold">{issue.title}</h3>
                              <p className="text-sm text-muted-foreground">ID: {issue.id}</p>
                            </div>
                            <Badge className={getStatusColor(issue.status)}>
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Resolved
                            </Badge>
                          </div>

                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 mr-1" />
                              {issue.location_address || 'N/A'}
                            </div>
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              Resolved {new Date(issue.updated_at || issue.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
            </Tabs>
          </div>

          {/* Issue Details */}
          <div className="lg:col-span-1">
            {selectedIssueData ? (
              <Card className="sticky top-6">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Issue Details</span>
                    <Badge className={getStatusColor(selectedIssueData.status.replace('_','-'))}>
                      {getStatusIcon(selectedIssueData.status)}
                      <span className="ml-1 capitalize">{selectedIssueData.status.replace(/[_-]/g, " ")}</span>
                    </Badge>
                  </CardTitle>
                  <CardDescription>{selectedIssueData.id}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">{selectedIssueData.title}</h4>
                    <p className="text-sm text-muted-foreground">{selectedIssueData.description}</p>
                  </div>

                  <div className="w-full h-48 bg-muted rounded-lg overflow-hidden">
                    <img
                      src={selectedIssueData.image_url || "/placeholder.svg"}
                      alt={selectedIssueData.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Location:</span>
                      <span>{selectedIssueData.location_address || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Category:</span>
                      <span>{getCategoryLabel(selectedIssueData.category)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Reported:</span>
                      <span>{new Date(selectedIssueData.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Last Updated:</span>
                      <span>{new Date(selectedIssueData.updated_at || selectedIssueData.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Eye className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Select an Issue</h3>
                  <p className="text-muted-foreground">Click on any issue to view detailed information and timeline.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
