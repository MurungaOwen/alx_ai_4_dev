"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Sparkles, ArrowRight, Github, Mail, AlertCircle } from "lucide-react"
import { useAuth } from "@/providers/auth-provider"

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const { signIn, signInWithProvider, error } = useAuth()

  const handleEmailSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    
    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    
    try {
      await signIn(email, password)
    } catch (err) {
      console.error('Sign in error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleProviderSignIn = async (provider: 'github' | 'google') => {
    setIsLoading(true)
    
    try {
      await signInWithProvider(provider)
    } catch (err) {
      console.error('Provider sign in error:', err)
      setIsLoading(false)
    }
  }

  return (
    <div className="page-container">
      <div className="mx-auto max-w-md">
        <div className="text-center mb-8 animate-fade-in">
          <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-2xl bg-primary/10 mb-4">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">Welcome back</h1>
          <p className="text-muted-foreground mt-2">
            Sign in to your account to continue creating and voting on polls
          </p>
        </div>

        <Card className="border-2 glass-effect animate-slide-up">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl">Sign In</CardTitle>
            <CardDescription>
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Social Login */}
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                className="h-11"
                onClick={() => handleProviderSignIn('github')}
                disabled={isLoading}
              >
                <Github className="mr-2 h-4 w-4" />
                GitHub
              </Button>
              <Button 
                variant="outline" 
                className="h-11"
                onClick={() => handleProviderSignIn('google')}
                disabled={isLoading}
              >
                <Mail className="mr-2 h-4 w-4" />
                Google
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  Or continue with email
                </span>
              </div>
            </div>

            {/* Email Login */}
            <form onSubmit={handleEmailSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email address
                </Label>
                <Input 
                  id="email" 
                  name="email"
                  type="email" 
                  placeholder="you@example.com" 
                  className="h-11"
                  required 
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password
                  </Label>
                  <Link 
                    href="/auth/reset-password" 
                    className="text-sm text-primary hover:text-primary/80 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input 
                  id="password" 
                  name="password"
                  type="password" 
                  placeholder="Enter your password"
                  className="h-11"
                  required 
                  disabled={isLoading}
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full h-11 text-base font-medium shadow-sm hover:shadow-md transition-shadow"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
                {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </form>

            <div className="text-center text-sm">
              <span className="text-muted-foreground">Don't have an account? </span>
              <Link 
                href="/auth/register" 
                className="text-primary hover:text-primary/80 font-medium transition-colors"
              >
                Sign up for free
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-xs text-muted-foreground">
            By signing in, you agree to our{" "}
            <Link href="#" className="hover:text-foreground transition-colors">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="#" className="hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}