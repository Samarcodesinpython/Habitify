"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { HabitList } from "@/components/habit-list"
import { MotivationalQuote } from "@/components/motivational-quote"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useState } from "react"
import type { Habit } from "@/components/habit-list"

export default function DashboardPage() {
  const { user } = useAuth()
  const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Alex"
  const [habits, setHabits] = useState<Habit[]>([])

  return (
    <div className="flex flex-col gap-6 pb-16 md:pb-0">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Hey {userName}, Ready to Focus?</h1>
        <MotivationalQuote />
      </div>

      <Card className="rounded-2xl border-border shadow-md">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Today's Habits</CardTitle>
              <CardDescription>You have {habits.length} habits scheduled for today</CardDescription>
            </div>
            <Link href="/dashboard/habits">
              <Button variant="ghost" size="sm" className="rounded-xl gap-1">
                View All <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <HabitList habits={habits} setHabits={setHabits} />
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="rounded-2xl border-border shadow-md">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Current Streak</CardTitle>
                <CardDescription>Your longest active streak</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">Morning Meditation</div>
                <div className="text-3xl font-bold">12 days</div>
              </div>
              <div className="relative h-24 w-24">
                <svg className="h-full w-full" viewBox="0 0 100 100">
                  <defs>
                    <linearGradient id="streak-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="hsl(var(--primary))" />
                      <stop offset="100%" stopColor="hsl(var(--primary))" />
                    </linearGradient>
                  </defs>
                  <circle className="stroke-muted" cx="50" cy="50" r="40" fill="none" strokeWidth="8" />
                  <circle
                    className="stroke-[url(#streak-gradient)]"
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray="251.2"
                    strokeDashoffset="62.8"
                    transform="rotate(-90 50 50)"
                  />
                  <text
                    x="50"
                    y="50"
                    dominantBaseline="middle"
                    textAnchor="middle"
                    className="fill-primary text-xl font-bold"
                  >
                    75%
                  </text>
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border shadow-md">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Focus Sessions</CardTitle>
                <CardDescription>Today's focus time</CardDescription>
              </div>
              <Link href="/dashboard/focus">
                <Button variant="ghost" size="sm" className="rounded-xl gap-1">
                  Focus Mode <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="text-3xl font-bold">1h 25m</div>
                <div className="text-sm font-medium text-muted-foreground">3 sessions completed</div>
              </div>
              <Button className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90" asChild>
                <Link href="/dashboard/focus">Start Session</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl border-border shadow-md">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Weekly Overview</CardTitle>
              <CardDescription>Your habit completion for this week</CardDescription>
            </div>
            <Link href="/dashboard/analytics">
              <Button variant="ghost" size="sm" className="rounded-xl gap-1">
                View Analytics <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            {["M", "T", "W", "T", "F", "S", "S"].map((day, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className="text-sm font-medium text-muted-foreground">{day}</div>
                <div
                  className={`mt-2 h-16 w-4 rounded-full ${
                    index < 3 ? "bg-primary" : index === 3 ? "bg-primary/60" : "bg-muted"
                  }`}
                ></div>
                <div className="mt-1 text-sm font-medium">{index < 3 ? "100%" : index === 3 ? "60%" : "0%"}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
