"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
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
  Clock,
  AlertTriangle,
  ArrowUp,
  Bell,
  Send,
  User,
  Calendar,
  MapPin,
  Timer,
  Zap,
  CheckCircle,
  XCircle,
  MessageSquare,
  Phone,
  Mail,
} from "lucide-react";

// Mock data for escalation issues
const mockEscalationIssues = [
  {
    id: "ISS-1001",
    title: "Major pothole blocking traffic",
    category: "pothole",
    priority: "high",
    status: "overdue",
    assignedTo: {
      name: "Amit Patel",
      avatar: "/api/placeholder/32/32",
      department: "Roads",
      role: "staff",
      phone: "+91 98765 43210",
      email: "amit.roads@civic.gov"
    },
    reportedDate: "2024-01-18T14:30:00Z",
    slaHours: 24,
    overdueHours: 16,
    location: "Main Street & 5th Ave",
    escalationLevel: 1,
    escalatedTo: {
      name: "Priya Sharma",
      role: "Department Head",
      department: "Roads"
    },
    lastReminder: "2024-01-20T10:00:00Z",
    reminderCount: 3,
    description: "Deep pothole causing severe traffic congestion and safety hazards",
    citizenReports: 15,
  },
  {
    id: "ISS-1002", 
    title: "Water main burst flooding residential area",
    category: "water-leak",
    priority: "critical",
    status: "overdue",
    assignedTo: {
      name: "Rajesh Kumar",
      avatar: "/api/placeholder/32/32",
      department: "Water & Sewage",
      role: "department_head",
      phone: "+91 98765 43211",
      email: "rajesh.water@civic.gov"
    },
    reportedDate: "2024-01-19T08:30:00Z",
    slaHours: 8,
    overdueHours: 28,
    location: "Green Valley Residential Complex",
    escalationLevel: 2,
    escalatedTo: {
      name: "Municipal Commissioner",
      role: "Commissioner",
      department: "Administration"
    },
    lastReminder: "2024-01-20T14:00:00Z",
    reminderCount: 5,
    description: "Major water main burst causing flooding and service disruption",
    citizenReports: 42,
  },
  {
    id: "ISS-1003",
    title: "Street lights out in entire sector",
    category: "streetlight",
    priority: "high",
    status: "critical",
    assignedTo: {
      name: "Sunita Devi",
      avatar: "/api/placeholder/32/32",
      department: "Electricity",
      role: "staff",
      phone: "+91 98765 43212",
      email: "sunita.electric@civic.gov"
    },
    reportedDate: "2024-01-20T06:00:00Z",
    slaHours: 48,
    overdueHours: 0,
    location: "Sector 15 - All Streets",
    escalationLevel: 0,
    escalatedTo: null,
    lastReminder: "2024-01-20T12:00:00Z",
    reminderCount: 2,
    description: "Power outage affecting all street lighting in residential sector",
    citizenReports: 28,
  },
];

const escalationRules = [
  {
    category: "pothole",
    slaHours: 24,
    reminderIntervals: [6, 12, 18], // hours
    escalationLevels: [
      { level: 1, role: "Department Head", afterHours: 24 },
      { level: 2, role: "Commissioner", afterHours: 48 },
    ]
  },
  {
    category: "water-leak",
    slaHours: 8,
    reminderIntervals: [2, 4, 6],
    escalationLevels: [
      { level: 1, role: "Department Head", afterHours: 8 },
      { level: 2, role: "Commissioner", afterHours: 16 },
    ]
  },
  {
    category: "streetlight",
    slaHours: 48,
    reminderIntervals: [12, 24, 36],
    escalationLevels: [
      { level: 1, role: "Department Head", afterHours: 48 },
      { level: 2, role: "Commissioner", afterHours: 72 },
    ]
  },
];

