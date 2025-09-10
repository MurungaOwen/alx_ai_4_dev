"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { PollResults } from "@/components/polls/poll-results"
import { PollResultsDetailed } from "@/components/polls/poll-results-detailed"
import { ArrowLeft, AlertCircle, CheckCircle } from "lucide-react"
import Link from "next/link"
// import { vote } from "@/lib/api/polls" - using client-side voting now
import { useAuth } from "@/providers/auth-provider"
import { formatDate } from "@/lib/utils/date"

interface PollDetailProps {
  poll: any
}

export function PollDetail({ poll }: PollDetailProps) {
  const [isVoting, setIsVoting] = useState(false)
  const [selectedOption, setSelectedOption] = useState<string>("")
  const [error, setError] = useState<string | null>(null)
  const [hasVoted, setHasVoted] = useState(false)
  const [voteSuccess, setVoteSuccess] = useState(false)
  const [pollData, setPollData] = useState(poll) // Local state for poll data
  const [userVotedOption, setUserVotedOption] = useState<string | undefined>(undefined)
  const [isCheckingVoteStatus, setIsCheckingVoteStatus] = useState(true)
  const { user, invalidateUserStats } = useAuth()

  const handleVote = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedOption) {
      setError("Please select an option")
      return
    }

    if (!user) {
      setError("Please sign in to vote")
      return
    }

    console.log('Starting vote process...', { 
      selectedOption, 
      userId: user.id, 
      pollId: pollData.id 
    })

    setIsVoting(true)
    setError(null)

    // Add timeout protection
    const timeoutId = setTimeout(() => {
      console.error('Vote operation timed out')
      setError("Vote operation timed out. Please try again.")
      setIsVoting(false)
    }, 15000) // 15 second timeout

    try {
      // Use client-side Supabase for voting to avoid server session issues
      const { supabase: clientSupabase } = await import('@/lib/supabase/client')

      // Check if poll is still active
      console.log('Checking poll status...')
      const { data: currentPoll, error: pollCheckError } = await clientSupabase
        .from('polls')
        .select('status, vote_type')
        .eq('id', pollData.id)
        .single()

      if (pollCheckError) {
        console.error('Poll check error:', pollCheckError)
        setError("Failed to check poll status")
        return
      }

      if (!currentPoll || currentPoll.status !== 'active') {
        console.warn('Poll is not active:', currentPoll)
        setError("This poll is no longer active")
        return
      }

      // Double-check if user already voted
      if (hasVoted) {
        console.warn('User has already voted')
        setError("You have already voted on this poll")
        return
      }

      // Create the vote
      console.log('Creating vote...')
      const voteData = {
        poll_id: pollData.id,
        option_id: selectedOption,
        user_id: user.id,
      }

      const { error: voteError } = await clientSupabase
        .from('votes')
        .insert(voteData)

      if (voteError) {
        console.error('Vote creation error:', voteError)
        setError(`Failed to record vote: ${voteError.message}`)
        return
      }

      console.log('Vote created successfully!')

      // Success - update local state immediately for real-time feedback
      setHasVoted(true)
      setVoteSuccess(true)
      setUserVotedOption(selectedOption)
      setPollData(prevData => ({
        ...prevData,
        total_votes: (prevData.total_votes || 0) + 1,
        options: prevData.options.map((opt: any) => 
          opt.id === selectedOption 
            ? { ...opt, vote_count: (opt.vote_count || 0) + 1 }
            : opt
        )
      }))

      console.log('Vote process completed successfully!')
      
      // Invalidate user stats to refresh profile activity
      invalidateUserStats()

    } catch (err: any) {
      console.error('Vote error:', err)
      setError(err.message || "An unexpected error occurred")
    } finally {
      clearTimeout(timeoutId)
      console.log('Setting isVoting to false...')
      setIsVoting(false)
    }
  }

  // Initialize with server-side data if available
  useEffect(() => {
    console.log('Poll detail - initializing with server data:', {
      hasVoted: poll.hasVoted,
      userVotes: poll.userVotes,
      userId: user?.id
    })
    
    if (poll.hasVoted !== undefined && poll.hasVoted === true) {
      setHasVoted(true)
      setUserVotedOption(poll.userVotes?.[0])
      setIsCheckingVoteStatus(false)
      return
    }
  }, [poll.hasVoted, poll.userVotes, user?.id])

  // Check user's voting status when component mounts or user changes
  useEffect(() => {
    const checkVotingStatus = async () => {
      if (!user || !pollData.id) {
        setHasVoted(false)
        setUserVotedOption(undefined)
        setIsCheckingVoteStatus(false)
        return
      }

      try {
        const { supabase: clientSupabase } = await import('@/lib/supabase/client')
        
        const { data: userVote, error } = await clientSupabase
          .from('votes')
          .select('option_id')
          .eq('poll_id', pollData.id)
          .eq('user_id', user.id)
          .single()

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
          console.error('Error checking vote status:', error)
        }

        console.log('Poll detail - client-side vote check result:', {
          userVote,
          pollId: pollData.id,
          userId: user.id
        })

        if (userVote) {
          setHasVoted(true)
          setUserVotedOption(userVote.option_id)
        } else {
          setHasVoted(false)
          setUserVotedOption(undefined)
        }
      } catch (err) {
        console.error('Error checking voting status:', err)
        // On error, default to allowing voting
        setHasVoted(false)
        setUserVotedOption(undefined)
      } finally {
        setIsCheckingVoteStatus(false)
      }
    }

    // Only run if we don't have server-side data
    if (poll.hasVoted === undefined) {
      checkVotingStatus()
    } else {
      setIsCheckingVoteStatus(false)
    }
  }, [user, pollData.id, poll.hasVoted])

  const isActive = pollData.status === 'active'

  return (
    <div className="min-h-screen">
      <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="mb-6">
        <Link href="/polls" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to polls
        </Link>
      </div>

      <Card className="animate-fade-in">
        <CardHeader className="text-center pb-6">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-2 mb-4">
              {pollData.category && (
                <Badge variant="outline" className="text-xs">
                  {pollData.category.name}
                </Badge>
              )}
              <Badge variant={isActive ? "default" : "secondary"}>
                {isActive ? "Active" : "Closed"}
              </Badge>
            </div>
            <CardTitle className="text-3xl font-bold mb-4 leading-tight">
              {pollData.title}
            </CardTitle>
            {pollData.description && (
              <CardDescription className="text-lg mt-4 leading-relaxed">
                {pollData.description}
              </CardDescription>
            )}
            <div className="flex items-center justify-center gap-4 mt-6 text-sm text-muted-foreground">
              <span>By {pollData.creator?.full_name || 'Anonymous'}</span>
              <span>•</span>
              <span>{formatDate(pollData.created_at)}</span>
              <span>•</span>
              <span className="font-medium">{pollData.total_votes || 0} votes</span>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="max-w-2xl mx-auto">
          {voteSuccess && (
            <Alert className="mb-6 border-green-200 bg-green-50 animate-slide-up">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Your vote has been recorded successfully!
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive" className="mb-6 animate-slide-up">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Show loading while checking vote status */}
          {isCheckingVoteStatus ? (
            <div className="text-center py-12">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-muted rounded w-32 mx-auto"></div>
                <div className="h-10 bg-muted rounded w-full"></div>
                <div className="h-10 bg-muted rounded w-full"></div>
                <div className="h-10 bg-muted rounded w-24 mx-auto"></div>
              </div>
            </div>
          ) : !hasVoted && isActive && user ? (
            <div className="animate-slide-up">
              <form onSubmit={handleVote} className="space-y-6">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold mb-2">Cast Your Vote</h3>
                  <p className="text-muted-foreground">Choose your preferred option</p>
                </div>
                <RadioGroup 
                  value={selectedOption} 
                  onValueChange={setSelectedOption}
                  className="space-y-3"
                >
                  {pollData.options.map((option: any, index: number) => (
                    <div 
                      key={option.id} 
                      className="flex items-center space-x-4 p-4 border-2 rounded-lg hover:bg-accent/50 hover:border-primary/50 transition-all duration-200 cursor-pointer animate-slide-up"
                      style={{animationDelay: `${index * 0.1}s`}}
                    >
                      <RadioGroupItem value={option.id} id={option.id} />
                      <Label htmlFor={option.id} className="flex-1 cursor-pointer text-base">
                        {option.text}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isVoting || !selectedOption}
                >
                  {isVoting ? "Submitting..." : "Submit Vote"}
                </Button>
              </form>
            </div>
          ) : !user && isActive ? (
            /* Show auth prompt for non-authenticated users */
            <div className="text-center py-12 animate-fade-in">
              <div className="mb-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Sign in to vote</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Join the conversation and cast your vote
                </p>
              </div>
              <div className="flex gap-3 justify-center">
                <Link href="/auth/login">
                  <Button>Sign In</Button>
                </Link>
                <Link href="/auth/register">
                  <Button variant="outline">Sign Up</Button>
                </Link>
              </div>
            </div>
          ) : (
            /* Show results - either user has voted or poll is closed */
            <div className="animate-slide-up">
              {hasVoted ? (
                <>
                  <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary mb-4">
                      <CheckCircle className="h-8 w-8 text-primary-foreground" />
                    </div>
                    <h3 className="text-2xl font-semibold mb-2">
                      Thank you for participating!
                    </h3>
                    <p className="text-muted-foreground">
                      Here's how everyone voted
                    </p>
                  </div>
                  
                  <PollResultsDetailed 
                    options={pollData.options.map((opt: any) => ({
                      id: opt.id,
                      text: opt.text,
                      votes: opt.vote_count || 0
                    }))} 
                    totalVotes={pollData.total_votes || 0}
                    userVotedOption={userVotedOption}
                  />
                </>
              ) : (
                <>
                  <div className="text-center mb-8">
                    <h3 className="text-xl font-semibold mb-2">
                      Poll Results
                    </h3>
                    <p className="text-muted-foreground">
                      See what others think about this topic
                    </p>
                  </div>
                  
                  <PollResults 
                    options={pollData.options.map((opt: any) => ({
                      id: opt.id,
                      text: opt.text,
                      votes: opt.vote_count || 0
                    }))} 
                    totalVotes={pollData.total_votes || 0} 
                  />
                </>
              )}
              
              {!isActive && (
                <div className="mt-8 p-4 bg-muted/50 border-2 rounded-lg text-center animate-fade-in">
                  <p className="text-sm font-medium text-muted-foreground">
                    🔒 This poll is no longer accepting votes
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </div>
  )
}