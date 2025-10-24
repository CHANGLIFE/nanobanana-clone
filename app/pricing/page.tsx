import { Metadata } from 'next'
import { Pricing } from '@/components/pricing'

export const metadata: Metadata = {
  title: 'Pricing - Nano Banana AI Image Editor',
  description: 'Choose the perfect plan for your AI image editing needs. Simple, transparent pricing for individuals and businesses.',
  openGraph: {
    title: 'Pricing - Nano Banana AI Image Editor',
    description: 'Choose the perfect plan for your AI image editing needs.',
    type: 'website',
  },
}

export default function PricingPage() {
  return <Pricing />
}