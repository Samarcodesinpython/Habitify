"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, CheckCircle2, Home, Settings, Clock } from "lucide-react"

export function Sidebar() {
  const pathname = usePathname()

  const isActive = (path: string) => {
    return pathname === path
  }

  return (
    <aside className="hidden w-64 flex-col border-r bg-background/50 backdrop-blur supports-[backdrop-filter]:bg-background/30 md:flex">
      <div className="flex flex-col gap-2 p-4">
        <div className="py-2 text-sm font-medium">Main</div>
        <nav className="flex flex-col gap-1">
          <Link
            href="/dashboard"
            className={`flex items-center gap-2 rounded-xl px-3 py-2 transition-colors ${
              isActive("/dashboard")
                ? "bg-primary/20 text-foreground font-medium"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Home className="h-4 w-4" />
            Dashboard
          </Link>
          <Link
            href="/dashboard/tasks"
            className={`flex items-center gap-2 rounded-xl px-3 py-2 transition-colors ${
              isActive("/dashboard/tasks")
                ? "bg-primary/20 text-foreground font-medium"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <CheckCircle2 className="h-4 w-4" />
            Tasks
          </Link>
          <Link
            href="/dashboard/habits"
            className={`flex items-center gap-2 rounded-xl px-3 py-2 transition-colors ${
              isActive("/dashboard/habits")
                ? "bg-primary/20 text-foreground font-medium"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <CheckCircle2 className="h-4 w-4" />
            Habits
          </Link>
          <Link
            href="/dashboard/focus"
            className={`flex items-center gap-2 rounded-xl px-3 py-2 transition-colors ${
              isActive("/dashboard/focus")
                ? "bg-primary/20 text-foreground font-medium"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Clock className="h-4 w-4" />
            Focus Mode
          </Link>
          <Link
            href="/dashboard/analytics"
            className={`flex items-center gap-2 rounded-xl px-3 py-2 transition-colors ${
              isActive("/dashboard/analytics")
                ? "bg-primary/20 text-foreground font-medium"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            Analytics
          </Link>
        </nav>
        <div className="py-2 text-sm font-medium">Settings</div>
        <nav className="flex flex-col gap-1">
          <Link
            href="/dashboard/settings"
            className={`flex items-center gap-2 rounded-xl px-3 py-2 transition-colors ${
              isActive("/dashboard/settings")
                ? "bg-primary/20 text-foreground font-medium"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Settings className="h-4 w-4" />
            Settings
          </Link>
        </nav>
      </div>
    </aside>
  )
}
