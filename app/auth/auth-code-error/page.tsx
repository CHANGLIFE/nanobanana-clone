import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"
import Link from "next/link"

export default function AuthCodeErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Authentication Error</CardTitle>
          <CardDescription>
            There was an error during the authentication process.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-4">
            <h4 className="font-medium mb-2">Possible solutions:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Try logging in again</li>
              <li>• Check if your GitHub account has a public email</li>
              <li>• Make sure you authorized the application</li>
            </ul>
          </div>
          <div className="flex flex-col gap-2">
            <Button asChild className="w-full">
              <Link href="/">Try Again</Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link href="https://github.com/settings/connections/applications">
                Check GitHub Settings
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}