"use client"

import { useState, useRef, ChangeEvent } from "react"
import { useRouter } from "next/navigation"
import { Upload, FileText, AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import api from "@/lib/axios"

interface UploadedFile {
  file: File
  type: string
  status: "pending" | "processing" | "completed" | "error"
}

export default function UploadPage() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [dragActive, setDragActive] = useState(false)
  const [personalInfo, setPersonalInfo] = useState({
    firstName: "",
    lastName: "",
    ssn: "",
    filingStatus: "single",
    dependents: 0,
    children: 0
  })
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files) {
      handleFiles(Array.from(e.dataTransfer.files))
    }
  }

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files))
      if (fileInputRef.current) {
        fileInputRef.current.value = "" // Reset input to allow same file re-upload
      }
    }
  }

  const validateFiles = (files: File[]): boolean => {
    const MAX_SIZE = 5 * 1024 * 1024 // 5MB
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png"]
    
    for (const file of files) {
      if (file.size > MAX_SIZE) {
        setError(`File too large: ${file.name} (max 5MB)`)
        return false
      }
      if (!allowedTypes.includes(file.type)) {
        setError(`Invalid file type: ${file.name} (only PDF, JPG, PNG)`)
        return false
      }
    }
    return true
  }

  const detectDocumentType = (filename: string): string => {
    const name = filename.toLowerCase()
    if (/w-?2/i.test(name)) return "W-2"
    if (/(1099-?int)/i.test(name)) return "1099-INT"
    if (/(1099-?nec)/i.test(name)) return "1099-NEC"
    if (/(1099-?div)/i.test(name)) return "1099-DIV"
    if (/(1099-?b)/i.test(name)) return "1099-B"
    if (/1040/i.test(name)) return "Form 1040"
    return "Other Tax Document"
  }

  const handleFiles = (files: File[]) => {
    setError("")
    if (!validateFiles(files)) return
    
    const newFiles = files.map((file) => ({
      file,
      type: detectDocumentType(file.name),
      status: "pending" as const,
    }))
    setUploadedFiles((prev) => [...prev, ...newFiles])
  }

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
  }

