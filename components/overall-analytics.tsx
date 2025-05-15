"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  ComposedChart,
  Area,
} from "recharts"

export function OverallAnalytics({ data }: { data: any[] }) {
  // Calculate productivity score
  const calculateProductivityScore = (day: any) => {
    if (!day) return 0

    const habitScore = day.habits_total > 0 ? (day.habits_completed / day.habits_total) * 50 : 0

    const taskScore = day.tasks_total > 0 ? (day.tasks_completed / day.tasks_total) * 30 : 0

    const focusScore =
      day.focus_time > 0
        ? Math.min(day.focus_time / 3600, 1) * 20 // Max 20 points for 1 hour of focus
        : 0

    return Math.round(habitScore + taskScore + focusScore)
  }

  // Process data for charts
  const processedData = data.map((day) => ({
    ...day,
    productivity_score: day.productivity_score || calculateProductivityScore(day),
    date: new Date(day.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    habits: day.habits_total > 0 ? Math.round((day.habits_completed / day.habits_total) * 100) : 0,
    tasks: day.tasks_total > 0 ? Math.round((day.tasks_completed / day.tasks_total) * 100) : 0,
    focus: day.focus_time > 0 ? Math.min(day.focus_time / 3600, 1) * 100 : 0, // Scale to percentage
  }))

  // Calculate current productivity score (average of last 7 days)
  const last7Days = data.slice(-7)
  const currentScore =
    last7Days.length > 0
      ? Math.round(
          last7Days.reduce((sum, day) => sum + (day.productivity_score || calculateProductivityScore(day)), 0) /
            last7Days.length,
        )
      : 0

  // Calculate weekly average (average of last 30 days)
  const weeklyAverage =
    data.length > 0
      ? Math.round(
          data.reduce((sum, day) => sum + (day.productivity_score || calculateProductivityScore(day)), 0) / data.length,
        )
      : 0

  // Calculate consistency (percentage of days with score > 50)
  const daysAbove50 = data.filter((day) => (day.productivity_score || calculateProductivityScore(day)) > 50).length
  const consistency = data.length > 0 ? Math.round((daysAbove50 / data.length) * 100) : 0

  // Weekly data for chart
  const weeklyData = processWeeklyData(data)

  // Monthly data for chart
  const monthlyData = processMonthlyData(data)

  // Combined performance data
  const combinedData = processedData.slice(-7)

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-xl border-border shadow-md">
          <CardContent className="pt-6">
            <div className="text-lg font-medium mb-2">Productivity Score</div>
            <div className="text-2xl font-bold">{currentScore}/100</div>
            <Progress value={currentScore} className="mt-2" />
            <div className="mt-1 text-xs text-muted-foreground">Based on last 7 days</div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-border shadow-md">
          <CardContent className="pt-6">
            <div className="text-lg font-medium mb-2">Weekly Average</div>
            <div className="text-2xl font-bold">{weeklyAverage}/100</div>
            <Progress value={weeklyAverage} className="mt-2" />
            <div className="mt-1 text-xs text-muted-foreground">Based on last 30 days</div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-border shadow-md">
          <CardContent className="pt-6">
            <div className="text-lg font-medium mb-2">Consistency</div>
            <div className="text-2xl font-bold">{consistency}%</div>
            <Progress value={consistency} className="mt-2" />
            <div className="mt-1 text-xs text-muted-foreground">Days with score above 50</div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-xl border-border shadow-md">
        <CardContent className="pt-6">
          <div className="text-lg font-medium mb-4">Weekly Progress Trend</div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                <YAxis domain={[0, 100]} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    borderColor: "hsl(var(--border))",
                    borderRadius: "0.75rem",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  name="Productivity Score"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-xl border-border shadow-md">
        <CardContent className="pt-6">
          <div className="text-lg font-medium mb-4">Monthly Progress Trend</div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                <YAxis domain={[0, 100]} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    borderColor: "hsl(var(--border))",
                    borderRadius: "0.75rem",
                  }}
                />
                <Bar dataKey="score" name="Productivity Score" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-xl border-border shadow-md">
        <CardContent className="pt-6">
          <div className="text-lg font-medium mb-4">Combined Performance</div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={combinedData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                <YAxis domain={[0, 100]} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    borderColor: "hsl(var(--border))",
                    borderRadius: "0.75rem",
                  }}
                />
                <Legend />
                <Bar dataKey="habits" name="Habits" fill="hsl(var(--violet))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="tasks" name="Tasks" fill="hsl(var(--mint))" radius={[4, 4, 0, 0]} />
                <Area
                  type="monotone"
                  dataKey="productivity_score"
                  name="Overall"
                  fill="hsl(var(--primary)/0.2)"
                  stroke="hsl(var(--primary))"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function processWeeklyData(data: any[]) {
  // Group data by week
  const weeks: Record<string, any[]> = {}

  data.forEach((day) => {
    const date = new Date(day.date)
    const weekStart = new Date(date)
    weekStart.setDate(date.getDate() - date.getDay()) // Start of week (Sunday)

    const weekKey = weekStart.toISOString().split("T")[0]

    if (!weeks[weekKey]) {
      weeks[weekKey] = []
    }

    weeks[weekKey].push(day)
  })

  // Calculate average score for each week
  return Object.entries(weeks)
    .map(([weekStart, days]) => {
      const avgScore = Math.round(days.reduce((sum, day) => sum + (day.productivity_score || 0), 0) / days.length)
      const weekDate = new Date(weekStart)

      return {
        name: `Week ${weekDate.getDate()}/${weekDate.getMonth() + 1}`,
        score: avgScore,
      }
    })
    .slice(-7) // Last 7 weeks
}

function processMonthlyData(data: any[]) {
  // Group data by month
  const months: Record<string, any[]> = {}

  data.forEach((day) => {
    const date = new Date(day.date)
    const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`

    if (!months[monthKey]) {
      months[monthKey] = []
    }

    months[monthKey].push(day)
  })

  // Calculate average score for each month
  return Object.entries(months).map(([monthKey, days]) => {
    const avgScore = Math.round(days.reduce((sum, day) => sum + (day.productivity_score || 0), 0) / days.length)
    const [year, month] = monthKey.split("-")

    return {
      name: new Date(Number.parseInt(year), Number.parseInt(month) - 1, 1).toLocaleDateString("en-US", {
        month: "short",
      }),
      score: avgScore,
    }
  })
}
