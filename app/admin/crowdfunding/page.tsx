"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import CampaignForm from "@/components/CampaignForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, DollarSign, Target, TrendingUp } from "lucide-react";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Campaign {
  id: string;
  title: string;
  description: string;
  target_amount: number;
  raised_amount: number;
  role: string;
}

export default function GovernmentCrowdfundingPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    const { data, error } = await supabase.from("campaigns").select("*");
    if (error) console.error(error);
    else setCampaigns(data || []);
    setLoading(false);
  };

  const handleDonate = async (amount: number, campaign: Campaign) => {
    const res = await fetch("/api/razorpay", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount, campaignId: campaign.id }),
    });

    const dataJson = await res.json();
    if (!dataJson.order) return alert("❌ " + dataJson.error);

    const order = dataJson.order;

    const rzp = new (window as any).Razorpay({
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
      amount: order.amount,
      currency: order.currency,
      name: "Government Crowdfunding",
      description: campaign.title,
      order_id: order.id,
      handler: async function (response: any) {
        alert("✅ Payment Successful! Payment ID: " + response.razorpay_payment_id);

        // Update raised_amount in Supabase
        await supabase
          .from("campaigns")
          .update({ raised_amount: campaign.raised_amount + amount })
          .eq("id", campaign.id);

        fetchCampaigns(); // Refresh list
      },
      prefill: { name: "", email: "" },
      theme: { color: "#3399cc" },
    });

    rzp.open();
  };

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
              Total Campaigns: {campaigns.length}
            </Badge>
            <Badge variant="outline" className="px-3 py-1 border-gray-200 text-gray-700">
              Active: {campaigns.filter(c => c.raised_amount < c.target_amount).length}
            </Badge>
          </div>
        </div>

        {/* Campaign Form */}
        <Card className="bg-white border-0 shadow-sm hover:shadow-lg transition-all duration-300 animate-fade-in mb-4 sm:mb-6">
          <CardHeader className="pb-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
              <div className="min-w-0 flex-1">
                <CardTitle className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center mr-3 shadow-lg">
                    <DollarSign className="w-4 h-4 text-white" />
                  </div>
                  Create New Campaign
                </CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <CampaignForm role="government" />
          </CardContent>
        </Card>

        {/* Campaigns Section */}
        <Card className="bg-white border-0 shadow-sm hover:shadow-lg transition-all duration-300 animate-fade-in">
          <CardHeader className="pb-3 sm:pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
              <div className="min-w-0 flex-1">
                <CardTitle className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-3 shadow-lg">
                    <Target className="w-4 h-4 text-white" />
                  </div>
                  All Campaigns
                </CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {loading ? (
              <div className="text-center py-8 sm:py-12">
                <div className="animate-bounce">
                  <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 sm:mb-3 text-gray-400" />
                </div>
                <p className="font-medium text-gray-500 text-sm sm:text-base">Loading campaigns...</p>
              </div>
            ) : campaigns.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {campaigns.map((c) => (
                  <Card
                    key={c.id}
                    className="bg-white border border-gray-100 rounded-lg hover:border-gray-200 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 animate-fade-in"
                  >
                    <CardContent className="p-4 sm:p-6">
                      <div className="space-y-3 sm:space-y-4">
                        <div>
                          <h3 className="font-semibold text-sm sm:text-base text-gray-900 line-clamp-2 mb-2">
                            {c.title}
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-600 line-clamp-3">
                            {c.description}
                          </p>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Progress</span>
                            <span className="font-medium text-gray-900">
                              {Math.round((c.raised_amount / c.target_amount) * 100)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-600 h-2 rounded-full transition-all duration-300"
                              style={{
                                width: `${Math.min((c.raised_amount / c.target_amount) * 100, 100)}%`,
                              }}
                            ></div>
                          </div>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>₹{c.raised_amount.toLocaleString()}</span>
                            <span>₹{c.target_amount.toLocaleString()}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-xs px-2 py-1 border-gray-200 text-gray-700">
                            {c.role}
                          </Badge>
                          <Button
                            onClick={() => handleDonate(1000, c)}
                            className="bg-green-600 hover:bg-green-700 text-white transition-all duration-200 transform hover:scale-105 text-xs sm:text-sm"
                          >
                            <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                            <span className="hidden xs:inline">Donate ₹1000</span>
                            <span className="xs:hidden">₹1000</span>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 sm:py-12">
                <div className="animate-bounce">
                  <Target className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-3 sm:mb-4" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold mb-2 text-gray-900">
                  No campaigns found
                </h3>
                <p className="text-sm text-gray-500">
                  Create your first campaign to get started.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
