"use client"

import { useState } from "react"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { 
  Settings, 
  Shield, 
  Bell, 
  Palette, 
  AlertCircle, 
  CheckCircle, 
  Trash2,
  Key,
  Mail,
  Globe
} from "lucide-react"
import { useAuth } from "@/providers/auth-provider"
import { updatePassword, resetPassword } from "@/lib/auth/actions"

export default function SettingsPage() {
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  
  // Password settings
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  // Notification settings
  const [notifications, setNotifications] = useState({
    emailUpdates: true,
    pollResults: true,
    newVotes: false,
    marketingEmails: false,
  })

  // Privacy settings
  const [privacy, setPrivacy] = useState({
    profilePublic: true,
    showInDirectory: true,
    allowDirectMessages: true,
  })

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage(null)

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' })
      setIsSubmitting(false)
      return
    }

    if (passwordData.newPassword.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters long' })
      setIsSubmitting(false)
      return
    }

    try {
      const result = await updatePassword(passwordData.newPassword)
      
      if (result.success) {
        setMessage({ type: 'success', text: 'Password updated successfully!' })
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to update password' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An unexpected error occurred' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePasswordReset = async () => {
    if (!user?.email) return
    
    setIsSubmitting(true)
    setMessage(null)

    try {
      const result = await resetPassword(user.email)
      
      if (result.success) {
        setMessage({ type: 'success', text: 'Password reset link sent to your email!' })
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to send reset email' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An unexpected error occurred' })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!user) return null

  return (
    <ProtectedRoute>
      <div className="page-container">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="mb-8 animate-fade-in">
            <div className="flex items-center gap-3">
              <Settings className="h-8 w-8 text-primary" />
              <div>
                <h1>Settings</h1>
                <p className="text-xl text-muted-foreground mt-1">
                  Manage your account preferences and security settings
                </p>
              </div>
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

          <Tabs defaultValue="security" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="privacy">Privacy</TabsTrigger>
              <TabsTrigger value="account">Account</TabsTrigger>
            </TabsList>

            <TabsContent value="security" className="space-y-6">
              <Card className="border-2 glass-effect animate-slide-up">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="h-5 w-5" />
                    Change Password
                  </CardTitle>
                  <CardDescription>
                    Update your password to keep your account secure
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePasswordUpdate} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                        placeholder="Enter new password"
                        className="border-2"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        placeholder="Confirm new password"
                        className="border-2"
                        required
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                      <Button type="submit" disabled={isSubmitting} className="sm:w-auto">
                        {isSubmitting ? "Updating..." : "Update Password"}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={handlePasswordReset}
                        disabled={isSubmitting}
                        className="sm:w-auto"
                      >
                        Send Reset Email
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              <Card className="border-2 glass-effect animate-slide-up" style={{animationDelay: '0.1s'}}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Account Security
                  </CardTitle>
                  <CardDescription>
                    Manage your account security settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="font-medium">Email Verification</div>
                      <div className="text-sm text-muted-foreground">
                        Your email is {user.email_confirmed_at ? 'verified' : 'not verified'}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {user.email_confirmed_at ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-yellow-600" />
                      )}
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="font-medium">Two-Factor Authentication</div>
                      <div className="text-sm text-muted-foreground">
                        Add an extra layer of security to your account
                      </div>
                    </div>
                    <Button variant="outline" size="sm" disabled>
                      Coming Soon
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6">
              <Card className="border-2 glass-effect animate-slide-up">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Email Notifications
                  </CardTitle>
                  <CardDescription>
                    Choose what notifications you'd like to receive
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="font-medium">Poll Updates</div>
                      <div className="text-sm text-muted-foreground">
                        Receive updates about your polls
                      </div>
                    </div>
                    <Switch
                      checked={notifications.emailUpdates}
                      onCheckedChange={(checked) => 
                        setNotifications(prev => ({ ...prev, emailUpdates: checked }))
                      }
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="font-medium">Poll Results</div>
                      <div className="text-sm text-muted-foreground">
                        Get notified when polls you created end
                      </div>
                    </div>
                    <Switch
                      checked={notifications.pollResults}
                      onCheckedChange={(checked) => 
                        setNotifications(prev => ({ ...prev, pollResults: checked }))
                      }
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="font-medium">New Votes</div>
                      <div className="text-sm text-muted-foreground">
                        Get notified when someone votes on your polls
                      </div>
                    </div>
                    <Switch
                      checked={notifications.newVotes}
                      onCheckedChange={(checked) => 
                        setNotifications(prev => ({ ...prev, newVotes: checked }))
                      }
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="font-medium">Marketing Emails</div>
                      <div className="text-sm text-muted-foreground">
                        Receive updates about new features and tips
                      </div>
                    </div>
                    <Switch
                      checked={notifications.marketingEmails}
                      onCheckedChange={(checked) => 
                        setNotifications(prev => ({ ...prev, marketingEmails: checked }))
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="privacy" className="space-y-6">
              <Card className="border-2 glass-effect animate-slide-up">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Privacy Settings
                  </CardTitle>
                  <CardDescription>
                    Control who can see your information and activity
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="font-medium">Public Profile</div>
                      <div className="text-sm text-muted-foreground">
                        Allow others to view your profile information
                      </div>
                    </div>
                    <Switch
                      checked={privacy.profilePublic}
                      onCheckedChange={(checked) => 
                        setPrivacy(prev => ({ ...prev, profilePublic: checked }))
                      }
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="font-medium">Show in Directory</div>
                      <div className="text-sm text-muted-foreground">
                        Appear in user directory and search results
                      </div>
                    </div>
                    <Switch
                      checked={privacy.showInDirectory}
                      onCheckedChange={(checked) => 
                        setPrivacy(prev => ({ ...prev, showInDirectory: checked }))
                      }
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="font-medium">Direct Messages</div>
                      <div className="text-sm text-muted-foreground">
                        Allow other users to send you direct messages
                      </div>
                    </div>
                    <Switch
                      checked={privacy.allowDirectMessages}
                      onCheckedChange={(checked) => 
                        setPrivacy(prev => ({ ...prev, allowDirectMessages: checked }))
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="account" className="space-y-6">
              <Card className="border-2 glass-effect animate-slide-up">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Account Information
                  </CardTitle>
                  <CardDescription>
                    View and manage your account details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Email Address</Label>
                      <Input value={user.email || ''} disabled className="bg-muted/50" />
                    </div>
                    <div className="space-y-2">
                      <Label>Account Created</Label>
                      <Input 
                        value={new Date(user.created_at).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })} 
                        disabled 
                        className="bg-muted/50" 
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>User ID</Label>
                    <Input value={user.id} disabled className="bg-muted/50 font-mono text-sm" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-destructive/20 glass-effect animate-slide-up" style={{animationDelay: '0.1s'}}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-destructive">
                    <Trash2 className="h-5 w-5" />
                    Danger Zone
                  </CardTitle>
                  <CardDescription>
                    Irreversible and destructive actions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 border border-destructive/20 rounded-lg bg-destructive/5">
                      <div className="space-y-2">
                        <div className="font-medium text-destructive">Delete Account</div>
                        <div className="text-sm text-muted-foreground">
                          Permanently delete your account and all associated data. This action cannot be undone.
                        </div>
                      </div>
                      <Button variant="destructive" size="sm" className="mt-4" disabled>
                        Delete Account
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ProtectedRoute>
  )
}