"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export function MainNav() {
  const pathname = usePathname()

  const routes = [
    {
      href: "/",
      label: "Home",
      active: pathname === "/"
    },
    {
      href: "/polls",
      label: "Browse Polls",
      active: pathname === "/polls" || (pathname?.startsWith("/polls") && pathname !== "/polls/create")
    },
    {
      href: "/polls/create",
      label: "Create Poll",
      active: pathname === "/polls/create"
    }
  ]

  return (
    <nav className="flex items-center space-x-1">
      {routes.map((route) => (
        <Link
          key={route.href}
          href={route.href}
          className={cn(
            "relative px-4 py-2 text-sm font-medium transition-all duration-200 rounded-lg",
            "hover:bg-accent/50 hover:text-accent-foreground",
            route.active 
              ? "bg-accent text-accent-foreground shadow-sm" 
              : "text-muted-foreground"
          )}
        >
          {route.label}
          {route.active && (
            <div className="absolute bottom-0 left-1/2 h-0.5 w-4 -translate-x-1/2 rounded-full bg-primary" />
          )}
        </Link>
      ))}
    </nav>
  )
}