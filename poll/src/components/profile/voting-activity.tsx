"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Vote, Clock, User, ExternalLink, Loader2 } from "lucide-react"
import { getUserVotingHistory, type VotingHistory } from "@/lib/api/user"
import { formatRelativeDate } from "@/lib/utils/date"
import { useAuth } from "@/providers/auth-provider"

export function VotingActivity() {
  const { statsInvalidated } = useAuth()
  const [votes, setVotes] = useState<VotingHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(false)

  const loadVotes = async (offset = 0, append = false) => {
    try {
      if (append) {
        setLoadingMore(true)
      } else {
        setLoading(true)
        setError(null)
      }

      const result = await getUserVotingHistory({
        limit: 10,
        offset
      })

      if (result.success && result.data) {
        if (append) {
          setVotes(prev => [...prev, ...result.data!.votes])
        } else {
          setVotes(result.data.votes)
        }
        setHasMore(result.data.hasMore)
      } else {
        setError(result.error || 'Failed to load voting activity')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  useEffect(() => {
    loadVotes()
  }, [])

  // Refresh votes when stats are invalidated (e.g., after voting)
  useEffect(() => {
    if (statsInvalidated > 0) {
      loadVotes()
    }
  }, [statsInvalidated])

  const handleLoadMore = () => {
    loadVotes(votes.length, true)
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Vote className="h-5 w-5" />
            Your Voting Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center space-x-4">
                  <div className="h-10 w-10 bg-muted rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Vote className="h-5 w-5" />
            Your Voting Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button variant="outline" onClick={() => loadVotes()}>
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (votes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Vote className="h-5 w-5" />
            Your Voting Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Vote className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-muted-foreground mb-4">You haven't voted on any polls yet.</p>
            <Button asChild>
              <Link href="/polls">
                Browse Polls
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Vote className="h-5 w-5" />
          Your Voting Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {votes.map((vote) => {
            const creatorName = vote.poll.creator.full_name || 'Anonymous'
            const creatorInitials = creatorName
              .split(' ')
              .map(n => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2)

            return (
              <div 
                key={vote.id} 
                className="flex items-start gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Vote className="h-5 w-5 text-primary" />
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium mb-1">
                        You voted on <span className="font-semibold">"{vote.poll.title}"</span>
                      </p>
                      
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">
                          {vote.selected_option.text}
                        </Badge>
                        <Badge 
                          variant={vote.poll.status === 'active' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {vote.poll.status}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatRelativeDate(vote.created_at)}
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="h-3 w-3" />
                          <Avatar className="h-4 w-4">
                            <AvatarImage 
                              src={vote.poll.creator.avatar_url || ''} 
                              alt={creatorName} 
                            />
                            <AvatarFallback className="text-xs">
                              {creatorInitials}
                            </AvatarFallback>
                          </Avatar>
                          <span>by {creatorName}</span>
                        </div>
                      </div>
                    </div>
                    
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/polls/${vote.poll.id}`}>
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
          
          {hasMore && (
            <div className="text-center pt-4">
              <Button 
                variant="outline" 
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="w-full sm:w-auto"
              >
                {loadingMore ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Load More'
                )}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}