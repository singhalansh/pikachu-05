"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
} from "lucide-react"
import SimpleAdminActions from "@/components/simple-admin-actions"
import AIUrgencyBadge from "@/components/ai-urgency-badge"

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
  upvotes: number; // Added for upvote-based ranking
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
      return "bg-blue-500 text-white"
    case "assigned":
      return "bg-yellow-500 text-white"
    case "in_progress":
      return "bg-orange-500 text-white"
    case "resolved":
      return "bg-green-500 text-white"
    case "closed":
      return "bg-gray-500 text-white"
    default:
      return "bg-muted text-muted-foreground"
  }
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "high":
      return "bg-destructive text-destructive-foreground"
    case "medium":
      return "bg-yellow-100 text-yellow-800"
    case "low":
      return "bg-green-100 text-green-800"
    default:
      return "bg-muted text-muted-foreground"
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case "submitted":
      return <Clock className="w-4 h-4" />
    case "assigned":
      return <User className="w-4 h-4" />
    case "in_progress":
      return <AlertTriangle className="w-4 h-4" />
    case "resolved":
      return <CheckCircle className="w-4 h-4" />
    case "closed":
      return <CheckCircle className="w-4 h-4" />
    default:
      return <Clock className="w-4 h-4" />
  }
}

const getCategoryLabel = (category: string) => {
  switch (category) {
    case "roads":
      return "Roads"
    case "potholes":
      return "Potholes"
    case "streetlights":
      return "Streetlights"
    case "garbage":
      return "Garbage"
    case "water":
      return "Water"
    case "drainage":
      return "Drainage"
    case "parks":
      return "Parks"
    case "traffic":
      return "Traffic"
    default:
      return "Other"
  }
}

