"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { User, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type UserOption = { id: string; full_name: string | null; email: string };

export default function AdminUserAssigner({
    issueId,
    departmentId,
    currentAssignee,
    onAssigned,
}: {
    issueId: string;
    departmentId?: string | null;
    currentAssignee?: { full_name: string | null; email: string } | null;
    onAssigned?: (user: UserOption | null) => void;
}) {
    const [users, setUsers] = useState<UserOption[]>([]);
    const [selected, setSelected] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        const load = async () => {
            if (!departmentId) return;
            try {
                const res = await fetch(
                    `/api/departments/${departmentId}/users`,
                    {
                        credentials: "include",
                    }
                );
                const json = await res.json();
                if (!res.ok)
                    throw new Error(json.error || "Failed to load users");
                setUsers(json.users || []);
            } catch (e) {
                console.error(e);
            }
        };
        load();
    }, [departmentId]);

    const assign = async () => {
        if (!issueId) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/issues/${issueId}/assign`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ assigned_to: selected || null }),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || "Failed to assign");
            const assigned = users.find((u) => u.id === selected) || null;
            toast({
                title: "Assigned",
                description: assigned
                    ? `Assigned to ${assigned.full_name || assigned.email}`
                    : "Unassigned",
            });
            onAssigned?.(assigned);
        } catch (e: any) {
            toast({
                title: "Assign failed",
                description: e.message,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="border-[#2E6A56]/20 shadow-lg hover:shadow-xl transition-shadow">
            <div className="h-2 bg-gradient-to-r from-[#2E6A56] via-[#5C9479] to-[#2E6A56] rounded-t-lg"></div>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <div className="p-2 bg-gradient-to-br from-[#2E6A56] to-[#5C9479] rounded-lg shadow-md">
                        <User className="w-5 h-5 text-white" />
                    </div>
                    <span className="bg-gradient-to-r from-[#2E6A56] to-[#5C9479] bg-clip-text text-transparent font-bold">Assign to User</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <Label className="mb-2 text-[#2E6A56] font-semibold flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Current Assignee
                    </Label>
                    {currentAssignee ? (
                        <div className="p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200 shadow-sm">
                            <div className="text-sm font-semibold text-blue-900">
                                {currentAssignee.full_name || currentAssignee.email}
                            </div>
                            <div className="text-xs text-blue-700 mt-1">
                                {currentAssignee.email}
                            </div>
                        </div>
                    ) : (
                        <div className="p-3 bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg border border-gray-200 text-sm text-muted-foreground flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            Not assigned
                        </div>
                    )}
                </div>

                <div className="space-y-2">
                    <Label className="text-[#2E6A56] font-semibold flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Select user in department
                    </Label>
                    <Select value={selected} onValueChange={setSelected}>
                        <SelectTrigger className="w-full bg-white border-[#2E6A56]/30 focus:ring-[#2E6A56] focus:border-[#2E6A56] hover:border-[#2E6A56]/50 transition-colors">
                            <SelectValue
                                placeholder={
                                    users.length
                                        ? "Choose user"
                                        : departmentId
                                        ? "Loading…"
                                        : "No department"
                                }
                            />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-2 border-[#2E6A56]/20 shadow-xl">
                            <SelectItem value="unassign" className="hover:bg-red-50 focus:bg-red-50">
                                <div className="flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4 text-red-600" />
                                    <span className="font-medium text-red-700">Unassign</span>
                                </div>
                            </SelectItem>
                            {users.map((u) => (
                                <SelectItem key={u.id} value={u.id} className="hover:bg-[#2E6A56]/10 focus:bg-[#2E6A56]/10">
                                    <div className="flex items-start gap-2">
                                        <div className="p-1 bg-gradient-to-br from-[#2E6A56] to-[#5C9479] rounded-md">
                                            <User className="w-3 h-3 text-white" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-[#2E6A56]">{u.full_name || u.email}</span>
                                            <span className="text-xs text-muted-foreground">{u.email}</span>
                                        </div>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <Button 
                    onClick={assign} 
                    disabled={loading} 
                    className="w-full bg-gradient-to-r from-[#2E6A56] to-[#5C9479] hover:from-[#5C9479] hover:to-[#2E6A56] text-white shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <>
                            <Clock className="w-4 h-4 mr-2 animate-spin" />
                            Assigning…
                        </>
                    ) : (
                        <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Assign User
                        </>
                    )}
                </Button>
            </CardContent>
        </Card>
    );
}
