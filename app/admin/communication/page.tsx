"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  MessageSquare,
  Bell,
  Send,
  Plus,
  Users,
  Megaphone,
  Calendar,
  Clock,
  MapPin,
  Star,
  Reply,
  Edit,
  Trash2,
  Filter,
  Search,
  Volume2,
  AlertTriangle,
  CheckCircle,
  Zap,
} from "lucide-react";

// Mock data for notifications
const mockNotifications = [
  {
    id: "1",
    title: "Issue ISS-1001 Updated",
    message: "Status changed to 'In Progress' by Amit Patel",
    type: "status_update",
    recipient: "citizens",
    sent: "2024-01-20T10:30:00Z",
    status: "delivered",
    readCount: 45,
    totalRecipients: 67,
  },
  {
    id: "2",
    title: "SLA Breach Alert",
    message: "Issue ISS-1002 has exceeded SLA deadline",
    type: "alert",
    recipient: "staff",
    sent: "2024-01-20T09:15:00Z",
    status: "delivered",
    readCount: 12,
    totalRecipients: 15,
  },
  {
    id: "3",
    title: "Weekly Progress Report",
    message: "Your department resolved 23 issues this week",
    type: "report",
    recipient: "departments",
    sent: "2024-01-19T18:00:00Z",
    status: "delivered", 
    readCount: 8,
    totalRecipients: 8,
  },
];

// Mock data for issue comments
const mockComments = [
  {
    id: "1",
    issueId: "ISS-1001",
    issueTitle: "Large pothole on Main Street",
    author: {
      name: "Amit Patel",
      role: "Staff",
      avatar: "/api/placeholder/32/32"
    },
    content: "Started work on this issue. Need to order additional materials for proper repair.",
    timestamp: "2024-01-20T11:30:00Z",
    isInternal: true,
    attachments: [],
  },
  {
    id: "2",
    issueId: "ISS-1001", 
    issueTitle: "Large pothole on Main Street",
    author: {
      name: "Priya Sharma",
      role: "Department Head",
      avatar: "/api/placeholder/32/32"
    },
    content: "Please prioritize this as it's causing traffic delays. Update expected completion time.",
    timestamp: "2024-01-20T12:15:00Z",
    isInternal: true,
    attachments: [],
  },
  {
    id: "3",
    issueId: "ISS-1002",
    issueTitle: "Broken streetlight near school",
    author: {
      name: "John Doe",
      role: "Citizen",
      avatar: "/api/placeholder/32/32"
    },
    content: "Thank you for the quick response! The light is working now.",
    timestamp: "2024-01-20T14:30:00Z",
    isInternal: false,
    attachments: [],
  },
];

// Mock data for campaigns (Abhiyaan Mode)
const mockCampaigns = [
  {
    id: "1",
    name: "Clean Streets Initiative",
    description: "City-wide campaign to address garbage and cleanliness issues",
    type: "cleanliness",
    status: "active",
    startDate: "2024-01-15T00:00:00Z",
    endDate: "2024-02-15T00:00:00Z",
    targetIssues: ["garbage", "cleanliness"],
    participants: 234,
    issuesResolved: 89,
    targetResolutions: 150,
    priority: "high",
    announcements: 5,
  },
  {
    id: "2",
    name: "Road Safety Drive",
    description: "Focus on pothole repairs and traffic signal maintenance",
    type: "infrastructure",
    status: "planning",
    startDate: "2024-02-01T00:00:00Z",
    endDate: "2024-03-01T00:00:00Z",
    targetIssues: ["pothole", "traffic"],
    participants: 67,
    issuesResolved: 0,
    targetResolutions: 200,
    priority: "medium",
    announcements: 2,
  },
];

