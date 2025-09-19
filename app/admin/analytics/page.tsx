"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import {
  TrendingUp,
  Download,
  FileText,
  Calendar,
  Clock,
  Target,
  Activity,
  BarChart3,
  MapPin,
  Users,
  CheckCircle,
  AlertTriangle,
  Timer,
} from "lucide-react";

// Mock data for analytics
const monthlyTrends = [
  { month: "Jan", reported: 145, resolved: 134, avgResponseTime: 4.2 },
  { month: "Feb", reported: 156, resolved: 142, avgResponseTime: 3.8 },
  { month: "Mar", responded: 178, resolved: 165, avgResponseTime: 4.1 },
  { month: "Apr", reported: 134, resolved: 128, avgResponseTime: 3.9 },
  { month: "May", reported: 198, resolved: 189, avgResponseTime: 3.5 },
  { month: "Jun", reported: 167, resolved: 156, avgResponseTime: 4.0 },
  { month: "Jul", reported: 189, resolved: 176, avgResponseTime: 3.7 },
  { month: "Aug", reported: 212, resolved: 198, avgResponseTime: 3.6 },
  { month: "Sep", reported: 195, resolved: 188, avgResponseTime: 3.8 },
  { month: "Oct", reported: 234, resolved: 221, avgResponseTime: 3.4 },
  { month: "Nov", reported: 201, resolved: 194, avgResponseTime: 3.9 },
  { month: "Dec", reported: 178, resolved: 171, avgResponseTime: 4.2 },
];

const categoryPerformance = [
  { category: "Potholes", reported: 342, resolved: 298, percentage: 87.1, avgTime: 2.8 },
  { category: "Streetlights", reported: 298, resolved: 271, percentage: 90.9, avgTime: 1.6 },
  { category: "Garbage", reported: 256, resolved: 238, percentage: 92.9, avgTime: 0.8 },
  { category: "Water Leaks", reported: 134, resolved: 118, percentage: 88.1, avgTime: 1.2 },
  { category: "Traffic", reported: 89, resolved: 76, percentage: 85.4, avgTime: 3.2 },
  { category: "Other", reported: 128, resolved: 112, percentage: 87.5, avgTime: 2.1 },
];

const departmentEfficiency = [
  { 
    department: "Sanitation", 
    totalAssigned: 256, 
    completed: 238, 
    efficiency: 92.9,
    avgTime: 0.8,
    slaCompliance: 94.5 
  },
  { 
    department: "Electricity", 
    totalAssigned: 298, 
    completed: 271, 
    efficiency: 90.9,
    avgTime: 1.6,
    slaCompliance: 89.2 
  },
  { 
    department: "Water & Sewage", 
    totalAssigned: 134, 
    completed: 118, 
    efficiency: 88.1,
    avgTime: 1.2,
    slaCompliance: 91.8 
  },
  { 
    department: "Roads", 
    totalAssigned: 342, 
    completed: 298, 
    efficiency: 87.1,
    avgTime: 2.8,
    slaCompliance: 82.3 
  },
  { 
    department: "Traffic Management", 
    totalAssigned: 89, 
    completed: 76, 
    efficiency: 85.4,
    avgTime: 3.2,
    slaCompliance: 78.9 
  },
];

const hotspotData = [
  { area: "Main Street Corridor", issues: 45, resolved: 38, severity: "high" },
  { area: "Central Business District", issues: 32, resolved: 29, severity: "high" },
  { area: "Industrial Zone", issues: 28, resolved: 25, severity: "medium" },
  { area: "Residential Area A", issues: 22, resolved: 20, severity: "medium" },
  { area: "Suburban Zone", issues: 15, resolved: 14, severity: "low" },
  { area: "Highway Junction", issues: 18, resolved: 15, severity: "medium" },
  { area: "School District", issues: 12, resolved: 12, severity: "low" },
  { area: "Hospital Area", issues: 8, resolved: 8, severity: "low" },
];

const slaPerformance = [
  { timeRange: "0-2 hours", count: 45, percentage: 32.1 },
  { timeRange: "2-6 hours", count: 38, percentage: 27.1 },
  { timeRange: "6-12 hours", count: 28, percentage: 20.0 },
  { timeRange: "12-24 hours", count: 18, percentage: 12.9 },
  { timeRange: "24+ hours", count: 11, percentage: 7.9 },
];

