"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ArrowLeft, Download, FileText, CalendarIcon, BarChart3, PieChart, TrendingUp, Shield } from "lucide-react"
import { format } from "date-fns"

// Mock report data
const availableReports = [
  {
    id: "monthly-summary",
    title: "Monthly Issue Summary",
    description: "Comprehensive overview of all issues reported and resolved in the selected month",
    type: "summary",
    lastGenerated: "2024-01-15T10:30:00Z",
    size: "2.3 MB",
  },
  {
    id: "department-performance",
    title: "Department Performance Report",
    description: "Analysis of each department's efficiency and resolution rates",
    type: "performance",
    lastGenerated: "2024-01-14T16:45:00Z",
    size: "1.8 MB",
  },
  {
    id: "citizen-satisfaction",
    title: "Citizen Satisfaction Survey",
    description: "Results from citizen feedback and satisfaction ratings",
    type: "satisfaction",
    lastGenerated: "2024-01-12T09:15:00Z",
    size: "1.2 MB",
  },
  {
    id: "geographic-analysis",
    title: "Geographic Issue Analysis",
    description: "Breakdown of issues by location and district patterns",
    type: "geographic",
    lastGenerated: "2024-01-10T14:20:00Z",
    size: "3.1 MB",
  },
  {
    id: "trend-analysis",
    title: "Trend Analysis Report",
    description: "Historical trends and predictive insights for issue patterns",
    type: "trends",
    lastGenerated: "2024-01-08T11:00:00Z",
    size: "2.7 MB",
  },
]

const quickStats = {
  totalReports: 47,
  thisMonth: 12,
  avgSize: "2.1 MB",
  lastExport: "2024-01-15",
}

const getReportIcon = (type: string) => {
  switch (type) {
    case "summary":
      return <FileText className="w-5 h-5 text-accent" />
    case "performance":
      return <BarChart3 className="w-5 h-5 text-status-progress" />
    case "satisfaction":
      return <TrendingUp className="w-5 h-5 text-status-resolved" />
    case "geographic":
      return <PieChart className="w-5 h-5 text-status-review" />
    case "trends":
      return <TrendingUp className="w-5 h-5 text-status-submitted" />
    default:
      return <FileText className="w-5 h-5 text-muted-foreground" />
  }
}

const getTypeColor = (type: string) => {
  switch (type) {
    case "summary":
      return "bg-accent text-accent-foreground"
    case "performance":
      return "bg-status-progress text-white"
    case "satisfaction":
      return "bg-status-resolved text-white"
    case "geographic":
      return "bg-status-review text-white"
    case "trends":
      return "bg-status-submitted text-white"
    default:
      return "bg-muted text-muted-foreground"
  }
}

