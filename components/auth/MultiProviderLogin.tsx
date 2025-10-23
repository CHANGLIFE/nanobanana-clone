'use client'

import { Button } from '@/components/ui/button'
import { Github, Chrome, AlertCircle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useState } from 'react'
import Link from 'next/link'

interface Provider {
  id: 'github' | 'google'
  name: string
  icon: React.ReactNode
  className: string
  hoverClassName: string
}

export function MultiProviderLogin() {
  const { login, loading } = useAuth()
  const [isLoggingIn, setIsLoggingIn] = useState<string | null>(null)
  const [needsConfig, setNeedsConfig] = useState(false)

  const providers: Provider[] = [
    {
      id: 'github',
      name: 'GitHub',
      icon: <Github className="h-4 w-4" />,
      className: 'bg-black hover:bg-gray-800 text-white',
      hoverClassName: 'hover:bg-gray-800'
    },
    {
      id: 'google',
      name: 'Google',
      icon: <Chrome className="h-4 w-4" />,
      className: 'bg-white hover:bg-gray-50 text-gray-900 border border-gray-300',
      hoverClassName: 'hover:bg-gray-50'
    }
  ]

  const handleLogin = async (provider: 'github' | 'google') => {
    if (isLoggingIn) return

    try {
      setIsLoggingIn(provider)
      await login(provider)
    } catch (error: any) {
      console.error('Login failed:', error)
      if (error.message?.includes('Supabase authentication is not configured')) {
        setNeedsConfig(true)
      }
    } finally {
      setIsLoggingIn(null)
    }
  }

  if (loading) {
    return (
      <Button disabled className="w-full">
        Loading...
      </Button>
    )
  }

  if (needsConfig) {
    return (
      <Button
        variant="outline"
        asChild
        className="w-full border-orange-500 text-orange-600 hover:bg-orange-50 hover:text-orange-700"
      >
        <Link href="/auth/setup">
          <AlertCircle className="mr-2 h-4 w-4" />
          Setup Authentication
        </Link>
      </Button>
    )
  }

  return (
    <div className="w-full space-y-3">
      <div className="grid gap-3">
        {providers.map((provider) => (
          <Button
            key={provider.id}
            onClick={() => handleLogin(provider.id)}
            disabled={isLoggingIn !== null}
            className={`w-full ${provider.className} ${isLoggingIn === provider.id ? 'opacity-75' : ''}`}
          >
            {provider.icon}
            {isLoggingIn === provider.id ? (
              <>Signing in with {provider.name}...</>
            ) : (
              <>Sign in with {provider.name}</>
            )}
          </Button>
        ))}
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>
    </div>
  )
}