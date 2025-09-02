import { Suspense } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PollsList } from "@/components/polls/polls-list"
import { Plus } from "lucide-react"

export default async function PollsPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ creator?: string }> 
}) {
  const resolvedSearchParams = await searchParams
  const isMyPolls = resolvedSearchParams.creator === 'me'
  
  return (
    <div className="flex flex-col">
      {/* Clean Hero Section */}
      <section className="py-12 lg:py-16">
        <div className="container">
          <div className="max-w-3xl">
            <h1 className="text-3xl font-semibold tracking-tight lg:text-4xl mb-4">
              {isMyPolls ? 'My Polls' : 'Polls'}
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              {isMyPolls 
                ? 'Manage your polls and track engagement.'
                : 'Discover and participate in community polls.'
              }
            </p>
            
            <div className="flex flex-wrap gap-3">
              <Link href="/polls/create">
                <Button size="lg" className="h-11">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Poll
                </Button>
              </Link>
              {!isMyPolls ? (
                <Link href="/polls?creator=me">
                  <Button size="lg" variant="outline" className="h-11">
                    My Polls
                  </Button>
                </Link>
              ) : (
                <Link href="/polls">
                  <Button size="lg" variant="outline" className="h-11">
                    All Polls
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>


      {/* Polls Section */}
      <section className="pb-16">
        <div className="container">
          <Suspense fallback={
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-64 bg-muted/50 rounded-lg border animate-pulse"></div>
              ))}
            </div>
          }>
            <PollsList creatorFilter={resolvedSearchParams.creator} />
          </Suspense>
        </div>
      </section>
    </div>
  )
}