"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Sparkles, ArrowRight, Github, Mail, UserPlus, AlertCircle, CheckCircle } from "lucide-react"
import { useAuth } from "@/providers/auth-provider"

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const { signUp, signInWithProvider, error } = useAuth()

  const handleEmailSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setSuccess(false)
    
    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const firstName = formData.get('firstName') as string
    const lastName = formData.get('lastName') as string
    
    const fullName = `${firstName} ${lastName}`.trim()
    
    try {
      await signUp(email, password, fullName)
      setSuccess(true)
    } catch (err) {
      console.error('Sign up error:', err)
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

  if (success) {
    return (
      <div className="page-container">
        <div className="mx-auto max-w-md">
          <Card className="border-2 glass-effect">
            <CardHeader className="text-center">
              <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-full bg-green-100 mb-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-xl">Check Your Email</CardTitle>
              <CardDescription>
                We've sent you a verification link to complete your registration
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                Please check your email and click the verification link to activate your account.
              </p>
              <Link href="/auth/login">
                <Button className="w-full">
                  Back to Sign In
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <div className="mx-auto max-w-md">
        <div className="text-center mb-8 animate-fade-in">
          <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-2xl bg-primary/10 mb-4">
            <UserPlus className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">Create your account</h1>
          <p className="text-muted-foreground mt-2">
            Join thousands of users creating and sharing polls
          </p>
        </div>

        <Card className="border-2 glass-effect animate-slide-up">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl">Sign Up</CardTitle>
            <CardDescription>
              Create a new account to get started
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Social Registration */}
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
                  Or register with email
                </span>
              </div>
            </div>

            {/* Email Registration */}
            <form onSubmit={handleEmailSignUp} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm font-medium">
                    First name
                  </Label>
                  <Input 
                    id="firstName" 
                    name="firstName"
                    placeholder="John" 
                    className="h-11"
                    required 
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm font-medium">
                    Last name
                  </Label>
                  <Input 
                    id="lastName" 
                    name="lastName"
                    placeholder="Doe" 
                    className="h-11"
                    required 
                    disabled={isLoading}
                  />
                </div>
              </div>
              
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
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <Input 
                  id="password" 
                  name="password"
                  type="password" 
                  placeholder="Create a strong password"
                  className="h-11"
                  required 
                  disabled={isLoading}
                />
                <div className="text-xs text-muted-foreground">
                  Must be at least 8 characters long
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium">
                  Confirm password
                </Label>
                <Input 
                  id="confirmPassword" 
                  name="confirmPassword"
                  type="password" 
                  placeholder="Confirm your password"
                  className="h-11"
                  required 
                  disabled={isLoading}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="terms" required />
                <label htmlFor="terms" className="text-sm text-muted-foreground">
                  I agree to the{" "}
                  <Link href="#" className="text-primary hover:text-primary/80 transition-colors">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="#" className="text-primary hover:text-primary/80 transition-colors">
                    Privacy Policy
                  </Link>
                </label>
              </div>
              
              <Button 
                type="submit" 
                className="w-full h-11 text-base font-medium shadow-sm hover:shadow-md transition-shadow"
                disabled={isLoading}
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
                {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </form>

            <div className="text-center text-sm">
              <span className="text-muted-foreground">Already have an account? </span>
              <Link 
                href="/auth/login" 
                className="text-primary hover:text-primary/80 font-medium transition-colors"
              >
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              <span>Free forever</span>
            </div>
            <div className="w-px h-4 bg-border"></div>
            <span>No credit card required</span>
            <div className="w-px h-4 bg-border"></div>
            <span>Setup in 2 minutes</span>
          </div>
        </div>
      </div>
    </div>
  )
}