const COLORS = ['#10b981', '#06b6d4', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("12m");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedMetric, setSelectedMetric] = useState("response-time");

  const totalIssues = categoryPerformance.reduce((sum, cat) => sum + cat.reported, 0);
  const totalResolved = categoryPerformance.reduce((sum, cat) => sum + cat.resolved, 0);
  const overallResolutionRate = ((totalResolved / totalIssues) * 100).toFixed(1);
  const avgResponseTime = (categoryPerformance.reduce((sum, cat) => sum + (cat.avgTime * cat.reported), 0) / totalIssues).toFixed(1);

  const exportData = (format: 'csv' | 'pdf') => {
    // Export functionality would be implemented here
    console.log(`Exporting data in ${format.toUpperCase()} format...`);
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-accent" />
            Analytics & Reports
          </h1>
          <p className="text-muted-foreground">
            Comprehensive data insights and performance metrics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => exportData('csv')}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportData('pdf')}>
            <FileText className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <Label htmlFor="time-range">Time Range</Label>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1m">Last Month</SelectItem>
              <SelectItem value="3m">Last 3 Months</SelectItem>
              <SelectItem value="6m">Last 6 Months</SelectItem>
              <SelectItem value="12m">Last Year</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="department">Department</Label>
          <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              <SelectItem value="sanitation">Sanitation</SelectItem>
              <SelectItem value="electricity">Electricity</SelectItem>
              <SelectItem value="roads">Roads</SelectItem>
              <SelectItem value="water">Water & Sewage</SelectItem>
              <SelectItem value="traffic">Traffic Management</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="metric">Primary Metric</Label>
          <Select value={selectedMetric} onValueChange={setSelectedMetric}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="response-time">Response Time</SelectItem>
              <SelectItem value="resolution-rate">Resolution Rate</SelectItem>
              <SelectItem value="sla-compliance">SLA Compliance</SelectItem>
              <SelectItem value="citizen-satisfaction">Citizen Satisfaction</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Issues</p>
                <p className="text-2xl font-bold">{totalIssues.toLocaleString()}</p>
                <p className="text-xs text-green-600 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +12.5% from last month
                </p>
              </div>
              <Activity className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Resolution Rate</p>
                <p className="text-2xl font-bold">{overallResolutionRate}%</p>
                <p className="text-xs text-green-600 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +2.3% from last month
                </p>
              </div>
              <Target className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Response Time</p>
                <p className="text-2xl font-bold">{avgResponseTime} days</p>
                <p className="text-xs text-green-600 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  -0.3 days improvement
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
                <p className="text-sm text-muted-foreground">Citizen Satisfaction</p>
                <p className="text-2xl font-bold">87.2%</p>
                <p className="text-xs text-green-600 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +1.8% from last month
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Monthly Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Issue Trends</CardTitle>
            <CardDescription>Issues reported vs resolved over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="reported" 
                    stroke="#ef4444" 
                    strokeWidth={2} 
                    name="Reported"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="resolved" 
                    stroke="#10b981" 
                    strokeWidth={2} 
                    name="Resolved"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Category Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Category Performance</CardTitle>
            <CardDescription>Resolution rates by issue category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="percentage" fill="#10b981" name="Resolution %" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Department Performance and SLA Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Department Efficiency */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Department Efficiency</CardTitle>
            <CardDescription>Performance metrics by department</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {departmentEfficiency.map((dept) => (
                <div key={dept.department} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{dept.department}</h4>
                    <Badge variant={dept.efficiency > 90 ? "default" : dept.efficiency > 85 ? "secondary" : "destructive"}>
                      {dept.efficiency}% efficiency
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground mb-2">
                    <div>Assigned: {dept.totalAssigned}</div>
                    <div>Completed: {dept.completed}</div>
                    <div>Avg Time: {dept.avgTime} days</div>
                  </div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span>SLA Compliance</span>
                    <span>{dept.slaCompliance}%</span>
                  </div>
                  <Progress value={dept.slaCompliance} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* SLA Performance Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>SLA Performance</CardTitle>
            <CardDescription>Response time distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={slaPerformance}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="percentage"
                  >
                    {slaPerformance.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2">
              {slaPerformance.map((item, index) => (
                <div key={item.timeRange} className="flex items-center text-sm">
                  <div 
                    className="w-3 h-3 rounded-full mr-2" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="flex-1">{item.timeRange}</span>
                  <span className="font-medium">{item.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Hotspots Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Issue Hotspots Analysis</CardTitle>
          <CardDescription>Areas with highest issue density and resolution rates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {hotspotData.map((spot) => (
              <div key={spot.area} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-sm">{spot.area}</h4>
                  <Badge 
                    variant={spot.severity === 'high' ? 'destructive' : spot.severity === 'medium' ? 'default' : 'secondary'}
                  >
                    {spot.severity}
                  </Badge>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Issues:</span>
                    <span className="font-medium">{spot.issues}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Resolved:</span>
                    <span className="font-medium">{spot.resolved}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Success Rate:</span>
                    <span className="font-medium">{((spot.resolved / spot.issues) * 100).toFixed(1)}%</span>
                  </div>
                </div>
                <Progress 
                  value={(spot.resolved / spot.issues) * 100} 
                  className="h-2 mt-2" 
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}