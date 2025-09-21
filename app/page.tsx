"use client";

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function HomePage() {
  // Function to trigger the Vapi widget
  const handleAIAgentClick = () => {
    // Find the Vapi widget button and trigger its click event
    const vapiButton = document.querySelector('[title*="voice chat"], [title*="Connecting"], [title*="Listening"], [title*="speaking"]') as HTMLButtonElement;
    if (vapiButton) {
      vapiButton.click();
    }
  };
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-50 to-indigo-50 py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
            Civic Issue Reporting Platform
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed">
            Report civic issues in your community and track their resolution. Together, we can make our city better.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center max-w-md sm:max-w-none mx-auto">
            <Button
              asChild
              size="lg"
              className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-3"
            >
              <Link href="/auth?mode=signup&firstTime=true">Get Started</Link>
            </Button>
            <Button
              onClick={handleAIAgentClick}
              size="lg"
              variant="outline"
              className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-none hover:from-purple-700 hover:to-indigo-700 transition-all duration-200"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="2"
              >
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
              Report with AI Agent
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12 text-gray-900">How It Works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <Card className="text-center p-4 sm:p-6">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <CardTitle className="text-lg sm:text-xl">Report Issues</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm sm:text-base leading-relaxed">
                  Easily report potholes, broken streetlights, garbage, and other civic issues with photos and location
                  data.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center p-4 sm:p-6">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>
                <CardTitle className="text-lg sm:text-xl">Track Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm sm:text-base leading-relaxed">
                  Monitor the status of your reported issues from submission to resolution with real-time updates.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center p-4 sm:p-6">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <CardTitle className="text-lg sm:text-xl">Community Driven</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm sm:text-base leading-relaxed">
                  Join a community of engaged citizens working together to improve local infrastructure and services.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center p-4 sm:p-6">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <CardTitle className="text-lg sm:text-xl">Get Results</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm sm:text-base leading-relaxed">
                  See real impact as municipal authorities address and resolve issues reported by the community.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gray-50 py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 text-center">
            <div className="p-4">
              <div className="text-3xl sm:text-4xl font-bold text-blue-600 mb-2">1,247</div>
              <div className="text-sm sm:text-base text-gray-600">Issues Reported</div>
            </div>
            <div className="p-4">
              <div className="text-3xl sm:text-4xl font-bold text-green-600 mb-2">892</div>
              <div className="text-sm sm:text-base text-gray-600">Issues Resolved</div>
            </div>
            <div className="p-4">
              <div className="text-3xl sm:text-4xl font-bold text-purple-600 mb-2">355</div>
              <div className="text-sm sm:text-base text-gray-600">Active Citizens</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
