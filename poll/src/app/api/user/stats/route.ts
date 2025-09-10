import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Use the existing user_stats view
    const { data: stats, error } = await supabase
      .from('user_stats')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) {
      console.error('Error fetching user stats:', error)
      return NextResponse.json({ error: 'Failed to fetch user statistics' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: {
        polls_created: stats?.polls_created || 0,
        votes_cast: stats?.votes_cast || 0,
        total_votes_received: stats?.total_votes_received || 0,
        bookmarks_count: stats?.bookmarks_count || 0
      }
    })

  } catch (error) {
    console.error('Unexpected error in user stats API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}