export default function EscalationSystemPage() {
  const [issues, setIssues] = useState(mockEscalationIssues);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [isReminderOpen, setIsReminderOpen] = useState(false);
  const [isEscalateOpen, setIsEscalateOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<any>(null);
  const [reminderMessage, setReminderMessage] = useState("");

  const filteredIssues = issues.filter(issue => {
    const matchesCategory = selectedCategory === "all" || issue.category === selectedCategory;
    const matchesStatus = selectedStatus === "all" || issue.status === selectedStatus;
    return matchesCategory && matchesStatus;
  });

  const getEscalationLevelColor = (level: number) => {
    switch (level) {
      case 0: return "bg-green-500";
      case 1: return "bg-yellow-500";
      case 2: return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "overdue": return "bg-red-500 text-white";
      case "critical": return "bg-orange-500 text-white";
      case "warning": return "bg-yellow-500 text-white";
      default: return "bg-green-500 text-white";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical": return "border-l-red-600";
      case "high": return "border-l-red-500";
      case "medium": return "border-l-yellow-500";
      case "low": return "border-l-green-500";
      default: return "border-l-gray-500";
    }
  };

  const sendReminder = (issue: any) => {
    setSelectedIssue(issue);
    setReminderMessage(
      `Reminder: Issue ${issue.id} "${issue.title}" is ${issue.status === 'overdue' ? 'overdue by ' + issue.overdueHours + ' hours' : 'approaching SLA deadline'}. Please provide an immediate update on the resolution status.`
    );
    setIsReminderOpen(true);
  };

  const escalateIssue = (issue: any) => {
    setSelectedIssue(issue);
    setIsEscalateOpen(true);
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
            <Clock className="w-6 h-6 text-accent" />
            Escalation System
          </h1>
          <p className="text-muted-foreground">
            Auto-reminders and escalation management for overdue issues
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <Label htmlFor="category-filter">Category</Label>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="pothole">Potholes</SelectItem>
              <SelectItem value="streetlight">Streetlights</SelectItem>
              <SelectItem value="water-leak">Water Leaks</SelectItem>
              <SelectItem value="garbage">Garbage</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="status-filter">Status</Label>
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-end">
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => {
              setSelectedCategory("all");
              setSelectedStatus("all");
            }}
          >
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Overdue Issues</p>
                <p className="text-2xl font-bold text-red-600">
                  {issues.filter(i => i.status === 'overdue').length}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Level 1 Escalations</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {issues.filter(i => i.escalationLevel === 1).length}
                </p>
              </div>
              <ArrowUp className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Level 2 Escalations</p>
                <p className="text-2xl font-bold text-red-600">
                  {issues.filter(i => i.escalationLevel === 2).length}
                </p>
              </div>
              <Zap className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Reminders Sent</p>
                <p className="text-2xl font-bold text-blue-600">
                  {issues.reduce((sum, issue) => sum + issue.reminderCount, 0)}
                </p>
              </div>
              <Bell className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Issues List */}
      <Card>
        <CardHeader>
          <CardTitle>Issues Requiring Attention ({filteredIssues.length})</CardTitle>
          <CardDescription>
            Issues that are overdue or approaching SLA deadlines
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredIssues.map((issue) => (
              <Card key={issue.id} className={`border-l-4 ${getPriorityColor(issue.priority)}`}>
                <CardContent className="p-4">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    {/* Issue Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium">{issue.title}</h3>
                        <Badge className={getStatusColor(issue.status)}>
                          {issue.status === 'overdue' ? `Overdue ${issue.overdueHours}h` : issue.status}
                        </Badge>
                        <Badge 
                          className={`${getEscalationLevelColor(issue.escalationLevel)} text-white`}
                        >
                          L{issue.escalationLevel}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-3">
                        {issue.description}
                      </p>

                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span className="truncate">{issue.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          {new Date(issue.reportedDate).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Timer className="w-4 h-4 text-muted-foreground" />
                          SLA: {issue.slaHours}h
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4 text-muted-foreground" />
                          {issue.citizenReports} reports
                        </div>
                      </div>
                    </div>

                    {/* Assigned User */}
                    <div className="flex items-center gap-3 lg:min-w-0 lg:w-64">
                      <Avatar>
                        <AvatarImage src={issue.assignedTo.avatar} />
                        <AvatarFallback>
                          {issue.assignedTo.name.split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{issue.assignedTo.name}</p>
                        <p className="text-xs text-muted-foreground">{issue.assignedTo.department}</p>
                        <p className="text-xs text-muted-foreground">
                          Last reminder: {formatTimeAgo(issue.lastReminder)} ({issue.reminderCount}x)
                        </p>
                      </div>
                    </div>

                    {/* Escalation Info */}
                    <div className="lg:min-w-0 lg:w-48">
                      {issue.escalatedTo && (
                        <div className="text-sm">
                          <p className="font-medium">Escalated to:</p>
                          <p className="text-muted-foreground">{issue.escalatedTo.name}</p>
                          <p className="text-xs text-muted-foreground">{issue.escalatedTo.role}</p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 lg:flex-col lg:min-w-0 lg:w-32">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 lg:flex-none"
                        onClick={() => sendReminder(issue)}
                      >
                        <Bell className="w-4 h-4 mr-2" />
                        Remind
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 lg:flex-none"
                        onClick={() => escalateIssue(issue)}
                      >
                        <ArrowUp className="w-4 h-4 mr-2" />
                        Escalate
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredIssues.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="w-12 h-12 mx-auto mb-2" />
                <p>No issues requiring escalation</p>
                <p className="text-sm">All issues are within SLA limits</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Send Reminder Dialog */}
      <Dialog open={isReminderOpen} onOpenChange={setIsReminderOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Reminder</DialogTitle>
            <DialogDescription>
              Send a reminder notification for issue {selectedIssue?.id}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reminder-message">Message</Label>
              <Textarea
                id="reminder-message"
                value={reminderMessage}
                onChange={(e) => setReminderMessage(e.target.value)}
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="email-reminder" defaultChecked />
                <Label htmlFor="email-reminder" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Send via Email
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="sms-reminder" defaultChecked />
                <Label htmlFor="sms-reminder" className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Send via SMS
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="call-reminder" />
                <Label htmlFor="call-reminder" className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Schedule Phone Call
                </Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReminderOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              // Send reminder logic here
              setIsReminderOpen(false);
            }}>
              <Send className="w-4 h-4 mr-2" />
              Send Reminder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Escalate Issue Dialog */}
      <Dialog open={isEscalateOpen} onOpenChange={setIsEscalateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Escalate Issue</DialogTitle>
            <DialogDescription>
              Escalate issue {selectedIssue?.id} to a higher authority
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="escalate-to">Escalate To</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select escalation target" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dept-head">Department Head</SelectItem>
                  <SelectItem value="commissioner">Municipal Commissioner</SelectItem>
                  <SelectItem value="mayor">Mayor's Office</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="escalation-reason">Reason for Escalation</Label>
              <Textarea
                id="escalation-reason"
                placeholder="Describe why this issue needs to be escalated..."
                rows={3}
              />
            </div>
            <div className="text-sm text-muted-foreground">
              <p>This will notify the selected authority and update the escalation level.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEscalateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              // Escalation logic here
              setIsEscalateOpen(false);
            }}>
              <ArrowUp className="w-4 h-4 mr-2" />
              Escalate Issue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}