"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Camera, AlertCircle, Upload, CheckCircle, X } from "lucide-react"
import MapPicker, { MapPickerValue } from "@/components/map-picker"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { createClient } from "@/lib/supabase/client"

interface FormData {
  title: string
  description: string
  category: string
  priority: string
  location_address: string
  location_lat: string
  location_lng: string
  image_url: string
  landmark?: string
  file?: File
}

export default function ReportIssuePage() {
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    category: "",
    priority: "medium",
    location_address: "",
    location_lat: "",
    location_lng: "",
    image_url: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
  const [dialogType, setDialogType] = useState<'success' | 'error'>('success')
  const { toast } = useToast()
  const router = useRouter()
  const { user } = useAuth()
  const supabase = createClient()

  // Redirect to login if not authenticated
  useEffect(() => {
    if (user === null) router.push('/citizen/login')
  }, [user, router])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleFileUpload = async (file: File) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to upload images",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)
    try {
      const form = new FormData()
      form.append('file', file)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: form,
        credentials: 'include',
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to upload file')

      // Save both uploaded URL and File object for Gemini
      setFormData(prev => ({ ...prev, image_url: data.url, file }))

      toast({
        title: "Success",
        description: "Image uploaded successfully",
      })
    } catch (error: any) {
      console.error('Upload error:', error)
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload image. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            location_lat: position.coords.latitude.toString(),
            location_lng: position.coords.longitude.toString()
          }))
          toast({
            title: "Location detected",
            description: "Your current location has been added to the issue."
          })
        },
        () => {
          toast({
            title: "Location Error",
            description: "Unable to detect location. Please enter manually.",
            variant: "destructive",
          })
        }
      )
    } else {
      toast({
        title: "Location Not Supported",
        description: "Geolocation is not supported by this browser.",
        variant: "destructive",
      })
    }
  }

  const handleDialogOk = () => {
    setShowDialog(false)
    router.push('/citizen/dashboard')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Convert file to base64 if exists
      let imageBase64: string | null = null
      if (formData.file) {
        const reader = new FileReader()
        imageBase64 = await new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string)
          reader.onerror = reject
          reader.readAsDataURL(formData.file as File)
        })
      }

      // Gemini verification
      const verifyRes = await fetch("/api/verify-issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          category: formData.category,
          description: formData.description,
          imageBase64
        })
      })

      if (!verifyRes.ok) throw new Error("Verification request failed")
      const { decision } = await verifyRes.json()

      console.log("=== GEMINI VERIFICATION LOG ===")
      console.log("Title:", formData.title)
      console.log("Category:", formData.category)
      console.log("Description:", formData.description)
      console.log("Has Image:", !!formData.file)
      console.log("Gemini Decision:", decision)
      console.log("=================================")

      if (decision !== "Yes") {
        // Show error dialog for failed verification
        setDialogType('error')
        setShowDialog(true)
        setIsSubmitting(false)
        return
      }

      // Submit issue to backend (or Supabase) if verification passes
      const res = await fetch('/api/issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to submit issue')

      // Reset form on successful submission
      setFormData({
        title: "",
        description: "",
        category: "",
        priority: "medium",
        location_address: "",
        location_lat: "",
        location_lng: "",
        image_url: "",
      })

      // Show success dialog
      setDialogType('success')
      setShowDialog(true)

    } catch (err: any) {
      console.error("Error during submission:", err)
      toast({
        title: "Submission Failed",
        description: err.message || "Something went wrong. Please try again.",
        variant: "destructive"
      })
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Report an Issue</h1>
            <p className="text-gray-600">Help improve your community by reporting issues that need attention</p>
          </div>

          {/* Card replacement */}
          <div className="bg-white rounded-lg shadow-md border">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold mb-2">Issue Details</h2>
              <p className="text-gray-600">Provide as much detail as possible to help us address the issue quickly</p>
            </div>
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Issue Title *</Label>
                  <Input id="title" value={formData.title} onChange={e => handleInputChange('title', e.target.value)} required placeholder="Brief description" />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea id="description" value={formData.description} onChange={e => handleInputChange('description', e.target.value)} rows={4} required placeholder="Detailed description..." />
                </div>

                {/* Category and Priority */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <select 
                      value={formData.category} 
                      onChange={e => handleInputChange('category', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select category</option>
                      <option value="Roads">Roads & Infrastructure</option>
                      <option value="Lighting">Street Lighting</option>
                      <option value="Sanitation">Sanitation & Waste</option>
                      <option value="Water">Water & Sewage</option>
                      <option value="Traffic">Traffic & Safety</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <select 
                      value={formData.priority} 
                      onChange={e => handleInputChange('priority', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <Label>Location *</Label>
                  <MapPicker
                    value={{
                      address: formData.location_address,
                      lat: formData.location_lat ? parseFloat(formData.location_lat) : null,
                      lng: formData.location_lng ? parseFloat(formData.location_lng) : null
                    }}
                    onChange={(val: MapPickerValue) => setFormData(prev => ({
                      ...prev,
                      location_address: val.address,
                      location_lat: val.lat !== null ? String(val.lat) : '',
                      location_lng: val.lng !== null ? String(val.lng) : '',
                    }))}
                    height={260}
                  />
                  <Input value={formData.location_address} readOnly className="text-xs" />
                </div>

                {/* Image Upload */}
                <div className="space-y-2">
                  <Label>Photo (Optional)</Label>
                  <div className="flex items-center gap-4">
                    <input type="file" accept="image/*" onChange={e => e.target.files && handleFileUpload(e.target.files[0])} className="hidden" id="image-upload" />
                    <label htmlFor="image-upload" className="flex items-center gap-2 px-4 py-2 border border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                      <Camera className="h-4 w-4" /> {isUploading ? "Uploading..." : "Upload Photo"}
                    </label>
                    {formData.image_url && <div className="flex items-center gap-2 text-sm text-green-600"><Upload className="h-4 w-4" /> Image uploaded</div>}
                  </div>
                </div>

                {/* Submit */}
                <div className="flex gap-4 pt-4">
                  <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1">Cancel</Button>
                  <Button type="submit" className="flex-1" disabled={isSubmitting || !formData.title || !formData.description || !formData.category || !(formData.location_lat && formData.location_lng)}>
                    {isSubmitting ? "Submitting..." : "Submit Issue"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Dialog Modal */}
      {showDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-mx-4 mx-4">
            <div className="text-center">
              <div className="mb-4">
                {dialogType === 'success' ? (
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto" />
                ) : (
                  <X className="h-12 w-12 text-red-600 mx-auto" />
                )}
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {dialogType === 'success' 
                  ? "Issue Submitted Successfully!" 
                  : "Verification Failed"
                }
              </h3>
              <p className="text-gray-600 mb-6">
                {dialogType === 'success' 
                  ? "Your issue has been submitted successfully and will be reviewed by our team. You will receive notifications about the progress."
                  : "Your report did not pass AI verification. Please ensure the issue description matches the category and represents a legitimate civic concern. You can try submitting again with more accurate information."
                }
              </p>
              <Button onClick={handleDialogOk} className="w-full">
                OK
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}