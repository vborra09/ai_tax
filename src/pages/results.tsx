'use client';

import { Download, FileText, DollarSign, AlertTriangle, Lightbulb, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import api from '@/lib/axios';

interface ParsedForm {
  file: string;
  document_type: string;
  parsed_fields: Record<string, string>;
}

interface TaxResults {
  parsed_forms: ParsedForm[];
  tax_summary: {
    total_income: number;
    adjustments: number;
    adjusted_gross_income: number;
    standard_deduction: number;
    taxable_income: number;
    initial_tax_liability: number;
    total_credits: number;
    final_tax_liability: number;
    total_withheld: number;
    tax_due: number;
    refund: number;
    has_anomalies: boolean;
    anomalies: string[];
  };
  filled_pdf_base64?: string;
  optimization_tips: {
    tips: string[];
  };
}

export default function ResultsPage() {
  const [results, setResults] = useState<TaxResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();

   useEffect(() => {
    const dataParam = searchParams.get('data')
    if (dataParam) {
      try {
        const parsedData = JSON.parse(dataParam)
        console.log('Parsed results data:', parsedData)
        setResults(parsedData)
      } catch (error) {
        console.error('Error parsing results data:', error)
      }
    }
  }, [searchParams])

  const handleDownloadPdf = () => {
    if (!results?.filled_pdf_base64) {
      setError('PDF not available for download');
      return;
    }

    try {
      const link = document.createElement('a');
      link.href = `data:application/pdf;base64,${results.filled_pdf_base64}`;
      link.download = 'tax_return_1040.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      setError('Failed to download PDF');
      console.error('Download error:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 mx-auto animate-spin" />
          <p>Processing your tax results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Alert variant="destructive" className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!results) {
    return null;
  }

  const { tax_summary, parsed_forms, optimization_tips } = results;
  const isRefund = tax_summary.refund > 0;

  return (
    <div className="min-h-screen bg-muted">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 id="page-title" className="text-2xl font-bold text-primary">
            Your Tax Return Results
          </h1>
          <p id="page-description" className=" text-gray-800">Review your calculated tax return</p>
        </div>
      </header>

      <main aria-labelledby="page-title" aria-describedby="page-description">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Summary Card */}
          <Card className="mb-8">
            <CardContent className="text-center p-6">
              <Badge
                variant={isRefund ? 'default' : 'destructive'}
                className="text-lg px-4 py-2 mb-4"
              >
                <DollarSign className="w-5 h-5 mr-2" />
                {isRefund ? 'Refund' : 'Amount Owed'}: $
                {Math.abs(tax_summary.refund).toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Badge>
              <p className="text-muted-foreground">
                {isRefund
                  ? 'Congratulations! You have a tax refund.'
                  : 'You owe additional taxes for this tax year.'}
              </p>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <Button
              id="download-btn"
              onClick={handleDownloadPdf}
              className="flex-1"
              size="lg"
              disabled={!results.filled_pdf_base64}
              aria-labelledby="download-btn-label"
            >
              <Download className="w-5 h-5 mr-2" />
              <span id="download-btn-label">Download Form 1040</span>
            </Button>
            <Button
              id="efile-btn"
              variant="secondary"
              className="flex-1"
              size="lg"
              aria-labelledby="efile-btn-label"
            >
              <FileText className="w-5 h-5 mr-2" />
              <span id="efile-btn-label">E-File Return</span>
            </Button>
          </div>

          {/* Tabs */}
          <div role="tablist" aria-label="Tax result sections">
            <Tabs defaultValue="summary" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-white">
                <TabsTrigger 
                  value="summary" 
                  id="tab-summary" 
                  aria-controls="tabpanel-summary"
                  className="data-[state=active]:bg-black data-[state=active]:text-white text-black"
                >
                  Tax Summary
                </TabsTrigger>
                <TabsTrigger 
                  value="documents" 
                  id="tab-documents" 
                  aria-controls="tabpanel-documents"
                  className="data-[state=active]:bg-black data-[state=active]:text-white text-black"
                >
                  Documents
                </TabsTrigger>
                <TabsTrigger 
                  value="tips" 
                  id="tab-tips" 
                  aria-controls="tabpanel-tips"
                  className="data-[state=active]:bg-black data-[state=active]:text-white text-black"
                >
                  Optimization Tips
                </TabsTrigger>
              </TabsList>


              {/* Summary Tab */}
              <TabsContent
                value="summary"
                className="mt-6"
                id="tabpanel-summary"
                aria-labelledby="tab-summary"
                role="tabpanel"
                tabIndex={0}
              >
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle id="income-summary-title">Income Summary</CardTitle>
                    </CardHeader>
                    <CardContent aria-labelledby="income-summary-title">
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total Income:</span>
                          <span className="font-medium">
                            ${tax_summary.total_income.toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Adjusted Gross Income:</span>
                          <span className="font-medium">
                            ${tax_summary.adjusted_gross_income.toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Standard Deduction:</span>
                          <span className="font-medium">
                            ${tax_summary.standard_deduction.toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </span>
                        </div>
                        <div className="flex justify-between border-t pt-2">
                          <span className="font-semibold">Taxable Income:</span>
                          <span className="font-semibold">
                            ${tax_summary.taxable_income.toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle id="tax-calculation-title">Tax Calculation</CardTitle>
                    </CardHeader>
                    <CardContent aria-labelledby="tax-calculation-title">
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Tax Liability:</span>
                          <span className="font-medium">
                            ${tax_summary.final_tax_liability.toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Federal Tax Withheld:</span>
                          <span className="font-medium">
                            ${tax_summary.total_withheld.toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </span>
                        </div>
                        <div
                          className={`flex justify-between border-t pt-2 ${
                            isRefund ? 'text-green-600' : 'text-destructive'
                          }`}
                        >
                          <span className="font-semibold">
                            {isRefund ? 'Refund:' : 'Amount Owed:'}
                          </span>
                          <span className="font-semibold">
                            ${Math.abs(tax_summary.refund).toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Anomalies Alert */}
                {tax_summary.has_anomalies && (
                  <Alert variant="destructive" className="mt-6">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Potential Issues Detected</AlertTitle>
                    <AlertDescription>
                      <ul className="list-disc pl-5 space-y-1">
                        {tax_summary.anomalies.map((anomaly, index) => (
                          <li key={index}>{anomaly}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}
              </TabsContent>

              {/* Document Details Tab */}
              <TabsContent
                value="documents"
                className="mt-6"
                id="tabpanel-documents"
                aria-labelledby="tab-documents"
                role="tabpanel"
                tabIndex={0}
              >
                <div className="space-y-6">
                  {parsed_forms.map((form, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <CardTitle id={`document-title-${index}`}>{form.document_type}</CardTitle>
                        <CardDescription>{form.file}</CardDescription>
                      </CardHeader>
                      <CardContent aria-labelledby={`document-title-${index}`}>
                        <div className="space-y-3">
                          {Object.entries(form.parsed_fields).map(([field, value]) => (
                            <div key={field} className="flex justify-between">
                              <span className="text-muted-foreground">{field}:</span>
                              <span className="font-medium">{value}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Optimization Tips Tab */}
              <TabsContent
                value="tips"
                className="mt-6"
                id="tabpanel-tips"
                aria-labelledby="tab-tips"
                role="tabpanel"
                tabIndex={0}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center" id="tips-title">
                      <Lightbulb className="w-5 h-5 mr-2 text-yellow-500" />
                      Tax Optimization Tips
                    </CardTitle>
                    <CardDescription>Recommendations to improve your tax situation</CardDescription>
                  </CardHeader>
                  <CardContent aria-labelledby="tips-title">
                    <ul className="space-y-4">
                      {optimization_tips.tips.map((tip, index) => (
                        <li key={index} className="flex items-start">
                          <span className="flex-shrink-0 mr-2">•</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Download Options (if PDF available) */}
          {results.filled_pdf_base64 && (
            <div className="mt-8">
              <label htmlFor="download-options" className="block text-sm font-medium mb-2 text-black">
                Download Options
              </label>
              <select
                id="download-options"
                className="border rounded p-2 w-full text-black"
                aria-describedby="download-options-help"
              >
                <option value="full">Full Tax Return</option>
                <option value="summary">Summary Only</option>
              </select>
              <p id="download-options-help" className="text-sm text-muted-foreground mt-1">
                Select which version you'd like to download
              </p>
            </div>
          )}

          {/* Disclaimer */}
          <Alert className="mt-8">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Important Disclaimer</AlertTitle>
            <AlertDescription>
              This information is provided for educational purposes only and should not be considered
              tax advice. Please consult with a qualified tax professional before making any
              decisions.
            </AlertDescription>
          </Alert>
        </div>
      </main>
    </div>
  );
}