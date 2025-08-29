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
    <div className="space-y-4">
      {options.map((option) => (
        <div key={option.id} className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="font-medium">{option.text}</span>
            <span className="text-sm text-muted-foreground">
              {option.votes} votes ({getPercentage(option.votes).toFixed(1)}%)
            </span>
          </div>
          <Progress value={getPercentage(option.votes)} className="h-2" />
        </div>
      ))}
      <div className="pt-4 border-t">
        <p className="text-center text-sm text-muted-foreground">
          Total votes: {totalVotes}
        </p>
      </div>
    </div>
  )
}