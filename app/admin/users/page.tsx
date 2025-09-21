"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserAvatar } from "@/components/ui/user-avatar";
import {
    Users,
    Search,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Ban,
    CheckCircle,
    ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type User = {
    id: string;
    name: string;
    email: string;
    phone?: string;
    location?: string;
    joinDate?: string;
    status?: string;
    issuesReported?: number;
    issuesResolved?: number;
    reputation?: number;
    avatar?: string;
};

const getStatusColor = (status: string) => {
    switch (status) {
        case "active":
            return "bg-green-500 text-white";
        case "suspended":
            return "bg-red-500 text-white";
        case "pending":
            return "bg-yellow-500 text-white";
        default:
            return "bg-gray-500 text-white";
    }
};

const getReputationColor = (reputation: number) => {
    if (reputation >= 80) return "text-green-600";
    if (reputation >= 60) return "text-yellow-600";
    return "text-red-600";
};

export default function UsersPage() {
    const supabase = createClient();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [sortBy, setSortBy] = useState("name");

    // Fetch users from Supabase
    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);

            // Fetch profiles with issue counts
            const { data: profiles, error: profilesError } =
                await supabase.from("profiles").select(`
                    *,
                    reported_issues:issues!user_id(count),
                    resolved_issues:issues!assigned_to(count)
                `);

            if (profilesError) {
                console.error("Error fetching users:", profilesError);
                setLoading(false);
                return;
            }

            // Type assertion for profiles data
            type ProfileData = {
                id: string;
                full_name: string | null;
                email: string;
                phone: string | null;
                address: string | null;
                created_at: string;
                avatar_url?: string | null;
                reported_issues?: { count: number }[];
                resolved_issues?: { count: number }[];
            };
            const typedProfiles = (profiles || []) as ProfileData[];

            // Transform the data to match our User type
            const transformedUsers: User[] = typedProfiles.map((profile) => ({
                id: profile.id,
                name: profile.full_name || "Unknown",
                email: profile.email,
                phone: profile.phone || undefined,
                location: profile.address || undefined,
                joinDate: new Date(profile.created_at).toLocaleDateString(),
                status: "active", // Default status
                issuesReported: profile.reported_issues?.[0]?.count || 0,
                issuesResolved: profile.resolved_issues?.[0]?.count || 0,
                reputation:
                    (profile.reported_issues?.[0]?.count || 0) * 10 +
                    (profile.resolved_issues?.[0]?.count || 0) * 20,
                avatar: profile.avatar_url || undefined,
            }));

            setUsers(transformedUsers);
            setLoading(false);
        };

        fetchUsers();
    }, [supabase]);

    // Filtering + sorting
    const filteredUsers = users
        .filter((user) => {
            const matchesSearch =
                user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.location?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus =
                statusFilter === "all" || user.status === statusFilter;
            return matchesSearch && matchesStatus;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case "name":
                    return a.name?.localeCompare(b.name || "") || 0;
                case "joinDate":
                    return (
                        new Date(b.joinDate || "").getTime() -
                        new Date(a.joinDate || "").getTime()
                    );
                case "reputation":
                    return (b.reputation || 0) - (a.reputation || 0);
                case "issues":
                    return (b.issuesReported || 0) - (a.issuesReported || 0);
                default:
                    return 0;
            }
        });

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:py-6 lg:py-8">
                {/* Action Buttons */}
                <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <div className="flex flex-col xs:flex-row xs:items-center gap-2 sm:gap-3">
                        <Link href="/admin/dashboard">
                            <Button variant="outline" size="sm" className="w-full xs:w-auto border-gray-200 text-gray-700 hover:bg-gray-50 transition-all duration-200 hover:scale-105">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                <span className="hidden xs:inline">Dashboard</span>
                                <span className="xs:hidden">Back to Dashboard</span>
                            </Button>
                        </Link>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="px-3 py-1 border-gray-200 text-gray-700">
                            Total Users: {users.length}
                        </Badge>
                        <Badge variant="outline" className="px-3 py-1 border-gray-200 text-gray-700">
                            Active: {users.filter((u) => u.status === "active").length}
                        </Badge>
                    </div>
                </div>

                {/* Filters */}
                <Card className="bg-white border-0 shadow-sm hover:shadow-lg transition-all duration-300 animate-fade-in mb-4 sm:mb-6">
                    <CardContent className="p-3 sm:p-4 md:p-6">
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                            <div className="flex-1 min-w-0">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <Input
                                        placeholder="Search users by name, email, or location..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500 w-full"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <Select
                                    value={statusFilter}
                                    onValueChange={setStatusFilter}
                                >
                                    <SelectTrigger className="border-gray-200 h-9 sm:h-10 w-full sm:w-40">
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="suspended">Suspended</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select value={sortBy} onValueChange={setSortBy}>
                                    <SelectTrigger className="border-gray-200 h-9 sm:h-10 w-full sm:w-40">
                                        <SelectValue placeholder="Sort by" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="name">Name</SelectItem>
                                        <SelectItem value="joinDate">Join Date</SelectItem>
                                        <SelectItem value="reputation">Reputation</SelectItem>
                                        <SelectItem value="issues">Issues Reported</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Users Grid */}
                {loading ? (
                    <div className="text-center py-8 sm:py-12">
                        <div className="animate-bounce">
                            <Users className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 sm:mb-3 text-gray-400" />
                        </div>
                        <p className="font-medium text-gray-500 text-sm sm:text-base">Loading users...</p>
                    </div>
                ) : filteredUsers.length > 0 ? (
                    <div className="space-y-3 sm:space-y-4">
                        {filteredUsers.map((user) => (
                            <Card
                                key={user.id}
                                className="bg-white border-0 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 animate-fade-in"
                            >
                                <CardContent className="p-3 sm:p-4 md:p-6">
                                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4">
                                        {/* User Info */}
                                        <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                                            <Avatar className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0">
                                                <AvatarImage
                                                    src={user.avatar || "/placeholder.svg"}
                                                    alt={user.name}
                                                />
                                                <AvatarFallback>
                                                    {user.name?.split(" ").map((n) => n[0]).join("")}
                                                </AvatarFallback>
                                            </Avatar>

                                            <div className="space-y-1 min-w-0 flex-1">
                                                <div className="flex items-center space-x-2 flex-wrap">
                                                    <h3 className="font-semibold text-sm sm:text-base text-gray-900 truncate">
                                                        {user.name}
                                                    </h3>
                                                    <Badge
                                                        className={`${getStatusColor(user.status || "pending")} text-xs px-2 py-1 flex-shrink-0`}
                                                    >
                                                        {user.status || "pending"}
                                                    </Badge>
                                                </div>
                                                <div className="flex flex-col xs:flex-row xs:items-center gap-1 sm:gap-2 text-xs text-gray-500">
                                                    {user.email && (
                                                        <span className="flex items-center min-w-0">
                                                            <Mail className="w-3 h-3 mr-1 flex-shrink-0" />
                                                            <span className="truncate">{user.email}</span>
                                                        </span>
                                                    )}
                                                    {user.phone && (
                                                        <span className="flex items-center min-w-0">
                                                            <Phone className="w-3 h-3 mr-1 flex-shrink-0" />
                                                            <span className="truncate">{user.phone}</span>
                                                        </span>
                                                    )}
                                                    {user.location && (
                                                        <span className="flex items-center min-w-0">
                                                            <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                                                            <span className="truncate">{user.location}</span>
                                                        </span>
                                                    )}
                                                    {user.joinDate && (
                                                        <span className="flex items-center flex-shrink-0">
                                                            <Calendar className="w-3 h-3 mr-1" />
                                                            <span className="hidden xs:inline">Joined </span>
                                                            {new Date(user.joinDate).toLocaleDateString()}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Stats + Actions */}
                                        <div className="flex items-center justify-between lg:justify-end gap-3 sm:gap-4 lg:gap-6">
                                            <div className="flex items-center gap-3 sm:gap-4">
                                                <div className="text-center">
                                                    <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
                                                        {user.issuesReported || 0}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        Reported
                                                    </p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
                                                        {user.issuesResolved || 0}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        Resolved
                                                    </p>
                                                </div>
                                                <div className="text-center">
                                                    <p className={`text-lg sm:text-xl md:text-2xl font-bold ${getReputationColor(user.reputation || 0)}`}>
                                                        {user.reputation || 0}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        Reputation
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-1 sm:gap-2">
                                                <Button variant="outline" size="sm" className="border-gray-200 text-gray-700 hover:bg-gray-50 transition-all duration-200 hover:scale-105">
                                                    <Mail className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                                                    <span className="hidden xs:inline">Contact</span>
                                                </Button>
                                                {user.status === "active" ? (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50 transition-all duration-200 hover:scale-105"
                                                    >
                                                        <Ban className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                                                        <span className="hidden xs:inline">Suspend</span>
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="text-green-600 hover:text-green-700 border-green-200 hover:bg-green-50 transition-all duration-200 hover:scale-105"
                                                    >
                                                        <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                                                        <span className="hidden xs:inline">Activate</span>
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card className="bg-white border-0 shadow-sm hover:shadow-lg transition-all duration-300 animate-fade-in">
                        <CardContent className="p-8 sm:p-12 text-center">
                            <div className="animate-bounce">
                                <Users className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-3 sm:mb-4" />
                            </div>
                            <h3 className="text-base sm:text-lg font-semibold mb-2 text-gray-900">
                                No users found
                            </h3>
                            <p className="text-sm text-gray-500">
                                Try adjusting your search or filter criteria.
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
