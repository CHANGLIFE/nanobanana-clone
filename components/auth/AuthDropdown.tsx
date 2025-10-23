'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { User, LogIn, AlertCircle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useState } from 'react'
import Link from 'next/link'

export function AuthDropdown() {
  const { login, loading } = useAuth()
  const [isLoggingIn, setIsLoggingIn] = useState<string | null>(null)
  const [needsConfig, setNeedsConfig] = useState(false)

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
      <Button disabled size="sm">
        Loading...
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <User className="h-4 w-4 mr-2" />
          Sign In
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {needsConfig ? (
          <DropdownMenuItem asChild>
            <Link href="/auth/setup" className="flex items-center">
              <AlertCircle className="mr-2 h-4 w-4 text-orange-500" />
              <span className="text-orange-600">Setup Authentication</span>
            </Link>
          </DropdownMenuItem>
        ) : (
          <>
            <DropdownMenuItem
              onClick={() => handleLogin('github')}
              disabled={isLoggingIn !== null}
            >
              <div className="w-4 h-4 mr-2 bg-black rounded" />
              {isLoggingIn === 'github' ? 'Signing in...' : 'Sign in with GitHub'}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleLogin('google')}
              disabled={isLoggingIn !== null}
            >
              <div className="w-4 h-4 mr-2 bg-white border border-gray-300 rounded" />
              {isLoggingIn === 'google' ? 'Signing in...' : 'Sign in with Google'}
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/auth/setup" className="text-sm text-muted-foreground">
            <AlertCircle className="mr-2 h-4 w-4" />
            Auth Help
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}