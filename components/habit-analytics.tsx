"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { useEffect, useState } from "react"
import { getClientSupabaseInstance } from "@/lib/supabase"
import { useAuth } from "@/components/auth-provider"

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--secondary))",
  "hsl(var(--accent))",
  "hsl(var(--violet))",
  "hsl(var(--rose))",
]

export function HabitAnalytics({ data }: { data: any[] }) {
  const [habits, setHabits] = useState<any[]>([])
  const [habitCompletions, setHabitCompletions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()
  const supabase = getClientSupabaseInstance()

  useEffect(() => {
    if (user) {
      fetchHabits()
    }
  }, [user])

  const fetchHabits = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      // Fetch habits
      const { data: habitsData, error: habitsError } = await supabase.from("habits").select("*").eq("user_id", user.id)

      if (habitsError) {
        console.error("Error fetching habits:", habitsError)
        return
      }

      setHabits(habitsData || [])

      // Fetch habit completions
      const { data: completionsData, error: completionsError } = await supabase
        .from("habit_completions")
        .select("*")
        .eq("user_id", user.id)
        .order("completed_at", { ascending: false })

      if (completionsError) {
        console.error("Error fetching habit completions:", completionsError)
        return
      }

      setHabitCompletions(completionsData || [])
    } catch (error) {
      console.error("Error fetching habits data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Calculate completion rate
  const totalHabits = habits.length
  const completedHabits = data.reduce((sum, day) => sum + (day.habits_completed || 0), 0)
  const totalHabitInstances = data.reduce((sum, day) => sum + (day.habits_total || 0), 0)
  const completionRate = totalHabitInstances > 0 ? Math.round((completedHabits / totalHabitInstances) * 100) : 0

  // Calculate current streak
  const currentStreak = calculateCurrentStreak(data)
  const bestStreak = calculateBestStreak(data)

  // Prepare weekly data
  const weeklyData = data.slice(-7).map((day) => {
    const date = new Date(day.date)
    return {
      name: date.toLocaleDateString("en-US", { weekday: "short" }),
      completed: day.habits_completed || 0,
      total: day.habits_total || 0,
    }
  })

  // Prepare monthly data
  const monthlyData = processMonthlyData(data)

  // Prepare habit type data
  const habitTypeData = [
    { name: "Health", value: Math.round(habits.length * 0.35) },
    { name: "Productivity", value: Math.round(habits.length * 0.25) },
    { name: "Learning", value: Math.round(habits.length * 0.2) },
    { name: "Mindfulness", value: Math.round(habits.length * 0.15) },
    { name: "Other", value: Math.round(habits.length * 0.05) },
  ].filter((item) => item.value > 0)

  return (
    <div className="space-y-6">
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="rounded-xl border-border shadow-md">
              <CardContent className="pt-6">
                <div className="text-lg font-medium mb-2">Completion Rate</div>
                <div className="text-2xl font-bold">{completionRate}%</div>
                <Progress value={completionRate} className="mt-2" />
                <div className="mt-1 text-xs text-muted-foreground">
                  {completedHabits} of {totalHabitInstances} habit instances completed
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl border-border shadow-md">
              <CardContent className="pt-6">
                <div className="text-lg font-medium mb-2">Current Streak</div>
                <div className="text-2xl font-bold">{currentStreak} days</div>
                <Progress value={(currentStreak / Math.max(bestStreak, 30)) * 100} className="mt-2" />
                <div className="mt-1 text-xs text-muted-foreground">Best: {bestStreak} days</div>
              </CardContent>
            </Card>
          </div>

          <Card className="rounded-xl border-border shadow-md">
            <CardContent className="pt-6">
              <div className="text-lg font-medium mb-4">Weekly Performance</div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        borderColor: "hsl(var(--border))",
                        borderRadius: "0.75rem",
                      }}
                    />
                    <Bar dataKey="completed" name="Completed" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="total" name="Total" fill="hsl(var(--muted))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="rounded-xl border-border shadow-md">
              <CardContent className="pt-6">
                <div className="text-lg font-medium mb-4">Habit Types</div>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={habitTypeData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {habitTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          borderColor: "hsl(var(--border))",
                          borderRadius: "0.75rem",
                        }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl border-border shadow-md">
              <CardContent className="pt-6">
                <div className="text-lg font-medium mb-4">Monthly Trend</div>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          borderColor: "hsl(var(--border))",
                          borderRadius: "0.75rem",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="completed"
                        name="Completed"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="total"
                        name="Total"
                        stroke="hsl(var(--muted-foreground))"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}

function calculateCurrentStreak(data: any[]): number {
  let streak = 0
  for (let i = data.length - 1; i >= 0; i--) {
    if (data[i].habits_completed === data[i].habits_total && data[i].habits_total > 0) {
      streak++
    } else {
      break
    }
  }
  return streak
}

function calculateBestStreak(data: any[]): number {
  let bestStreak = 0
  let currentStreak = 0
  for (let i = data.length - 1; i >= 0; i--) {
    if (data[i].habits_completed === data[i].habits_total && data[i].habits_total > 0) {
      currentStreak++
      bestStreak = Math.max(bestStreak, currentStreak)
    } else {
      currentStreak = 0
    }
  }
  return bestStreak
}

function processMonthlyData(data: any[]): any[] {
  const monthlyData = []
  let currentWeek = { name: "", completed: 0, total: 0 }
  let weekNumber = 1

  data.forEach((day, index) => {
    const date = new Date(day.date)
    const dayOfWeek = date.getDay() // 0 (Sunday) to 6 (Saturday)

    currentWeek.completed += day.habits_completed || 0
    currentWeek.total += day.habits_total || 0
    currentWeek.name = `Week ${weekNumber}`

    if (dayOfWeek === 6 || index === data.length - 1) {
      monthlyData.push({ ...currentWeek })
      currentWeek = { name: "", completed: 0, total: 0 }
      weekNumber++
    }
  })

  return monthlyData
}
