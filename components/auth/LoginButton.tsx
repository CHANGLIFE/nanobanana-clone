'use client'

import { Button } from '@/components/ui/button'
import { Github, AlertCircle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export function LoginButton() {
  const { login, loading } = useAuth()
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [needsConfig, setNeedsConfig] = useState(false)

  const handleLogin = async () => {
    if (isLoggingIn) return

    try {
      setIsLoggingIn(true)
      await login('github')
    } catch (error: any) {
      console.error('Login failed:', error)
      if (error.message?.includes('Supabase authentication is not configured')) {
        setNeedsConfig(true)
      }
    } finally {
      setIsLoggingIn(false)
    }
  }

  if (loading) {
    return (
      <Button disabled>
        <Github className="mr-2 h-4 w-4" />
        Loading...
      </Button>
    )
  }

  if (needsConfig) {
    return (
      <Button
        variant="outline"
        asChild
        className="border-orange-500 text-orange-600 hover:bg-orange-50 hover:text-orange-700"
      >
        <Link href="/auth/setup">
          <AlertCircle className="mr-2 h-4 w-4" />
          Setup Authentication
        </Link>
      </Button>
    )
  }

  return (
    <Button
      onClick={handleLogin}
      disabled={isLoggingIn}
      className="bg-black hover:bg-gray-800 text-white"
    >
      <Github className="mr-2 h-4 w-4" />
      {isLoggingIn ? 'Signing in...' : 'Sign in with GitHub'}
    </Button>
  )
}