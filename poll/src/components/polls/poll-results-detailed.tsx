import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Trophy, TrendingUp, BarChart3, Sparkles, Award, Crown } from "lucide-react"

interface PollOption {
  id: string
  text: string
  votes: number
}

interface PollResultsDetailedProps {
  options: PollOption[]
  totalVotes: number
  userVotedOption?: string
}

export function PollResultsDetailed({ options, totalVotes, userVotedOption }: PollResultsDetailedProps) {
  const getPercentage = (votes: number) => {
    return totalVotes > 0 ? (votes / totalVotes) * 100 : 0
  }

  // Sort options by votes for ranking
  const sortedOptions = [...options].sort((a, b) => b.votes - a.votes)
  const winningOption = sortedOptions[0]
  const isClose = sortedOptions[1] && (winningOption.votes - sortedOptions[1].votes) <= 2

  // Calculate statistics
  const averageVotes = totalVotes > 0 ? totalVotes / options.length : 0
  const mostPopularPercentage = getPercentage(winningOption?.votes || 0)
  
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Statistics Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex justify-center mb-2">
              <Users className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="text-xl font-semibold">{totalVotes}</div>
            <div className="text-xs text-muted-foreground">Participants</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex justify-center mb-2">
              <Trophy className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="text-xl font-semibold">{winningOption?.votes || 0}</div>
            <div className="text-xs text-muted-foreground">Top Choice</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex justify-center mb-2">
              <BarChart3 className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="text-xl font-semibold">{averageVotes.toFixed(0)}</div>
            <div className="text-xs text-muted-foreground">Average</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex justify-center mb-2">
              <TrendingUp className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="text-xl font-semibold">{mostPopularPercentage.toFixed(0)}%</div>
            <div className="text-xs text-muted-foreground">Consensus</div>
          </CardContent>
        </Card>
      </div>

      {/* Close Race Alert */}
      {isClose && totalVotes > 5 && (
        <div className="flex items-center justify-center p-3 rounded-lg bg-yellow-50 border border-yellow-200">
          <span className="text-sm font-medium text-yellow-800">Close race - top options are very close!</span>
        </div>
      )}

      {/* Detailed Results */}
      <div className="space-y-4">
        <div className="text-center mb-8">
          <h3 className="text-xl font-semibold mb-2">Vote Distribution</h3>
          <p className="text-muted-foreground">See how all {totalVotes} votes were distributed across the choices</p>
        </div>
        
        {sortedOptions.map((option, index) => {
          const percentage = getPercentage(option.votes)
          const isWinning = index === 0 && totalVotes > 0
          const isUserChoice = userVotedOption === option.id
          const rank = index + 1
          
          return (
            <div 
              key={option.id} 
              className={`relative p-4 rounded-lg border transition-colors ${
                isWinning 
                  ? 'bg-primary/5 border-primary/20' 
                  : isUserChoice
                  ? 'bg-blue-50 border-blue-200'
                  : 'bg-card border-border'
              }`}
              style={{animationDelay: `${index * 0.1}s`}}
            >
              {/* Rank Badge */}
              <div className="absolute -top-2 -left-2">
                <div className={`
                  h-6 w-6 rounded-full flex items-center justify-center text-xs font-semibold
                  ${rank === 1 ? 'bg-yellow-400 text-yellow-900' : 
                    rank === 2 ? 'bg-gray-300 text-gray-700' :
                    rank === 3 ? 'bg-orange-300 text-orange-800' :
                    'bg-muted text-muted-foreground'}
                `}>
                  {rank}
                </div>
              </div>

              {/* Option Content */}
              <div className="ml-8">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h4 className={`text-lg font-semibold ${isWinning ? 'text-primary' : ''}`}>
                      {option.text}
                    </h4>
                    <div className="flex items-center gap-3 mt-2">
                      {isWinning && (
                        <Badge className="bg-primary text-primary-foreground text-xs">
                          Leading
                        </Badge>
                      )}
                      {isUserChoice && (
                        <Badge variant="outline" className="border-blue-500 text-blue-600 text-xs">
                          Your Vote
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right ml-4">
                    <div className={`text-3xl font-bold ${isWinning ? 'text-primary' : 'text-foreground'}`}>
                      {percentage.toFixed(1)}%
                    </div>
                    <div className="text-base font-medium text-muted-foreground">
                      {option.votes} of {totalVotes} votes
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-3">
                  <div className="flex justify-between text-sm text-muted-foreground mb-1">
                    <span>Vote share</span>
                    <span>{percentage.toFixed(1)}% of total</span>
                  </div>
                  <Progress 
                    value={percentage} 
                    className="h-6 bg-muted/50"
                  />
                  
                  {/* Visual representation of voters */}
                  {option.votes > 0 && (
                    <div className="flex items-center gap-2 mt-3">
                      <div className="flex -space-x-2">
                        {[...Array(Math.min(option.votes, 5))].map((_, i) => (
                          <div
                            key={i}
                            className="h-8 w-8 rounded-full bg-primary border-2 border-background flex items-center justify-center text-primary-foreground text-xs font-medium"
                          >
                            {option.votes > 5 && i === 4 ? `+${option.votes - 4}` : ''}
                          </div>
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground ml-2">
                        {option.votes === 1 ? '1 person chose this' : `${option.votes} people chose this`}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
      
      {/* Summary Footer */}
      <Card className="bg-muted/30">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-lg">Summary</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="font-medium">Leading Option</div>
              <div className="text-muted-foreground">{winningOption?.text || 'N/A'}</div>
            </div>
            <div>
              <div className="font-medium">Participation</div>
              <div className="text-muted-foreground">
                {totalVotes === 0 ? 'No votes yet' : 
                 totalVotes < 10 ? 'Getting started' :
                 totalVotes < 50 ? 'Good engagement' :
                 'High participation'}
              </div>
            </div>
            <div>
              <div className="font-medium">Decision Clarity</div>
              <div className="text-muted-foreground">
                {mostPopularPercentage >= 70 ? 'Strong consensus' :
                 mostPopularPercentage >= 50 ? 'Clear preference' :
                 isClose ? 'Close race' :
                 'Diverse views'}
              </div>
            </div>
          </div>
          
          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              Results update in real-time
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}