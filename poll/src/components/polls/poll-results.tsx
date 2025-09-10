import { Progress } from "@/components/ui/progress"

interface PollOption {
  id: string
  text: string
  votes: number
}

interface PollResultsProps {
  options: PollOption[]
  totalVotes: number
}

export function PollResults({ options, totalVotes }: PollResultsProps) {
  const getPercentage = (votes: number) => {
    return totalVotes > 0 ? (votes / totalVotes) * 100 : 0
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {options.map((option, index) => {
        const percentage = getPercentage(option.votes)
        const isWinning = totalVotes > 0 && option.votes === Math.max(...options.map(o => o.votes))
        
        return (
          <div 
            key={option.id} 
            className={`p-4 rounded-lg border-2 transition-all duration-300 animate-slide-up ${
              isWinning && totalVotes > 0 
                ? 'bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20' 
                : 'bg-muted/30 border-border'
            }`}
            style={{animationDelay: `${index * 0.1}s`}}
          >
            <div className="flex justify-between items-center mb-3">
              <span className={`font-semibold ${isWinning && totalVotes > 0 ? 'text-primary' : ''}`}>
                {option.text}
              </span>
              <div className="text-right">
                <div className={`text-lg font-bold ${isWinning && totalVotes > 0 ? 'text-primary' : ''}`}>
                  {percentage.toFixed(1)}%
                </div>
                <div className="text-xs text-muted-foreground">
                  {option.votes} vote{option.votes !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
            <Progress 
              value={percentage} 
              className="h-3 bg-muted/50" 
            />
          </div>
        )
      })}
      
      <div className="pt-6 border-t border-border/50">
        <div className="text-center space-y-2">
          <p className="text-lg font-semibold">
            {totalVotes} Total Vote{totalVotes !== 1 ? 's' : ''}
          </p>
          <p className="text-sm text-muted-foreground">
            Results update in real-time
          </p>
        </div>
      </div>
    </div>
  )
}