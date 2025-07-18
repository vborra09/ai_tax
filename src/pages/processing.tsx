"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import { Calculator, CheckCircle, Loader } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface ProcessingStep {
  id: string
  title: string
  description: string
  status: "pending" | "processing" | "completed"
}

export default function ProcessingPage() {
  const [steps, setSteps] = useState<ProcessingStep[]>([
    {
      id: "extract",
      title: "Extracting Document Data",
      description: "Reading and parsing your tax documents...",
      status: "processing",
    },
    {
      id: "validate",
      title: "Validating Information",
      description: "Checking data accuracy and completeness...",
      status: "pending",
    },
    {
      id: "calculate",
      title: "Calculating Tax Liability",
      description: "Computing your taxes using current IRS rules...",
      status: "pending",
    },
    {
      id: "generate",
      title: "Generating Form 1040",
      description: "Creating your completed tax return...",
      status: "pending",
    },
  ])

  const [progress, setProgress] = useState(0)
  const router = useRouter()

  useEffect(() => {
    const processSteps = async () => {
      for (let i = 0; i < steps.length; i++) {
        await new Promise((resolve) => setTimeout(resolve, 2000))

        setSteps((prev) =>
          prev.map((step, index) => {
            if (index === i) {
              return { ...step, status: "completed" }
            } else if (index === i + 1) {
              return { ...step, status: "processing" }
            }
            return step
          }),
        )

        setProgress(((i + 1) / steps.length) * 100)
      }

      // Navigate to results after all steps complete
      setTimeout(() => {
        router.push("/results")
      }, 1000)
    }

    processSteps()
  }, [router, steps.length])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-black">Processing Your Tax Return</h1>
          <p className="text-muted-foreground mt-1">Please wait while we process your documents</p>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Progress Bar */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Processing Progress</CardTitle>
            <CardDescription>Your tax return is being processed</CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-muted-foreground mt-2">{Math.round(progress)}% complete</p>
          </CardContent>
        </Card>

        {/* Progress Steps */}
        <div className="space-y-6">
          {steps.map((step, index) => (
            <Card key={step.id}>
              <CardContent className="flex items-start p-6">
                <div className="flex-shrink-0">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      step.status === "completed"
                        ? "bg-green-100"
                        : step.status === "processing"
                          ? "bg-primary/10"
                          : "bg-muted"
                    }`}
                  >
                    {step.status === "completed" && <CheckCircle className="w-6 h-6 text-green-600" />}
                    {step.status === "processing" && <Loader className="w-6 h-6 text-primary animate-spin" />}
                    {step.status === "pending" && <div className="w-6 h-6 rounded-full bg-muted-foreground/30" />}
                  </div>
                </div>

                <div className="ml-4 flex-1">
                  <h3
                    className={`text-lg font-medium ${
                      step.status === "completed"
                        ? "text-green-900"
                        : step.status === "processing"
                          ? "text-primary"
                          : "text-muted-foreground"
                    }`}
                  >
                    {step.title}
                  </h3>
                  <p
                    className={`mt-1 ${
                      step.status === "completed"
                        ? "text-green-700"
                        : step.status === "processing"
                          ? "text-primary/80"
                          : "text-muted-foreground"
                    }`}
                  >
                    {step.description}
                  </p>

                  {step.status === "processing" && (
                    <div className="mt-3">
                      <Progress value={60} className="w-full h-2" />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>


        {/* Security Notice */}
        <Card className="mt-6 border-muted">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground text-center">
              <strong>Security Notice:</strong> Your documents are processed in memory and are not permanently stored.
              All data is encrypted and handled according to industry security standards.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
