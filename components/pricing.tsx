"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Sparkles, Zap, Crown, ArrowRight } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { LoginButton } from "@/components/auth/LoginButton"

interface PricingPlan {
  id: string
  name: string
  description: string
  price: number
  period: string
  features: string[]
  icon: React.ReactNode
  popular?: boolean
  credits: number
  buttonText: string
}

const pricingPlans: PricingPlan[] = [
  {
    id: "free",
    name: "Free",
    description: "Perfect for trying out Nano Banana",
    price: 0,
    period: "forever",
    credits: 10,
    icon: <Sparkles className="h-6 w-6" />,
    features: [
      "10 AI credits per month",
      "Basic image editing",
      "Standard quality output",
      "Community support",
      "Single user account"
    ],
    buttonText: "Get Started"
  },
  {
    id: "pro",
    name: "Pro",
    description: "For creators who need more power",
    price: 9.99,
    period: "month",
    credits: 500,
    icon: <Zap className="h-6 w-6" />,
    popular: true,
    features: [
      "500 AI credits per month",
      "Advanced image editing",
      "HD quality output",
      "Priority support",
      "Commercial usage rights",
      "Custom style presets",
      "Batch processing (up to 10 images)"
    ],
    buttonText: "Start Free Trial"
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "For teams and businesses",
    price: 29.99,
    period: "month",
    credits: 2000,
    icon: <Crown className="h-6 w-6" />,
    features: [
      "2000 AI credits per month",
      "Unlimited image editing",
      "Ultra-HD 4K output",
      "Dedicated support",
      "Full commercial rights",
      "Custom model training",
      "Unlimited batch processing",
      "API access",
      "Team collaboration tools",
      "White-label options"
    ],
    buttonText: "Contact Sales"
  }
]

export function Pricing() {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
  const { user } = useAuth()
  // Test mode for development - remove in production
  const testMode = process.env.NODE_ENV === 'development'

  const handleSubscribe = async (planId: string) => {
    if (!user) {
      // Redirect to login or show login modal
      return
    }

    setLoadingPlan(planId)

    try {
      // Use test payment endpoint in development
      const paymentEndpoint = testMode ? '/api/test-payment' : '/api/creem/create-payment'

      console.log('Creating payment session:', {
        planId,
        endpoint: paymentEndpoint,
        testMode
      })

      const response = await fetch(paymentEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId,
          planName: pricingPlans.find(p => p.id === planId)?.name,
          price: pricingPlans.find(p => p.id === planId)?.price,
          userId: user.id,
        }),
      })

      const data = await response.json()

      if (data.success) {
        console.log('Payment session created:', data)
        // Redirect to payment page
        window.location.href = data.paymentUrl
      } else {
        console.error('Payment creation failed:', data.error)
        alert(`Payment failed: ${data.error}${data.details ? ` - ${data.details}` : ''}`)
      }
    } catch (error) {
      console.error('Error creating payment:', error)
      alert('Payment service is currently unavailable. Please try again later.')
    } finally {
      setLoadingPlan(null)
    }
  }

  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted/20">
      <div className="container px-4 mx-auto">
        {testMode && (
          <div className="text-center mb-4">
            <Badge variant="outline" className="text-xs">
              🧪 Development Mode - Using Test Payments
            </Badge>
          </div>
        )}

        <div className="text-center mb-16">
          <Badge className="mb-4" variant="secondary">
            Simple, Transparent Pricing
          </Badge>
          <h2 className="text-4xl font-bold tracking-tight mb-4">
            Choose Your Creative Plan
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Unlock the full power of AI-powered image editing with our flexible pricing plans
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {pricingPlans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative overflow-hidden transition-all duration-200 hover:shadow-lg ${
                plan.popular
                  ? 'ring-2 ring-primary shadow-primary/20 scale-105'
                  : 'border-border'
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-sm font-semibold px-4 py-1 rounded-bl-lg">
                  Most Popular
                </div>
              )}

              <CardHeader className="text-center pb-8">
                <div className="flex justify-center mb-4">
                  <div className={`p-3 rounded-full ${
                    plan.popular ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  }`}>
                    {plan.icon}
                  </div>
                </div>
                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                <CardDescription className="text-base">{plan.description}</CardDescription>

                <div className="mt-6">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold">
                      ${plan.price === 0 ? '0' : plan.price.toFixed(2)}
                    </span>
                    {plan.price > 0 && (
                      <span className="text-muted-foreground">/{plan.period}</span>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground mt-2">
                    {plan.credits} AI credits included
                  </div>
                </div>
              </CardHeader>

              <CardContent className="flex-grow">
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                {plan.id === 'free' ? (
                  user ? (
                    <Button
                      className="w-full"
                      variant={plan.popular ? "default" : "outline"}
                      disabled={user?.plan === 'free'}
                    >
                      {user?.plan === 'free' ? 'Current Plan' : plan.buttonText}
                    </Button>
                  ) : (
                    <LoginButton className="w-full">
                      {plan.buttonText}
                    </LoginButton>
                  )
                ) : plan.id === 'enterprise' ? (
                  <Button
                    className="w-full"
                    variant={plan.popular ? "default" : "outline"}
                    onClick={() => window.location.href = 'mailto:sales@nanobanana.ai'}
                  >
                    Contact Sales
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    className="w-full"
                    variant={plan.popular ? "default" : "outline"}
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={loadingPlan === plan.id || !user}
                  >
                    {loadingPlan === plan.id ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Processing...
                      </>
                    ) : !user ? (
                      'Login Required'
                    ) : (
                      plan.buttonText
                    )}
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center">
          <h3 className="text-2xl font-semibold mb-4">Need a custom plan?</h3>
          <p className="text-muted-foreground mb-6">
            We offer tailored solutions for teams with specific requirements
          </p>
          <Button variant="outline" size="lg">
            Get in Touch
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        {/* FAQ Section */}
        <div className="mt-20 max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h3>
          <div className="grid gap-6">
            {[
              {
                question: "What are AI credits?",
                answer: "AI credits are used for each image generation or edit. Different operations consume different amounts of credits based on complexity and processing requirements."
              },
              {
                question: "Can I change or cancel my plan anytime?",
                answer: "Yes, you can upgrade, downgrade, or cancel your subscription at any time. Changes will take effect at the next billing cycle."
              },
              {
                question: "Do unused credits roll over?",
                answer: "For Pro and Enterprise plans, unused credits roll over to the next month up to a maximum of 2x your monthly allowance."
              },
              {
                question: "What payment methods do you accept?",
                answer: "We accept all major credit cards, debit cards, and various digital payment methods through our secure payment processor."
              },
              {
                question: "Is my data secure?",
                answer: "Absolutely. We use industry-standard encryption and never share your images or personal data with third parties."
              }
            ].map((faq, index) => (
              <div key={index} className="border-b pb-6 last:border-b-0">
                <h4 className="font-semibold mb-2">{faq.question}</h4>
                <p className="text-muted-foreground">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}