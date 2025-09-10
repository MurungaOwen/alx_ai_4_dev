import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch user's voting history with poll details
    const { data: votes, error } = await supabase
      .from('votes')
      .select(`
        id,
        created_at,
        poll_id,
        option_id,
        polls!inner(
          id,
          title,
          description,
          status,
          creator_id,
          profiles!inner(
            full_name,
            avatar_url
          )
        ),
        poll_options!inner(
          id,
          text
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching user votes:', error)
      return NextResponse.json({ error: 'Failed to fetch voting history' }, { status: 500 })
    }

    // Get total count for pagination
    const { count, error: countError } = await supabase
      .from('votes')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)

    if (countError) {
      console.error('Error counting user votes:', countError)
      return NextResponse.json({ error: 'Failed to count votes' }, { status: 500 })
    }

    // Transform the data for easier consumption
    const votingHistory = votes?.map(vote => ({
      id: vote.id,
      created_at: vote.created_at,
      poll: {
        id: vote.polls.id,
        title: vote.polls.title,
        description: vote.polls.description,
        status: vote.polls.status,
        creator: {
          full_name: vote.polls.profiles.full_name,
          avatar_url: vote.polls.profiles.avatar_url
        }
      },
      selected_option: {
        id: vote.poll_options.id,
        text: vote.poll_options.text
      }
    })) || []

    return NextResponse.json({
      success: true,
      data: {
        votes: votingHistory,
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit
      }
    })

  } catch (error) {
    console.error('Unexpected error in user votes API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}