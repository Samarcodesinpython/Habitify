"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, CheckCircle2, Home, Clock } from "lucide-react"

export function MobileNav() {
  const pathname = usePathname()

  const isActive = (path: string) => {
    return pathname === path
  }

  return (
    <div className="fixed bottom-0 left-0 z-50 w-full border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
      <div className="grid h-16 grid-cols-4">
        <Link
          href="/dashboard"
          className={`flex flex-col items-center justify-center ${
            isActive("/dashboard") ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <Home className="h-5 w-5" />
          <span className="text-xs">Home</span>
        </Link>
        <Link
          href="/dashboard/habits"
          className={`flex flex-col items-center justify-center ${
            isActive("/dashboard/habits") ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <CheckCircle2 className="h-5 w-5" />
          <span className="text-xs">Habits</span>
        </Link>
        <Link
          href="/dashboard/focus"
          className={`flex flex-col items-center justify-center ${
            isActive("/dashboard/focus") ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <Clock className="h-5 w-5" />
          <span className="text-xs">Focus</span>
        </Link>
        <Link
          href="/dashboard/analytics"
          className={`flex flex-col items-center justify-center ${
            isActive("/dashboard/analytics") ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <BarChart3 className="h-5 w-5" />
          <span className="text-xs">Stats</span>
        </Link>
      </div>
    </div>
  )
}