export default function AdminReportsPage() {
  const [selectedReport, setSelectedReport] = useState("")
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  })
  const [reportFormat, setReportFormat] = useState("pdf")
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerateReport = async () => {
    if (!selectedReport) return

    setIsGenerating(true)
    // Simulate report generation
    await new Promise((resolve) => setTimeout(resolve, 3000))
    setIsGenerating(false)

    // In a real app, this would trigger a download
    console.log(`Generating ${selectedReport} report in ${reportFormat} format`)
  }

  const handleDownloadExisting = (reportId: string) => {
    // In a real app, this would trigger a download
    console.log(`Downloading report: ${reportId}`)
  }

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
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
          {/* Report Generation */}
          <div className="xl:col-span-2 space-y-4 sm:space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6 md:mb-8">
              <Card className="bg-white border-0 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 animate-fade-in group">
                <CardContent className="p-3 sm:p-4 md:p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-1 sm:space-x-2 mb-1 sm:mb-2">
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-600 rounded-full animate-pulse flex-shrink-0"></div>
                        <p className="text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wide truncate">
                          Total Reports
                        </p>
                      </div>
                      <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1 transition-all duration-300 group-hover:text-blue-600">
                        {quickStats.totalReports}
                      </p>
                    </div>
                    <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-blue-100 rounded-lg sm:rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                      <FileText className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-0 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 animate-fade-in group">
                <CardContent className="p-3 sm:p-4 md:p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-1 sm:space-x-2 mb-1 sm:mb-2">
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-amber-500 rounded-full animate-pulse flex-shrink-0"></div>
                        <p className="text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wide truncate">
                          This Month
                        </p>
                      </div>
                      <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1 transition-all duration-300 group-hover:text-amber-600">
                        {quickStats.thisMonth}
                      </p>
                    </div>
                    <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-amber-100 rounded-lg sm:rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                      <CalendarIcon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-amber-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-0 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 animate-fade-in group">
                <CardContent className="p-3 sm:p-4 md:p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-1 sm:space-x-2 mb-1 sm:mb-2">
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-500 rounded-full animate-pulse flex-shrink-0"></div>
                        <p className="text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wide truncate">
                          Avg Size
                        </p>
                      </div>
                      <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1 transition-all duration-300 group-hover:text-emerald-600">
                        {quickStats.avgSize}
                      </p>
                    </div>
                    <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-emerald-100 rounded-lg sm:rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                      <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-emerald-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-0 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 animate-fade-in group">
                <CardContent className="p-3 sm:p-4 md:p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-1 sm:space-x-2 mb-1 sm:mb-2">
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-500 rounded-full animate-pulse flex-shrink-0"></div>
                        <p className="text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wide truncate">
                          Last Export
                        </p>
                      </div>
                      <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1 transition-all duration-300 group-hover:text-gray-600">
                        {quickStats.lastExport}
                      </p>
                    </div>
                    <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gray-100 rounded-lg sm:rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                      <Download className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-gray-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Generate New Report */}
            <Card className="bg-white border-0 shadow-sm hover:shadow-lg transition-all duration-300 animate-fade-in">
              <CardHeader className="pb-3 sm:pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-3 shadow-lg">
                        <BarChart3 className="w-4 h-4 text-white" />
                      </div>
                      Generate New Report
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm text-gray-500 mt-1">
                      Create custom reports with specific parameters and date ranges
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-1 sm:space-y-2">
                    <label className="text-xs sm:text-sm font-medium text-gray-700">Report Type</label>
                    <Select value={selectedReport} onValueChange={setSelectedReport}>
                      <SelectTrigger className="border-gray-200 h-9 sm:h-10">
                        <SelectValue placeholder="Select report type" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableReports.map((report) => (
                          <SelectItem key={report.id} value={report.id}>
                            {report.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1 sm:space-y-2">
                    <label className="text-xs sm:text-sm font-medium text-gray-700">Format</label>
                    <Select value={reportFormat} onValueChange={setReportFormat}>
                      <SelectTrigger className="border-gray-200 h-9 sm:h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pdf">PDF Document</SelectItem>
                        <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                        <SelectItem value="csv">CSV Data</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1 sm:space-y-2">
                  <label className="text-xs sm:text-sm font-medium text-gray-700">Date Range</label>
                  <div className="flex flex-col md:flex-row gap-2 sm:gap-3">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="flex-1 justify-start text-left font-normal border-gray-200 text-gray-700 hover:bg-gray-50 transition-all duration-200">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          <span className="truncate">{dateRange.from ? format(dateRange.from, "PPP") : "Start date"}</span>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={dateRange.from}
                          onSelect={(date) => setDateRange((prev) => ({ ...prev, from: date }))}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="flex-1 justify-start text-left font-normal border-gray-200 text-gray-700 hover:bg-gray-50 transition-all duration-200">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          <span className="truncate">{dateRange.to ? format(dateRange.to, "PPP") : "End date"}</span>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={dateRange.to}
                          onSelect={(date) => setDateRange((prev) => ({ ...prev, to: date }))}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {selectedReport && (
                  <div className="p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h4 className="font-medium text-sm sm:text-base mb-1 sm:mb-2 text-gray-900">
                      {availableReports.find((r) => r.id === selectedReport)?.title}
                    </h4>
                    <p className="text-xs sm:text-sm text-gray-600">
                      {availableReports.find((r) => r.id === selectedReport)?.description}
                    </p>
                  </div>
                )}

                <Button 
                  onClick={handleGenerateReport} 
                  disabled={!selectedReport || isGenerating} 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200 transform hover:scale-105"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      <span className="hidden xs:inline">Generating Report...</span>
                      <span className="xs:hidden">Generating...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      <span className="hidden xs:inline">Generate & Download Report</span>
                      <span className="xs:hidden">Generate Report</span>
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Available Reports */}
          <div className="mt-6 xl:mt-0">
            <Card className="bg-white border-0 shadow-sm hover:shadow-lg transition-all duration-300 animate-fade-in">
              <CardHeader className="pb-3 sm:pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-base sm:text-lg font-semibold text-gray-900">
                      Available Reports
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm text-gray-500 mt-1">
                      Previously generated reports ready for download
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-3 sm:space-y-4">
                {availableReports.map((report) => (
                  <div key={report.id} className="p-3 sm:p-4 border border-gray-100 rounded-lg hover:border-gray-200 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 space-y-2 sm:space-y-3">
                    <div className="flex items-start gap-2 sm:gap-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        {getReportIcon(report.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-xs sm:text-sm text-gray-900 line-clamp-2">{report.title}</h4>
                        <p className="text-xs text-gray-600 line-clamp-2 mt-1 hidden sm:block">{report.description}</p>
                      </div>
                      <Badge className={`${getTypeColor(report.type)} text-xs px-2 py-1 flex-shrink-0 hidden sm:block`} variant="secondary">
                        {report.type}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className="truncate">{new Date(report.lastGenerated).toLocaleDateString()}</span>
                      <span className="flex-shrink-0">{report.size}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-gray-200 text-gray-700 hover:bg-gray-50 transition-all duration-200 hover:scale-105"
                      onClick={() => handleDownloadExisting(report.id)}
                    >
                      <Download className="w-3 h-3 mr-2" />
                      <span className="hidden xs:inline">Download</span>
                      <span className="xs:hidden">Get</span>
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
