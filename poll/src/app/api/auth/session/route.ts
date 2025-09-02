import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get session
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error || !session) {
      return NextResponse.json({ error: 'No session' }, { status: 401 })
    }

    return NextResponse.json({
      access_token: session.access_token,
      expires_at: session.expires_at
    })

  } catch (error) {
    console.error('Session API error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}