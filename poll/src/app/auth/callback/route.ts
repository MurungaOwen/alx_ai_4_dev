import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'
  
  console.log('Auth callback - incoming request:', {
    code: code ? 'present' : 'missing',
    next,
    origin,
    allParams: Object.fromEntries(searchParams)
  })

  if (code) {
    try {
      const supabase = await createClient()
      
      console.log('Auth callback - exchanging code for session...')
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Auth callback - session exchange failed:', error)
        return NextResponse.redirect(`${origin}/auth/auth-code-error?error=${encodeURIComponent(error.message)}`)
      }

      if (data.session) {
        console.log('Auth callback - session created successfully for user:', data.user?.email)
        
        const forwardedHost = request.headers.get('x-forwarded-host')
        const isLocalEnv = process.env.NODE_ENV === 'development'
        
        const redirectUrl = isLocalEnv 
          ? `${origin}${next}`
          : forwardedHost 
            ? `https://${forwardedHost}${next}`
            : `${origin}${next}`

        console.log('Auth callback - redirecting to:', redirectUrl)
        return NextResponse.redirect(redirectUrl)
      } else {
        console.error('Auth callback - no session created despite no error')
        return NextResponse.redirect(`${origin}/auth/auth-code-error?error=no_session`)
      }
    } catch (err) {
      console.error('Auth callback - unexpected error:', err)
      return NextResponse.redirect(`${origin}/auth/auth-code-error?error=unexpected`)
    }
  } else {
    console.error('Auth callback - no code parameter provided')
    return NextResponse.redirect(`${origin}/auth/auth-code-error?error=no_code`)
  }
}