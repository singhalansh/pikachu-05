"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
    Building2,
    User,
    CheckCircle,
    AlertCircle,
    Clock,
    Shield,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getSuggestedDepartments, type Department } from "@/lib/departments";

interface AdminDepartmentAssignerProps {
    issueId: string;
    issueCategory: string;
    currentDepartment?: {
        id: string;
        name: string;
    };
    onDepartmentAssigned?: (department: Department) => void;
}

// This will now be fetched from the database

export default function AdminDepartmentAssigner({
    issueId,
    issueCategory,
    currentDepartment,
    onDepartmentAssigned,
}: AdminDepartmentAssignerProps) {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [selectedDepartmentId, setSelectedDepartmentId] = useState(
        currentDepartment?.id || ""
    );
    const [loading, setLoading] = useState(false);
    const [fetchingDepartments, setFetchingDepartments] = useState(true);
    const { toast } = useToast();

    // Fetch departments on component mount
    useEffect(() => {
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        try {
            const response = await fetch("/api/departments");
            if (response.ok) {
                const data = await response.json();
                if (data.departments && data.departments.length > 0) {
                    setDepartments(data.departments);
                } else {
                    console.warn(
                        "No departments returned from API, using defaults"
                    );
                    setDepartments(getDefaultDepartments());
                }
            } else {
                console.error(
                    "Failed to fetch departments, status:",
                    response.status
                );
                // Fallback to default departments if API fails
                setDepartments(getDefaultDepartments());
            }
        } catch (error) {
            console.error("Error fetching departments:", error);
            // Fallback to default departments
            setDepartments(getDefaultDepartments());
        } finally {
            setFetchingDepartments(false);
        }
    };

    // Default departments based on common municipal departments
    const getDefaultDepartments = (): Department[] => [
        {
            id: "public-works",
            name: "Public Works",
            description: "Roads, infrastructure, and general maintenance",
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        },
        {
            id: "utilities",
            name: "Utilities",
            description: "Water, electricity, and utility services",
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        },
        {
            id: "sanitation",
            name: "Sanitation",
            description: "Waste management and cleaning services",
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        },
        {
            id: "transportation",
            name: "Transportation",
            description: "Traffic management and public transport",
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        },
        {
            id: "public-safety",
            name: "Public Safety",
            description: "Safety and emergency services",
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        },
        {
            id: "environmental",
            name: "Environmental Services",
            description: "Environmental and health services",
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        },
        {
            id: "general",
            name: "General Services",
            description: "General municipal services",
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        },
    ];

    const handleAssignDepartment = async () => {
        if (!selectedDepartmentId) {
            toast({
                title: "Error",
                description: "Please select a department",
                variant: "destructive",
            });
            return;
        }

        console.log("Assigning department:", {
            issueId,
            selectedDepartmentId,
            departments: departments.length,
        });

        setLoading(true);
        try {
            const response = await fetch(
                `/api/issues/${issueId}/assign-department`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        department_id: selectedDepartmentId,
                    }),
                }
            );

            const data = await response.json();
            console.log("Assignment response:", {
                status: response.status,
                data,
            });

            if (response.ok) {
                const assignedDepartment = departments.find(
                    (d) => d.id === selectedDepartmentId
                );

                toast({
                    title: "Success",
                    description: `Issue assigned to ${assignedDepartment?.name}`,
                });

                // Notify parent component
                if (onDepartmentAssigned && assignedDepartment) {
                    onDepartmentAssigned(assignedDepartment);
                }
            } else {
                console.error("Assignment failed:", data);
                throw new Error(data.error || "Failed to assign department");
            }
        } catch (error) {
            console.error("Error assigning department:", error);
            toast({
                title: "Error",
                description:
                    error instanceof Error
                        ? error.message
                        : "Failed to assign department",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const [suggestedDepartments, setSuggestedDepartments] = useState<
        Department[]
    >([]);

    // Fetch suggested departments when component mounts or category changes
    useEffect(() => {
        const fetchSuggested = async () => {
            try {
                const suggested = await getSuggestedDepartments(issueCategory);
                setSuggestedDepartments(suggested);
            } catch (error) {
                console.error("Error fetching suggested departments:", error);
                setSuggestedDepartments([]);
            }
        };

        if (issueCategory && departments.length > 0) {
            fetchSuggested();
        }
    }, [issueCategory, departments]);

    if (fetchingDepartments) {
        return (
            <Card className="border-[#2E6A56]/20">
                <div className="h-2 bg-gradient-to-r from-[#2E6A56] via-[#5C9479] to-[#2E6A56] rounded-t-lg"></div>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <div className="p-2 bg-gradient-to-br from-[#2E6A56] to-[#5C9479] rounded-lg">
                            <Building2 className="w-5 h-5 text-white" />
                        </div>
                        <span className="bg-gradient-to-r from-[#2E6A56] to-[#5C9479] bg-clip-text text-transparent">
                            Assign Department
                        </span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-[#2E6A56]/5 to-[#5C9479]/5 rounded-lg border border-[#2E6A56]/20">
                        <div className="p-2 bg-gradient-to-br from-[#2E6A56] to-[#5C9479] rounded-full">
                            <Clock className="w-4 h-4 text-white animate-spin" />
                        </div>
                        <span className="text-[#2E6A56] font-medium">
                            Loading departments...
                        </span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="overflow-visible border-[#2E6A56]/20 shadow-lg hover:shadow-xl transition-shadow">
            <div className="h-2 bg-gradient-to-r from-[#2E6A56] via-[#5C9479] to-[#2E6A56] rounded-t-lg"></div>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <div className="p-2 bg-gradient-to-br from-[#2E6A56] to-[#5C9479] rounded-lg shadow-md">
                        <Building2 className="w-5 h-5 text-white" />
                    </div>
                    <span className="bg-gradient-to-r from-[#2E6A56] to-[#5C9479] bg-clip-text text-transparent font-bold">
                        Assign Department
                    </span>
                </CardTitle>
                {currentDepartment && (
                    <div className="flex items-center gap-2 mt-2 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-900">
                            Currently assigned to:
                        </span>
                        <Badge className="bg-gradient-to-r from-green-600 to-emerald-600 text-white border-0 shadow-sm">
                            {currentDepartment.name}
                        </Badge>
                    </div>
                )}
            </CardHeader>
            <CardContent className="space-y-4 overflow-visible">
                {/* Category-based suggestions */}
                {suggestedDepartments.length > 0 && (
                    <div className="p-4 bg-gradient-to-br from-[#2E6A56]/10 via-[#5C9479]/10 to-[#2E6A56]/5 rounded-lg border-2 border-[#2E6A56]/30 shadow-md">
                        <div className="flex items-center gap-2 text-sm mb-3">
                            <div className="p-1.5 bg-gradient-to-br from-[#2E6A56] to-[#5C9479] rounded-full">
                                <AlertCircle className="w-4 h-4 text-white" />
                            </div>
                            <span className="font-bold text-[#2E6A56]">
                                Suggested for "{issueCategory}" category:
                            </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {suggestedDepartments.map((dept) => (
                                <Badge
                                    key={dept.id}
                                    className="text-xs cursor-pointer bg-gradient-to-r from-[#2E6A56] to-[#5C9479] hover:from-[#5C9479] hover:to-[#2E6A56] text-white border-0 shadow-sm hover:shadow-md transition-all hover:scale-105"
                                    onClick={() =>
                                        setSelectedDepartmentId(dept.id)
                                    }
                                >
                                    {dept.name}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}

                {/* Department Selection */}
                <div className="space-y-2">
                    <Label
                        htmlFor="department"
                        className="text-[#2E6A56] font-semibold flex items-center gap-2"
                    >
                        <Building2 className="w-4 h-4" />
                        Select Department
                    </Label>
                    <Select
                        value={selectedDepartmentId}
                        onValueChange={setSelectedDepartmentId}
                    >
                        <SelectTrigger className="w-full bg-white border-[#2E6A56]/30 focus:ring-[#2E6A56] focus:border-[#2E6A56] hover:border-[#2E6A56]/50 transition-colors">
                            <SelectValue placeholder="Choose a department" />
                        </SelectTrigger>
                        <SelectContent className="bg-white w-full min-w-[300px] max-w-[400px] border-2 border-[#2E6A56]/20 shadow-xl">
                            {departments.map((department) => (
                                <SelectItem
                                    key={department.id}
                                    value={department.id}
                                    className="w-full hover:bg-[#2E6A56]/10 focus:bg-[#2E6A56]/10"
                                >
                                    <div className="flex items-start space-x-2 w-full">
                                        <div className="p-1 bg-gradient-to-br from-[#2E6A56] to-[#5C9479] rounded-md">
                                            <Shield className="w-4 h-4 text-white mt-0.5 flex-shrink-0" />
                                        </div>
                                        <div className="flex flex-col w-full">
                                            <span className="font-semibold text-[#2E6A56]">
                                                {department.name}
                                            </span>
                                            {department.description && (
                                                <span className="text-xs text-muted-foreground">
                                                    {department.description}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Department Head Info */}
                {selectedDepartmentId && (
                    <div className="space-y-2">
                        {(() => {
                            const selectedDept = departments.find(
                                (d) => d.id === selectedDepartmentId
                            );
                            return (
                                selectedDept && (
                                    <div className="p-4 bg-gradient-to-br from-[#2E6A56]/5 to-[#5C9479]/10 rounded-lg border border-[#2E6A56]/20 shadow-sm">
                                        <div className="flex items-center gap-2 text-sm mb-3">
                                            <div className="p-1.5 bg-gradient-to-br from-[#2E6A56] to-[#5C9479] rounded-full">
                                                <User className="w-4 h-4 text-white" />
                                            </div>
                                            <span className="font-bold text-[#2E6A56]">
                                                Department Details
                                            </span>
                                        </div>
                                        <div className="text-sm space-y-2">
                                            {selectedDept.head && (
                                                <div className="flex items-start gap-2 p-2 bg-white/50 rounded-md">
                                                    <span className="font-medium text-[#2E6A56]">
                                                        Head:
                                                    </span>
                                                    <span className="text-gray-700">
                                                        {
                                                            selectedDept.head
                                                                .full_name
                                                        }
                                                    </span>
                                                </div>
                                            )}
                                            {selectedDept.email && (
                                                <div className="flex items-start gap-2 p-2 bg-white/50 rounded-md">
                                                    <span className="font-medium text-[#2E6A56]">
                                                        Email:
                                                    </span>
                                                    <span className="text-gray-700">
                                                        {selectedDept.email}
                                                    </span>
                                                </div>
                                            )}
                                            {selectedDept.description && (
                                                <div className="p-2 bg-white/50 rounded-md">
                                                    <span className="text-gray-700">
                                                        {
                                                            selectedDept.description
                                                        }
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )
                            );
                        })()}
                    </div>
                )}

                {/* Action Button */}
                <div className="flex gap-2 pt-4">
                    <Button
                        onClick={handleAssignDepartment}
                        disabled={
                            loading ||
                            !selectedDepartmentId ||
                            selectedDepartmentId === currentDepartment?.id
                        }
                        className="flex-1 bg-gradient-to-r from-[#2E6A56] to-[#5C9479] hover:from-[#5C9479] hover:to-[#2E6A56] text-white shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <Clock className="w-4 h-4 mr-2 animate-spin" />
                                Assigning...
                            </>
                        ) : (
                            <>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                {currentDepartment
                                    ? "Reassign Department"
                                    : "Assign Department"}
                            </>
                        )}
                    </Button>
                </div>

                {/* Assignment Preview */}
                {selectedDepartmentId &&
                    selectedDepartmentId !== currentDepartment?.id && (
                        <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border-2 border-green-300 shadow-md">
                            <div className="flex items-center gap-2 text-sm mb-2">
                                <div className="p-1.5 bg-gradient-to-br from-green-600 to-emerald-600 rounded-full">
                                    <CheckCircle className="w-4 h-4 text-white" />
                                </div>
                                <span className="font-bold text-green-900">
                                    Assignment Preview:
                                </span>
                            </div>
                            <div className="mt-3 p-3 bg-white/60 rounded-md text-sm">
                                {currentDepartment ? (
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <Badge className="bg-gray-600 text-white border-0 shadow-sm">
                                            {currentDepartment.name}
                                        </Badge>
                                        <span className="text-green-600 font-bold text-lg">
                                            →
                                        </span>
                                        <Badge className="bg-gradient-to-r from-green-600 to-emerald-600 text-white border-0 shadow-md">
                                            {
                                                departments.find(
                                                    (d) =>
                                                        d.id ===
                                                        selectedDepartmentId
                                                )?.name
                                            }
                                        </Badge>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-gray-700">
                                            Will be assigned to
                                        </span>
                                        <Badge className="bg-gradient-to-r from-green-600 to-emerald-600 text-white border-0 shadow-md">
                                            {
                                                departments.find(
                                                    (d) =>
                                                        d.id ===
                                                        selectedDepartmentId
                                                )?.name
                                            }
                                        </Badge>
                                    </div>
                                )}
                            </div>
                            <p className="text-xs text-green-800 mt-2 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                The department will receive a notification about
                                this assignment.
                            </p>
                        </div>
                    )}
            </CardContent>
        </Card>
    );
}
