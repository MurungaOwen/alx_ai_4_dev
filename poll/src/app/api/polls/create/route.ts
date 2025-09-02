import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import type { Database } from '@/lib/supabase/types'

type PollInsert = Database['public']['Tables']['polls']['Insert']
type PollOptionInsert = Database['public']['Tables']['poll_options']['Insert']

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { pollData, accessToken } = body

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Access token required' },
        { status: 401 }
      )
    }

    // Create supabase client with access token
    const supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      }
    )

    // Verify the token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)
    
    console.log('API auth check with token:', { 
      hasUser: !!user, 
      userId: user?.id,
      authError: authError?.message 
    })

    if (authError || !user) {
      console.error('Token auth error:', authError)
      return NextResponse.json(
        { error: 'Invalid access token' },
        { status: 401 }
      )
    }

    const { title, description, categoryId, options, allowAnonymous, allowMultipleVotes } = pollData

    // Validate input
    if (!title?.trim()) {
      return NextResponse.json(
        { error: 'Poll title is required' },
        { status: 400 }
      )
    }

    if (!options || options.length < 2) {
      return NextResponse.json(
        { error: 'At least 2 options are required' },
        { status: 400 }
      )
    }

    if (options.some((opt: string) => !opt.trim())) {
      return NextResponse.json(
        { error: 'All options must have text' },
        { status: 400 }
      )
    }

    // Create poll
    const pollInsert: PollInsert = {
      title: title.trim(),
      description: description?.trim() || null,
      creator_id: user.id,
      category_id: categoryId || null,
      status: 'active',
      vote_type: allowMultipleVotes ? 'multiple' : 'single',
      allow_anonymous: allowAnonymous ?? true,
      allow_multiple_votes: allowMultipleVotes ?? false,
      expires_at: null,
    }

    const { data: poll, error: pollError } = await supabase
      .from('polls')
      .insert(pollInsert)
      .select()
      .single()

    if (pollError) {
      console.error('Create poll error:', pollError)
      return NextResponse.json(
        { error: 'Failed to create poll' },
        { status: 500 }
      )
    }

    // Create poll options
    const optionsInsert: PollOptionInsert[] = options
      .filter((opt: string) => opt.trim())
      .map((option: string, index: number) => ({
        poll_id: poll.id,
        text: option.trim(),
        position: index,
      }))

    const { error: optionsError } = await supabase
      .from('poll_options')
      .insert(optionsInsert)

    if (optionsError) {
      console.error('Create options error:', optionsError)
      // Clean up poll if options failed
      await supabase.from('polls').delete().eq('id', poll.id)
      return NextResponse.json(
        { error: 'Failed to create poll options' },
        { status: 500 }
      )
    }

    console.log('Poll created successfully:', poll.id)
    revalidatePath('/polls')
    
    return NextResponse.json(
      { success: true, data: poll },
      { status: 201 }
    )

  } catch (error) {
    console.error('API route error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}