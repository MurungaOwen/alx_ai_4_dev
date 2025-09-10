import { createClient } from "@/lib/supabase/server"

interface PollsStatsProps {
  loading?: boolean
}

export async function PollsStats({ loading = false }: PollsStatsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="text-center p-4 bg-card/50 backdrop-blur-sm rounded-lg border">
            <div className="h-8 bg-muted animate-pulse rounded mb-2"></div>
            <div className="h-4 bg-muted animate-pulse rounded"></div>
          </div>
        ))}
      </div>
    )
  }

  const supabase = await createClient()

  // Get poll statistics
  const [
    { count: totalPolls },
    { count: activePolls },
    { data: totalVotes },
    { count: totalCategories }
  ] = await Promise.all([
    supabase.from('polls').select('*', { count: 'exact', head: true }),
    supabase.from('polls').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('polls').select('total_votes').eq('status', 'active'),
    supabase.from('categories').select('*', { count: 'exact', head: true })
  ])

  const totalVoteCount = totalVotes?.reduce((sum, poll) => sum + (poll.total_votes || 0), 0) || 0

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div className="text-center p-4 bg-card/50 backdrop-blur-sm rounded-lg border">
        <div className="text-2xl font-bold">{totalPolls || 0}</div>
        <div className="text-sm text-muted-foreground">Total Polls</div>
      </div>
      <div className="text-center p-4 bg-card/50 backdrop-blur-sm rounded-lg border">
        <div className="text-2xl font-bold">{activePolls || 0}</div>
        <div className="text-sm text-muted-foreground">Active</div>
      </div>
      <div className="text-center p-4 bg-card/50 backdrop-blur-sm rounded-lg border">
        <div className="text-2xl font-bold">{totalVoteCount}</div>
        <div className="text-sm text-muted-foreground">Total Votes</div>
      </div>
      <div className="text-center p-4 bg-card/50 backdrop-blur-sm rounded-lg border">
        <div className="text-2xl font-bold">{totalCategories || 0}</div>
        <div className="text-sm text-muted-foreground">Categories</div>
      </div>
    </div>
  )
}