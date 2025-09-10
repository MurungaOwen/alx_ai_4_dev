"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/providers/auth-provider'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface ProtectedRouteProps {
  children: React.ReactNode
  redirectTo?: string
  fallback?: React.ReactNode
}

export function ProtectedRoute({ 
  children, 
  redirectTo = '/auth/login',
  fallback 
}: ProtectedRouteProps) {
  const { user, loading, error } = useAuth()
  const router = useRouter()
  const [hasTimedOut, setHasTimedOut] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      console.log('ProtectedRoute: Redirecting unauthenticated user to', redirectTo)
      router.replace(redirectTo) // Use replace instead of push to prevent back navigation issues
    }
  }, [user, loading, router, redirectTo])

  // Timeout mechanism to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading && !user) {
        console.warn('ProtectedRoute: Auth loading timed out, showing error state')
        setHasTimedOut(true)
      }
    }, 10000) // 10 second timeout

    return () => clearTimeout(timeout)
  }, [loading, user])

  // Handle auth error or timeout
  if (error || hasTimedOut) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="p-8 max-w-md mx-auto">
          <CardContent className="flex flex-col items-center space-y-4 p-0">
            <AlertCircle className="h-12 w-12 text-destructive" />
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold">Authentication Error</h3>
              <p className="text-muted-foreground">
                {error || 'Authentication is taking too long to load.'}
              </p>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => window.location.reload()}>
                Retry
              </Button>
              <Link href={redirectTo}>
                <Button variant="outline">
                  Sign In
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return fallback || (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="p-8">
          <CardContent className="flex flex-col items-center space-y-4 p-0">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!user) {
    // Show redirecting message instead of null to prevent blank screen
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="p-8">
          <CardContent className="flex flex-col items-center space-y-4 p-0">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Redirecting to login...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}

// Higher-order component version
export function withAuth<T extends {}>(
  Component: React.ComponentType<T>,
  redirectTo = '/auth/login'
) {
  return function AuthenticatedComponent(props: T) {
    return (
      <ProtectedRoute redirectTo={redirectTo}>
        <Component {...props} />
      </ProtectedRoute>
    )
  }
}