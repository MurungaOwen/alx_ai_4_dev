import Link from "next/link"
import { Button } from "@/components/ui/button"

export function AuthHeader() {
  return (
    <header className="border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="text-2xl font-bold">
          PollApp
        </Link>
        <div className="flex gap-2">
          <Link href="/auth/login">
            <Button variant="ghost">Sign In</Button>
          </Link>
          <Link href="/auth/register">
            <Button>Sign Up</Button>
          </Link>
        </div>
      </div>
    </header>
  )
}