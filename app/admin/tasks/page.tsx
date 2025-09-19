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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ListTodo,
  Clock,
  User,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  MoreVertical,
  Calendar,
  MapPin,
  Timer,
  Zap,
  Eye,
  MessageSquare,
  Upload,
} from "lucide-react";

// Mock data for tasks
const mockTasks = [
  {
    id: "ISS-1001",
    title: "Fix large pothole on Main Street",
    category: "pothole",
    priority: "high",
    status: "new",
    assignedTo: {
      name: "Amit Patel",
      avatar: "/api/placeholder/32/32",
      department: "Roads",
    },
    reportedDate: "2024-01-20T14:30:00Z",
    slaHours: 24,
    timeSpent: 2,
    location: "Main Street & 5th Ave",
    description: "Deep pothole causing traffic issues",
    photos: ["photo1.jpg", "photo2.jpg"],
    comments: 3,
  },
  {
    id: "ISS-1002", 
    title: "Repair broken streetlight",
    category: "streetlight",
    priority: "medium",
    status: "in-progress",
    assignedTo: {
      name: "Priya Sharma",
      avatar: "/api/placeholder/32/32",
      department: "Electricity",
    },
    reportedDate: "2024-01-20T12:15:00Z",
    slaHours: 48,
    timeSpent: 6,
    location: "School Street",
    description: "Street light not working, safety concern",
    photos: ["photo3.jpg"],
    comments: 5,
  },
  {
    id: "ISS-1003",
    title: "Clean overflowing garbage bin",
    category: "garbage",
    priority: "medium",
    status: "in-progress",
    assignedTo: {
      name: "Sunita Devi",
      avatar: "/api/placeholder/32/32", 
      department: "Sanitation",
    },
    reportedDate: "2024-01-19T09:45:00Z",
    slaHours: 12,
    timeSpent: 10,
    location: "Central Park",
    description: "Garbage bin overflowing, needs immediate attention",
    photos: ["photo4.jpg", "photo5.jpg", "photo6.jpg"],
    comments: 2,
  },
  {
    id: "ISS-1004",
    title: "Fix water pipe leak",
    category: "water-leak", 
    priority: "high",
    status: "resolved",
    assignedTo: {
      name: "Rajesh Kumar",
      avatar: "/api/placeholder/32/32",
      department: "Water & Sewage",
    },
    reportedDate: "2024-01-20T08:30:00Z",
    slaHours: 8,
    timeSpent: 6,
    location: "Residential Area",
    description: "Major water leak causing road damage",
    photos: ["photo7.jpg", "photo8.jpg"],
    comments: 8,
  },
];

const departments = [
  "All Departments", "Roads", "Electricity", "Sanitation", "Water & Sewage", "Traffic Management"
];

const statusColumns = [
  { 
    id: "new", 
    title: "New", 
    color: "bg-gray-100 border-gray-300",
    textColor: "text-gray-700",
    count: 0 
  },
  { 
    id: "in-progress", 
    title: "In Progress", 
    color: "bg-blue-100 border-blue-300",
    textColor: "text-blue-700",
    count: 0 
  },
  { 
    id: "review", 
    title: "Under Review", 
    color: "bg-yellow-100 border-yellow-300", 
    textColor: "text-yellow-700",
    count: 0 
  },
  { 
    id: "resolved", 
    title: "Resolved", 
    color: "bg-green-100 border-green-300",
    textColor: "text-green-700", 
    count: 0 
  },
];

