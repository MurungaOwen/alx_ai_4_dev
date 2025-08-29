import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"

export default function AuthCodeErrorPage() {
  return (
    <div className="page-container">
      <div className="mx-auto max-w-md">
        <Card className="border-2 glass-effect">
          <CardHeader className="text-center">
            <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-full bg-destructive/10 mb-4">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle className="text-xl">Authentication Error</CardTitle>
            <CardDescription>
              There was an error processing your authentication request
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              The authentication link you used may be invalid or expired. 
              Please try signing in again.
            </p>
            <div className="space-y-2">
              <Link href="/auth/login" className="block">
                <Button className="w-full">
                  Try Again
                </Button>
              </Link>
              <Link href="/" className="block">
                <Button variant="outline" className="w-full">
                  Back to Home
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}