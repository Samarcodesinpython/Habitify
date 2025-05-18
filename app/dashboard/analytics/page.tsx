"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { HabitAnalytics } from "@/components/habit-analytics"
import { TaskAnalytics } from "@/components/task-analytics"
import { OverallAnalytics } from "@/components/overall-analytics"
import { getClientSupabaseInstance } from "@/lib/supabase"
import { useAuth } from "@/components/auth-provider"

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()
  const supabase = getClientSupabaseInstance()

  useEffect(() => {
    if (user) {
      fetchAnalyticsData()
    }
  }, [user])

  const fetchAnalyticsData = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      // Get the last 30 days of analytics data
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const { data, error } = await supabase
        .from("analytics")
        .select("*")
        .eq("user_id", user.id)
        .gte("date", thirtyDaysAgo.toISOString().split("T")[0])
        .order("date", { ascending: true })

      if (error) {
        console.error("Error fetching analytics data:", JSON.stringify(error))
        return
      }

      setAnalyticsData(data || [])
    } catch (error) {
      console.error("Error fetching analytics data:", JSON.stringify(error))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-4 pb-16 md:pb-0">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">Track your progress and analyze your productivity</p>
      </div>

      <Tabs defaultValue="overall" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="overall">Overall</TabsTrigger>
          <TabsTrigger value="habits">Habits</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="focus">Focus Time</TabsTrigger>
        </TabsList>
        <TabsContent value="overall" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Overall Performance</CardTitle>
              <CardDescription>Your productivity score and trends</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <OverallAnalytics data={analyticsData} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="habits" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Habit Performance</CardTitle>
              <CardDescription>Your habit completion rates and streaks</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <HabitAnalytics data={analyticsData} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Task Performance</CardTitle>
              <CardDescription>Your task completion rates and trends</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <TaskAnalytics data={analyticsData} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="focus" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Focus Time</CardTitle>
              <CardDescription>Your focus session statistics</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-3">
                    <Card className="rounded-xl border-border shadow-md">
                      <CardContent className="pt-6">
                        <div className="text-lg font-medium mb-2">Total Focus Time</div>
                        <div className="text-2xl font-bold">
                          {formatFocusTime(analyticsData.reduce((sum, day) => sum + (day.focus_time || 0), 0))}
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">Last 30 days</div>
                      </CardContent>
                    </Card>

                    <Card className="rounded-xl border-border shadow-md">
                      <CardContent className="pt-6">
                        <div className="text-lg font-medium mb-2">Sessions</div>
                        <div className="text-2xl font-bold">
                          {analyticsData.reduce((sum, day) => sum + (day.focus_sessions || 0), 0)}
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">Last 30 days</div>
                      </CardContent>
                    </Card>

                    <Card className="rounded-xl border-border shadow-md">
                      <CardContent className="pt-6">
                        <div className="text-lg font-medium mb-2">Average Session</div>
                        <div className="text-2xl font-bold">{calculateAverageSessionTime(analyticsData)}</div>
                        <div className="mt-1 text-xs text-muted-foreground">Last 30 days</div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card className="rounded-xl border-border shadow-md">
                    <CardContent className="pt-6">
                      <div className="text-lg font-medium mb-4">Daily Focus Time</div>
                      <div className="h-[300px] w-full">
                        <FocusTimeChart data={analyticsData} />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function formatFocusTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }

  return `${minutes}m`
}

function calculateAverageSessionTime(data: any[]): string {
  const totalSessions = data.reduce((sum, day) => sum + (day.focus_sessions || 0), 0)
  const totalTime = data.reduce((sum, day) => sum + (day.focus_time || 0), 0)

  if (totalSessions === 0) return "0m"

  const averageSeconds = totalTime / totalSessions
  const minutes = Math.floor(averageSeconds / 60)

  return `${minutes}m`
}

function FocusTimeChart({ data }: { data: any[] }) {
  // Process data for the chart
  const chartData = data.slice(-7).map((day) => ({
    name: new Date(day.date).toLocaleDateString("en-US", { weekday: "short" }),
    time: Math.floor((day.focus_time || 0) / 60), // Convert seconds to minutes
  }))

  return (
    <div className="h-full w-full flex items-end justify-between gap-4">
      {chartData.map((day, index) => (
        <div key={day.name} className="flex flex-col items-center flex-1">
          <div
            className="w-full bg-primary rounded-t-lg"
            style={{
              height: `${Math.max(10, (day.time / 120) * 250)}px`,
            }}
          ></div>
          <div className="mt-2 text-sm">{day.name}</div>
          <div className="text-xs text-muted-foreground">{day.time}m</div>
        </div>
      ))}
    </div>
  )
}
