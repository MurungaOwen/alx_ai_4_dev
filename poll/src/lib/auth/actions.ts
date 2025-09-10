'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function signUp(formData: FormData) {
  const supabase = await createClient()

  const firstName = formData.get('firstName') as string
  const lastName = formData.get('lastName') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const fullName = `${firstName} ${lastName}`.trim()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      data: {
        full_name: fullName,
      },
    },
  })

  if (error) {
    console.error('Sign up error:', error)
    return { error: error.message }
  }

  return { 
    success: true, 
    message: 'Check your email for a verification link',
    needsVerification: true 
  }
}

export async function signIn(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error('Sign in error:', error)
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signOut() {
  const supabase = await createClient()

  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error('Sign out error:', error)
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/auth/login')
}

export async function signInWithProvider(provider: 'github' | 'google') {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  })

  if (error) {
    console.error(`${provider} sign in error:`, error)
    return { error: error.message }
  }

  if (data.url) {
    redirect(data.url)
  }
}

export async function resetPassword(email: string) {
  const supabase = await createClient()

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password`,
  })

  if (error) {
    console.error('Reset password error:', error)
    return { error: error.message }
  }

  return { 
    success: true, 
    message: 'Check your email for a password reset link' 
  }
}

export async function updatePassword(newPassword: string) {
  const supabase = await createClient()

  // Verify user is authenticated first
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    console.error('Auth error in updatePassword:', authError)
    return { error: 'Authentication required' }
  }

  const { error } = await supabase.auth.updateUser({
    password: newPassword
  })

  if (error) {
    console.error('Update password error:', error)
    return { error: error.message }
  }

  return { success: true, message: 'Password updated successfully' }
}

export async function getCurrentUser() {
  const supabase = await createClient()

  const { data: { user }, error } = await supabase.auth.getUser()

  if (error) {
    console.error('Get user error:', error)
    return null
  }

  return user
}

export async function getProfile(userId?: string) {
  const supabase = await createClient()
  
  // If no userId provided, get current user
  if (!userId) {
    const user = await getCurrentUser()
    if (!user) return null
    userId = user.id
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Get profile error:', error)
    return null
  }

  return profile
}

export async function updateProfile(profileData: {
  full_name?: string
  bio?: string
  avatar_url?: string
}) {
  const supabase = await createClient()
  
  // Get user directly from supabase client
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    console.error('Auth error in updateProfile:', authError)
    return { error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('profiles')
    .update({
      ...profileData,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)
    .select()
    .single()

  if (error) {
    console.error('Update profile error:', error)
    return { error: error.message }
  }

  revalidatePath('/profile')
  return { success: true, data }
}