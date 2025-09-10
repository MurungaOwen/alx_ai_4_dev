"use client"

import Link from "next/link"
import { useState } from "react"
import { MainNav } from "./main-nav"
import { UserNav } from "@/components/auth/user-nav"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Sparkles } from "lucide-react"
import { useAuth } from "@/providers/auth-provider"

export function SiteHeader() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, loading } = useAuth()

  return (
    <header className="sticky top-0 z-50 w-full glass-effect border-b">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              PollApp
            </span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <MainNav />
          </div>
        </div>
        
        {/* Desktop Auth */}
        <div className="hidden md:flex items-center space-x-3">
          <UserNav />
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <div className="flex flex-col space-y-8 mt-8">
                <div className="flex items-center space-x-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-xl font-bold">PollApp</span>
                </div>
                
                <nav className="flex flex-col space-y-4">
                  <Link 
                    href="/" 
                    className="text-lg font-medium hover:text-primary transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    Home
                  </Link>
                  <Link 
                    href="/polls" 
                    className="text-lg font-medium hover:text-primary transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    Browse Polls
                  </Link>
                  {user && (
                    <Link 
                      href="/polls/create" 
                      className="text-lg font-medium hover:text-primary transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      Create Poll
                    </Link>
                  )}
                </nav>
                
                <div className="border-t pt-8">
                  <div className="space-y-4">
                    {user && <div className="text-sm text-muted-foreground">Account</div>}
                    <UserNav mobile onNavigate={() => setIsOpen(false)} />
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}