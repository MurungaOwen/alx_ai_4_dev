/**
 * Centralized client-side authentication service
 * All auth operations should go through this service
 */

import { supabase } from '@/lib/supabase/client'
import type { User, Session } from '@supabase/supabase-js'

export interface AuthError {
  message: string
  code?: string
}

export class AuthService {
  private static instance: AuthService
  
  private constructor() {}
  
  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService()
    }
    return AuthService.instance
  }

  /**
   * Get current session
   */
  async getSession(): Promise<{ session: Session | null; error: AuthError | null }> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('AuthService - Get session error:', error)
        return { session: null, error: { message: error.message, code: error.code } }
      }
      
      return { session, error: null }
    } catch (err: any) {
      console.error('AuthService - Unexpected get session error:', err)
      return { session: null, error: { message: 'Failed to get session' } }
    }
  }

  /**
   * Get current user
   */
  async getUser(): Promise<{ user: User | null; error: AuthError | null }> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error) {
        console.error('AuthService - Get user error:', error)
        return { user: null, error: { message: error.message, code: error.code } }
      }
      
      return { user, error: null }
    } catch (err: any) {
      console.error('AuthService - Unexpected get user error:', err)
      return { user: null, error: { message: 'Failed to get user' } }
    }
  }

  /**
   * Sign in with email and password
   */
  async signIn(email: string, password: string): Promise<{ user: User | null; error: AuthError | null }> {
    try {
      console.log('AuthService - Signing in with email:', email)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) {
        console.error('AuthService - Sign in error:', error)
        return { user: null, error: { message: error.message, code: error.code } }
      }
      
      console.log('AuthService - Sign in successful')
      return { user: data.user, error: null }
    } catch (err: any) {
      console.error('AuthService - Unexpected sign in error:', err)
      return { user: null, error: { message: 'Failed to sign in' } }
    }
  }

  /**
   * Sign up with email and password
   */
  async signUp(email: string, password: string, metadata?: { full_name?: string }): Promise<{ user: User | null; error: AuthError | null }> {
    try {
      console.log('AuthService - Signing up with email:', email)
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: metadata,
        },
      })
      
      if (error) {
        console.error('AuthService - Sign up error:', error)
        return { user: null, error: { message: error.message, code: error.code } }
      }
      
      console.log('AuthService - Sign up successful')
      return { user: data.user, error: null }
    } catch (err: any) {
      console.error('AuthService - Unexpected sign up error:', err)
      return { user: null, error: { message: 'Failed to sign up' } }
    }
  }

  /**
   * Sign in with OAuth provider
   */
  async signInWithProvider(provider: 'github' | 'google', redirectTo?: string): Promise<{ error: AuthError | null }> {
    try {
      console.log('AuthService - Signing in with provider:', provider)
      
      const callbackUrl = redirectTo 
        ? `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`
        : `${window.location.origin}/auth/callback`
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: callbackUrl,
        },
      })
      
      if (error) {
        console.error('AuthService - Provider sign in error:', error)
        return { error: { message: error.message, code: error.code } }
      }
      
      console.log('AuthService - Provider sign in initiated')
      return { error: null }
    } catch (err: any) {
      console.error('AuthService - Unexpected provider sign in error:', err)
      return { error: { message: `Failed to sign in with ${provider}` } }
    }
  }

  /**
   * Sign out
   */
  async signOut(): Promise<{ error: AuthError | null }> {
    try {
      console.log('AuthService - Starting sign out...')
      
      // First try to sign out from Supabase
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('AuthService - Sign out error:', error)
        // Continue with cleanup even if sign out fails
      }
      
      console.log('AuthService - Clearing auth cookies...')
      
      // Clear all Supabase cookies
      if (typeof window !== 'undefined') {
        // Clear cookies
        document.cookie.split(";").forEach(function(c) { 
          const cookie = c.trim()
          if (cookie.includes('sb-') || cookie.includes('supabase')) {
            const eqPos = cookie.indexOf("=")
            const name = eqPos > -1 ? cookie.substring(0, eqPos) : cookie
            document.cookie = `${name}=;expires=${new Date(0).toUTCString()};path=/`
          }
        })
        
        // Clear local storage
        Object.keys(localStorage).forEach(key => {
          if (key.includes('supabase')) {
            localStorage.removeItem(key)
          }
        })
        
        // Clear session storage
        Object.keys(sessionStorage).forEach(key => {
          if (key.includes('supabase')) {
            sessionStorage.removeItem(key)
          }
        })
      }
      
      console.log('AuthService - Sign out complete')
      return { error: null }
    } catch (err: any) {
      console.error('AuthService - Unexpected sign out error:', err)
      return { error: { message: 'Failed to sign out completely' } }
    }
  }

  /**
   * Refresh session
   */
  async refreshSession(): Promise<{ session: Session | null; error: AuthError | null }> {
    try {
      console.log('AuthService - Refreshing session...')
      
      const { data: { session }, error } = await supabase.auth.refreshSession()
      
      if (error) {
        console.error('AuthService - Refresh session error:', error)
        return { session: null, error: { message: error.message, code: error.code } }
      }
      
      console.log('AuthService - Session refreshed')
      return { session, error: null }
    } catch (err: any) {
      console.error('AuthService - Unexpected refresh session error:', err)
      return { session: null, error: { message: 'Failed to refresh session' } }
    }
  }

  /**
   * Set up auth state change listener
   */
  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange(callback)
  }
}

// Export singleton instance
export const authService = AuthService.getInstance()