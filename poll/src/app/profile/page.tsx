"use client"

import { useState, useEffect } from "react"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { User, Mail, Calendar, BarChart3, FileText, TrendingUp, CheckCircle, AlertCircle, Edit3, Vote } from "lucide-react"
import { useAuth } from "@/providers/auth-provider"
import { updateProfile } from "@/lib/auth/actions"
import { getPolls } from "@/lib/api/polls"
import { getUserStats, type UserStats } from "@/lib/api/user"
import { VotingActivity } from "@/components/profile/voting-activity"

export default function ProfilePage() {
  const { user, profile, refreshProfile, invalidateUserStats, statsInvalidated } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [userPolls, setUserPolls] = useState<any[]>([])
  const [pollsLoading, setPollsLoading] = useState(true)
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)
  
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    bio: profile?.bio || '',
    avatar_url: profile?.avatar_url || '',
  })

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        bio: profile.bio || '',
        avatar_url: profile.avatar_url || '',
      })
    }
  }, [profile])

  useEffect(() => {
    loadUserPolls()
    loadUserStats()
  }, [user])

  // Refresh stats when invalidated (e.g., after voting)
  useEffect(() => {
    if (statsInvalidated > 0) {
      loadUserStats()
    }
  }, [statsInvalidated])

  const loadUserPolls = async () => {
    if (!user) return
    
    try {
      const result = await getPolls({ creatorId: user.id, limit: 10 })
      if (result.success && result.data) {
        setUserPolls(result.data)
      }
    } catch (error) {
      console.error('Failed to load user polls:', error)
    } finally {
      setPollsLoading(false)
    }
  }

  const loadUserStats = async () => {
    if (!user) return
    
    try {
      const result = await getUserStats()
      if (result.success && result.data) {
        setUserStats(result.data)
      }
    } catch (error) {
      console.error('Failed to load user stats:', error)
    } finally {
      setStatsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage(null)

    try {
      const result = await updateProfile(formData)
      
      if (result.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' })
        setIsEditing(false)
        await refreshProfile()
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to update profile' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An unexpected error occurred' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      full_name: profile?.full_name || '',
      bio: profile?.bio || '',
      avatar_url: profile?.avatar_url || '',
    })
    setIsEditing(false)
    setMessage(null)
  }

  if (!user || !profile) return null

  const displayName = profile.full_name || user.email?.split('@')[0] || 'User'
  const initials = displayName
    .split(' ')
    .map((name) => name[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const totalVotesReceived = userStats?.total_votes_received || 0
  const activePolls = userPolls.filter(poll => poll.status === 'active').length
  const votesCast = userStats?.votes_cast || 0

  return (
    <ProtectedRoute>
      <div className="page-container">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="mb-8 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1>Your Profile</h1>
                <p className="text-xl text-muted-foreground mt-2">
                  Manage your account information and view your activity
                </p>
              </div>
              {!isEditing && (
                <Button onClick={() => setIsEditing(true)} className="w-fit">
                  <Edit3 className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
              )}
            </div>
          </div>

          {message && (
            <Alert variant={message.type === 'error' ? 'destructive' : 'default'} className="mb-6">
              {message.type === 'error' ? (
                <AlertCircle className="h-4 w-4" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6">
              <Card className="border-2 glass-effect animate-slide-up">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Personal Information
                  </CardTitle>
                  <CardDescription>
                    Update your personal details and profile information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="flex flex-col sm:flex-row items-center gap-6">
                        <Avatar className="h-20 w-20">
                          <AvatarImage src={formData.avatar_url} alt={displayName} />
                          <AvatarFallback className="text-lg">{initials}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-2">
                          <Label htmlFor="avatar_url">Avatar URL</Label>
                          <Input
                            id="avatar_url"
                            type="url"
                            value={formData.avatar_url}
                            onChange={(e) => setFormData(prev => ({ ...prev, avatar_url: e.target.value }))}
                            placeholder="https://example.com/avatar.jpg"
                            className="border-2"
                          />
                        </div>
                      </div>

                      <Separator />

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="full_name">Full Name</Label>
                          <Input
                            id="full_name"
                            value={formData.full_name}
                            onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                            placeholder="Your full name"
                            className="border-2"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={user.email || ''}
                            disabled
                            className="bg-muted/50"
                          />
                          <p className="text-xs text-muted-foreground">
                            Email cannot be changed from this page
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                          id="bio"
                          value={formData.bio}
                          onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                          placeholder="Tell us a little about yourself..."
                          rows={4}
                          className="border-2 resize-none"
                          maxLength={300}
                        />
                        <p className="text-xs text-muted-foreground">
                          {formData.bio.length}/300 characters
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3 pt-4">
                        <Button 
                          type="submit" 
                          disabled={isSubmitting}
                          className="sm:w-auto"
                        >
                          {isSubmitting ? "Updating..." : "Save Changes"}
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={handleCancel}
                          disabled={isSubmitting}
                          className="sm:w-auto"
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-6">
                      <div className="flex flex-col sm:flex-row items-center gap-6">
                        <Avatar className="h-20 w-20">
                          <AvatarImage src={profile.avatar_url || ''} alt={displayName} />
                          <AvatarFallback className="text-lg">{initials}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 text-center sm:text-left">
                          <h3 className="text-2xl font-semibold">{displayName}</h3>
                          <p className="text-muted-foreground flex items-center justify-center sm:justify-start gap-2 mt-1">
                            <Mail className="h-4 w-4" />
                            {user.email}
                          </p>
                          <p className="text-sm text-muted-foreground flex items-center justify-center sm:justify-start gap-2 mt-2">
                            <Calendar className="h-4 w-4" />
                            Member since {new Date(user.created_at).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </p>
                        </div>
                      </div>

                      <Separator />

                      {profile.bio ? (
                        <div>
                          <h4 className="font-medium mb-2">About</h4>
                          <p className="text-muted-foreground leading-relaxed">{profile.bio}</p>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <p>No bio added yet. Click "Edit Profile" to add one!</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity" className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <Card className="text-center p-4 glass-effect animate-slide-up">
                  <div className="flex items-center justify-center mb-2">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-xl font-bold">
                    {statsLoading ? '-' : userPolls.length}
                  </div>
                  <div className="text-xs text-muted-foreground">Polls Created</div>
                </Card>
                <Card className="text-center p-4 glass-effect animate-slide-up" style={{animationDelay: '0.1s'}}>
                  <div className="flex items-center justify-center mb-2">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="text-xl font-bold">
                    {statsLoading ? '-' : activePolls}
                  </div>
                  <div className="text-xs text-muted-foreground">Active Polls</div>
                </Card>
                <Card className="text-center p-4 glass-effect animate-slide-up" style={{animationDelay: '0.2s'}}>
                  <div className="flex items-center justify-center mb-2">
                    <BarChart3 className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="text-xl font-bold">
                    {statsLoading ? '-' : totalVotesReceived}
                  </div>
                  <div className="text-xs text-muted-foreground">Votes Received</div>
                </Card>
                <Card className="text-center p-4 glass-effect animate-slide-up" style={{animationDelay: '0.3s'}}>
                  <div className="flex items-center justify-center mb-2">
                    <Vote className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="text-xl font-bold">
                    {statsLoading ? '-' : votesCast}
                  </div>
                  <div className="text-xs text-muted-foreground">Votes Cast</div>
                </Card>
              </div>

              {/* Activity Sections */}
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Voting Activity */}
                <div className="animate-slide-up" style={{animationDelay: '0.4s'}}>
                  <VotingActivity />
                </div>
                
                {/* Created Polls */}
                <Card className="border-2 glass-effect animate-slide-up" style={{animationDelay: '0.5s'}}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Your Recent Polls
                    </CardTitle>
                    <CardDescription>
                      Polls you've created recently
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {pollsLoading ? (
                      <div className="space-y-3">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <div key={i} className="animate-pulse flex items-center space-x-4">
                            <div className="h-4 bg-muted rounded w-full"></div>
                            <div className="h-4 bg-muted rounded w-20"></div>
                          </div>
                        ))}
                      </div>
                    ) : userPolls.length > 0 ? (
                      <div className="space-y-4">
                        {userPolls.slice(0, 5).map((poll) => (
                          <div key={poll.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                            <div className="flex-1">
                              <h4 className="font-medium">{poll.title}</h4>
                              <p className="text-sm text-muted-foreground mt-1">
                                {poll.total_votes} votes • Created {new Date(poll.created_at).toLocaleDateString('en-US', { 
                                  year: 'numeric', 
                                  month: 'short', 
                                  day: 'numeric' 
                                })}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={poll.status === 'active' ? 'default' : 'secondary'}>
                                {poll.status}
                              </Badge>
                              <Button variant="ghost" size="sm" asChild>
                                <Link href={`/polls/${poll.id}`}>View</Link>
                              </Button>
                            </div>
                          </div>
                        ))}
                        {userPolls.length > 5 && (
                          <div className="text-center pt-2">
                            <Button variant="outline" size="sm" asChild>
                              <Link href="/polls?creator=me">View All Polls</Link>
                            </Button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>You haven't created any polls yet.</p>
                        <Button asChild className="mt-4">
                          <Link href="/polls/create">Create Your First Poll</Link>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ProtectedRoute>
  )
}