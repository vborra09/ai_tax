"use client"
import { Download, FileText, DollarSign, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface TaxSummary {
  totalIncome: number
  adjustedGrossIncome: number
  standardDeduction: number
  taxableIncome: number
  taxLiability: number
  withheld: number
  refundOrOwed: number
  isRefund: boolean
}

interface ExtractedData {
  w2: {
    employer: string
    wages: number
    federalWithheld: number
  }[]
  form1099: {
    type: string
    payer: string
    amount: number
  }[]
}

export default function ResultsPage() {
  // Mock data - in real app, this would come from your backend
  const taxSummary: TaxSummary = {
    totalIncome: 75000,
    adjustedGrossIncome: 75000,
    standardDeduction: 14600,
    taxableIncome: 60400,
    taxLiability: 6916,
    withheld: 8500,
    refundOrOwed: 1584,
    isRefund: true,
  }

  const extractedData: ExtractedData = {
    w2: [
      {
        employer: "ABC Corporation",
        wages: 75000,
        federalWithheld: 8500,
      },
    ],
    form1099: [
      {
        type: "1099-INT",
        payer: "First National Bank",
        amount: 150,
      },
    ],
  }

  const handleDownloadForm = () => {
    // In real app, this would trigger PDF generation and download
    alert("Form 1040 download would start here")
  }

  const handleFileReturn = () => {
    // In real app, this would integrate with IRS e-filing
    alert("E-filing integration would be implemented here")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold">Your Tax Return Results</h1>
          <p className="text-muted-foreground mt-1">Review your calculated tax return and download Form 1040</p>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tax Summary Card */}
        <Card className="mb-8">
          <CardContent className="text-center p-6">
            <Badge variant={taxSummary.isRefund ? "default" : "destructive"} className="text-lg px-4 py-2 mb-4">
              <DollarSign className="w-5 h-5 mr-2" />
              {taxSummary.isRefund ? "Refund" : "Amount Owed"}: ${Math.abs(taxSummary.refundOrOwed).toLocaleString()}
            </Badge>
            <p className="text-muted-foreground">
              {taxSummary.isRefund
                ? "Congratulations! You have a tax refund."
                : "You owe additional taxes for this tax year."}
            </p>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Button onClick={handleDownloadForm} className="flex-1" size="lg">
            <Download className="w-5 h-5 mr-2" />
            Download Form 1040
          </Button>
          <Button onClick={handleFileReturn} variant="secondary" className="flex-1" size="lg">
            <FileText className="w-5 h-5 mr-2" />
            E-File Return
          </Button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="summary" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="summary">Tax Summary</TabsTrigger>
            <TabsTrigger value="details">Extracted Data</TabsTrigger>
            <TabsTrigger value="form">Form Preview</TabsTrigger>
          </TabsList>

          {/* Tax Summary Tab */}
          <TabsContent value="summary">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Income Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Income:</span>
                    <span className="font-medium">${taxSummary.totalIncome.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Adjusted Gross Income:</span>
                    <span className="font-medium">${taxSummary.adjustedGrossIncome.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Standard Deduction:</span>
                    <span className="font-medium">-${taxSummary.standardDeduction.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-semibold">Taxable Income:</span>
                    <span className="font-semibold">${taxSummary.taxableIncome.toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tax Calculation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax Liability:</span>
                    <span className="font-medium">${taxSummary.taxLiability.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Federal Tax Withheld:</span>
                    <span className="font-medium">${taxSummary.withheld.toLocaleString()}</span>
                  </div>
                  <div
                    className={`flex justify-between border-t pt-2 ${
                      taxSummary.isRefund ? "text-green-600" : "text-destructive"
                    }`}
                  >
                    <span className="font-semibold">{taxSummary.isRefund ? "Refund:" : "Amount Owed:"}</span>
                    <span className="font-semibold">${Math.abs(taxSummary.refundOrOwed).toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Extracted Data Tab */}
          <TabsContent value="details">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>W-2 Forms</CardTitle>
                </CardHeader>
                <CardContent>
                  {extractedData.w2.map((w2, index) => (
                    <Card key={index} className="bg-muted">
                      <CardContent className="p-4">
                        <h4 className="font-medium mb-2">{w2.employer}</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Wages:</span>
                            <span className="ml-2 font-medium">${w2.wages.toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Federal Withheld:</span>
                            <span className="ml-2 font-medium">${w2.federalWithheld.toLocaleString()}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>1099 Forms</CardTitle>
                </CardHeader>
                <CardContent>
                  {extractedData.form1099.map((form1099, index) => (
                    <Card key={index} className="bg-muted">
                      <CardContent className="p-4">
                        <h4 className="font-medium mb-2">
                          {form1099.type} - {form1099.payer}
                        </h4>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Amount:</span>
                          <span className="ml-2 font-medium">${form1099.amount.toLocaleString()}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Form Preview Tab */}
          <TabsContent value="form">
            <Card>
              <CardContent className="text-center py-12">
                <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <CardTitle className="mb-2">Form 1040 Preview</CardTitle>
                <CardDescription className="mb-6">
                  Your completed Form 1040 is ready for download and filing.
                </CardDescription>
                <Button onClick={handleDownloadForm}>Download PDF</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Disclaimer */}
        <Alert className="mt-8">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Important Disclaimer</AlertTitle>
          <AlertDescription>
            This is a prototype demonstration. Please review all calculations and consult with a tax professional before
            filing your actual tax return. This tool is for educational purposes only.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  )
}
