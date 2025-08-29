import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Clock, TrendingUp } from "lucide-react"

interface PollCardProps {
  id: string
  title: string
  votes: number
  active: boolean
  description?: string
  createdAt?: string
  category?: string
}

export function PollCard({ 
  id, 
  title, 
  votes, 
  active, 
  description,
  createdAt = "2 hours ago",
  category = "General"
}: PollCardProps) {
  return (
    <Card className="group relative overflow-hidden card-hover border-2 bg-card/50 backdrop-blur-sm">
      <Link href={`/polls/${id}`} className="block">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <Badge 
              variant={active ? "default" : "secondary"}
              className="mb-2 w-fit"
            >
              {active ? "Live" : "Closed"}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {category}
            </Badge>
          </div>
          <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-2">
            {title}
          </CardTitle>
          {description && (
            <CardDescription className="text-sm line-clamp-2">
              {description}
            </CardDescription>
          )}
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span className="font-medium">{votes}</span>
                <span>votes</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{createdAt}</span>
              </div>
            </div>
            {active && <TrendingUp className="h-4 w-4 text-green-600" />}
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-2 w-16 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${Math.min((votes / 100) * 100, 100)}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground">
                {Math.min((votes / 100) * 100, 100).toFixed(0)}% engagement
              </span>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 px-3 text-xs font-medium group-hover:bg-primary/10 group-hover:text-primary transition-colors"
            >
              {active ? "Vote Now" : "View Results"} →
            </Button>
          </div>
        </CardContent>
      </Link>
    </Card>
  )
}