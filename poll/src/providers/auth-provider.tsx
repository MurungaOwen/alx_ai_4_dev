"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { User } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase/client"
import { authService } from "@/lib/auth/client"
import { Profile } from "@/lib/supabase/types"

interface AuthContextType {
  user: User | null
  profile: Profile | null
  loading: boolean
  error: string | null
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, fullName: string) => Promise<void>
  signOut: () => Promise<void>
  signInWithProvider: (provider: 'github' | 'google') => Promise<void>
  refreshProfile: () => Promise<void>
  invalidateUserStats: () => void
  statsInvalidated: number
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statsInvalidated, setStatsInvalidated] = useState(0)
  const router = useRouter()

  // Fetch user profile
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      setProfile(data)
    } catch (err) {
      console.error('Error fetching profile:', err)
    }
  }

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) throw error
        
        if (session?.user) {
          setUser(session.user)
          await fetchProfile(session.user.id)
        }
      } catch (err) {
        console.error('Auth initialization error:', err)
        setError('Failed to initialize authentication')
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()

    // Listen for auth changes
    const { data: { subscription } } = authService.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change event:', event, session?.user?.email)
        
        if (event === 'SIGNED_OUT') {
          console.log('User signed out - clearing state')
          setUser(null)
          setProfile(null)
          setLoading(false)
          return
        }
        
        if (session?.user) {
          setUser(session.user)
          await fetchProfile(session.user.id)
        } else {
          setUser(null)
          setProfile(null)
        }
        setLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      setError(null)
      const { user, error } = await authService.signIn(email, password)

      if (error) {
        setError(error.message)
        throw new Error(error.message)
      }

      if (user) {
        setUser(user)
        await fetchProfile(user.id)
        
        // Handle redirect parameter from URL
        const urlParams = new URLSearchParams(window.location.search)
        const redirect = urlParams.get('redirect')
        
        if (redirect && redirect.startsWith('/')) {
          router.push(redirect)
        } else {
          router.push('/')
        }
      }
    } catch (err: any) {
      console.error('Sign in error:', err)
      throw err
    }
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      setError(null)
      const { user, error } = await authService.signUp(email, password, { full_name: fullName })

      if (error) {
        setError(error.message)
        throw new Error(error.message)
      }

      return { user }
    } catch (err: any) {
      console.error('Sign up error:', err)
      throw err
    }
  }

  const signOut = async () => {
    try {
      setError(null)
      console.log('Auth Provider - Starting sign out...')
      
      // Use centralized auth service
      const { error } = await authService.signOut()
      
      if (error) {
        console.error('Auth Provider - Sign out error:', error)
        setError(error.message)
      }
      
      console.log('Auth Provider - Clearing local state...')
      
      // Clear local state immediately
      setUser(null)
      setProfile(null)
      setLoading(false)
      
      console.log('Auth Provider - Redirecting to login...')
      // Use window.location for hard redirect to ensure clean state
      window.location.href = '/auth/login'
    } catch (err: any) {
      console.error('Auth Provider - Sign out failed:', err)
      setError(err.message || 'Failed to sign out')
      
      // Even if sign out fails, clear local state and redirect
      setUser(null)
      setProfile(null)
      setLoading(false)
      window.location.href = '/auth/login'
    }
  }

  const signInWithProvider = async (provider: 'github' | 'google') => {
    try {
      setError(null)
      
      // Handle redirect parameter
      const urlParams = new URLSearchParams(window.location.search)
      const redirect = urlParams.get('redirect')
      
      const { error } = await authService.signInWithProvider(provider, redirect || undefined)

      if (error) {
        setError(error.message)
        throw new Error(error.message)
      }
    } catch (err: any) {
      console.error(`Sign in with ${provider} error:`, err)
      throw err
    }
  }

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id)
    }
  }

  const invalidateUserStats = () => {
    setStatsInvalidated(prev => prev + 1)
  }

  const value = {
    user,
    profile,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    signInWithProvider,
    refreshProfile,
    invalidateUserStats,
    statsInvalidated,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Hook for protected routes
export const useRequireAuth = (redirectTo = '/auth/login') => {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push(redirectTo)
    }
  }, [user, loading, router, redirectTo])

  return { user, loading }
}