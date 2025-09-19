"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Upload, Camera, ArrowLeft, CheckCircle, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function ReportIssuePage() {
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    description: "",
    location: "",
    coordinates: { lat: "", lng: "" },
    image: null as File | null,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }))
    }
  }

  const handleLocationDetect = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData((prev) => ({
            ...prev,
            coordinates: {
              lat: position.coords.latitude.toString(),
              lng: position.coords.longitude.toString(),
            },
          }))
          toast({
            title: "Location Detected",
            description: "Your current location has been captured.",
          })
        },
        (error) => {
          toast({
            title: "Location Error",
            description: "Unable to detect location. Please enter manually.",
            variant: "destructive",
          })
        },
      )
    } else {
      toast({
        title: "Location Not Supported",
        description: "Geolocation is not supported by this browser.",
        variant: "destructive",
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    toast({
      title: "Issue Reported Successfully!",
      description:
        "Your issue has been submitted and assigned ID: ISS-" +
        Math.floor(Math.random() * 1000)
          .toString()
          .padStart(3, "0"),
    })

    setIsSubmitting(false)

    // Reset form
    setFormData({
      title: "",
      category: "",
      description: "",
      location: "",
      coordinates: { lat: "", lng: "" },
      image: null,
    })

    // Redirect to dashboard after success
    setTimeout(() => {
      window.location.href = "/citizen/dashboard"
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <Button variant="ghost" size="sm" asChild className="self-start">
              <Link href="/citizen/dashboard">
                <ArrowLeft className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Back to Dashboard</span>
                <span className="sm:hidden">Back</span>
              </Link>
            </Button>
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl font-bold">Report New Issue</h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Help improve your community by reporting civic issues
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4 sm:py-6 max-w-2xl">
        <Card>
          <CardHeader className="pb-4 sm:pb-6">
            <CardTitle className="flex items-center text-lg sm:text-xl">
              <AlertTriangle className="w-5 h-5 mr-2 text-accent" />
              Issue Details
            </CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Provide as much detail as possible to help municipal authorities address the issue quickly.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              {/* Issue Title */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium">
                  Issue Title *
                </Label>
                <Input
                  id="title"
                  placeholder="Brief description of the issue"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  className="h-11 sm:h-10"
                  required
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category" className="text-sm font-medium">
                  Category *
                </Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                  <SelectTrigger className="h-11 sm:h-10">
                    <SelectValue placeholder="Select issue category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pothole">Pothole</SelectItem>
                    <SelectItem value="streetlight">Streetlight</SelectItem>
                    <SelectItem value="garbage">Garbage Collection</SelectItem>
                    <SelectItem value="water-leak">Water Leakage</SelectItem>
                    <SelectItem value="traffic">Traffic Signal</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">
                  Description *
                </Label>
                <Textarea
                  id="description"
                  placeholder="Provide detailed description of the issue, including any relevant context or urgency"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  rows={4}
                  className="resize-none"
                  required
                />
              </div>

              {/* Location */}
              <div className="space-y-3 sm:space-y-4">
                <Label className="text-sm font-medium">Location *</Label>

                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Input
                      placeholder="Enter street address or landmark"
                      value={formData.location}
                      onChange={(e) => handleInputChange("location", e.target.value)}
                      className="flex-1 h-11 sm:h-10"
                      required
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleLocationDetect}
                      className="h-11 sm:h-10 sm:w-auto bg-transparent"
                    >
                      <MapPin className="w-4 h-4 mr-2" />
                      <span className="sm:hidden">Detect Location</span>
                      <span className="hidden sm:inline">Detect</span>
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Input
                      placeholder="Latitude"
                      value={formData.coordinates.lat}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          coordinates: { ...prev.coordinates, lat: e.target.value },
                        }))
                      }
                      className="h-11 sm:h-10"
                    />
                    <Input
                      placeholder="Longitude"
                      value={formData.coordinates.lng}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          coordinates: { ...prev.coordinates, lng: e.target.value },
                        }))
                      }
                      className="h-11 sm:h-10"
                    />
                  </div>
                </div>

                {/* Map Placeholder */}
                <div className="h-40 sm:h-48 bg-muted rounded-lg flex items-center justify-center border-2 border-dashed border-border">
                  <div className="text-center p-4">
                    <MapPin className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Interactive map for location selection</p>
                    <p className="text-xs text-muted-foreground mt-1">Click to pin exact location</p>
                  </div>
                </div>
              </div>

              {/* Photo Upload */}
              <div className="space-y-2">
                <Label htmlFor="photo" className="text-sm font-medium">
                  Photo Evidence
                </Label>
                <div className="border-2 border-dashed border-border rounded-lg p-4 sm:p-6">
                  <div className="text-center">
                    {formData.image ? (
                      <div className="space-y-3">
                        <CheckCircle className="w-8 h-8 text-status-resolved mx-auto" />
                        <p className="text-sm font-medium">{formData.image.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(formData.image.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setFormData((prev) => ({ ...prev, image: null }))}
                        >
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Upload className="w-8 h-8 text-muted-foreground mx-auto" />
                        <div>
                          <p className="text-sm font-medium">Upload a photo of the issue</p>
                          <p className="text-xs text-muted-foreground">PNG, JPG up to 10MB</p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 justify-center">
                          <Button type="button" variant="outline" size="sm" asChild className="h-10 bg-transparent">
                            <label htmlFor="photo" className="cursor-pointer">
                              <Upload className="w-4 h-4 mr-2" />
                              Choose File
                            </label>
                          </Button>
                          <Button type="button" variant="outline" size="sm" className="h-10 bg-transparent">
                            <Camera className="w-4 h-4 mr-2" />
                            Take Photo
                          </Button>
                        </div>
                      </div>
                    )}
                    <input id="photo" type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button type="submit" className="h-11 sm:h-10 sm:flex-1" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Submit Issue Report
                    </>
                  )}
                </Button>
                <Button type="button" variant="outline" asChild className="h-11 sm:h-10 sm:w-auto bg-transparent">
                  <Link href="/citizen/dashboard">Cancel</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Help Card */}
        <Card className="mt-4 sm:mt-6">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-base sm:text-lg">Reporting Tips</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>• Be specific and descriptive in your issue title and description</p>
            <p>• Include photos whenever possible - they help authorities understand the problem</p>
            <p>• Provide accurate location information for faster response</p>
            <p>• Check if the issue has already been reported to avoid duplicates</p>
            <p>• For emergencies, contact emergency services directly</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
