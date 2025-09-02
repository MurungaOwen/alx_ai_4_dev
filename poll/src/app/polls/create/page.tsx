"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, X, ArrowLeft, Wand2, Settings, Eye, AlertCircle, CheckCircle } from "lucide-react"
import { getCategories } from "@/lib/api/polls"
import { useAuth } from "@/providers/auth-provider"

export default function CreatePollPage() {
  const [options, setOptions] = useState(["", ""])
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [categoryId, setCategoryId] = useState<string>("")
  const [allowMultiple, setAllowMultiple] = useState(false)
  const [anonymous, setAnonymous] = useState(true)
  const [categories, setCategories] = useState<any[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  const { user, loading } = useAuth()
  const router = useRouter()

  // Immediate redirect for unauthorized access
  useEffect(() => {
    if (!loading && !user) {
      router.replace('/auth/login?redirect=/polls/create')
    }
  }, [user, loading, router])

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      const result = await getCategories()
      if (result.success && result.data) {
        setCategories(result.data)
      }
    } catch (err) {
      console.error('Failed to load categories:', err)
    }
  }

  const addOption = () => {
    if (options.length < 10) {
      setOptions([...options, ""])
    }
  }

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index))
    }
  }

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options]
    newOptions[index] = value
    setOptions(newOptions)
  }

  const validateForm = () => {
    if (!title.trim()) {
      setError("Poll title is required")
      return false
    }

    if (title.length > 100) {
      setError("Poll title must be less than 100 characters")
      return false
    }

    if (description.length > 300) {
      setError("Description must be less than 300 characters")
      return false
    }

    const validOptions = options.filter(opt => opt.trim())
    if (validOptions.length < 2) {
      setError("At least 2 options are required")
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    // Double check authentication on client side
    console.log('Create poll - user check:', { user: user?.id, email: user?.email })
    
    if (!user) {
      setError("Please sign in to create a poll")
      return
    }

    setIsSubmitting(true)
    setError(null)

    // Add timeout protection
    const timeoutId = setTimeout(() => {
      console.error('Poll creation operation timed out')
      setError("Poll creation timed out. Please try again.")
      setIsSubmitting(false)
    }, 20000) // 20 second timeout

    try {
      const validOptions = options.filter(opt => opt.trim())
      
      // Use client-side Supabase directly since we're on a protected route
      const { supabase: clientSupabase } = await import('@/lib/supabase/client')
      
      // Create poll data
      const pollInsert = {
        title: title.trim(),
        description: description.trim() || null,
        creator_id: user.id,
        category_id: categoryId || null,
        status: 'active' as const,
        vote_type: allowMultiple ? 'multiple' as const : 'single' as const,
        allow_anonymous: anonymous,
        allow_multiple_votes: allowMultiple,
        expires_at: null,
      }

      console.log('Creating poll with data:', pollInsert)

      const { data: poll, error: pollError } = await clientSupabase
        .from('polls')
        .insert(pollInsert)
        .select()
        .single()

      if (pollError) {
        console.error('Poll creation error:', pollError)
        setError(pollError.message || "Failed to create poll")
        return
      }

      if (!poll) {
        setError("Poll was not created - no data returned")
        return
      }

      console.log('Poll created successfully:', poll)

      // Create poll options
      const optionsInsert = validOptions.map((option: string, index: number) => ({
        poll_id: poll.id,
        text: option.trim(),
        position: index,
      }))

      const { error: optionsError } = await clientSupabase
        .from('poll_options')
        .insert(optionsInsert)

      if (optionsError) {
        console.error('Poll options creation error:', optionsError)
        // Clean up poll if options failed
        await clientSupabase.from('polls').delete().eq('id', poll.id)
        setError(optionsError.message || "Failed to create poll options")
        return
      }

      console.log('Poll options created successfully')

      // Revalidate the polls page cache
      try {
        await fetch('/api/revalidate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: '/polls' })
        })
      } catch (revalidateError) {
        console.warn('Cache revalidation failed:', revalidateError)
      }

      setSuccess(true)
      // Redirect to the created poll after a short delay
      setTimeout(() => {
        router.push(`/polls/${poll.id}`)
      }, 1500)
        
    } catch (err: any) {
      console.error('Submit error:', err)
      setError(err.message || "An unexpected error occurred")
    } finally {
      clearTimeout(timeoutId)
      setIsSubmitting(false)
    }
  }

  if (success) {
    return (
      <ProtectedRoute>
        <div className="page-container">
          <div className="mx-auto max-w-md">
            <Card className="border-2 glass-effect">
              <CardHeader className="text-center">
                <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-full bg-green-100 mb-4">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle className="text-xl">Poll Created Successfully!</CardTitle>
                <CardDescription>
                  Your poll is now live and ready for votes
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-sm text-muted-foreground">
                  Redirecting you to your new poll...
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="page-container">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="mb-8 animate-fade-in">
            <Link href="/polls" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to polls
            </Link>
            <div className="flex items-center justify-between">
              <div>
                <h1>Create New Poll</h1>
                <p className="text-xl text-muted-foreground mt-2">
                  Build engaging polls that drive meaningful conversations
                </p>
              </div>
              <Badge variant="secondary" className="px-3 py-1">
                <Wand2 className="mr-1 h-3 w-3" />
                Draft
              </Badge>
            </div>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid gap-8 lg:grid-cols-3">
              {/* Main Form */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="border-2 glass-effect animate-slide-up">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Poll Details
                    </CardTitle>
                    <CardDescription>
                      Define your poll question and description
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="title" className="text-base font-medium">
                        Poll Question
                      </Label>
                      <Input 
                        id="title" 
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="What's your question?"
                        className="text-lg h-12 border-2"
                        maxLength={100}
                        required
                      />
                      <div className="text-xs text-muted-foreground">
                        {title.length}/100 characters
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-base font-medium">
                        Description
                        <span className="text-muted-foreground font-normal ml-1">(optional)</span>
                      </Label>
                      <Textarea 
                        id="description" 
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Add context to help people understand your poll better..."
                        rows={4}
                        className="border-2 resize-none"
                        maxLength={300}
                      />
                      <div className="text-xs text-muted-foreground">
                        {description.length}/300 characters
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-base font-medium">
                        Category
                        <span className="text-muted-foreground font-normal ml-1">(optional)</span>
                      </Label>
                      <Select value={categoryId} onValueChange={setCategoryId}>
                        <SelectTrigger className="border-2">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-3 h-3 rounded-full" 
                                  style={{ backgroundColor: category.color }}
                                />
                                {category.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2 glass-effect animate-slide-up" style={{animationDelay: '0.1s'}}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Answer Options</CardTitle>
                        <CardDescription>
                          Add up to 10 options for people to choose from
                        </CardDescription>
                      </div>
                      <Badge variant="outline">
                        {options.length}/10
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {options.map((option, index) => (
                      <div key={index} className="flex gap-3 group">
                        <div className="flex-1">
                          <Input
                            value={option}
                            onChange={(e) => updateOption(index, e.target.value)}
                            placeholder={`Option ${index + 1}`}
                            className="h-11 border-2 group-hover:border-primary/50 transition-colors"
                            maxLength={100}
                          />
                        </div>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon"
                          className="h-11 w-11 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeOption(index)}
                          disabled={options.length <= 2}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="w-full h-11 border-dashed border-2 hover:border-primary/50 transition-colors" 
                      onClick={addOption}
                      disabled={options.length >= 10}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Option
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-2 glass-effect animate-slide-up" style={{animationDelay: '0.2s'}}>
                  <CardHeader>
                    <CardTitle>Poll Settings</CardTitle>
                    <CardDescription>
                      Configure how your poll works
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between p-4 rounded-lg border bg-card/50">
                      <div className="space-y-1">
                        <div className="font-medium">Multiple Choice</div>
                        <div className="text-sm text-muted-foreground">
                          Allow users to select multiple options
                        </div>
                      </div>
                      <Switch 
                        checked={allowMultiple}
                        onCheckedChange={setAllowMultiple}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg border bg-card/50">
                      <div className="space-y-1">
                        <div className="font-medium">Anonymous Voting</div>
                        <div className="text-sm text-muted-foreground">
                          Hide voter identities from results
                        </div>
                      </div>
                      <Switch 
                        checked={anonymous}
                        onCheckedChange={setAnonymous}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Preview Sidebar */}
              <div className="space-y-6">
                <Card className="border-2 glass-effect sticky top-24 animate-slide-up" style={{animationDelay: '0.3s'}}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="h-5 w-5" />
                      Preview
                    </CardTitle>
                    <CardDescription>
                      How your poll will appear to voters
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 border rounded-lg bg-muted/20">
                      <div className="font-medium mb-2">
                        {title || "Your poll question will appear here"}
                      </div>
                      {description && (
                        <div className="text-sm text-muted-foreground mb-4">
                          {description}
                        </div>
                      )}
                      
                      <div className="space-y-2">
                        {options.filter(opt => opt.trim()).map((option, index) => (
                          <div key={index} className="flex items-center space-x-2 p-2 border rounded text-sm">
                            <div className="w-4 h-4 rounded-full border-2"></div>
                            <span>{option || `Option ${index + 1}`}</span>
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 pt-3 border-t text-xs text-muted-foreground space-y-1">
                        {allowMultiple && (
                          <div>✓ Multiple selections allowed</div>
                        )}
                        {anonymous && (
                          <div>✓ Anonymous voting enabled</div>
                        )}
                        {categoryId && (
                          <div>✓ Category: {categories.find(c => c.id === categoryId)?.name}</div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="space-y-3 animate-slide-up" style={{animationDelay: '0.4s'}}>
                  <Button 
                    type="submit" 
                    className="w-full h-12 text-base font-medium shadow-lg hover:shadow-xl transition-all"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Creating..." : "Publish Poll"}
                    {!isSubmitting && <Plus className="ml-2 h-4 w-4" />}
                  </Button>
                  <Link href="/polls" className="block">
                    <Button 
                      type="button" 
                      variant="ghost" 
                      className="w-full h-12 text-base"
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  )
}