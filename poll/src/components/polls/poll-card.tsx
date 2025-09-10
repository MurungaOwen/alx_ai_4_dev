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
    <Card className="group hover:shadow-md transition-shadow">
      <Link href={`/polls/${id}`} className="block">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between gap-3 mb-3">
            <Badge variant={active ? "default" : "secondary"} className="text-xs">
              {active ? "Active" : "Closed"}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {category}
            </Badge>
          </div>
          
          <CardTitle className="text-lg font-semibold line-clamp-2 group-hover:text-primary transition-colors">
            {title}
          </CardTitle>
          
          {description && (
            <CardDescription className="text-sm mt-2 line-clamp-2">
              {description}
            </CardDescription>
          )}
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="flex items-center justify-between text-sm mb-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Users className="h-4 w-4" />
                <span className="font-medium">{votes}</span>
                <span className="text-xs">votes</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span className="text-xs">{createdAt}</span>
              </div>
            </div>
            
            {active && votes > 5 && (
              <div className="flex items-center gap-1 text-green-600">
                <TrendingUp className="h-4 w-4" />
                <span className="text-xs font-medium">Popular</span>
              </div>
            )}
          </div>
          
          <div className="h-2 bg-muted rounded-full overflow-hidden mb-4">
            <div 
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${Math.min((votes / Math.max(votes, 10)) * 100, 100)}%` }}
            />
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full group-hover:bg-accent transition-colors"
          >
            {active ? "Vote Now" : "View Results"}
          </Button>
        </CardContent>
      </Link>
    </Card>
  )
}