'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Info, ExternalLink, Github, Database, Chrome } from 'lucide-react'
import Link from 'next/link'

export function AuthSetupGuide() {
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-blue-100 to-red-100">
          <div className="flex items-center gap-1">
            <Github className="h-5 w-5 text-blue-600" />
            <div className="w-4 h-4 bg-white border border-gray-300 rounded-full flex items-center justify-center">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            </div>
          </div>
        </div>
        <CardTitle className="text-2xl">Setup Authentication</CardTitle>
        <CardDescription>
          Enable GitHub and Google login for Nano Banana AI Image Editor
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            You need to configure Supabase before GitHub authentication will work.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
              1
            </div>
            <div className="flex-1">
              <h4 className="font-semibold">Create Supabase Project</h4>
              <p className="text-sm text-muted-foreground">
                Visit{' '}
                <Link
                  href="https://supabase.com"
                  target="_blank"
                  className="text-blue-600 hover:underline inline-flex items-center"
                >
                  supabase.com <ExternalLink className="h-3 w-3 ml-1" />
                </Link>
                {' '}and create a new project.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
              2
            </div>
            <div className="flex-1">
              <h4 className="font-semibold">Enable Authentication Providers</h4>
              <p className="text-sm text-muted-foreground">
                In your Supabase dashboard, go to Authentication → Providers and enable both <strong>GitHub</strong> and <strong>Google</strong>.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
              3
            </div>
            <div className="flex-1">
              <h4 className="font-semibold">Create OAuth Applications</h4>
              <p className="text-sm text-muted-foreground mb-3">
                You need to create OAuth applications for both providers:
              </p>

              <div className="space-y-3">
                <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2 mb-2">
                    <Github className="h-4 w-4 text-blue-600" />
                    <span className="font-semibold text-sm">GitHub OAuth</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    Go to{' '}
                    <Link
                      href="https://github.com/settings/developers"
                      target="_blank"
                      className="text-blue-600 hover:underline inline-flex items-center"
                    >
                      GitHub Developer Settings <ExternalLink className="h-3 w-3 ml-1" />
                    </Link>
                  </p>
                  <div className="text-xs font-mono bg-muted p-2 rounded">
                    Callback: http://localhost:3005/api/auth/callback
                  </div>
                </div>

                <div className="p-3 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
                  <div className="flex items-center gap-2 mb-2">
                    <Chrome className="h-4 w-4 text-red-600" />
                    <span className="font-semibold text-sm">Google OAuth</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    Go to{' '}
                    <Link
                      href="https://console.cloud.google.com/"
                      target="_blank"
                      className="text-red-600 hover:underline inline-flex items-center"
                    >
                      Google Cloud Console <ExternalLink className="h-3 w-3 ml-1" />
                    </Link>
                    {' '}→ APIs & Services → Credentials
                  </p>
                  <div className="text-xs font-mono bg-muted p-2 rounded">
                    Callback: http://localhost:3005/api/auth/callback
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
              4
            </div>
            <div className="flex-1">
              <h4 className="font-semibold">Configure Environment Variables</h4>
              <p className="text-sm text-muted-foreground">
                Update your <code className="bg-muted px-1 rounded">.env.local</code> file with Supabase credentials.
              </p>
              <div className="mt-2 p-3 bg-muted rounded-lg text-xs font-mono">
                <div>NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co</div>
                <div>NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key</div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Button asChild className="w-full">
            <Link href="/README-AUTH.md" target="_blank">
              <Database className="mr-2 h-4 w-4" />
              View Detailed Setup Guide
            </Link>
          </Button>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Refresh After Configuration
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}