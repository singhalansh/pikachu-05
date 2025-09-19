"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import GoogleMap from "@/components/GoogleMap";
import { createClient } from "@/lib/supabase/client";
import {
  Map,
  Filter,
  Layers,
  MapPin,
  AlertTriangle,
  Clock,
  CheckCircle,
  Eye,
  Calendar,
  Zap,
  Settings,
  RefreshCw,
  Download,
} from "lucide-react";

// Mock data for issues on map
const mockMapIssues = [
  {
    id: "ISS-1001",
    title: "Large pothole on Main Street",
    category: "pothole",
    status: "submitted",
    priority: "high",
    location: "Greater Noida Expressway",
    coordinates: { lat: 28.4744, lng: 77.5040 }, // Greater Noida
    reportedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    description: "Deep pothole causing traffic issues",
    reporter: "John Doe",
    photos: 2,
  },
  {
    id: "ISS-1002", 
    title: "Broken streetlight near school",
    category: "streetlight",
    status: "in-progress",
    priority: "medium",
    location: "Knowledge Park, Greater Noida",
    coordinates: { lat: 28.4750, lng: 77.5050 }, // Greater Noida
    reportedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    description: "Street light not working, safety concern",
    reporter: "Jane Smith",
    photos: 1,
  },
  {
    id: "ISS-1003",
    title: "Overflowing garbage bin",
    category: "garbage",
    status: "resolved",
    priority: "medium", 
    location: "City Park, Greater Noida",
    coordinates: { lat: 28.4755, lng: 77.5060 }, // Greater Noida
    reportedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    description: "Garbage bin overflowing, needs immediate attention",
    reporter: "Mike Johnson",
    photos: 3,
  },
  {
    id: "ISS-1004",
    title: "Water pipe leak",
    category: "water-leak",
    status: "in-review",
    priority: "high",
    location: "Alpha Commercial Belt, Greater Noida",
    coordinates: { lat: 28.4760, lng: 77.5070 }, // Greater Noida
    reportedDate: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago 
    description: "Major water leak causing road damage",
    reporter: "Sarah Wilson",
    photos: 4,
  },
  {
    id: "ISS-1005",
    title: "Traffic signal malfunction",
    category: "traffic",
    status: "submitted",
    priority: "high",
    location: "Yamuna Expressway Junction", 
    coordinates: { lat: 28.4765, lng: 77.5080 }, // Greater Noida
    reportedDate: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
    description: "Traffic lights not working properly",
    reporter: "David Brown",
    photos: 1,
  },
];

const categories = [
  { id: "pothole", name: "Potholes", color: "#8b5cf6", icon: "🕳️" },
  { id: "streetlight", name: "Streetlights", color: "#06b6d4", icon: "💡" },
  { id: "garbage", name: "Garbage", color: "#10b981", icon: "🗑️" },
  { id: "water-leak", name: "Water Leaks", color: "#f59e0b", icon: "💧" },
  { id: "traffic", name: "Traffic", color: "#ef4444", icon: "🚦" },
  { id: "other", name: "Other", color: "#6b7280", icon: "📍" },
];

const statusOptions = [
  { id: "submitted", name: "Submitted", color: "#6b7280", icon: Clock },
  { id: "in-review", name: "In Review", color: "#f59e0b", icon: Eye },
  { id: "in-progress", name: "In Progress", color: "#06b6d4", icon: Settings },
  { id: "resolved", name: "Resolved", color: "#10b981", icon: CheckCircle },
];

const priorityOptions = [
  { id: "high", name: "High", color: "#ef4444" },
  { id: "medium", name: "Medium", color: "#f59e0b" },
  { id: "low", name: "Low", color: "#10b981" },
];