export default function AdminIssuesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [selectedIssues, setSelectedIssues] = useState<string[]>([])
  const [allIssues, setAllIssues] = useState<Issue[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [processingIssue, setProcessingIssue] = useState<string | null>(null)
  const [expandedUserIds, setExpandedUserIds] = useState<Set<string>>(new Set())

  // Fetch issues from API
  useEffect(() => {
    const fetchIssues = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/issues?limit=100')
        if (response.ok) {
          const data = await response.json()
          setAllIssues(data.issues || [])
        } else {
          setError('Failed to fetch issues')
        }
      } catch (error) {
        console.error('Error fetching issues:', error)
        setError('Error loading issues')
      } finally {
        setLoading(false)
      }
    }

    fetchIssues()
  }, [])

  const filteredIssues = allIssues
    .filter((issue) => {
      const matchesSearch =
        issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.location_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (issue.profiles?.full_name || '').toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === "all" || issue.status === statusFilter
      const matchesPriority = priorityFilter === "all" || issue.priority === priorityFilter
      const matchesCategory = categoryFilter === "all" || issue.category === categoryFilter

      return matchesSearch && matchesStatus && matchesPriority && matchesCategory
    })
    .sort((a, b) => {
      // Primary sort: by upvotes (descending)
      const upvoteDiff = (b.upvotes || 0) - (a.upvotes || 0);
      if (upvoteDiff !== 0) return upvoteDiff;
      
      // Secondary sort: by creation date (descending) for stable sorting
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    })

  const statusCounts = {
    all: allIssues.length,
    submitted: allIssues.filter((i) => i.status === "submitted").length,
    assigned: allIssues.filter((i) => i.status === "assigned").length,
    in_progress: allIssues.filter((i) => i.status === "in_progress").length,
    resolved: allIssues.filter((i) => i.status === "resolved").length,
    closed: allIssues.filter((i) => i.status === "closed").length,
  }

  const handleBulkAction = (action: string) => {
    setSelectedIssues([])
  }

  const handleStatusUpdate = async (issueId: string, newStatus: string, notes?: string) => {
    try {
      const response = await fetch(`/api/issues/${issueId}/simple-status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          notes: notes || `Status changed to ${newStatus} by admin`
        }),
      });

      if (response.ok) {
        // Update the local state instead of full page reload
        setAllIssues(prevIssues => 
          prevIssues.map(issue => 
            issue.id === issueId 
              ? { ...issue, status: newStatus, updated_at: new Date().toISOString() }
              : issue
          )
        );
        
        // Show success message
        const statusMessages = {
          'assigned': 'Issue accepted and assigned to department',
          'in_progress': 'Work started on issue',
          'resolved': 'Issue marked as resolved',
          'closed': 'Issue closed'
        };
        
        const message = statusMessages[newStatus as keyof typeof statusMessages] || `Status updated to ${newStatus}`;
        
        // Simple toast notification
        const toast = document.createElement('div');
        toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg z-50';
        toast.textContent = `✅ ${message}`;
        document.body.appendChild(toast);
        setTimeout(() => document.body.removeChild(toast), 3000);
        
      } else {
        const errorData = await response.json();
        const errorToast = document.createElement('div');
        errorToast.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg z-50';
        errorToast.textContent = `❌ ${errorData.error || 'Failed to update status'}`;
        document.body.appendChild(errorToast);
        setTimeout(() => document.body.removeChild(errorToast), 3000);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      const errorToast = document.createElement('div');
      errorToast.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg z-50';
      errorToast.textContent = '❌ Failed to update issue status';
      document.body.appendChild(errorToast);
      setTimeout(() => document.body.removeChild(errorToast), 3000);
    }
  };

  const handleIssueAction = async (action: string, issueId: string, currentStatus: string) => {
    if (processingIssue) return;
    
    try {
      setProcessingIssue(issueId);
      
      switch (action) {
        case 'accept':
          await handleStatusUpdate(issueId, 'assigned', 'Issue accepted and assigned to department');
          break;
        case 'reject':
          await handleStatusUpdate(issueId, 'closed', 'Issue rejected by admin');
          break;
        case 'in_progress':
          await handleStatusUpdate(issueId, 'in_progress', 'Work started on this issue');
          break;
        case 'resolve':
          await handleStatusUpdate(issueId, 'resolved', 'Issue has been resolved');
          break;
        case 'close':
          await handleStatusUpdate(issueId, 'closed', 'Issue closed by admin');
          break;
        case 'view':
          setProcessingIssue(null);
          window.location.href = `/admin/issues/${issueId}`;
          return;
        case 'edit':
          setProcessingIssue(null);
          window.location.href = `/admin/issues/${issueId}`;
          return;
        case 'assign':
          setProcessingIssue(null);
          window.location.href = `/admin/issues/${issueId}`;
          return;
        case 'priority':
          setProcessingIssue(null);
          window.location.href = `/admin/issues/${issueId}`;
          return;
        default:
          // Unknown action
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.error('Error performing action:', error);
      const errorToast = document.createElement('div');
      errorToast.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg z-50';
      errorToast.textContent = '❌ Failed to perform action';
      document.body.appendChild(errorToast);
      setTimeout(() => document.body.removeChild(errorToast), 3000);
    } finally {
      setProcessingIssue(null);
    }
  };

  const handleUserIdClick = (issueId: string) => {
    setExpandedUserIds(prev => {
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/admin/dashboard">
                <button className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold">Issue Management</h1>
                <p className="text-muted-foreground">Track, assign, and manage all civic issues</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {selectedIssues.length > 0 && (
                <button 
                  onClick={() => handleBulkAction("status")}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Bulk Actions ({selectedIssues.length})
                </button>
              )}
              <Link href="/admin/issues/map">
                <button className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <MapPin className="w-4 h-4 mr-2" />
                  Map View
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search issues, locations, or IDs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="submitted">Submitted</SelectItem>
                    <SelectItem value="assigned">Assigned</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priority</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="roads">Roads</SelectItem>
                    <SelectItem value="potholes">Potholes</SelectItem>
                    <SelectItem value="streetlights">Streetlights</SelectItem>
                    <SelectItem value="garbage">Garbage</SelectItem>
                    <SelectItem value="water">Water</SelectItem>
                    <SelectItem value="drainage">Drainage</SelectItem>
                    <SelectItem value="parks">Parks</SelectItem>
                    <SelectItem value="traffic">Traffic</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {loading && (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Loading issues...</p>
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {error && (
          <Card>
            <CardContent className="p-8 text-center">
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Error Loading Issues</h3>
              <p className="text-muted-foreground">{error}</p>
              <Button 
                onClick={() => window.location.reload()} 
                className="mt-4"
              >
                Retry
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Status Tabs */}
        {!loading && !error && (
          <Tabs value={statusFilter} onValueChange={setStatusFilter} className="space-y-4">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="all">All ({statusCounts.all})</TabsTrigger>
              <TabsTrigger value="submitted">Submitted ({statusCounts.submitted})</TabsTrigger>
              <TabsTrigger value="assigned">Assigned ({statusCounts.assigned})</TabsTrigger>
              <TabsTrigger value="in_progress">In Progress ({statusCounts.in_progress})</TabsTrigger>
              <TabsTrigger value="resolved">Resolved ({statusCounts.resolved})</TabsTrigger>
              <TabsTrigger value="closed">Closed ({statusCounts.closed})</TabsTrigger>
            </TabsList>

          <TabsContent value={statusFilter} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Issues ({filteredIssues.length})</CardTitle>
                <CardDescription>
                  {statusFilter === "all" ? "All issues" : `Issues with status: ${statusFilter.replace("_", " ")}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Desktop Table View - Hidden on mobile */}
                <div className="hidden lg:block rounded-md border overflow-hidden">
                  <div className="overflow-x-auto max-w-full">
                    <Table className="min-w-full">
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">
                            <input
                              type="checkbox"
                              checked={selectedIssues.length === filteredIssues.length && filteredIssues.length > 0}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedIssues(filteredIssues.map((issue) => issue.id))
                                } else {
                                  setSelectedIssues([])
                                }
                              }}
                              className="rounded"
                            />
                          </TableHead>
                          <TableHead className="min-w-[300px]">Issue</TableHead>
                          <TableHead className="w-24">Status</TableHead>
                          <TableHead className="w-20">Priority</TableHead>
                          <TableHead className="w-24">AI Urgency</TableHead>
                          <TableHead className="w-24">Category</TableHead>
                          <TableHead className="min-w-[150px]">Assigned To</TableHead>
                          <TableHead className="min-w-[120px]">Reported</TableHead>
                          <TableHead className="w-16">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredIssues.map((issue) => (
                          <TableRow key={issue.id}>
                            <TableCell>
                              <input
                                type="checkbox"
                                checked={selectedIssues.includes(issue.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedIssues([...selectedIssues, issue.id])
                                  } else {
                                    setSelectedIssues(selectedIssues.filter((id) => id !== issue.id))
                                  }
                                }}
                                className="rounded"
                              />
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1 max-w-[280px]">
                                <div className="font-medium truncate" title={issue.title}>{issue.title}</div>
                                <div className="text-sm text-muted-foreground flex items-center">
                                  <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                                  <span className="truncate" title={issue.location_address}>
                                    {issue.location_address}
                                  </span>
                                </div>
                                <div 
                                  className="text-xs text-muted-foreground cursor-pointer hover:text-primary transition-colors"
                                  onClick={() => handleUserIdClick(issue.id)}
                                  title="Click to show/hide full ID"
                                >
                                  ID: {issue.id.slice(0, 8)}...
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={`${getStatusColor(issue.status)} text-xs`}>
                                {getStatusIcon(issue.status)}
                                <span className="ml-1 capitalize hidden sm:inline">{issue.status.replace("_", " ")}</span>
                                <span className="ml-1 capitalize sm:hidden">{issue.status.charAt(0).toUpperCase()}</span>
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={`${getPriorityColor(issue.priority)} text-xs`} variant="outline">
                                {issue.priority.charAt(0).toUpperCase()}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <AIUrgencyBadge 
                                urgency={issue.ai_urgency}
                                confidence={issue.ai_confidence}
                                className="text-xs"
                              />
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs">
                                {getCategoryLabel(issue.category).slice(0, 8)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {issue.assigned_profile ? (
                                <div className="space-y-1 max-w-[140px]">
                                  <div className="text-sm font-medium truncate" title={issue.assigned_profile.full_name}>
                                    {issue.assigned_profile.full_name}
                                  </div>
                                  <div className="text-xs text-muted-foreground truncate" title={issue.department?.name}>
                                    {issue.department?.name}
                                  </div>
                                  {expandedUserIds.has(issue.id) && (
                                    <div className="text-xs text-blue-600 font-mono bg-blue-50 px-2 py-1 rounded border">
                                      {issue.id}
                                    </div>
                                  )}
                                </div>
                              ) : issue.department ? (
                                <div className="space-y-1 max-w-[140px]">
                                  <div className="text-sm font-medium">Department</div>
                                  <div className="text-xs text-muted-foreground truncate" title={issue.department.name}>
                                    {issue.department.name}
                                  </div>
                                  {expandedUserIds.has(issue.id) && (
                                    <div className="text-xs text-blue-600 font-mono bg-blue-50 px-2 py-1 rounded border">
                                      {issue.id}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="space-y-1 max-w-[140px]">
                                  <span className="text-muted-foreground text-sm">Unassigned</span>
                                  {expandedUserIds.has(issue.id) && (
                                    <div className="text-xs text-blue-600 font-mono bg-blue-50 px-2 py-1 rounded border">
                                      {issue.id}
                                    </div>
                                  )}
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1 max-w-[110px]">
                                <div className="text-sm flex items-center">
                                  <Calendar className="w-3 h-3 mr-1 flex-shrink-0" />
                                  <span className="text-xs">{new Date(issue.created_at).toLocaleDateString()}</span>
                                </div>
                                <div className="text-xs text-muted-foreground flex items-center">
                                  <User className="w-3 h-3 mr-1 flex-shrink-0" />
                                  <span className="truncate" title={issue.profiles?.full_name || 'Unknown'}>
                                    {issue.profiles?.full_name || 'Unknown'}
                                  </span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <SimpleAdminActions
                                issue={{
                                  id: issue.id,
                                  status: issue.status,
                                  title: issue.title
                                }}
                                onAction={handleIssueAction}
                                processing={processingIssue === issue.id}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {filteredIssues.length === 0 && (
                  <div className="text-center py-8">
                    <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Issues Found</h3>
                    <p className="text-muted-foreground">
                      No issues match your current filters. Try adjusting your search criteria.
                    </p>
                  </div>
                )}

                {/* Mobile Card View - Hidden on larger screens */}
                <div className="block lg:hidden mt-4">
                  <div className="space-y-4">
                    {filteredIssues.map((issue) => (
                      <Card key={issue.id} className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={selectedIssues.includes(issue.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedIssues([...selectedIssues, issue.id])
                                } else {
                                  setSelectedIssues(selectedIssues.filter((id) => id !== issue.id))
                                }
                              }}
                              className="rounded"
                            />
                            <div className="flex-1">
                              <h3 className="font-medium text-sm leading-tight">{issue.title}</h3>
                              <p 
                                className="text-xs text-muted-foreground mt-1 cursor-pointer hover:text-primary transition-colors"
                                onClick={() => handleUserIdClick(issue.id)}
                                title="Click to show/hide full ID"
                              >
                                ID: {issue.id.slice(0, 8)}...
                              </p>
                            </div>
                          </div>
                          <SimpleAdminActions
                            issue={{
                              id: issue.id,
                              status: issue.status,
                              title: issue.title
                            }}
                            onAction={handleIssueAction}
                            processing={processingIssue === issue.id}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">Status</span>
                            <Badge className={`${getStatusColor(issue.status)} text-xs`}>
                              {getStatusIcon(issue.status)}
                              <span className="ml-1 capitalize">{issue.status.replace("_", " ")}</span>
                            </Badge>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">Priority</span>
                            <Badge className={`${getPriorityColor(issue.priority)} text-xs`} variant="outline">
                              {issue.priority}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">AI Urgency</span>
                            <AIUrgencyBadge 
                              urgency={issue.ai_urgency}
                              confidence={issue.ai_confidence}
                              className="text-xs"
                            />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">Category</span>
                            <Badge variant="outline" className="text-xs">
                              {getCategoryLabel(issue.category)}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">Assigned To</span>
                            <span className="text-xs">
                              {issue.assigned_profile ? (
                                <div>
                                  <div className="font-medium">{issue.assigned_profile.full_name}</div>
                                  <div className="text-muted-foreground">{issue.department?.name}</div>
                                  {expandedUserIds.has(issue.id) && (
                                    <div className="text-xs text-blue-600 font-mono bg-blue-50 px-2 py-1 rounded border mt-1">
                                      {issue.id}
                                    </div>
                                  )}
                                </div>
                              ) : issue.department ? (
                                <div>
                                  <div className="font-medium">Department</div>
                                  <div className="text-muted-foreground">{issue.department.name}</div>
                                  {expandedUserIds.has(issue.id) && (
                                    <div className="text-xs text-blue-600 font-mono bg-blue-50 px-2 py-1 rounded border mt-1">
                                      {issue.id}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div>
                                  <span className="text-muted-foreground">Unassigned</span>
                                  {expandedUserIds.has(issue.id) && (
                                    <div className="text-xs text-blue-600 font-mono bg-blue-50 px-2 py-1 rounded border mt-1">
                                      {issue.id}
                                    </div>
                                  )}
                                </div>
                              )}
                            </span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">Reported</span>
                            <div className="text-xs text-right">
                              <div className="flex items-center">
                                <Calendar className="w-3 h-3 mr-1" />
                                {new Date(issue.created_at).toLocaleDateString()}
                              </div>
                              <div className="flex items-center text-muted-foreground">
                                <User className="w-3 h-3 mr-1" />
                                {issue.profiles?.full_name || 'Unknown'}
                              </div>
                            </div>
                          </div>
                          
                          <div className="pt-2 border-t">
                            <div className="flex items-center text-xs text-muted-foreground">
                              <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                              <span className="truncate">{issue.location_address}</span>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        )}
      </div>
    </div>
  )
}