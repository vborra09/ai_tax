import Link from "next/link"
import { FileText, Calculator, Download, Shield } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-muted">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Calculator className="h-8 w-8 text-primary mr-3" />
              <h1 className="text-2xl font-bold text-primary">AI Tax Agent</h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link href="#features" className="text-muted-foreground hover:text-foreground">
                Features
              </Link>
              
              <Link href="#support" className="text-muted-foreground hover:text-foreground">
                Support
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-primary">Automate Your Tax Return with AI</h2>
            <p className="text-xl mb-8 text-gray-800 max-w-3xl mx-auto">
              Upload your tax documents, let our AI extract the data, calculate your taxes, and generate a completed
              Form 1040 in minutes.
            </p>
            <Button asChild size="lg" variant="secondary">
              <Link href="/upload" className="inline-flex items-center">
                Start Your Tax Return
                <FileText className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-black">How It Works</h3>
            <p className="text-lg text-muted-foreground">Simple, secure, and automated tax preparation</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>Upload Documents</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>Upload your W-2, 1099, and other tax documents in PDF format</CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calculator className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle>AI Processing</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>Our AI extracts data and calculates your tax liability automatically</CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Download className="h-8 w-8 text-purple-600" />
                </div>
                <CardTitle>Download Form 1040</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>Get your completed, ready-to-file Form 1040 in minutes</CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      

      {/* Footer */}
      <footer className="bg-card border-t py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Calculator className="h-6 w-6 text-primary mr-2" />
              <span className="text-lg font-semibold text-black">AI Tax Agent</span>
            </div>
            <p className="text-muted-foreground">
              © 2024 AI Tax Agent. This is a prototype for demonstration purposes only.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
