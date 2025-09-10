"use client"

import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/providers/auth-provider"
import { User, Settings, LogOut, FileText } from "lucide-react"

interface UserNavProps {
  onNavigate?: () => void
  mobile?: boolean
}

export function UserNav({ onNavigate, mobile = false }: UserNavProps) {
  const { user, profile, loading, signOut } = useAuth()

  // Show loading skeleton while auth is loading
  if (loading) {
    return (
      <div className="flex items-center gap-3">
        <div className="h-8 w-16 bg-muted rounded animate-pulse"></div>
        <div className="h-8 w-8 bg-muted rounded-full animate-pulse"></div>
      </div>
    )
  }

  // Show login buttons when not authenticated
  if (!user) {
    if (mobile) {
      return (
        <div className="flex flex-col space-y-3">
          <Link href="/auth/login" onClick={onNavigate}>
            <Button variant="outline" className="w-full justify-start">
              Sign In
            </Button>
          </Link>
          <Link href="/auth/register" onClick={onNavigate}>
            <Button className="w-full justify-start">
              Get Started
            </Button>
          </Link>
        </div>
      )
    }

    return (
      <div className="flex items-center gap-3">
        <Link href="/auth/login">
          <Button variant="ghost" size="sm">
            Sign In
          </Button>
        </Link>
        <Link href="/auth/register">
          <Button size="sm">
            Sign Up
          </Button>
        </Link>
      </div>
    )
  }

  const displayName = profile?.full_name || user.email?.split('@')[0] || 'User'
  const initials = displayName
    .split(' ')
    .map((name) => name[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  if (mobile) {
    return (
      <div className="space-y-3">
        <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
          <Avatar className="h-8 w-8">
            <AvatarImage src={profile?.avatar_url || ''} alt={displayName} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <p className="text-sm font-medium leading-none">{displayName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Link href="/profile" onClick={onNavigate}>
            <Button variant="outline" size="sm" className="w-full justify-start">
              <User className="mr-2 h-4 w-4" />
              Profile
            </Button>
          </Link>
          <Link href="/polls?creator=me" onClick={onNavigate}>
            <Button variant="outline" size="sm" className="w-full justify-start">
              <FileText className="mr-2 h-4 w-4" />
              My Polls
            </Button>
          </Link>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full justify-start text-destructive hover:text-destructive"
          onClick={() => {
            handleSignOut()
            onNavigate?.()
          }}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </Button>
      </div>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={profile?.avatar_url || ''} alt={displayName} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{displayName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <Link href="/profile">
          <DropdownMenuItem className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            Profile
          </DropdownMenuItem>
        </Link>
        <Link href="/polls?creator=me">
          <DropdownMenuItem className="cursor-pointer">
            <FileText className="mr-2 h-4 w-4" />
            My Polls
          </DropdownMenuItem>
        </Link>
        <Link href="/settings">
          <DropdownMenuItem className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </DropdownMenuItem>
        </Link>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          className="cursor-pointer text-destructive focus:text-destructive"
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}