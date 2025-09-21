"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Send, Bell, Users, AlertTriangle, CheckCircle, Calendar, Megaphone } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// Mock notification data
const sentNotifications = [
  {
    id: "1",
    title: "Scheduled Maintenance - Water Service",
    message:
      "Water service will be temporarily interrupted on Main Street from 9 AM to 3 PM tomorrow for pipe repairs.",
    type: "maintenance",
    audience: "location",
    targetLocation: "Main Street District",
    sentDate: "2024-01-19T14:30:00Z",
    recipients: 234,
    status: "sent",
  },
  {
    id: "2",
    title: "Road Closure Update",
    message: "5th Avenue will remain closed until Friday due to ongoing pothole repairs. Alternative routes available.",
    type: "traffic",
    audience: "all",
    targetLocation: "All Citizens",
    sentDate: "2024-01-18T10:15:00Z",
    recipients: 1247,
    status: "sent",
  },
  {
    id: "3",
    title: "Community Meeting Reminder",
    message:
      "Monthly town hall meeting scheduled for next Tuesday at 7 PM. Your input on civic improvements is valued.",
    type: "community",
    audience: "all",
    targetLocation: "All Citizens",
    sentDate: "2024-01-17T16:45:00Z",
    recipients: 1247,
    status: "sent",
  },
]

const getNotificationTypeIcon = (type: string) => {
  switch (type) {
    case "maintenance":
      return <AlertTriangle className="w-5 h-5 text-status-review" />
    case "traffic":
      return <CheckCircle className="w-5 h-5 text-status-progress" />
    case "community":
      return <Users className="w-5 h-5 text-accent" />
    default:
      return <Bell className="w-5 h-5 text-muted-foreground" />
  }
}

