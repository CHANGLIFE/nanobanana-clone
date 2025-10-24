"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Home, ArrowRight } from "lucide-react"
import Link from "next/link"

function PaymentSuccessContent() {
  const [isLoading, setIsLoading] = useState(true)
  const [paymentStatus, setPaymentStatus] = useState<any>(null)
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')

  useEffect(() => {
    if (sessionId) {
      verifyPayment(sessionId)
    } else {
      setIsLoading(false)
    }
  }, [sessionId])

  const verifyPayment = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/payment/verify?session_id=${sessionId}`)
      const data = await response.json()

      if (data.success) {
        setPaymentStatus(data)
      }
    } catch (error) {
      console.error('Payment verification error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg">Verifying your payment...</p>
        </div>
      </div>
    )
  }

  // Show error state if payment verification failed
  if (!isLoading && (!paymentStatus || !paymentStatus.success)) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardHeader className="pb-4">
            <div className="mx-auto mb-4">
              <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">❌</span>
              </div>
            </div>
            <CardTitle className="text-2xl text-red-600">Payment Verification Failed</CardTitle>
            <CardDescription className="text-base">
              We couldn't verify your payment. Please contact support.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Button asChild className="w-full">
                <Link href="/pricing">
                  <ArrowRight className="mr-2 h-4 w-4" />
                  Back to Pricing
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center">
        <CardHeader className="pb-4">
          <div className="mx-auto mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl text-green-600">Payment Successful!</CardTitle>
          <CardDescription className="text-base">
            Thank you for subscribing to Nano Banana
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {paymentStatus && (
            <div className="bg-muted/50 rounded-lg p-4 text-sm">
              <h3 className="font-semibold mb-2">Subscription Details:</h3>
              <div className="text-left space-y-1">
                <p><span className="font-medium">Plan:</span> {paymentStatus.planName}</p>
                <p><span className="font-medium">Credits:</span> {paymentStatus.credits} AI credits added</p>
                <p><span className="font-medium">Status:</span> Active</p>
                {paymentStatus.isTest && (
                  <p className="text-orange-600"><span className="font-medium">Note:</span> This was a test payment</p>
                )}
              </div>
            </div>
          )}

          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Go to Dashboard
              </Link>
            </Button>

            <Button variant="outline" asChild className="w-full">
              <Link href="/#editor">
                Start Editing
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="text-xs text-muted-foreground mt-4">
            <p>A confirmation email has been sent to your registered email address.</p>
            <p>Need help? Contact our support team.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg">Loading...</p>
        </div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  )
}