"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Target, FileText, Loader2, CheckCircle, AlertCircle } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function CampaignForm({ role }: { role: "citizen" | "government" }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetAmount, setTargetAmount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    // Validation
    if (!title.trim()) {
      setError("Campaign title is required");
      setLoading(false);
      return;
    }
    if (!description.trim()) {
      setError("Campaign description is required");
      setLoading(false);
      return;
    }
    if (targetAmount <= 0) {
      setError("Target amount must be greater than 0");
      setLoading(false);
      return;
    }

    try {
      // Only insert campaign, no Razorpay
      const { error } = await supabase.from("campaigns").insert([
        {
          title: title.trim(),
          description: description.trim(),
          target_amount: targetAmount,
          raised_amount: 0,
          role,
        },
      ]);

      if (error) throw error;

      setSuccess(true);
      setTitle("");
      setDescription("");
      setTargetAmount(0);
      
      // Reset success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error(err);
      setError("Failed to add campaign: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-white border-0 shadow-sm">
      <CardContent className="p-4 sm:p-6">
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Header */}
          <div className="mb-0">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
              {role === "government" ? "Government Project" : "Citizen Request"}
            </h3>
          </div>

          {/* Success Message */}
          {success && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg animate-fade-in">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <p className="text-sm font-medium text-green-800">
                Campaign created successfully!
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg animate-fade-in">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          )}

          {/* Form Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {/* Campaign Title */}
            <div className="sm:col-span-2">
              <Label htmlFor="title" className="text-sm font-medium text-gray-700 mb-2 block">
                Campaign Title *
              </Label>
              <div className="relative">
                <Target className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="title"
                  type="text"
                  placeholder="Enter campaign title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
                  required
                />
              </div>
            </div>

            {/* Target Amount */}
            <div>
              <Label htmlFor="amount" className="text-sm font-medium text-gray-700 mb-2 block">
                Target Amount (₹) *
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm font-medium">₹</span>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0"
                  value={targetAmount || ""}
                  onChange={(e) => setTargetAmount(Number(e.target.value))}
                  className="pl-8 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
                  min="1"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Minimum amount: ₹1
              </p>
            </div>

            {/* Campaign Type Badge */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                Campaign Type
              </Label>
              <Badge 
                variant="outline" 
                className={`px-3 py-1 text-sm ${
                  role === "government" 
                    ? "border-blue-200 text-blue-700 bg-blue-50" 
                    : "border-green-200 text-green-700 bg-green-50"
                }`}
              >
                {role === "government" ? "Government Project" : "Citizen Request"}
              </Badge>
            </div>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description" className="text-sm font-medium text-gray-700 mb-2 block">
              Campaign Description *
            </Label>
            <Textarea
              id="description"
              placeholder="Describe your campaign goals, impact, and how the funds will be used..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 min-h-[100px] resize-none"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              {description.length}/500 characters
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              disabled={loading || !title.trim() || !description.trim() || targetAmount <= 0}
              className="bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 px-6 py-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Campaign...
                </>
              ) : (
                <>
                  <Target className="w-4 h-4 mr-2" />
                  Create Campaign
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