export default function IssueMapPage() {
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Debug: Log when issues state changes
  useEffect(() => {
    console.log('Issues state changed:', issues.length, 'issues');
  }, [issues]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(categories.map(c => c.id));
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(statusOptions.map(s => s.id));
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>(priorityOptions.map(p => p.id));
  const [dateRange, setDateRange] = useState("7d");
  const [heatmapEnabled, setHeatmapEnabled] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState<any>(null);
  const [mapView, setMapView] = useState("satellite"); // satellite, street, terrain

  // Fetch issues from database
  useEffect(() => {
    console.log('IssueMapPage: Component mounted, starting to fetch issues...');
    const fetchIssues = async () => {
      try {
        const supabase = createClient();
        
        // Check if user is authenticated
        const { data: { user } } = await supabase.auth.getUser();
        console.log('Current user:', user ? 'Authenticated' : 'Not authenticated');
        
        const { data, error } = await supabase
          .from('issues')
          .select(`
            id,
            title,
            description,
            category,
            status,
            priority,
            location_address,
            location_lat,
            location_lng,
            image_url,
            created_at,
            upvotes,
            user_id
          `)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching issues:', error);
          console.log('Using mock data due to database error');
          console.log('Setting mock issues:', mockMapIssues);
          // Fallback to mock data if database fails
          setIssues(mockMapIssues);
        } else {
          console.log('Raw database data:', data);
          // Transform database data to match component interface
          const transformedIssues = data?.map(issue => ({
            id: issue.id,
            title: issue.title,
            category: issue.category.toLowerCase().replace(/\s+/g, '-'),
            status: issue.status,
            priority: issue.priority,
            location: issue.location_address,
            coordinates: {
              lat: parseFloat(issue.location_lat),
              lng: parseFloat(issue.location_lng)
            },
            reportedDate: issue.created_at,
            description: issue.description,
            reporter: `User ${issue.user_id?.slice(0, 8) || 'Unknown'}`,
            photos: issue.image_url ? 1 : 0,
            upvotes: issue.upvotes || 0
          })) || [];
          
          console.log('Transformed issues:', transformedIssues);
          
          // If no real issues found, use mock data for testing
          if (transformedIssues.length === 0) {
            console.log('No real issues found, using mock data for testing');
            setIssues(mockMapIssues);
          } else {
            console.log(`Found ${transformedIssues.length} real issues from database`);
            setIssues(transformedIssues);
          }
        }
      } catch (err) {
        console.error('Error fetching issues:', err);
        // Fallback to mock data
        setIssues(mockMapIssues);
      } finally {
        setLoading(false);
      }
    };

    fetchIssues();
  }, []);

  const filteredIssues = issues.filter(issue => {
    const matchesCategory = selectedCategories.includes(issue.category);
    const matchesStatus = selectedStatuses.includes(issue.status);
    const matchesPriority = selectedPriorities.includes(issue.priority);
    
    // Date filtering
    const issueDate = new Date(issue.reportedDate);
    const now = new Date();
    let dateThreshold = new Date();
    
    switch(dateRange) {
      case "1d":
        dateThreshold.setDate(now.getDate() - 1);
        break;
      case "7d":
        dateThreshold.setDate(now.getDate() - 7);
        break;
      case "30d":
        dateThreshold.setDate(now.getDate() - 30);
        break;
      default:
        dateThreshold.setFullYear(now.getFullYear() - 1); // All time
    }
    
    const matchesDate = issueDate >= dateThreshold;
    
    return matchesCategory && matchesStatus && matchesPriority && matchesDate;
  });
  
  console.log('Final filtered issues count:', filteredIssues.length);

  const getCategoryIcon = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.icon || "📍";
  };

  const getCategoryColor = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.color || "#6b7280";
  };

  const getStatusIcon = (status: string) => {
    const statusConfig = statusOptions.find(s => s.id === status);
    const Icon = statusConfig?.icon || Clock;
    return <Icon className="w-4 h-4" />;
  };

  const getStatusColor = (status: string) => {
    return statusOptions.find(s => s.id === status)?.color || "#6b7280";
  };

  const hotspotAreas = [
    { name: "Main Street Corridor", issueCount: 15, density: "high" },
    { name: "Central Business District", issueCount: 12, density: "high" },
    { name: "Residential Zone A", issueCount: 8, density: "medium" },
    { name: "Industrial Area", issueCount: 6, density: "medium" },
    { name: "Suburban Zone", issueCount: 3, density: "low" },
  ];

  const refreshIssues = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('issues')
        .select(`
          id,
          title,
          description,
          category,
          status,
          priority,
          location_address,
          location_lat,
          location_lng,
          image_url,
          created_at,
          upvotes,
          user_id
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error refreshing issues:', error);
      } else {
        const transformedIssues = data?.map(issue => ({
          id: issue.id,
          title: issue.title,
          category: issue.category.toLowerCase().replace(/\s+/g, '-'),
          status: issue.status,
          priority: issue.priority,
          location: issue.location_address,
          coordinates: {
            lat: parseFloat(issue.location_lat),
            lng: parseFloat(issue.location_lng)
          },
          reportedDate: issue.created_at,
          description: issue.description,
          reporter: `User ${issue.user_id?.slice(0, 8) || 'Unknown'}`,
          photos: issue.image_url ? 1 : 0,
          upvotes: issue.upvotes || 0
        })) || [];
        
        setIssues(transformedIssues);
      }
    } catch (err) {
      console.error('Error refreshing issues:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Map className="w-6 h-6 text-accent" />
            Issue Map & Heatmap
          </h1>
          <p className="text-muted-foreground">
            Live city map with reported issues and intensity heatmap visualization
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={refreshIssues} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Button variant="outline" size="sm" onClick={() => {
            console.log('Loading mock data for testing');
            setIssues(mockMapIssues);
          }}>
            Load Test Data
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Panel */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Map Controls */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Map View</Label>
                <Select value={mapView} onValueChange={setMapView}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="street">Street View</SelectItem>
                    <SelectItem value="satellite">Satellite</SelectItem>
                    <SelectItem value="terrain">Terrain</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Heatmap Toggle */}
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="heatmap" 
                  checked={heatmapEnabled}
                  onCheckedChange={(checked) => setHeatmapEnabled(checked === true)}
                />
                <Label htmlFor="heatmap" className="text-sm">
                  Enable Heatmap
                </Label>
              </div>

              <Separator />

              {/* Date Range */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Time Range</Label>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1d">Last 24 hours</SelectItem>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                    <SelectItem value="all">All time</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Category Filters */}
              <div>
                <Label className="text-sm font-medium mb-3 block">Categories</Label>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <div key={category.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={category.id}
                        checked={selectedCategories.includes(category.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedCategories([...selectedCategories, category.id]);
                          } else {
                            setSelectedCategories(selectedCategories.filter(c => c !== category.id));
                          }
                        }}
                      />
                      <Label htmlFor={category.id} className="text-sm flex items-center gap-2">
                        <span>{category.icon}</span>
                        {category.name}
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: category.color }}
                        />
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Filters */}
              <div>
                <Label className="text-sm font-medium mb-3 block">Status</Label>
                <div className="space-y-2">
                  {statusOptions.map((status) => (
                    <div key={status.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={status.id}
                        checked={selectedStatuses.includes(status.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedStatuses([...selectedStatuses, status.id]);
                          } else {
                            setSelectedStatuses(selectedStatuses.filter(s => s !== status.id));
                          }
                        }}
                      />
                      <Label htmlFor={status.id} className="text-sm flex items-center gap-2">
                        {getStatusIcon(status.id)}
                        {status.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Priority Filters */}
              <div>
                <Label className="text-sm font-medium mb-3 block">Priority</Label>
                <div className="space-y-2">
                  {priorityOptions.map((priority) => (
                    <div key={priority.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={priority.id}
                        checked={selectedPriorities.includes(priority.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedPriorities([...selectedPriorities, priority.id]);
                          } else {
                            setSelectedPriorities(selectedPriorities.filter(p => p !== priority.id));
                          }
                        }}
                      />
                      <Label htmlFor={priority.id} className="text-sm flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: priority.color }}
                        />
                        {priority.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Hotspots */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-lg">Issue Hotspots</CardTitle>
              <CardDescription>Areas with highest issue density</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {hotspotAreas.map((area, index) => (
                  <div key={area.name} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium text-sm">{area.name}</h4>
                      <p className="text-xs text-muted-foreground">{area.issueCount} issues</p>
                    </div>
                    <Badge 
                      variant={area.density === "high" ? "destructive" : area.density === "medium" ? "default" : "secondary"}
                    >
                      {area.density}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Map and Issue Details */}
        <div className="lg:col-span-3">
          {/* Map Container */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Live Issue Map</span>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Layers className="w-4 h-4" />
                  {loading ? 'Loading...' : `${filteredIssues.length} issues shown`}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96 relative">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                      <p className="text-sm text-gray-600">Loading issues...</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <GoogleMap
                      issues={filteredIssues}
                      selectedIssue={selectedIssue}
                      onIssueSelect={setSelectedIssue}
                      heatmapEnabled={heatmapEnabled}
                      mapView={mapView}
                      className="w-full h-full"
                    />
                    {/* Debug info */}
                    <div className="absolute top-2 left-2 bg-black bg-opacity-75 text-white text-xs p-2 rounded">
                      Issues: {issues.length} | Filtered: {filteredIssues.length}
                      <br />
                      Loading: {loading ? 'Yes' : 'No'}
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Selected Issue Details */}
          {selectedIssue && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Issue Details
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setSelectedIssue(null)}
                  >
                    ×
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium mb-2">{selectedIssue.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {selectedIssue.description}
                    </p>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        {selectedIssue.location}
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        {new Date(selectedIssue.reportedDate).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Reporter:</span>
                        {selectedIssue.reporter}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Badge style={{ backgroundColor: getCategoryColor(selectedIssue.category) }}>
                        {getCategoryIcon(selectedIssue.category)} {categories.find(c => c.id === selectedIssue.category)?.name}
                      </Badge>
                      <Badge style={{ backgroundColor: getStatusColor(selectedIssue.status) }}>
                        {getStatusIcon(selectedIssue.status)}
                        <span className="ml-1">{statusOptions.find(s => s.id === selectedIssue.status)?.name}</span>
                      </Badge>
                      <Badge 
                        variant={selectedIssue.priority === "high" ? "destructive" : "default"}
                      >
                        {selectedIssue.priority}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{selectedIssue.photos} photos attached</span>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm">Assign</Button>
                      <Button variant="outline" size="sm">View Full Details</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}