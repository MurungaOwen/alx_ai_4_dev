import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { PollResults } from "@/components/polls/poll-results"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function PollDetailPage({ params }: { params: { id: string } }) {
  const mockPoll = {
    id: params.id,
    title: "What's your favorite programming language?",
    description: "Help us understand which programming language developers prefer the most.",
    options: [
      { id: "1", text: "JavaScript", votes: 15 },
      { id: "2", text: "Python", votes: 12 },
      { id: "3", text: "TypeScript", votes: 8 },
      { id: "4", text: "Go", votes: 7 },
    ],
    totalVotes: 42,
    hasVoted: false,
    active: true,
  }

  return (
    <div className="container max-w-3xl mx-auto py-8 px-4">
      <div className="mb-6">
        <Link href="/polls" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to polls
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="text-2xl mb-2">{mockPoll.title}</CardTitle>
              {mockPoll.description && (
                <CardDescription className="text-base">{mockPoll.description}</CardDescription>
              )}
            </div>
            <Badge variant={mockPoll.active ? "default" : "secondary"}>
              {mockPoll.active ? "Active" : "Closed"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {!mockPoll.hasVoted && mockPoll.active ? (
            <form className="space-y-4">
              <div className="mb-4">
                <h3 className="font-medium mb-3">Choose your answer:</h3>
                <RadioGroup defaultValue="">
                  {mockPoll.options.map((option) => (
                    <div key={option.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                      <RadioGroupItem value={option.id} id={option.id} />
                      <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                        {option.text}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
              <Button className="w-full" size="lg">
                Submit Vote
              </Button>
            </form>
          ) : (
            <div>
              <div className="mb-4">
                <h3 className="font-medium mb-3">Poll Results:</h3>
              </div>
              <PollResults options={mockPoll.options} totalVotes={mockPoll.totalVotes} />
              {mockPoll.hasVoted && (
                <div className="mt-4 p-3 bg-muted rounded-lg text-center text-sm text-muted-foreground">
                  Thank you for voting! You have already participated in this poll.
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}