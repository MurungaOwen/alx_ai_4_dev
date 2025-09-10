"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PollCard } from "@/components/polls/poll-card"
import { Plus, User, AlertCircle, Loader2 } from "lucide-react"
import { useAuth } from "@/providers/auth-provider"
import { formatRelativeDate } from "@/lib/utils/date"

interface PollsListProps {
  creatorFilter?: string
}

interface Poll {
  id: string
  title: string
  description: string | null
  status: 'active' | 'draft' | 'closed'
  created_at: string
  creator: {
    id: string
    full_name: string | null
    avatar_url: string | null
  }
  category: {
    id: string
    name: string
    color: string
  } | null
  options: Array<{
    id: string
    text: string
    vote_count: number
  }>
  total_votes: number
  hasVoted?: boolean
  userVotes?: string[]
}

export function PollsList({ creatorFilter }: PollsListProps) {
  const { user, loading } = useAuth()
  const [polls, setPolls] = useState<Poll[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const isMyPolls = creatorFilter === 'me'

  useEffect(() => {
    const fetchPolls = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // For "My Polls", check if user is authenticated
        if (isMyPolls && !user) {
          setIsLoading(false)
          return
        }

        // Import client-side Supabase
        const { supabase } = await import('@/lib/supabase/client')
        
        // Build query
        let query = supabase
          .from('polls')
          .select(`
            *,
            creator:profiles!creator_id(id, full_name, avatar_url),
            category:categories(id, name, color),
            options:poll_options(id, text, vote_count)
          `)
          .order('created_at', { ascending: false })

        // Apply filters
        if (isMyPolls && user) {
          query = query.eq('creator_id', user.id)
        } else if (!isMyPolls) {
          query = query.eq('status', 'active')
        }

        const { data, error: fetchError } = await query

        if (fetchError) {
          console.error('Error fetching polls:', fetchError)
          setError('Failed to load polls')
          return
        }

        // Calculate total votes for each poll
        const pollsWithTotalVotes = (data || []).map(poll => {
          const totalVotes = poll.options.reduce((sum: number, option: any) => 
            sum + (option.vote_count || 0), 0
          )
          return { ...poll, total_votes: totalVotes }
        })

        setPolls(pollsWithTotalVotes)
      } catch (err) {
        console.error('Error in fetchPolls:', err)
        setError('An unexpected error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    // Don't fetch if we're still checking auth
    if (!loading) {
      fetchPolls()
    }
  }, [isMyPolls, user, loading])

  // Show loading state while auth is loading
  if (loading || isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // Show sign in prompt for "My Polls" when not authenticated
  if (isMyPolls && !user) {
    return (
      <div className="text-center py-32">
        <div className="mx-auto max-w-md">
          <div className="mb-6 flex justify-center">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
              <User className="h-8 w-8 text-muted-foreground" />
            </div>
          </div>
          <h3 className="text-xl font-semibold mb-3">Sign in required</h3>
          <p className="text-muted-foreground mb-6 text-sm">
            Sign in to view and manage your polls.
          </p>
          <Link href="/auth/login?redirect=/polls?creator=me">
            <Button>
              Sign In
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="text-center py-32">
        <div className="mx-auto max-w-md">
          <div className="mb-6 flex justify-center">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-muted-foreground" />
            </div>
          </div>
          <h3 className="text-xl font-semibold mb-3">Unable to load polls</h3>
          <p className="text-muted-foreground mb-6 text-sm">
            {error}
          </p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  if (polls.length === 0) {
    return (
      <div className="text-center py-32">
        <div className="mx-auto max-w-lg">
          <div className="mb-6 flex justify-center">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
              <Plus className="h-8 w-8 text-muted-foreground" />
            </div>
          </div>
          <h3 className="text-xl font-semibold mb-3">
            {isMyPolls ? "No polls yet" : "No polls found"}
          </h3>
          <p className="text-muted-foreground mb-6 text-sm">
            {isMyPolls 
              ? "Create your first poll to get started."
              : "Be the first to create a poll."
            }
          </p>
          <Link href="/polls/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Poll
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Simple header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {polls.length} poll{polls.length === 1 ? '' : 's'}
        </p>
        <Link href="/polls/create">
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            New Poll
          </Button>
        </Link>
      </div>

      {/* Clean grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {polls.map((poll: any) => (
          <PollCard
            key={poll.id}
            id={poll.id}
            title={poll.title}
            description={poll.description}
            votes={poll.total_votes}
            active={poll.status === 'active'}
            category={poll.category?.name || 'General'}
            createdAt={formatRelativeDate(poll.created_at)}
          />
        ))}
      </div>
    </div>
  )
}