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
  Eye,
  Image,
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  Star,
  Download,
  Share2,
  Filter,
  Search,
  Users,
  BarChart3,
  TrendingUp,
  Award,
  Target,
  Globe,
  Shield,
  Zap,
} from "lucide-react";

// Mock data for resolved issues gallery
const mockResolvedIssues = [
  {
    id: "ISS-1001",
    title: "Large pothole fixed on Main Street",
    category: "pothole",
    location: "Main Street & 5th Ave",
    resolvedDate: "2024-01-18T14:30:00Z",
    resolutionTime: "2.5 days",
    beforePhoto: "/api/placeholder/300/200",
    afterPhoto: "/api/placeholder/300/200",
    description: "Deep pothole causing traffic issues - completely repaired with asphalt",
    resolvedBy: {
      name: "Amit Patel",
      department: "Roads",
      avatar: "/api/placeholder/32/32"
    },
    citizenRating: 4.8,
    publicRating: 4.6,
    cost: "₹12,500",
    materials: ["Asphalt", "Road marking paint"],
    isPublic: true,
  },
  {
    id: "ISS-1002",
    title: "Broken streetlight repaired near school",
    category: "streetlight",
    location: "School Street",
    resolvedDate: "2024-01-19T16:45:00Z",
    resolutionTime: "1.2 days",
    beforePhoto: "/api/placeholder/300/200",
    afterPhoto: "/api/placeholder/300/200",
    description: "Faulty streetlight replaced with LED fixture for better illumination",
    resolvedBy: {
      name: "Priya Sharma",
      department: "Electricity",
      avatar: "/api/placeholder/32/32"
    },
    citizenRating: 5.0,
    publicRating: 4.9,
    cost: "₹3,200",
    materials: ["LED street light", "Electrical wiring"],
    isPublic: true,
  },
  {
    id: "ISS-1003",
    title: "Garbage collection improved in residential area",
    category: "garbage",
    location: "Green Valley Society",
    resolvedDate: "2024-01-20T09:30:00Z",
    resolutionTime: "0.8 days",
    beforePhoto: "/api/placeholder/300/200",
    afterPhoto: "/api/placeholder/300/200",
    description: "Additional garbage bins installed and collection frequency increased",
    resolvedBy: {
      name: "Sunita Devi",
      department: "Sanitation",
      avatar: "/api/placeholder/32/32"
    },
    citizenRating: 4.5,
    publicRating: 4.3,
    cost: "₹8,600",
    materials: ["Garbage bins", "Collection vehicle fuel"],
    isPublic: true,
  },
];

// Mock data for accountability board
const mockAccountabilityData = {
  monthlyStats: {
    totalIssues: 234,
    resolved: 198,
    resolutionRate: 84.6,
    avgResolutionTime: 2.3,
    citizenSatisfaction: 4.2,
    budget: {
      allocated: 2500000,
      used: 1890000,
      percentage: 75.6
    }
  },
  departmentPerformance: [
    {
      department: "Sanitation",
      resolved: 67,
      target: 70,
      efficiency: 95.7,
      rating: 4.8,
      budget: { allocated: 500000, used: 380000 }
    },
    {
      department: "Roads",
      resolved: 45,
      target: 55,
      efficiency: 81.8,
      rating: 4.2,
      budget: { allocated: 800000, used: 620000 }
    },
    {
      department: "Electricity",
      resolved: 52,
      target: 50,
      efficiency: 104.0,
      rating: 4.9,
      budget: { allocated: 400000, used: 290000 }
    },
    {
      department: "Water & Sewage",
      resolved: 34,
      target: 40,
      efficiency: 85.0,
      rating: 4.0,
      budget: { allocated: 600000, used: 450000 }
    },
  ],
  publicCommitments: [
    {
      id: "1",
      commitment: "All pothole issues to be resolved within 48 hours",
      progress: 87.5,
      deadline: "2024-03-31T00:00:00Z",
      responsible: "Roads Department",
      status: "on-track"
    },
    {
      id: "2", 
      commitment: "100% street light functionality in residential areas",
      progress: 94.2,
      deadline: "2024-02-28T00:00:00Z",
      responsible: "Electricity Department",
      status: "ahead"
    },
    {
      id: "3",
      commitment: "Daily garbage collection in all wards",
      progress: 78.3,
      deadline: "2024-04-15T00:00:00Z",
      responsible: "Sanitation Department", 
      status: "at-risk"
    },
  ]
};

