import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PollCard } from "@/components/polls/poll-card"
import { Plus } from "lucide-react"

export default function PollsPage() {
  const mockPolls = [
    { 
      id: "1", 
      title: "What's your favorite programming language?", 
      description: "Help us understand the most popular programming languages in the developer community",
      votes: 142, 
      active: true,
      category: "Technology",
      createdAt: "2 hours ago"
    },
    { 
      id: "2", 
      title: "Best framework for web development in 2024?", 
      description: "Share your thoughts on the most effective web development frameworks",
      votes: 287, 
      active: true,
      category: "Development",
      createdAt: "5 hours ago"
    },
    { 
      id: "3", 
      title: "Preferred code editor for daily development?", 
      description: "Which code editor do you use for your everyday coding tasks?",
      votes: 356, 
      active: false,
      category: "Tools",
      createdAt: "1 day ago"
    },
    { 
      id: "4", 
      title: "Which database do you prefer for modern web apps?", 
      description: "Exploring database preferences for contemporary web applications",
      votes: 173, 
      active: true,
      category: "Database",
      createdAt: "3 hours ago"
    },
    { 
      id: "5", 
      title: "Best cloud deployment platform for startups?", 
      description: "What's the most cost-effective and reliable deployment solution?",
      votes: 89, 
      active: true,
      category: "DevOps",
      createdAt: "6 hours ago"
    },
    { 
      id: "6", 
      title: "Favorite CSS framework or methodology?", 
      description: "Which CSS approach helps you build better user interfaces?",
      votes: 201, 
      active: false,
      category: "Frontend",
      createdAt: "2 days ago"
    },
  ]

  return (
    <div className="page-container">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between mb-12">
        <div className="space-y-2">
          <h1>Browse Polls</h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            Discover and participate in community polls. Share your opinion and see what others think.
          </p>
        </div>
        <Link href="/polls/create">
          <Button size="lg" className="shadow-sm hover:shadow-md transition-shadow">
            <Plus className="mr-2 h-4 w-4" />
            Create Poll
          </Button>
        </Link>
      </div>

      {/* Filter/Stats Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="text-center p-4 bg-card/50 backdrop-blur-sm rounded-lg border">
          <div className="text-2xl font-bold">{mockPolls.length}</div>
          <div className="text-sm text-muted-foreground">Total Polls</div>
        </div>
        <div className="text-center p-4 bg-card/50 backdrop-blur-sm rounded-lg border">
          <div className="text-2xl font-bold">{mockPolls.filter(p => p.active).length}</div>
          <div className="text-sm text-muted-foreground">Active</div>
        </div>
        <div className="text-center p-4 bg-card/50 backdrop-blur-sm rounded-lg border">
          <div className="text-2xl font-bold">{mockPolls.reduce((acc, p) => acc + p.votes, 0)}</div>
          <div className="text-sm text-muted-foreground">Total Votes</div>
        </div>
        <div className="text-center p-4 bg-card/50 backdrop-blur-sm rounded-lg border">
          <div className="text-2xl font-bold">6</div>
          <div className="text-sm text-muted-foreground">Categories</div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {mockPolls.map((poll, index) => (
          <div 
            key={poll.id} 
            className="animate-slide-up" 
            style={{animationDelay: `${index * 0.1}s`}}
          >
            <PollCard
              id={poll.id}
              title={poll.title}
              description={poll.description}
              votes={poll.votes}
              active={poll.active}
              category={poll.category}
              createdAt={poll.createdAt}
            />
          </div>
        ))}
      </div>

      {mockPolls.length === 0 && (
        <div className="text-center py-20">
          <div className="mb-4 text-muted-foreground text-lg">No polls found.</div>
          <Link href="/polls/create">
            <Button size="lg">Create the first poll</Button>
          </Link>
        </div>
      )}
    </div>
  )
}