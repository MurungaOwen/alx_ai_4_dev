import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, BarChart3, Users, Shield, Zap, Globe, TrendingUp } from "lucide-react"
import { createClient } from "@/lib/supabase/server"

export default async function Home() {
  const supabase = await createClient()

  // Get real statistics from the database
  const [
    { count: totalPolls },
    { count: activePolls },
    { data: totalVotes },
    { count: totalUsers }
  ] = await Promise.all([
    supabase.from('polls').select('*', { count: 'exact', head: true }),
    supabase.from('polls').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('polls').select('total_votes'),
    supabase.from('profiles').select('*', { count: 'exact', head: true })
  ])

  const totalVoteCount = totalVotes?.reduce((sum, poll) => sum + (poll.total_votes || 0), 0) || 0

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="container relative z-10">
          <div className="mx-auto max-w-4xl text-center animate-fade-in">
            <Badge variant="secondary" className="mb-6 px-4 py-2">
              <Zap className="mr-2 h-4 w-4" />
              Launch polls in seconds
            </Badge>
            <h1 className="mb-6 text-5xl font-bold tracking-tight lg:text-7xl">
              Create{" "}
              <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                Beautiful Polls
              </span>{" "}
              That Drive Decisions
            </h1>
            <p className="mb-8 text-xl text-muted-foreground lg:text-2xl max-w-3xl mx-auto leading-relaxed">
              Gather opinions, make data-driven decisions, and engage your audience with 
              stunning, interactive polls. No friction for voters, maximum insights for you.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link href="/polls/create">
                <Button size="lg" className="h-14 px-8 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200">
                  Create Your First Poll
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/polls">
                <Button size="lg" variant="outline" className="h-14 px-8 text-lg font-semibold">
                  Browse Polls
                  <Globe className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/4 h-72 w-72 rounded-full bg-primary/5 blur-3xl"></div>
          <div className="absolute top-3/4 right-1/4 h-72 w-72 rounded-full bg-secondary/5 blur-3xl"></div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y bg-background/50 backdrop-blur-sm">
        <div className="container">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div className="text-center animate-slide-up">
              <div className="text-3xl font-bold lg:text-4xl">{totalPolls || 0}</div>
              <div className="text-sm text-muted-foreground lg:text-base">Polls Created</div>
            </div>
            <div className="text-center animate-slide-up" style={{animationDelay: '0.1s'}}>
              <div className="text-3xl font-bold lg:text-4xl">{totalVoteCount || 0}</div>
              <div className="text-sm text-muted-foreground lg:text-base">Votes Cast</div>
            </div>
            <div className="text-center animate-slide-up" style={{animationDelay: '0.2s'}}>
              <div className="text-3xl font-bold lg:text-4xl">{activePolls || 0}</div>
              <div className="text-sm text-muted-foreground lg:text-base">Active Polls</div>
            </div>
            <div className="text-center animate-slide-up" style={{animationDelay: '0.3s'}}>
              <div className="text-3xl font-bold lg:text-4xl">{totalUsers || 0}</div>
              <div className="text-sm text-muted-foreground lg:text-base">Users</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 lg:py-32">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <Badge variant="outline" className="mb-4">
              Features
            </Badge>
            <h2 className="mb-4">
              Everything you need to create engaging polls
            </h2>
            <p className="text-lg text-muted-foreground">
              Powerful features designed to help you gather meaningful feedback and make better decisions
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card className="card-hover border-2 animate-slide-up">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                  <BarChart3 className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl">Real-time Analytics</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-base leading-relaxed">
                  Watch votes pour in live with beautiful visualizations and detailed analytics to understand your audience better
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="card-hover border-2 animate-slide-up" style={{animationDelay: '0.1s'}}>
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary/10">
                  <Users className="h-8 w-8 text-secondary-foreground" />
                </div>
                <CardTitle className="text-xl">Zero Friction Sharing</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-base leading-relaxed">
                  Share with a simple link. No sign-ups required for voters. Maximum participation with minimal barriers
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="card-hover border-2 animate-slide-up" style={{animationDelay: '0.2s'}}>
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10">
                  <Shield className="h-8 w-8 text-accent-foreground" />
                </div>
                <CardTitle className="text-xl">Privacy by Design</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-base leading-relaxed">
                  Choose anonymous voting or require authentication. Full control over data privacy and voter anonymity
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="card-hover border-2 animate-slide-up" style={{animationDelay: '0.3s'}}>
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-chart-1/10">
                  <TrendingUp className="h-8 w-8 text-chart-1" />
                </div>
                <CardTitle className="text-xl">Smart Insights</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-base leading-relaxed">
                  Get AI-powered insights and trend analysis to understand what your data really means
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="card-hover border-2 animate-slide-up" style={{animationDelay: '0.4s'}}>
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-chart-2/10">
                  <Zap className="h-8 w-8 text-chart-2" />
                </div>
                <CardTitle className="text-xl">Lightning Fast</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-base leading-relaxed">
                  Create polls in under 30 seconds. Optimized for speed without sacrificing powerful features
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="card-hover border-2 animate-slide-up" style={{animationDelay: '0.5s'}}>
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-chart-3/10">
                  <Globe className="h-8 w-8 text-chart-3" />
                </div>
                <CardTitle className="text-xl">Global Reach</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-base leading-relaxed">
                  Reach audiences worldwide with multi-language support and global CDN for lightning-fast loading
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32">
        <div className="container">
          <Card className="glass-effect border-2 animate-fade-in">
            <CardContent className="p-12 text-center">
              <Badge variant="secondary" className="mb-6">
                Ready to get started?
              </Badge>
              <h2 className="mb-4">
                Join thousands creating better polls
              </h2>
              <p className="mb-8 text-lg text-muted-foreground max-w-2xl mx-auto">
                Start gathering meaningful feedback today. Create your first poll in under a minute 
                and see why teams choose PollApp for their decision-making needs.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
                <Link href="/polls/create">
                  <Button size="lg" className="h-14 px-8 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200">
                    Create Poll Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button size="lg" variant="outline" className="h-14 px-8 text-lg font-semibold">
                    Sign Up Free
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}