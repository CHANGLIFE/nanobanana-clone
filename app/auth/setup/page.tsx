import { AuthSetupGuide } from '@/components/auth/AuthSetupGuide'
import Link from 'next/link'

export default function AuthSetupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-2xl font-bold text-primary hover:opacity-80 transition-opacity">
            <span className="text-3xl">🍌</span>
            Nano Banana
          </Link>
          <p className="text-muted-foreground mt-2">AI-Powered Image Editor</p>
        </div>
        <AuthSetupGuide />
      </div>
    </div>
  )
}