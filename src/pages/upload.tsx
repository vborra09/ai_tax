"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/router"
import { Upload, FileText, AlertCircle, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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
  })
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

    const files = Array.from(e.dataTransfer.files)
    handleFiles(files)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      handleFiles(files)
    }
  }

  const handleFiles = (files: File[]) => {
    const newFiles = files.map((file) => ({
      file,
      type: detectDocumentType(file.name),
      status: "pending" as const,
    }))
    setUploadedFiles((prev) => [...prev, ...newFiles])
  }

  const detectDocumentType = (filename: string): string => {
    const name = filename.toLowerCase()
    if (name.includes("w-2") || name.includes("w2")) return "W-2"
    if (name.includes("1099-int")) return "1099-INT"
    if (name.includes("1099-nec")) return "1099-NEC"
    if (name.includes("1099")) return "1099"
    return "Unknown"
  }

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (uploadedFiles.length === 0) return

    // Simulate processing
    setUploadedFiles((prev) => prev.map((file) => ({ ...file, status: "processing" })))

    // Simulate API call delay
    setTimeout(() => {
      setUploadedFiles((prev) => prev.map((file) => ({ ...file, status: "completed" })))
      router.push("/processing")
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold">Upload Tax Documents</h1>
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
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={personalInfo.firstName}
                    onChange={(e) => setPersonalInfo((prev) => ({ ...prev, firstName: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={personalInfo.lastName}
                    onChange={(e) => setPersonalInfo((prev) => ({ ...prev, lastName: e.target.value }))}
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
            </CardContent>
          </Card>

          {/* File Upload */}
          <Card>
            <CardHeader>
              <CardTitle>Upload Documents</CardTitle>
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
                  accept=".pdf"
                  onChange={handleFileInput}
                  className="hidden"
                  id="file-upload"
                />
                <Button asChild variant="outline">
                  <label htmlFor="file-upload" className="cursor-pointer">
                    Choose Files
                  </label>
                </Button>
                <p className="text-sm text-muted-foreground mt-2">Supported: PDF files only</p>
              </div>

              {/* Uploaded Files */}
              {uploadedFiles.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-medium mb-3">Uploaded Documents</h3>
                  <div className="space-y-2">
                    {uploadedFiles.map((uploadedFile, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-md">
                        <div className="flex items-center">
                          <FileText className="h-5 w-5 text-muted-foreground mr-3" />
                          <div>
                            <p className="font-medium">{uploadedFile.file.name}</p>
                            <p className="text-sm text-muted-foreground">Type: {uploadedFile.type}</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          {uploadedFile.status === "pending" && (
                            <Button variant="ghost" size="sm" onClick={() => removeFile(index)}>
                              Remove
                            </Button>
                          )}
                          {uploadedFile.status === "processing" && (
                            <div className="flex items-center text-primary">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                              Processing
                            </div>
                          )}
                          {uploadedFile.status === "completed" && <CheckCircle className="h-5 w-5 text-green-600" />}
                          {uploadedFile.status === "error" && <AlertCircle className="h-5 w-5 text-destructive" />}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Submit Button */}
        <div className="mt-8 text-center">
          <Button
            onClick={handleSubmit}
            disabled={uploadedFiles.length === 0 || !personalInfo.firstName || !personalInfo.lastName}
            size="lg"
          >
            Process Tax Documents
          </Button>
        </div>
      </div>
    </div>
  )
}
