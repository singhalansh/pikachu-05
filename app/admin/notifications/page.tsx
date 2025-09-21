"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Send, Bell, Users, AlertTriangle, CheckCircle, Calendar, Megaphone, Clock, MapPin, Zap, BellRing, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface AdminNotification {
  id: string;
  type: "new_issue" | "maintenance" | "traffic" | "community" | "emergency" | "service";
  title: string;
  message: string;
  priority: "low" | "medium" | "high" | "urgent";
  timestamp: string;
  read: boolean;
  data?: {
    issueId?: string;
    category?: string;
    location?: string;
    reportedBy?: string;
    reportedAt?: string;
  };
}

const getNotificationTypeIcon = (type: string) => {
  switch (type) {
    case "new_issue":
      return <BellRing className="w-5 h-5 text-blue-600" />
    case "maintenance":
      return <AlertTriangle className="w-5 h-5 text-orange-600" />
    case "traffic":
      return <CheckCircle className="w-5 h-5 text-green-600" />
    case "community":
      return <Users className="w-5 h-5 text-purple-600" />
    case "emergency":
      return <Zap className="w-5 h-5 text-red-600" />
    default:
      return <Bell className="w-5 h-5 text-gray-600" />
  }
}

const getTypeColor = (type: string) => {
  switch (type) {
    case "new_issue":
      return "bg-blue-600 text-white"
    case "maintenance":
      return "bg-orange-600 text-white"
    case "traffic":
      return "bg-green-600 text-white"
    case "community":
      return "bg-purple-600 text-white"
    case "emergency":
      return "bg-red-600 text-white"
    default:
      return "bg-gray-600 text-white"
  }
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "urgent":
      return "bg-red-100 text-red-800 border-red-200"
    case "high":
      return "bg-orange-100 text-orange-800 border-orange-200"
    case "medium":
      return "bg-yellow-100 text-yellow-800 border-yellow-200"
    case "low":
      return "bg-green-100 text-green-800 border-green-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

export default function AdminNotificationsPage() {
  const [notificationForm, setNotificationForm] = useState({
    title: "",
    message: "",
    type: "",
    audience: "all",
    targetLocation: "",
    priority: "medium",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [adminNotifications, setAdminNotifications] = useState<AdminNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  
  const { toast } = useToast()

  // Fetch notifications from API
  const fetchNotifications = async () => {
    try {
      console.log('Fetching admin notifications...')
      const response = await fetch('/api/admin/notifications', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched notifications:', data);
        setAdminNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      } else {
        console.error('Failed to fetch notifications:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchNotifications();
  }, []);

  // Poll for new notifications every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchNotifications();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Update unread count when notifications change
  useEffect(() => {
    const count = adminNotifications.filter(notif => !notif.read).length;
    setUnreadCount(count);
  }, [adminNotifications]);

  const handleInputChange = (field: string, value: string) => {
    setNotificationForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: notificationForm.type,
          title: notificationForm.title,
          message: notificationForm.message,
          priority: notificationForm.priority,
          data: {
            audience: notificationForm.audience,
            targetLocation: notificationForm.targetLocation
          }
        })
      });

      if (response.ok) {
        toast({
          title: "Notification Sent Successfully!",
          description: `Your ${notificationForm.type} notification has been sent.`,
        });

        // Reset form
        setNotificationForm({
          title: "",
          message: "",
          type: "",
          audience: "all",
          targetLocation: "",
          priority: "medium",
        });

        // Refresh notifications
        fetchNotifications();
      } else {
        throw new Error('Failed to send notification');
      }
    } catch (error) {
      toast({
        title: "Failed to send notification",
        description: "Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const markAsRead = async (id: string) => {
    try {
      const response = await fetch('/api/admin/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'mark_read' })
      });
      
      if (response.ok) {
        setAdminNotifications(prev => 
          prev.map(notif => 
            notif.id === id ? { ...notif, read: true } : notif
          )
        );
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/admin/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark_all_read' })
      });
      
      if (response.ok) {
        setAdminNotifications(prev => 
          prev.map(notif => ({ ...notif, read: true }))
        );
      }
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  }

  const dismissNotification = async (id: string) => {
    try {
      const response = await fetch('/api/admin/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'dismiss' })
      });
      
      if (response.ok) {
        setAdminNotifications(prev => prev.filter(notif => notif.id !== id));
      }
    } catch (error) {
      console.error('Failed to dismiss notification:', error);
    }
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  }

  // Test notification function for debugging
  const sendTestNotification = async () => {
    try {
      const response = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'new_issue',
          title: 'TEST: New Issue Reported',
          message: 'This is a test notification to verify the system is working',
          priority: 'medium',
          data: {
            issueId: 'TEST-123',
            category: 'Test Category',
            location: 'Test Location',
            reportedBy: 'test@example.com'
          }
        })
      });

      if (response.ok) {
        toast({
          title: "Test notification sent!",
          description: "Check if it appears in the notifications list.",
        });
        fetchNotifications();
      }
    } catch (error) {
      console.error('Test notification failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/dashboard">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Notification Center</h1>
                <p className="text-muted-foreground">Send updates and manage incoming notifications</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <>
                  <Badge variant="destructive" className="animate-pulse">
                    {unreadCount} new
                  </Badge>
                  <Button size="sm" variant="outline" onClick={markAllAsRead}>
                    Mark all read
                  </Button>
                </>
              )}
              <Button size="sm" variant="outline" onClick={sendTestNotification}>
                Send Test Notification
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <Tabs defaultValue="incoming" className="space-y-6">
          <TabsList>
            <TabsTrigger value="incoming" className="relative">
              <BellRing className="w-4 h-4 mr-2" />
              Incoming Notifications
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="send">
              <Send className="w-4 h-4 mr-2" />
              Send Notification
            </TabsTrigger>
          </TabsList>

          {/* Incoming Notifications Tab */}
          <TabsContent value="incoming" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Recent Notifications</span>
                  <div className="text-sm text-muted-foreground">
                    {isLoading ? 'Loading...' : `Auto-refreshes every 5 seconds`}
                  </div>
                </CardTitle>
                <CardDescription>
                  Real-time notifications about new issue reports and system updates
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Bell className="w-12 h-12 mx-auto mb-4 opacity-50 animate-pulse" />
                    <p>Loading notifications...</p>
                  </div>
                ) : adminNotifications.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No notifications at this time</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                      onClick={sendTestNotification}
                    >
                      Send Test Notification
                    </Button>
                  </div>
                ) : (
                  adminNotifications.map((notification) => (
                    <div 
                      key={notification.id} 
                      className={`flex items-start gap-4 p-4 border rounded-lg transition-all ${
                        !notification.read ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationTypeIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className={`font-semibold ${!notification.read ? 'text-blue-900' : ''}`}>
                                {notification.title}
                              </h4>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {notification.message}
                            </p>
                            
                            {/* Additional details for issue notifications */}
                            {notification.type === "new_issue" && notification.data && (
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs bg-white/50 p-2 rounded border">
                                <div className="flex items-center gap-1">
                                  <span className="font-medium">ID:</span>
                                  <code className="bg-gray-100 px-1 rounded">{notification.data.issueId}</code>
                                </div>
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  <span>{notification.data.location}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <span className="font-medium">From:</span>
                                  <span>{notification.data.reportedBy}</span>
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            <Badge className={getTypeColor(notification.type)} variant="secondary">
                              {notification.type.replace('_', ' ')}
                            </Badge>
                            <Badge 
                              variant="outline" 
                              className={getPriorityColor(notification.priority)}
                            >
                              {notification.priority}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {formatTimeAgo(notification.timestamp)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {!notification.read && (
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => markAsRead(notification.id)}
                              >
                                Mark Read
                              </Button>
                            )}
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => dismissNotification(notification.id)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Send Notification Tab */}
          <TabsContent value="send" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Megaphone className="w-5 h-5 mr-2 text-purple-600" />
                  Compose Notification
                </CardTitle>
                <CardDescription>
                  Send important updates, alerts, and announcements to citizens in your municipality.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSendNotification} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="type">Notification Type *</Label>
                      <Select
                        value={notificationForm.type}
                        onValueChange={(value) => handleInputChange("type", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select notification type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="maintenance">Maintenance Alert</SelectItem>
                          <SelectItem value="traffic">Traffic Update</SelectItem>
                          <SelectItem value="community">Community News</SelectItem>
                          <SelectItem value="emergency">Emergency Alert</SelectItem>
                          <SelectItem value="service">Service Update</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="priority">Priority Level</Label>
                      <Select
                        value={notificationForm.priority}
                        onValueChange={(value) => handleInputChange("priority", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low Priority</SelectItem>
                          <SelectItem value="medium">Medium Priority</SelectItem>
                          <SelectItem value="high">High Priority</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="title">Notification Title *</Label>
                    <Input
                      id="title"
                      placeholder="Enter a clear, descriptive title"
                      value={notificationForm.title}
                      onChange={(e) => handleInputChange("title", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      placeholder="Write your notification message. Be clear and concise."
                      value={notificationForm.message}
                      onChange={(e) => handleInputChange("message", e.target.value)}
                      rows={4}
                      required
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button type="submit" className="flex-1" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Send Notification
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}