export default function TransparencyPage() {
  const [activeTab, setActiveTab] = useState("gallery");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIssue, setSelectedIssue] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const filteredIssues = mockResolvedIssues.filter(issue => {
    const matchesCategory = selectedCategory === "all" || issue.category === selectedCategory;
    const matchesSearch = issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         issue.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch && issue.isPublic;
  });

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 95) return "text-green-600";
    if (efficiency >= 85) return "text-yellow-600";
    return "text-red-600";
  };

  const getCommitmentStatusColor = (status: string) => {
    switch (status) {
      case "ahead": return "bg-green-500 text-white";
      case "on-track": return "bg-blue-500 text-white";
      case "at-risk": return "bg-yellow-500 text-white";
      case "behind": return "bg-red-500 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return "1 day ago";
    return `${diffInDays} days ago`;
  };

  const openIssueDetail = (issue: any) => {
    setSelectedIssue(issue);
    setIsDetailOpen(true);
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Eye className="w-6 h-6 text-accent" />
            Transparency Dashboard
          </h1>
          <p className="text-muted-foreground">
            Public accountability and resolved issues showcase
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Share2 className="w-4 h-4 mr-2" />
            Share Board
          </Button>
          <Button variant="outline" size="sm">
            <Globe className="w-4 h-4 mr-2" />
            Public View
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="gallery">Resolved Issues Gallery</TabsTrigger>
          <TabsTrigger value="accountability">Public Accountability Board</TabsTrigger>
        </TabsList>

        {/* Resolved Issues Gallery */}
        <TabsContent value="gallery">
          <div className="space-y-6">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search resolved issues..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="pothole">Potholes</SelectItem>
                  <SelectItem value="streetlight">Streetlights</SelectItem>
                  <SelectItem value="garbage">Garbage</SelectItem>
                  <SelectItem value="water-leak">Water Leaks</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="w-4 h-4 text-green-500" />
                {filteredIssues.length} resolved issues
              </div>
            </div>

            {/* Issues Gallery Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredIssues.map((issue) => (
                <Card key={issue.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => openIssueDetail(issue)}>
                  <CardContent className="p-0">
                    {/* Before/After Images */}
                    <div className="relative">
                      <div className="grid grid-cols-2 gap-0">
                        <div className="relative">
                          <img 
                            src={issue.beforePhoto} 
                            alt="Before" 
                            className="w-full h-32 object-cover rounded-tl-lg"
                          />
                          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                            Before
                          </div>
                        </div>
                        <div className="relative">
                          <img 
                            src={issue.afterPhoto} 
                            alt="After" 
                            className="w-full h-32 object-cover rounded-tr-lg"
                          />
                          <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                            After
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Issue Details */}
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="text-xs">
                          {issue.id}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs font-medium">{issue.publicRating}</span>
                        </div>
                      </div>
                      
                      <h3 className="font-medium text-sm mb-2 line-clamp-2">{issue.title}</h3>
                      
                      <div className="space-y-1 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span className="truncate">{issue.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>Resolved in {issue.resolutionTime}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{formatTimeAgo(issue.resolvedDate)}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-3 pt-2 border-t">
                        <div className="flex items-center gap-2">
                          <Avatar className="w-5 h-5">
                            <AvatarImage src={issue.resolvedBy.avatar} />
                            <AvatarFallback className="text-xs">
                              {issue.resolvedBy.name.split(" ").map(n => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-muted-foreground">{issue.resolvedBy.department}</span>
                        </div>
                        <div className="text-xs font-medium text-green-600">
                          {issue.cost}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredIssues.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Image className="w-12 h-12 mx-auto mb-4" />
                <p>No resolved issues found matching your criteria</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Public Accountability Board */}
        <TabsContent value="accountability">
          <div className="space-y-6">
            {/* Overall Performance Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Resolution Rate</p>
                      <p className="text-2xl font-bold">{mockAccountabilityData.monthlyStats.resolutionRate}%</p>
                      <p className="text-xs text-green-600">
                        {mockAccountabilityData.monthlyStats.resolved}/{mockAccountabilityData.monthlyStats.totalIssues} issues
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
                      <p className="text-sm text-muted-foreground">Avg Resolution Time</p>
                      <p className="text-2xl font-bold">{mockAccountabilityData.monthlyStats.avgResolutionTime} days</p>
                      <p className="text-xs text-green-600">18% improvement</p>
                    </div>
                    <Clock className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Citizen Satisfaction</p>
                      <p className="text-2xl font-bold">{mockAccountabilityData.monthlyStats.citizenSatisfaction}/5.0</p>
                      <p className="text-xs text-green-600">+0.3 this month</p>
                    </div>
                    <Star className="w-8 h-8 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Budget Utilization</p>
                      <p className="text-2xl font-bold">{mockAccountabilityData.monthlyStats.budget.percentage}%</p>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(mockAccountabilityData.monthlyStats.budget.used)} used
                      </p>
                    </div>
                    <BarChart3 className="w-8 h-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Department Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Department Performance Scorecard</CardTitle>
                <CardDescription>
                  Monthly performance metrics for transparency and accountability
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockAccountabilityData.departmentPerformance.map((dept, index) => (
                    <div key={dept.department} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium">{dept.department}</h3>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-sm font-medium">
                              {dept.resolved}/{dept.target} issues
                            </div>
                            <div className={`text-xs ${getEfficiencyColor(dept.efficiency)}`}>
                              {dept.efficiency}% efficiency
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium">{dept.rating}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Progress:</span>
                          <div className="mt-1">
                            <div className="w-full bg-muted rounded-full h-2">
                              <div 
                                className="bg-accent h-2 rounded-full" 
                                style={{ width: `${(dept.resolved / dept.target) * 100}%` }}
                              />
                            </div>
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Budget:</span>
                          <div className="mt-1">
                            <span className="font-medium">
                              {formatCurrency(dept.budget.used)} / {formatCurrency(dept.budget.allocated)}
                            </span>
                            <div className="text-xs text-muted-foreground">
                              {((dept.budget.used / dept.budget.allocated) * 100).toFixed(1)}% utilized
                            </div>
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Status:</span>
                          <div className="mt-1">
                            <Badge 
                              className={dept.efficiency >= 95 ? "bg-green-500 text-white" : 
                                        dept.efficiency >= 85 ? "bg-yellow-500 text-white" : 
                                        "bg-red-500 text-white"}
                            >
                              {dept.efficiency >= 95 ? "Excellent" : 
                               dept.efficiency >= 85 ? "Good" : "Needs Improvement"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Public Commitments */}
            <Card>
              <CardHeader>
                <CardTitle>Public Commitments & Targets</CardTitle>
                <CardDescription>
                  Trackable commitments made to citizens with progress updates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockAccountabilityData.publicCommitments.map((commitment) => (
                    <div key={commitment.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-medium mb-1">{commitment.commitment}</h4>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>By {commitment.responsible}</span>
                            <span>Deadline: {new Date(commitment.deadline).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <Badge className={getCommitmentStatusColor(commitment.status)}>
                          {commitment.status.replace('-', ' ')}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Progress</span>
                          <span className="font-medium">{commitment.progress}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              commitment.status === 'ahead' ? 'bg-green-500' :
                              commitment.status === 'on-track' ? 'bg-blue-500' :
                              commitment.status === 'at-risk' ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${commitment.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Issue Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedIssue?.title}</DialogTitle>
            <DialogDescription>
              Issue {selectedIssue?.id} - Resolved by {selectedIssue?.resolvedBy.department}
            </DialogDescription>
          </DialogHeader>
          {selectedIssue && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Before</h4>
                  <img 
                    src={selectedIssue.beforePhoto} 
                    alt="Before" 
                    className="w-full h-48 object-cover rounded"
                  />
                </div>
                <div>
                  <h4 className="font-medium mb-2">After</h4>
                  <img 
                    src={selectedIssue.afterPhoto} 
                    alt="After" 
                    className="w-full h-48 object-cover rounded"
                  />
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-sm text-muted-foreground">{selectedIssue.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-medium mb-1">Resolution Details</h4>
                  <div className="space-y-1 text-muted-foreground">
                    <div>Time taken: {selectedIssue.resolutionTime}</div>
                    <div>Cost: {selectedIssue.cost}</div>
                    <div>Materials: {selectedIssue.materials.join(", ")}</div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Ratings</h4>
                  <div className="space-y-1 text-muted-foreground">
                    <div>Citizen Rating: ⭐ {selectedIssue.citizenRating}/5.0</div>
                    <div>Public Rating: ⭐ {selectedIssue.publicRating}/5.0</div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
              Close
            </Button>
            <Button>
              <Share2 className="w-4 h-4 mr-2" />
              Share Success Story
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}