"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Calendar, MapPin, User, Users, Plus, Clock } from "lucide-react";

interface Abhiyaan {
  id: string;
  name: string;
  description: string;
  creator_name: string;
  location: string;
  time: string;
}

export default function AdminAbhiyaanPage() {
  const supabase = createClient();
  const [abhiyaans, setAbhiyaans] = useState<Abhiyaan[]>([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [creatorName, setCreatorName] = useState("");
  const [location, setLocation] = useState("");
  const [time, setTime] = useState("");

  useEffect(() => {
    fetchAbhiyaans();
  }, []);

  const fetchAbhiyaans = async () => {
    const { data, error } = await supabase.from("abhiyaans").select("*").order("time", { ascending: true });
    if (error) console.error(error);
    else setAbhiyaans(data || []);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description || !creatorName || !location || !time) return alert("Fill all fields");

    const { error } = await supabase.from("abhiyaans").insert([
      { name, description, creator_name: creatorName, location, time }
    ] as any);

    if (error) alert("Failed to add Abhiyaan");
    else {
      alert("Abhiyaan added!");
      setName(""); setDescription(""); setCreatorName(""); setLocation(""); setTime("");
      fetchAbhiyaans();
    }
  };

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
        {/* Create New Abhiyaan Form */}
        <Card className="bg-white border-0 shadow-sm hover:shadow-lg transition-all duration-300 animate-fade-in mb-4 xs:mb-6">
          <CardHeader className="pb-2 xs:pb-3 sm:pb-4">
            <CardTitle className="flex items-center text-sm xs:text-base sm:text-lg font-semibold text-gray-900">
              <div className="w-6 h-6 xs:w-8 xs:h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center mr-2 xs:mr-3 shadow-lg">
                <Plus className="w-3 h-3 xs:w-4 xs:h-4 text-white" />
              </div>
              <span className="hidden xs:inline">Create New Abhiyaan</span>
              <span className="xs:hidden">New Abhiyaan</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <form onSubmit={handleSubmit} className="space-y-3 xs:space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 xs:gap-4 sm:gap-6">
                <div className="space-y-1 xs:space-y-2">
                  <Label htmlFor="name" className="text-xs xs:text-sm font-medium text-gray-700">Abhiyaan Name *</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter abhiyaan name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                    required
                  />
                </div>
                <div className="space-y-1 xs:space-y-2">
                  <Label htmlFor="creator" className="text-xs xs:text-sm font-medium text-gray-700">Creator Name *</Label>
                  <Input
                    id="creator"
                    type="text"
                    placeholder="Enter creator name"
                    value={creatorName}
                    onChange={(e) => setCreatorName(e.target.value)}
                    className="border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-1 xs:space-y-2">
                <Label htmlFor="description" className="text-xs xs:text-sm font-medium text-gray-700">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Enter abhiyaan description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 resize-none text-xs xs:text-sm"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 xs:gap-4 sm:gap-6">
                <div className="space-y-1 xs:space-y-2">
                  <Label htmlFor="location" className="text-xs xs:text-sm font-medium text-gray-700">Location *</Label>
                  <Input
                    id="location"
                    type="text"
                    placeholder="Enter location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                    required
                  />
                </div>
                <div className="space-y-1 xs:space-y-2">
                  <Label htmlFor="time" className="text-xs xs:text-sm font-medium text-gray-700">Date & Time *</Label>
                  <Input
                    id="time"
                    type="datetime-local"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                    required
                  />
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2 xs:gap-3 pt-3 xs:pt-4 sm:pt-6">
                <Button 
                  type="submit" 
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white transition-all duration-200 hover:scale-105 focus:ring-2 focus:ring-green-200 text-xs xs:text-sm py-2 xs:py-3"
                >
                  <Plus className="w-3 h-3 xs:w-4 xs:h-4 mr-1 xs:mr-2" />
                  <span className="hidden xs:inline">Add Abhiyaan</span>
                  <span className="xs:hidden">Add</span>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* All Abhiyaans */}
        <Card className="bg-white border-0 shadow-sm hover:shadow-lg transition-all duration-300 animate-fade-in">
          <CardHeader className="pb-2 xs:pb-3 sm:pb-4">
            <CardTitle className="flex items-center text-sm xs:text-base sm:text-lg font-semibold text-gray-900">
              <div className="w-6 h-6 xs:w-8 xs:h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-2 xs:mr-3 shadow-lg">
                <Users className="w-3 h-3 xs:w-4 xs:h-4 text-white" />
              </div>
              <span className="hidden xs:inline">All Abhiyaans</span>
              <span className="xs:hidden">Abhiyaans</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {loading ? (
              <div className="space-y-3 xs:space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-3 xs:p-4 border border-gray-200 rounded-lg animate-pulse">
                    <div className="h-3 xs:h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-2 xs:h-3 bg-gray-200 rounded w-full mb-1"></div>
                    <div className="h-2 xs:h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : abhiyaans.length === 0 ? (
              <div className="text-center py-6 xs:py-8">
                <Users className="w-10 h-10 xs:w-12 xs:h-12 text-gray-400 mx-auto mb-3 xs:mb-4" />
                <h3 className="text-base xs:text-lg font-medium text-gray-900 mb-2">No Abhiyaans Found</h3>
                <p className="text-xs xs:text-sm text-gray-600 px-4">Create your first abhiyaan to get started.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 xs:gap-4 sm:gap-6">
                {abhiyaans.map(a => (
                  <Card key={a.id} className="bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 animate-fade-in">
                    <CardContent className="p-3 xs:p-4">
                      <div className="space-y-2 xs:space-y-3">
                        <div>
                          <h3 className="text-sm xs:text-base sm:text-lg font-semibold text-gray-900 mb-1 line-clamp-1">{a.name}</h3>
                          <p className="text-xs xs:text-sm text-gray-600 line-clamp-2 leading-relaxed">{a.description}</p>
                        </div>
                        
                        <div className="space-y-1 xs:space-y-2">
                          <div className="flex items-center gap-1 xs:gap-2 text-xs xs:text-sm text-gray-600">
                            <User className="w-3 h-3 xs:w-4 xs:h-4 text-blue-500 flex-shrink-0" />
                            <span className="truncate">By: {a.creator_name}</span>
                          </div>
                          <div className="flex items-center gap-1 xs:gap-2 text-xs xs:text-sm text-gray-600">
                            <MapPin className="w-3 h-3 xs:w-4 xs:h-4 text-green-500 flex-shrink-0" />
                            <span className="truncate">{a.location}</span>
                          </div>
                          <div className="flex items-center gap-1 xs:gap-2 text-xs xs:text-sm text-gray-600">
                            <Clock className="w-3 h-3 xs:w-4 xs:h-4 text-orange-500 flex-shrink-0" />
                            <span className="truncate">{new Date(a.time).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