const getTypeColor = (type: string) => {
  switch (type) {
    case "maintenance":
      return "bg-status-review text-white"
    case "traffic":
      return "bg-status-progress text-white"
    case "community":
      return "bg-accent text-accent-foreground"
    default:
      return "bg-muted text-muted-foreground"
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
  const { toast } = useToast()

  const handleInputChange = (field: string, value: string) => {
    setNotificationForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    toast({
      title: "Notification Sent Successfully!",
      description: `Your ${notificationForm.type} notification has been sent to ${
        notificationForm.audience === "all" ? "all citizens" : notificationForm.targetLocation
      }.`,
    })

    setIsSubmitting(false)

    // Reset form
    setNotificationForm({
      title: "",
      message: "",
      type: "",
      audience: "all",
      targetLocation: "",
      priority: "medium",
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-2 xs:px-3 sm:px-4 md:px-6 lg:px-8 py-2 xs:py-3 sm:py-4 md:py-6 lg:py-8">
        {/* Action Buttons */}
        <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2 xs:gap-3 sm:gap-4 mb-3 xs:mb-4 sm:mb-6">
          <div className="flex flex-col xs:flex-row xs:items-center gap-2 sm:gap-3">
            <Link href="/admin/dashboard">
              <Button variant="outline" size="sm" className="w-full xs:w-auto border-gray-200 text-gray-700 hover:bg-gray-50 transition-all duration-200 hover:scale-105 text-xs xs:text-sm">
                <ArrowLeft className="w-3 h-3 xs:w-4 xs:h-4 mr-1 xs:mr-2" />
                <span className="hidden xs:inline">Dashboard</span>
                <span className="xs:hidden">Back to Dashboard</span>
              </Button>
            </Link>
          </div>
        </div>
        <Tabs defaultValue="send" className="space-y-3 xs:space-y-4 sm:space-y-6">
        <TabsList className="flex border-b border-gray-200 bg-white shadow-sm">
          <TabsTrigger
            value="send"
            className="relative flex items-center justify-center px-2 xs:px-4 sm:px-6 py-2 xs:py-3 text-xs xs:text-sm font-medium text-gray-600
                       data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700
                       data-[state=active]:border-b-2 data-[state=active]:border-blue-600
                       hover:bg-gray-50 hover:text-gray-900
                       rounded-none transition-all duration-200 
                       focus:outline-none focus:ring-2 focus:ring-blue-200 focus:ring-inset
                       focus-visible:border-b-2 focus-visible:border-blue-400"
          >
            <Send className="w-3 h-3 xs:w-4 xs:h-4 mr-1 xs:mr-2" />
            <span className="hidden xs:inline">Send Notification</span>
            <span className="xs:hidden">Send</span>
          </TabsTrigger>

          <TabsTrigger
            value="history"
            className="relative flex items-center justify-center px-2 xs:px-4 sm:px-6 py-2 xs:py-3 text-xs xs:text-sm font-medium text-gray-600
                       data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700
                       data-[state=active]:border-b-2 data-[state=active]:border-blue-600
                       hover:bg-gray-50 hover:text-gray-900
                       rounded-none transition-all duration-200 
                       focus:outline-none focus:ring-2 focus:ring-blue-200 focus:ring-inset
                       focus-visible:border-b-2 focus-visible:border-blue-400"
          >
            <Bell className="w-3 h-3 xs:w-4 xs:h-4 mr-1 xs:mr-2" />
            <span className="hidden xs:inline">Notification History</span>
            <span className="xs:hidden">History</span>
          </TabsTrigger>
        </TabsList>

          <TabsContent value="send" className="space-y-3 xs:space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 xs:gap-4 sm:gap-6">
              {/* Send Form */}
              <div className="lg:col-span-2">
                <Card className="bg-white border-0 shadow-sm hover:shadow-lg transition-all duration-300 animate-fade-in">
                  <CardHeader className="pb-2 xs:pb-3 sm:pb-4">
                    <CardTitle className="flex items-center text-sm xs:text-base sm:text-lg font-semibold text-gray-900">
                      <div className="w-6 h-6 xs:w-8 xs:h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-2 xs:mr-3 shadow-lg">
                        <Megaphone className="w-3 h-3 xs:w-4 xs:h-4 text-white" />
                      </div>
                      <span className="hidden xs:inline">Compose Notification</span>
                      <span className="xs:hidden">Compose</span>
                    </CardTitle>
                    <CardDescription className="text-xs xs:text-sm text-gray-500 hidden xs:block">
                      Send important updates, alerts, and announcements to citizens in your municipality.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <form onSubmit={handleSendNotification} className="space-y-3 xs:space-y-4 sm:space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 xs:gap-4 sm:gap-6">
                        <div className="space-y-1 xs:space-y-2">
                          <Label htmlFor="type" className="text-xs xs:text-sm font-medium text-gray-700">Notification Type *</Label>
                          <Select
                            value={notificationForm.type}
                            onValueChange={(value) => handleInputChange("type", value)}
                          >
                            <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 hover:border-gray-300">
                              <SelectValue placeholder="Select notification type" />
                            </SelectTrigger>
                            <SelectContent className="bg-white border-gray-200 shadow-lg z-50">
                              <SelectItem value="maintenance" className="hover:bg-blue-50 focus:bg-blue-50 cursor-pointer">Maintenance Alert</SelectItem>
                              <SelectItem value="traffic" className="hover:bg-blue-50 focus:bg-blue-50 cursor-pointer">Traffic Update</SelectItem>
                              <SelectItem value="community" className="hover:bg-blue-50 focus:bg-blue-50 cursor-pointer">Community News</SelectItem>
                              <SelectItem value="emergency" className="hover:bg-blue-50 focus:bg-blue-50 cursor-pointer">Emergency Alert</SelectItem>
                              <SelectItem value="service" className="hover:bg-blue-50 focus:bg-blue-50 cursor-pointer">Service Update</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-1 xs:space-y-2">
                          <Label htmlFor="priority" className="text-xs xs:text-sm font-medium text-gray-700">Priority Level</Label>
                          <Select
                            value={notificationForm.priority}
                            onValueChange={(value) => handleInputChange("priority", value)}
                          >
                            <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 hover:border-gray-300">
                              <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                            <SelectContent className="bg-white border-gray-200 shadow-lg z-50">
                              <SelectItem value="low" className="hover:bg-blue-50 focus:bg-blue-50 cursor-pointer">Low Priority</SelectItem>
                              <SelectItem value="medium" className="hover:bg-blue-50 focus:bg-blue-50 cursor-pointer">Medium Priority</SelectItem>
                              <SelectItem value="high" className="hover:bg-blue-50 focus:bg-blue-50 cursor-pointer">High Priority</SelectItem>
                              <SelectItem value="urgent" className="hover:bg-blue-50 focus:bg-blue-50 cursor-pointer">Urgent</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-1 xs:space-y-2">
                        <Label htmlFor="title" className="text-xs xs:text-sm font-medium text-gray-700">Notification Title *</Label>
                        <Input
                          id="title"
                          placeholder="Enter a clear, descriptive title"
                          value={notificationForm.title}
                          onChange={(e) => handleInputChange("title", e.target.value)}
                          className="border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                          required
                        />
                      </div>

                      <div className="space-y-1 xs:space-y-2">
                        <Label htmlFor="message" className="text-xs xs:text-sm font-medium text-gray-700">Message *</Label>
                        <Textarea
                          id="message"
                          placeholder="Write your notification message. Be clear and concise."
                          value={notificationForm.message}
                          onChange={(e) => handleInputChange("message", e.target.value)}
                          rows={4}
                          className="border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 resize-none"
                          required
                        />
                        <div className="text-xs text-gray-500">
                          {notificationForm.message.length}/500 characters
                        </div>
                      </div>

                      <div className="space-y-3 xs:space-y-4">
                        <Label className="text-xs xs:text-sm font-medium text-gray-700">Target Audience *</Label>
                        <div className="space-y-2 xs:space-y-3">
                          <div className={`flex items-center space-x-2 xs:space-x-3 p-2 xs:p-3 border rounded-lg transition-all duration-200 cursor-pointer ${
                            notificationForm.audience === "all" 
                              ? "border-blue-500 bg-blue-50" 
                              : "border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                          }`}>
                            <input
                              type="radio"
                              id="all"
                              name="audience"
                              value="all"
                              checked={notificationForm.audience === "all"}
                              onChange={(e) => handleInputChange("audience", e.target.value)}
                              className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-200"
                            />
                            <Label htmlFor="all" className="text-xs xs:text-sm font-medium text-gray-700 cursor-pointer">
                              <span className="hidden xs:inline">All Citizens (1,247 users)</span>
                              <span className="xs:hidden">All Citizens</span>
                            </Label>
                          </div>
                          <div className={`flex items-center space-x-2 xs:space-x-3 p-2 xs:p-3 border rounded-lg transition-all duration-200 cursor-pointer ${
                            notificationForm.audience === "location" 
                              ? "border-blue-500 bg-blue-50" 
                              : "border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                          }`}>
                            <input
                              type="radio"
                              id="location"
                              name="audience"
                              value="location"
                              checked={notificationForm.audience === "location"}
                              onChange={(e) => handleInputChange("audience", e.target.value)}
                              className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-200"
                            />
                            <Label htmlFor="location" className="text-xs xs:text-sm font-medium text-gray-700 cursor-pointer">
                              <span className="hidden xs:inline">Specific Location/District</span>
                              <span className="xs:hidden">Specific Location</span>
                            </Label>
                          </div>
                        </div>

                        {notificationForm.audience === "location" && (
                          <div className="space-y-1 xs:space-y-2">
                            <Label htmlFor="targetLocation" className="text-xs xs:text-sm font-medium text-gray-700">Target Location</Label>
                            <Select
                              value={notificationForm.targetLocation}
                              onValueChange={(value) => handleInputChange("targetLocation", value)}
                            >
                              <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 hover:border-gray-300">
                                <SelectValue placeholder="Select target location" />
                              </SelectTrigger>
                              <SelectContent className="bg-white border-gray-200 shadow-lg z-50">
                                <SelectItem value="downtown" className="hover:bg-blue-50 focus:bg-blue-50 cursor-pointer">Downtown District (234 users)</SelectItem>
                                <SelectItem value="riverside" className="hover:bg-blue-50 focus:bg-blue-50 cursor-pointer">Riverside Area (189 users)</SelectItem>
                                <SelectItem value="westside" className="hover:bg-blue-50 focus:bg-blue-50 cursor-pointer">Westside (156 users)</SelectItem>
                                <SelectItem value="north-end" className="hover:bg-blue-50 focus:bg-blue-50 cursor-pointer">North End (198 users)</SelectItem>
                                <SelectItem value="central-park" className="hover:bg-blue-50 focus:bg-blue-50 cursor-pointer">Central Park Area (145 users)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2 xs:gap-3 sm:gap-4 pt-3 xs:pt-4">
                        <Button 
                          type="submit" 
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200 hover:scale-105 focus:ring-2 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-xs xs:text-sm" 
                          disabled={isSubmitting}
                        >
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
                        <Button 
                          type="button" 
                          variant="outline" 
                          className="border-gray-200 text-gray-700 hover:bg-gray-50 transition-all duration-200 hover:scale-105 focus:ring-2 focus:ring-blue-200 text-xs xs:text-sm"
                        >
                          <span className="hidden xs:inline">Save Draft</span>
                          <span className="xs:hidden">Save</span>
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </div>

              {/* Preview */}
              <div>
                <Card className="bg-white border-0 shadow-sm hover:shadow-lg transition-all duration-300 animate-fade-in">
                  <CardHeader className="pb-2 xs:pb-3 sm:pb-4">
                    <CardTitle className="flex items-center text-sm xs:text-base sm:text-lg font-semibold text-gray-900">
                      <div className="w-6 h-6 xs:w-8 xs:h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center mr-2 xs:mr-3 shadow-lg">
                        <Bell className="w-3 h-3 xs:w-4 xs:h-4 text-white" />
                      </div>
                      Preview
                    </CardTitle>
                    <CardDescription className="text-xs xs:text-sm text-gray-500 hidden xs:block">
                      How your notification will appear to citizens
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3 xs:space-y-4">
                      <div className="p-3 xs:p-4 border border-gray-200 rounded-lg bg-gray-50/50 hover:bg-gray-50 transition-all duration-200">
                        <div className="flex items-start gap-2 xs:gap-3">
                          {notificationForm.type && getNotificationTypeIcon(notificationForm.type)}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-xs xs:text-sm text-gray-900 break-words">{notificationForm.title || "Notification Title"}</h4>
                            <p className="text-xs xs:text-sm text-gray-600 mt-1 break-words">
                              {notificationForm.message || "Your notification message will appear here..."}
                            </p>
                            <div className="flex flex-col xs:flex-row xs:items-center gap-1 xs:gap-2 mt-2">
                              {notificationForm.type && (
                                <Badge className={`${getTypeColor(notificationForm.type)} text-xs`} variant="secondary">
                                  {notificationForm.type}
                                </Badge>
                              )}
                              <span className="text-xs text-gray-500">Just now</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="text-xs xs:text-sm text-gray-600 space-y-1">
                        <p className="break-words">
                          <strong className="text-gray-700">Recipients:</strong>{" "}
                          {notificationForm.audience === "all"
                            ? "All citizens (1,247)"
                            : notificationForm.targetLocation || "Select location"}
                        </p>
                        <p>
                          <strong className="text-gray-700">Priority:</strong> {notificationForm.priority || "medium"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-3 xs:space-y-4 sm:space-y-6">
            <Card className="bg-white border-0 shadow-sm hover:shadow-lg transition-all duration-300 animate-fade-in">
              <CardHeader className="pb-2 xs:pb-3 sm:pb-4">
                <CardTitle className="flex items-center text-sm xs:text-base sm:text-lg font-semibold text-gray-900">
                  <div className="w-6 h-6 xs:w-8 xs:h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mr-2 xs:mr-3 shadow-lg">
                    <Bell className="w-3 h-3 xs:w-4 xs:h-4 text-white" />
                  </div>
                  <span className="hidden xs:inline">Sent Notifications</span>
                  <span className="xs:hidden">History</span>
                </CardTitle>
                <CardDescription className="text-xs xs:text-sm text-gray-500 hidden xs:block">
                  History of all notifications sent to citizens
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 space-y-3 xs:space-y-4">
                {sentNotifications.map((notification) => (
                  <div key={notification.id} className="flex items-start gap-2 xs:gap-4 p-3 xs:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-200 animate-fade-in">
                    <div className="flex-shrink-0 mt-1">{getNotificationTypeIcon(notification.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col xs:flex-row xs:items-start xs:justify-between mb-2 gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-xs xs:text-sm text-gray-900 break-words">{notification.title}</h4>
                          <p className="text-xs xs:text-sm text-gray-600 mt-1 break-words">{notification.message}</p>
                        </div>
                        <Badge className={`${getTypeColor(notification.type)} text-xs self-start xs:self-auto`} variant="secondary">
                          {notification.type}
                        </Badge>
                      </div>
                      <div className="flex flex-col gap-1 xs:gap-2 text-xs xs:text-sm text-gray-500">
                        <div className="flex flex-col xs:flex-row xs:items-center gap-1 xs:gap-4">
                          <span className="flex items-center">
                            <Calendar className="w-3 h-3 xs:w-4 xs:h-4 mr-1" />
                            {new Date(notification.sentDate).toLocaleDateString()}
                          </span>
                          <span className="flex items-center">
                            <Users className="w-3 h-3 xs:w-4 xs:h-4 mr-1" />
                            {notification.recipients} recipients
                          </span>
                        </div>
                        <span className="break-words">{notification.targetLocation}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
