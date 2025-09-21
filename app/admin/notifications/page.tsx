"use client"

import React, { useState, useEffect, ChangeEvent, FormEvent } from "react"
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
  id: string
  type: "new_issue" | "maintenance" | "traffic" | "community" | "emergency" | "service"
  title: string
  message: string
  priority: "low" | "medium" | "high" | "urgent"
  timestamp: string
  read: boolean
  data?: {
    issueId?: string
    category?: string
    location?: string
    reportedBy?: string
    reportedAt?: string
  }
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

  // Input change handler
  const handleInputChange = (field: string, value: string) => {
    setNotificationForm((prev) => ({ ...prev, [field]: value }))
  }

  // Send notification handler
  const handleSendNotification = async (e: FormEvent) => {
    e.preventDefault()
    if (!notificationForm.title || !notificationForm.message || !notificationForm.type) {
      toast({ title: "Error", description: "Please fill all required fields", variant: "destructive" })
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(notificationForm),
      })

      if (response.ok) {
        toast({ title: "Notification sent!", description: "It will appear in the notifications list." })
        setNotificationForm({ title: "", message: "", type: "", audience: "all", targetLocation: "", priority: "medium" })
        fetchNotifications()
      } else {
        toast({ title: "Failed", description: "Could not send notification", variant: "destructive" })
      }
    } catch (error) {
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("adminNotifications", JSON.stringify(adminNotifications))
  }, [adminNotifications])

  // Load notifications from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("adminNotifications")
    if (saved) setAdminNotifications(JSON.parse(saved))
  }, [])

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const response = await fetch("/api/admin/notifications")
      let apiNotifications: AdminNotification[] = []

      if (response.ok) {
        const data = await response.json()
        apiNotifications = data.notifications || []
      }

      const saved = localStorage.getItem("adminNotifications")
      let merged: AdminNotification[] = apiNotifications

      if (saved) {
        const local = JSON.parse(saved) as AdminNotification[]
        merged = apiNotifications.map((n) => {
          const localNotif = local.find((l) => l.id === n.id)
          return localNotif ? { ...n, read: localNotif.read } : n
        })
        const localOnly = local.filter((l) => !apiNotifications.some((a) => a.id === l.id))
        merged = [...merged, ...localOnly]
      }

      setAdminNotifications(merged)
      setUnreadCount(merged.filter((n) => !n.read).length)
      localStorage.setItem("adminNotifications", JSON.stringify(merged))
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 5000) // auto-refresh every 5 sec
    return () => clearInterval(interval)
  }, [])

  const markAsRead = async (id: string) => {
    try {
      const response = await fetch("/api/admin/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: "mark_read" }),
      })
      if (response.ok) {
        setAdminNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
      }
    } catch (error) {
      console.error(error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const response = await fetch("/api/admin/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark_all_read" }),
      })
      if (response.ok) {
        setAdminNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      }
    } catch (error) {
      console.error(error)
    }
  }

  const dismissNotification = async (id: string) => {
    try {
      const response = await fetch("/api/admin/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: "dismiss" }),
      })
      if (response.ok) {
        setAdminNotifications((prev) => prev.filter((n) => n.id !== id))
      }
    } catch (error) {
      console.error(error)
    }
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / 60000)
    if (diffInMinutes < 1) return "Just now"
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h ago`
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d ago`
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/dashboard">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Notification Center</h1>
            <p className="text-muted-foreground">Manage and send notifications</p>
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
            <Button size="sm" variant="outline" onClick={fetchNotifications}>
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <Tabs defaultValue="incoming" className="space-y-6">
          <TabsList>
            <TabsTrigger value="incoming" className="relative flex items-center gap-2">
              <BellRing className="w-4 h-4" /> Incoming
              {unreadCount > 0 && <Badge variant="destructive">{unreadCount}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="send" className="flex items-center gap-2">
              <Send className="w-4 h-4" /> Send
            </TabsTrigger>
          </TabsList>

          <TabsContent value="incoming">
            <Card>
              <CardHeader>
                <CardTitle>Recent Notifications</CardTitle>
                <CardDescription>Real-time updates and alerts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Bell className="w-12 h-12 mx-auto mb-4 opacity-50 animate-pulse" />
                    Loading notifications...
                  </div>
                ) : adminNotifications.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    No notifications
                  </div>
                ) : (
                  adminNotifications.map((n) => (
                    <div key={n.id} className={`flex items-start gap-4 p-4 border rounded-lg ${!n.read ? "bg-blue-50 border-blue-200" : "hover:bg-gray-50"}`}>
                      <div className="flex-shrink-0 mt-1">{getNotificationTypeIcon(n.type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className={`font-semibold ${!n.read ? "text-blue-900" : ""}`}>{n.title}</h4>
                              {!n.read && <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{n.message}</p>
                            {n.type === "new_issue" && n.data && (
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs bg-white/50 p-2 rounded border">
                                <div>ID: <code>{n.data.issueId}</code></div>
                                <div className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {n.data.location}</div>
                                <div>From: {n.data.reportedBy}</div>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            <Badge className={getTypeColor(n.type)}>{n.type.replace("_", " ")}</Badge>
                            <Badge variant="outline" className={getPriorityColor(n.priority)}>{n.priority}</Badge>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="w-4 h-4" /> {formatTimeAgo(n.timestamp)}
                          </span>
                          <div className="flex items-center gap-2">
                            {!n.read && <Button size="sm" variant="ghost" onClick={() => markAsRead(n.id)}>Mark Read</Button>}
                            <Button size="sm" variant="ghost" onClick={() => dismissNotification(n.id)}><X className="w-4 h-4" /></Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="send">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Megaphone className="w-5 h-5 text-purple-600" /> Compose Notification
                </CardTitle>
                <CardDescription>Send updates and alerts</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSendNotification} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="type">Notification Type *</Label>
                      <Select value={notificationForm.type} onValueChange={(v) => handleInputChange("type", v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="maintenance">Maintenance</SelectItem>
                          <SelectItem value="traffic">Traffic</SelectItem>
                          <SelectItem value="community">Community</SelectItem>
                          <SelectItem value="emergency">Emergency</SelectItem>
                          <SelectItem value="service">Service</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="priority">Priority Level</Label>
                      <Select value={notificationForm.priority} onValueChange={(v) => handleInputChange("priority", v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="title">Title *</Label>
                    <Input value={notificationForm.title} onChange={(e) => handleInputChange("title", e.target.value)} required />
                  </div>
                  <div>
                    <Label htmlFor="message">Message *</Label>
                    <Textarea value={notificationForm.message} onChange={(e) => handleInputChange("message", e.target.value)} rows={4} required />
                  </div>
                  <Button type="submit" className="flex items-center gap-2" disabled={isSubmitting}>
                    {isSubmitting ? <>Sending...</> : <><Send className="w-4 h-4" /> Send Notification</>}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
