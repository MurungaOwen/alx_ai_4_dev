'use server'

import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/actions'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { Database } from '@/lib/supabase/types'

type PollInsert = Database['public']['Tables']['polls']['Insert']
type PollOptionInsert = Database['public']['Tables']['poll_options']['Insert']

export interface CreatePollData {
  title: string
  description?: string
  categoryId?: string
  options: string[]
  allowAnonymous?: boolean
  allowMultipleVotes?: boolean
  expiresAt?: string
}

export async function createPoll(pollData: CreatePollData) {
  const supabase = createClient()
  const user = await getCurrentUser()

  if (!user) {
    return { error: 'Authentication required' }
  }

  const { title, description, categoryId, options, allowAnonymous, allowMultipleVotes, expiresAt } = pollData

  // Validate input
  if (!title.trim()) {
    return { error: 'Poll title is required' }
  }

  if (!options || options.length < 2) {
    return { error: 'At least 2 options are required' }
  }

  if (options.some(opt => !opt.trim())) {
    return { error: 'All options must have text' }
  }

  try {
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
      expires_at: expiresAt || null,
    }

    const { data: poll, error: pollError } = await supabase
      .from('polls')
      .insert(pollInsert)
      .select()
      .single()

    if (pollError) {
      console.error('Create poll error:', pollError)
      return { error: 'Failed to create poll' }
    }

    // Create poll options
    const optionsInsert: PollOptionInsert[] = options
      .filter(opt => opt.trim())
      .map((option, index) => ({
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
      return { error: 'Failed to create poll options' }
    }

    revalidatePath('/polls')
    return { success: true, data: poll }
  } catch (error) {
    console.error('Create poll error:', error)
    return { error: 'Failed to create poll' }
  }
}

export async function getPolls(options?: {
  status?: 'active' | 'draft' | 'closed'
  categoryId?: string
  creatorId?: string
  limit?: number
  offset?: number
}) {
  const supabase = createClient()
  
  let query = supabase
    .from('polls')
    .select(`
      *,
      creator:profiles!creator_id(id, full_name, avatar_url),
      category:categories(id, name, color),
      options:poll_options(id, text, vote_count),
      _count:votes(count)
    `)
    .order('created_at', { ascending: false })

  if (options?.status) {
    query = query.eq('status', options.status)
  }

  if (options?.categoryId) {
    query = query.eq('category_id', options.categoryId)
  }

  if (options?.creatorId) {
    query = query.eq('creator_id', options.creatorId)
  }

  if (options?.limit) {
    query = query.limit(options.limit)
  }

  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
  }

  const { data: polls, error } = await query

  if (error) {
    console.error('Get polls error:', error)
    return { error: 'Failed to fetch polls' }
  }

  return { success: true, data: polls }
}

export async function getPoll(id: string) {
  const supabase = createClient()
  const user = await getCurrentUser()

  const { data: poll, error } = await supabase
    .from('polls')
    .select(`
      *,
      creator:profiles!creator_id(id, full_name, avatar_url),
      category:categories(id, name, color),
      options:poll_options(
        id, 
        text, 
        description, 
        position, 
        vote_count,
        votes(id, user_id)
      )
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Get poll error:', error)
    return { error: 'Poll not found' }
  }

  // Check if current user has voted
  let hasVoted = false
  let userVotes: string[] = []

  if (user && poll.options) {
    for (const option of poll.options) {
      const userVote = option.votes?.find((vote: any) => vote.user_id === user.id)
      if (userVote) {
        hasVoted = true
        userVotes.push(option.id)
      }
    }
  }

  return { 
    success: true, 
    data: {
      ...poll,
      hasVoted,
      userVotes
    }
  }
}

export async function vote(pollId: string, optionId: string) {
  const supabase = createClient()
  const user = await getCurrentUser()

  // Get poll details first
  const { data: poll, error: pollError } = await supabase
    .from('polls')
    .select('*')
    .eq('id', pollId)
    .single()

  if (pollError || !poll) {
    return { error: 'Poll not found' }
  }

  if (poll.status !== 'active') {
    return { error: 'Poll is not active' }
  }

  // For authenticated users, check if they already voted
  if (user) {
    const { data: existingVote } = await supabase
      .from('votes')
      .select('id')
      .eq('poll_id', pollId)
      .eq('user_id', user.id)
      .single()

    if (existingVote && poll.vote_type === 'single') {
      return { error: 'You have already voted on this poll' }
    }
  }

  // Create vote
  const voteData = {
    poll_id: pollId,
    option_id: optionId,
    user_id: user?.id || null,
  }

  const { error: voteError } = await supabase
    .from('votes')
    .insert(voteData)

  if (voteError) {
    console.error('Vote error:', voteError)
    return { error: 'Failed to record vote' }
  }

  revalidatePath(`/polls/${pollId}`)
  return { success: true }
}

export async function deletePoll(pollId: string) {
  const supabase = createClient()
  const user = await getCurrentUser()

  if (!user) {
    return { error: 'Authentication required' }
  }

  // Verify ownership
  const { data: poll, error: pollError } = await supabase
    .from('polls')
    .select('creator_id')
    .eq('id', pollId)
    .single()

  if (pollError || !poll) {
    return { error: 'Poll not found' }
  }

  if (poll.creator_id !== user.id) {
    return { error: 'Unauthorized' }
  }

  const { error } = await supabase
    .from('polls')
    .delete()
    .eq('id', pollId)

  if (error) {
    console.error('Delete poll error:', error)
    return { error: 'Failed to delete poll' }
  }

  revalidatePath('/polls')
  return { success: true }
}

export async function updatePollStatus(pollId: string, status: 'active' | 'closed' | 'archived') {
  const supabase = createClient()
  const user = await getCurrentUser()

  if (!user) {
    return { error: 'Authentication required' }
  }

  // Verify ownership
  const { data: poll, error: pollError } = await supabase
    .from('polls')
    .select('creator_id')
    .eq('id', pollId)
    .single()

  if (pollError || !poll) {
    return { error: 'Poll not found' }
  }

  if (poll.creator_id !== user.id) {
    return { error: 'Unauthorized' }
  }

  const { error } = await supabase
    .from('polls')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', pollId)

  if (error) {
    console.error('Update poll status error:', error)
    return { error: 'Failed to update poll status' }
  }

  revalidatePath(`/polls/${pollId}`)
  return { success: true }
}

export async function getCategories() {
  const supabase = createClient()

  const { data: categories, error } = await supabase
    .from('categories')
    .select('*')
    .order('name')

  if (error) {
    console.error('Get categories error:', error)
    return { error: 'Failed to fetch categories' }
  }

  return { success: true, data: categories }
}