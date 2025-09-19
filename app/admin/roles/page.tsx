"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  UserCog,
  Shield,
  Users,
  Building2,
  MapPin,
  Plus,
  Edit,
  Trash2,
  Crown,
  Briefcase,
  HardHat,
  Navigation,
} from "lucide-react";

// Mock data for users and roles
const roleHierarchy = {
  commissioner: { name: "Commissioner", icon: Crown, level: 1, color: "bg-purple-500" },
  department_head: { name: "Department Head", icon: Briefcase, level: 2, color: "bg-blue-500" },
  staff: { name: "Staff", icon: HardHat, level: 3, color: "bg-green-500" },
  ward_officer: { name: "Ward Officer", icon: Navigation, level: 4, color: "bg-orange-500" },
};

const departments = [
  "Sanitation", "Roads", "Electricity", "Water & Sewage", "Traffic Management", "Public Works"
];

const mockUsers = [
  {
    id: "1",
    name: "Rajesh Kumar",
    email: "rajesh.commissioner@civic.gov",
    role: "commissioner",
    department: "All Departments",
    ward: "All",
    avatar: "/api/placeholder/32/32",
    lastActive: "2024-01-20T10:30:00Z",
    issuesAssigned: 0,
    issuesResolved: 245,
  },
  {
    id: "2",
    name: "Priya Sharma",
    email: "priya.sanitation@civic.gov", 
    role: "department_head",
    department: "Sanitation",
    ward: "All",
    avatar: "/api/placeholder/32/32",
    lastActive: "2024-01-20T09:15:00Z",
    issuesAssigned: 12,
    issuesResolved: 89,
  },
  {
    id: "3",
    name: "Amit Patel",
    email: "amit.roads@civic.gov",
    role: "staff",
    department: "Roads",
    ward: "Ward 5",
    avatar: "/api/placeholder/32/32", 
    lastActive: "2024-01-20T11:45:00Z",
    issuesAssigned: 8,
    issuesResolved: 34,
  },
  {
    id: "4",
    name: "Sunita Devi",
    email: "sunita.ward3@civic.gov",
    role: "ward_officer",
    department: "General",
    ward: "Ward 3",
    avatar: "/api/placeholder/32/32",
    lastActive: "2024-01-20T08:30:00Z",
    issuesAssigned: 15,
    issuesResolved: 67,
  },
];

export default function RoleManagementPage() {
  const [users, setUsers] = useState(mockUsers);
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);

  const filteredUsers = users.filter(user => {
    const matchesRole = selectedRole === "all" || user.role === selectedRole;
    const matchesDepartment = selectedDepartment === "all" || user.department === selectedDepartment;
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRole && matchesDepartment && matchesSearch;
  });

  const getRoleIcon = (role: string) => {
    const roleConfig = roleHierarchy[role as keyof typeof roleHierarchy];
    const Icon = roleConfig?.icon || Users;
    return <Icon className="w-4 h-4" />;
  };

  const getRoleColor = (role: string) => {
    return roleHierarchy[role as keyof typeof roleHierarchy]?.color || "bg-gray-500";
  };

  const departmentStats = departments.map(dept => {
    const deptUsers = users.filter(u => u.department === dept || u.department === "All Departments");
    const totalAssigned = deptUsers.reduce((sum, u) => sum + u.issuesAssigned, 0);
    const totalResolved = deptUsers.reduce((sum, u) => sum + u.issuesResolved, 0);
    
    return {
      name: dept,
      userCount: deptUsers.filter(u => u.department === dept).length,
      totalAssigned,
      totalResolved,
      efficiency: totalAssigned > 0 ? Math.round((totalResolved / (totalAssigned + totalResolved)) * 100) : 0,
    };
  });

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <UserCog className="w-6 h-6 text-accent" />
            Role Management
          </h1>
          <p className="text-muted-foreground">
            Manage user roles and department access controls
          </p>
        </div>
        <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>
                Create a new user account with appropriate role and department access.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" placeholder="Enter full name" />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="user@civic.gov" />
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(roleHierarchy).map(([key, role]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          <role.icon className="w-4 h-4" />
                          {role.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="department">Department</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
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
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddUserOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsAddUserOpen(false)}>
                Create User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div>
          <Label htmlFor="search">Search Users</Label>
          <Input
            id="search"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="role-filter">Filter by Role</Label>
          <Select value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              {Object.entries(roleHierarchy).map(([key, role]) => (
                <SelectItem key={key} value={key}>
                  <div className="flex items-center gap-2">
                    <role.icon className="w-4 h-4" />
                    {role.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="dept-filter">Filter by Department</Label>
          <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-end">
          <Button variant="outline" className="w-full" onClick={() => {
            setSelectedRole("all");
            setSelectedDepartment("all");
            setSearchTerm("");
          }}>
            Clear Filters
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Users List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Users ({filteredUsers.length})</CardTitle>
              <CardDescription>
                Manage user accounts and their access permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>
                          {user.name.split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{user.name}</h4>
                          <Badge 
                            className={`${getRoleColor(user.role)} text-white text-xs`}
                          >
                            {getRoleIcon(user.role)}
                            <span className="ml-1">
                              {roleHierarchy[user.role as keyof typeof roleHierarchy]?.name}
                            </span>
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Building2 className="w-3 h-3" />
                            {user.department}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {user.ward}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right text-sm">
                        <div className="font-medium">{user.issuesAssigned} assigned</div>
                        <div className="text-muted-foreground">{user.issuesResolved} resolved</div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Department Performance */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Department Performance</CardTitle>
              <CardDescription>
                Overview of each department's capacity and efficiency
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {departmentStats.map((dept) => (
                  <div key={dept.name} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{dept.name}</h4>
                      <Badge variant="outline">{dept.userCount} users</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                      <div>Assigned: {dept.totalAssigned}</div>
                      <div>Resolved: {dept.totalResolved}</div>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm">Efficiency</span>
                      <span className="font-medium">{dept.efficiency}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2 mt-1">
                      <div 
                        className="bg-accent h-2 rounded-full" 
                        style={{ width: `${dept.efficiency}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}