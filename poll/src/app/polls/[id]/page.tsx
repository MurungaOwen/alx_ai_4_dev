import { Suspense } from "react"
import { notFound } from "next/navigation"
import { PollDetail } from "@/components/polls/poll-detail"
import { getPoll } from "@/lib/api/polls"

export default async function PollDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const result = await getPoll(id)

  if (!result.success || !result.data) {
    notFound()
  }

  return (
    <Suspense fallback={
      <div className="container max-w-3xl mx-auto py-8 px-4">
        <div className="animate-pulse space-y-6">
          <div className="h-4 bg-muted rounded w-24"></div>
          <div className="bg-muted rounded-lg h-96"></div>
        </div>
      </div>
    }>
      <PollDetail poll={result.data} />
    </Suspense>
  )
}