export default function CommunicationPage() {
  const [activeTab, setActiveTab] = useState("notifications");
  const [isNewNotificationOpen, setIsNewNotificationOpen] = useState(false);
  const [isNewCampaignOpen, setIsNewCampaignOpen] = useState(false);
  const [selectedNotificationType, setSelectedNotificationType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  
  const filteredNotifications = mockNotifications.filter(notification => {
    const matchesType = selectedNotificationType === "all" || notification.type === selectedNotificationType;
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered": return "bg-green-500 text-white";
      case "pending": return "bg-yellow-500 text-white";
      case "failed": return "bg-red-500 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  const getNotificationTypeColor = (type: string) => {
    switch (type) {
      case "alert": return "bg-red-500 text-white";
      case "status_update": return "bg-blue-500 text-white";
      case "report": return "bg-green-500 text-white";
      case "campaign": return "bg-purple-500 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  const getCampaignStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-500 text-white";
      case "planning": return "bg-blue-500 text-white";
      case "completed": return "bg-gray-500 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours === 1) return "1 hour ago";
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return "1 day ago";
    return `${diffInDays} days ago`;
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-accent" />
            Communication Center
          </h1>
          <p className="text-muted-foreground">
            Manage notifications, comments, and special campaign announcements
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="comments">Issue Comments</TabsTrigger>
          <TabsTrigger value="campaigns">Abhiyaan Mode</TabsTrigger>
        </TabsList>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <div className="space-y-6">
            {/* Notification Controls */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex gap-4 items-center">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search notifications..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Select value={selectedNotificationType} onValueChange={setSelectedNotificationType}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="alert">Alerts</SelectItem>
                    <SelectItem value="status_update">Status Updates</SelectItem>
                    <SelectItem value="report">Reports</SelectItem>
                    <SelectItem value="campaign">Campaigns</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Dialog open={isNewNotificationOpen} onOpenChange={setIsNewNotificationOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    New Notification
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Send Notification</DialogTitle>
                    <DialogDescription>
                      Create and send a notification to citizens or staff
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="notification-title">Title</Label>
                      <Input id="notification-title" placeholder="Notification title" />
                    </div>
                    <div>
                      <Label htmlFor="notification-message">Message</Label>
                      <Textarea id="notification-message" placeholder="Notification message" rows={3} />
                    </div>
                    <div>
                      <Label htmlFor="notification-type">Type</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="alert">Alert</SelectItem>
                          <SelectItem value="status_update">Status Update</SelectItem>
                          <SelectItem value="report">Report</SelectItem>
                          <SelectItem value="info">Information</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="notification-recipients">Recipients</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select recipients" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Users</SelectItem>
                          <SelectItem value="citizens">Citizens</SelectItem>
                          <SelectItem value="staff">Staff Only</SelectItem>
                          <SelectItem value="departments">Department Heads</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Delivery Methods</Label>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="email" defaultChecked />
                        <Label htmlFor="email">Email</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="push" defaultChecked />
                        <Label htmlFor="push">Push Notification</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="sms" />
                        <Label htmlFor="sms">SMS</Label>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsNewNotificationOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={() => setIsNewNotificationOpen(false)}>
                      <Send className="w-4 h-4 mr-2" />
                      Send Notification
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* Notifications List */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Notifications ({filteredNotifications.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredNotifications.map((notification) => (
                    <div key={notification.id} className="flex items-start gap-4 p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium">{notification.title}</h4>
                          <Badge className={getNotificationTypeColor(notification.type)}>
                            {notification.type.replace('_', ' ')}
                          </Badge>
                          <Badge className={getStatusColor(notification.status)}>
                            {notification.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {notification.recipient}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTimeAgo(notification.sent)}
                          </span>
                          <span className="flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            {notification.readCount}/{notification.totalRecipients} read
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm">
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Comments Tab */}
        <TabsContent value="comments">
          <Card>
            <CardHeader>
              <CardTitle>Issue Comments & Communication</CardTitle>
              <CardDescription>
                View and manage comments on issues from staff and citizens
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockComments.map((comment) => (
                  <div key={comment.id} className="flex gap-4 p-4 border rounded-lg">
                    <Avatar>
                      <AvatarImage src={comment.author.avatar} />
                      <AvatarFallback>
                        {comment.author.name.split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium">{comment.author.name}</span>
                        <Badge variant="outline">{comment.author.role}</Badge>
                        {comment.isInternal && (
                          <Badge variant="secondary">Internal</Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {formatTimeAgo(comment.timestamp)}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground mb-2">
                        Re: <span className="font-medium">{comment.issueTitle}</span>
                      </div>
                      <p className="text-sm">{comment.content}</p>
                      <div className="flex gap-2 mt-2">
                        <Button variant="ghost" size="sm">
                          <Reply className="w-3 h-3 mr-2" />
                          Reply
                        </Button>
                        {comment.isInternal && (
                          <Button variant="ghost" size="sm">
                            <Edit className="w-3 h-3 mr-2" />
                            Edit
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Campaigns Tab (Abhiyaan Mode) */}
        <TabsContent value="campaigns">
          <div className="space-y-6">
            {/* Campaign Controls */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-accent" />
                <h2 className="text-lg font-semibold">Special Campaigns (Abhiyaan Mode)</h2>
              </div>
              <Dialog open={isNewCampaignOpen} onOpenChange={setIsNewCampaignOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    New Campaign
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Create New Campaign</DialogTitle>
                    <DialogDescription>
                      Launch a special campaign to focus on specific issue types
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="campaign-name">Campaign Name</Label>
                      <Input id="campaign-name" placeholder="Enter campaign name" />
                    </div>
                    <div>
                      <Label htmlFor="campaign-description">Description</Label>
                      <Textarea id="campaign-description" placeholder="Campaign description and goals" rows={3} />
                    </div>
                    <div>
                      <Label htmlFor="campaign-type">Campaign Type</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select campaign type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cleanliness">Cleanliness Drive</SelectItem>
                          <SelectItem value="infrastructure">Infrastructure Focus</SelectItem>
                          <SelectItem value="safety">Safety Initiative</SelectItem>
                          <SelectItem value="environment">Environmental Campaign</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="start-date">Start Date</Label>
                        <Input id="start-date" type="date" />
                      </div>
                      <div>
                        <Label htmlFor="end-date">End Date</Label>
                        <Input id="end-date" type="date" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="target-resolution">Target Resolutions</Label>
                      <Input id="target-resolution" type="number" placeholder="Number of issues to resolve" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsNewCampaignOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={() => setIsNewCampaignOpen(false)}>
                      <Megaphone className="w-4 h-4 mr-2" />
                      Launch Campaign
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* Active Campaigns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mockCampaigns.map((campaign) => (
                <Card key={campaign.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{campaign.name}</CardTitle>
                      <Badge className={getCampaignStatusColor(campaign.status)}>
                        {campaign.status}
                      </Badge>
                    </div>
                    <CardDescription>{campaign.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <span>Progress</span>
                        <span className="font-medium">
                          {campaign.issuesResolved}/{campaign.targetResolutions} issues
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-accent h-2 rounded-full" 
                          style={{ width: `${(campaign.issuesResolved / campaign.targetResolutions) * 100}%` }}
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Participants:</span>
                          <span className="ml-2 font-medium">{campaign.participants}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Announcements:</span>
                          <span className="ml-2 font-medium">{campaign.announcements}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {new Date(campaign.startDate).toLocaleDateString()} - {new Date(campaign.endDate).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button size="sm" variant="outline">
                          <Volume2 className="w-3 h-3 mr-2" />
                          Announce
                        </Button>
                        <Button size="sm" variant="outline">
                          <Users className="w-3 h-3 mr-2" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}