export default function DepartmentTasksPage() {
  const [tasks, setTasks] = useState(mockTasks);
  const [selectedDepartment, setSelectedDepartment] = useState("All Departments");
  const [selectedStaff, setSelectedStaff] = useState("all");

  // Calculate time remaining for SLA
  const calculateSLAStatus = (reportedDate: string, slaHours: number, timeSpent: number) => {
    const reported = new Date(reportedDate);
    const now = new Date();
    const elapsed = (now.getTime() - reported.getTime()) / (1000 * 60 * 60); // hours
    const remaining = slaHours - elapsed;
    const percentageUsed = (elapsed / slaHours) * 100;
    
    return {
      remaining: Math.max(0, remaining),
      isOverdue: remaining < 0,
      percentageUsed: Math.min(100, percentageUsed),
      status: remaining < 0 ? 'overdue' : remaining < 2 ? 'critical' : remaining < 6 ? 'warning' : 'normal'
    };
  };

  const filteredTasks = tasks.filter(task => {
    const matchesDepartment = selectedDepartment === "All Departments" || 
                             task.assignedTo.department === selectedDepartment;
    const matchesStaff = selectedStaff === "all" || task.assignedTo.name === selectedStaff;
    return matchesDepartment && matchesStaff;
  });

  // Group tasks by status
  const tasksByStatus = statusColumns.map(column => ({
    ...column,
    tasks: filteredTasks.filter(task => task.status === column.id),
    count: filteredTasks.filter(task => task.status === column.id).length
  }));

  const staffMembers = Array.from(new Set(tasks.map(task => task.assignedTo.name)));

  const getSLABadgeColor = (slaStatus: any) => {
    switch (slaStatus.status) {
      case 'overdue': return 'bg-red-500 text-white';
      case 'critical': return 'bg-orange-500 text-white';
      case 'warning': return 'bg-yellow-500 text-white';
      default: return 'bg-green-500 text-white';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-green-500';
      default: return 'border-l-gray-500';
    }
  };

  const TaskCard = ({ task }: { task: any }) => {
    const slaStatus = calculateSLAStatus(task.reportedDate, task.slaHours, task.timeSpent);
    
    return (
      <Card className={`mb-3 border-l-4 ${getPriorityColor(task.priority)} hover:shadow-md transition-shadow`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h4 className="font-medium text-sm mb-1 line-clamp-2">{task.title}</h4>
              <p className="text-xs text-muted-foreground mb-2 line-clamp-1">{task.description}</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <MoreVertical className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Move to Next Stage
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Add Comment
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Proof
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {/* Task metadata */}
          <div className="space-y-2 mb-3">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1 text-muted-foreground">
                <MapPin className="w-3 h-3" />
                <span className="truncate">{task.location}</span>
              </div>
              <Badge variant="outline" className="text-xs px-1 py-0">
                {task.id}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Calendar className="w-3 h-3" />
                {new Date(task.reportedDate).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <MessageSquare className="w-3 h-3" />
                {task.comments}
              </div>
            </div>
          </div>

          {/* SLA Progress */}
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-muted-foreground">SLA Progress</span>
              <Badge className={`${getSLABadgeColor(slaStatus)} text-xs px-1 py-0`}>
                {slaStatus.isOverdue ? 'OVERDUE' : `${Math.round(slaStatus.remaining)}h left`}
              </Badge>
            </div>
            <Progress 
              value={slaStatus.percentageUsed} 
              className="h-1"
            />
          </div>

          {/* Assigned user */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar className="w-6 h-6">
                <AvatarImage src={task.assignedTo.avatar} />
                <AvatarFallback className="text-xs">
                  {task.assignedTo.name.split(" ").map(n => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-xs font-medium">{task.assignedTo.name}</p>
                <p className="text-xs text-muted-foreground">{task.assignedTo.department}</p>
              </div>
            </div>
            <Badge 
              variant={task.priority === 'high' ? 'destructive' : task.priority === 'medium' ? 'default' : 'secondary'}
              className="text-xs"
            >
              {task.priority}
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ListTodo className="w-6 h-6 text-accent" />
            Department Task View
          </h1>
          <p className="text-muted-foreground">
            Kanban-style workflow with SLA tracking for staff assignments
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <Label htmlFor="dept-filter">Department</Label>
          <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {departments.map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="staff-filter">Staff Member</Label>
          <Select value={selectedStaff} onValueChange={setSelectedStaff}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Staff</SelectItem>
              {staffMembers.map((staff) => (
                <SelectItem key={staff} value={staff}>
                  {staff}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-end">
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => {
              setSelectedDepartment("All Departments");
              setSelectedStaff("all");
            }}
          >
            Clear Filters
          </Button>
        </div>
      </div>

      {/* SLA Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Overdue Tasks</p>
                <p className="text-2xl font-bold text-red-600">
                  {filteredTasks.filter(task => 
                    calculateSLAStatus(task.reportedDate, task.slaHours, task.timeSpent).isOverdue
                  ).length}
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
                <p className="text-sm text-muted-foreground">Critical (&lt;2h)</p>
                <p className="text-2xl font-bold text-orange-600">
                  {filteredTasks.filter(task => {
                    const sla = calculateSLAStatus(task.reportedDate, task.slaHours, task.timeSpent);
                    return !sla.isOverdue && sla.status === 'critical';
                  }).length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">
                  {filteredTasks.filter(task => task.status === 'in-progress').length}
                </p>
              </div>
              <Timer className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed Today</p>
                <p className="text-2xl font-bold text-green-600">
                  {filteredTasks.filter(task => task.status === 'resolved').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {tasksByStatus.map((column) => (
          <Card key={column.id} className={`${column.color} border-2`}>
            <CardHeader className="pb-3">
              <CardTitle className={`text-lg flex items-center justify-between ${column.textColor}`}>
                <span>{column.title}</span>
                <Badge variant="secondary" className="text-xs">
                  {column.count}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {column.tasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
                {column.tasks.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm">No tasks in this column</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}