const handleSubmit = async () => {
  if (uploadedFiles.length === 0 || !personalInfo.firstName || !personalInfo.lastName) return

  setIsSubmitting(true)
  setError("")
  setUploadedFiles(prev => prev.map(file => ({ ...file, status: "processing" })))

  try {
    const formData = new FormData()
    formData.append("firstName", personalInfo.firstName)
    formData.append("lastName", personalInfo.lastName)
    formData.append("ssn", personalInfo.ssn)
    formData.append("filing_status", personalInfo.filingStatus)
    formData.append("num_other_dependents", personalInfo.dependents.toString())
    formData.append("num_qualifying_children", personalInfo.children.toString())

    uploadedFiles.forEach(file => {
      formData.append("files", file.file, file.file.name)
    })

    const response = await api.post("/process-forms/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })

    setUploadedFiles(prev => prev.map(file => ({ ...file, status: "completed" })))
    
    // Pass the entire response to the results page
    const params = new URLSearchParams({
      success: "true",
      data: JSON.stringify(response.data)
    }).toString()
    router.push(`/results?${params}`)
  } catch (err: any) {
    console.error("Upload failed:", err)
    const message =
      err.response?.data?.message ||
      err.message ||
      "Failed to upload documents. Please try again."

    setError(message)
    setUploadedFiles(prev => prev.map(file => ({
      ...file,
      status: file.status === "processing" ? "error" : file.status
    })))
  } finally {
    setIsSubmitting(false)
  }
}

  return (
    <div className="min-h-screen bg-muted">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-primary">Upload Tax Documents</h1>
          <p className="text-muted-foreground mt-1">Upload your W-2, 1099, and other tax documents</p>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Enter your basic information for tax filing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name*</Label>
                  <Input
                    id="firstName"
                    value={personalInfo.firstName}
                    onChange={(e) => setPersonalInfo((prev) => ({ ...prev, firstName: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name*</Label>
                  <Input
                    id="lastName"
                    value={personalInfo.lastName}
                    onChange={(e) => setPersonalInfo((prev) => ({ ...prev, lastName: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ssn">Social Security Number</Label>
                <Input
                  id="ssn"
                  type="password"
                  value={personalInfo.ssn}
                  onChange={(e) => setPersonalInfo((prev) => ({ ...prev, ssn: e.target.value }))}
                  placeholder="XXX-XX-XXXX"
                  pattern="\d{3}-?\d{2}-?\d{4}"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="filingStatus">Filing Status</Label>
                <Select
                  value={personalInfo.filingStatus}
                  onValueChange={(value) => setPersonalInfo((prev) => ({ ...prev, filingStatus: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single</SelectItem>
                    <SelectItem value="married-joint">Married Filing Jointly</SelectItem>
                    <SelectItem value="married-separate">Married Filing Separately</SelectItem>
                    <SelectItem value="head-of-household">Head of Household</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dependents">Number of Dependents</Label>
                <Input
                  id="dependents"
                  type="number"
                  min="0"
                  value={personalInfo.dependents}
                  onChange={(e) =>
                    setPersonalInfo((prev) => ({ ...prev, dependents: Number.parseInt(e.target.value) || 0 }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="children">Number of children</Label>
                <Input
                  id="children"
                  type="number"
                  min="0"
                  value={personalInfo.children}
                  onChange={(e) =>
                    setPersonalInfo((prev) => ({ ...prev, children: Number.parseInt(e.target.value) || 0 }))
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* File Upload */}
          <Card>
            <CardHeader>
              <CardTitle>Upload Documents*</CardTitle>
              <CardDescription>Drag and drop your tax documents or click to browse</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Upload Area */}
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive
                    ? "border-primary bg-primary/5"
                    : "border-muted-foreground/25 hover:border-muted-foreground/50"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium mb-2">Drop your tax documents here</p>
                <p className="text-muted-foreground mb-4">or click to browse files</p>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileInput}
                  className="hidden"
                  id="file-upload"
                  ref={fileInputRef}
                />
                <Button 
                  asChild 
                  variant="outline"
                  className="bg-white hover:bg-white hover:text-black hover:border-gray-300 transition-colors"
                >
                  <label htmlFor="file-upload" className="cursor-pointer">
                    Choose Files
                  </label>
                </Button>
                <p className="text-sm text-muted-foreground mt-2">Supported: PDF, JPG, PNG (max 5MB each)</p>
              </div>

              {/* Uploaded Files */}
              {uploadedFiles.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-medium mb-3">Uploaded Documents ({uploadedFiles.length})</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {uploadedFiles.map((uploadedFile, index) => (
                      <div key={index} className={`flex items-center justify-between p-3 rounded-md ${
                        uploadedFile.status === "error" ? "bg-destructive/10" : "bg-muted"
                      }`}>
                        <div className="flex items-center">
                          <FileText className="h-5 w-5 text-muted-foreground mr-3" />
                          <div>
                            <p className="font-medium">{uploadedFile.file.name}</p>
                            <p className="text-sm text-muted-foreground">Type: {uploadedFile.type}</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          {uploadedFile.status === "pending" && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => removeFile(index)}
                              className="text-destructive hover:text-destructive"
                            >
                              Remove
                            </Button>
                          )}
                          {uploadedFile.status === "processing" && (
                            <div className="flex items-center text-primary">
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              Processing
                            </div>
                          )}
                          {uploadedFile.status === "completed" && (
                            <div className="flex items-center text-green-600">
                              <CheckCircle className="h-5 w-5 mr-1" />
                              Done
                            </div>
                          )}
                          {uploadedFile.status === "error" && (
                            <div className="flex items-center text-destructive">
                              <AlertCircle className="h-5 w-5 mr-1" />
                              Failed
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Submit Button and Error Message */}
        <div className="mt-8 text-center space-y-4">
          {error && (
            <div className="p-4 bg-destructive/10 text-destructive rounded-md inline-flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              {error}
            </div>
          )}
          
          <Button
            onClick={handleSubmit}
            disabled={
              uploadedFiles.length === 0 || 
              !personalInfo.firstName || 
              !personalInfo.lastName ||
              isSubmitting
            }
            size="lg"
            className="min-w-48"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Submit Tax Documents'
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}