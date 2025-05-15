"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts"
import { useEffect, useState } from "react"
import { getClientSupabaseInstance } from "@/lib/supabase"
import { useAuth } from "@/components/auth-provider"

const COLORS = ["hsl(var(--pastel-green))", "hsl(var(--pastel-blue))", "hsl(var(--pastel-pink))"]
const CATEGORY_COLORS = [
  "hsl(var(--pastel-peach))",
  "hsl(var(--pastel-purple))",
  "hsl(var(--pastel-blue))",
  "hsl(var(--pastel-green))",
  "hsl(var(--pastel-pink))",
  "hsl(var(--pastel-yellow))",
]

export function TaskAnalytics({ data }: { data: any[] }) {
  const [tasks, setTasks] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()
  const supabase = getClientSupabaseInstance()

  useEffect(() => {
    if (user) {
      fetchTasks()
    }
  }, [user])

  const fetchTasks = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      const { data, error } = await supabase.from("tasks").select("*").eq("user_id", user.id)

      if (error) {
        console.error("Error fetching tasks:", error)
        return
      }

      setTasks(data || [])
    } catch (error) {
      console.error("Error fetching tasks:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Calculate completion rate
  const completedTasks = tasks.filter((task) => task.completed).length
  const totalTasks = tasks.length
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  // Prepare status data for pie chart
  const statusData = [
    { name: "Completed", value: completedTasks },
    { name: "In Progress", value: totalTasks - completedTasks },
  ]

  // Prepare category data for pie chart
  const categoryData = tasks.reduce((acc: any[], task) => {
    const category = task.category || "other"
    const existingCategory = acc.find((item) => item.name === getCategoryName(category))

    if (existingCategory) {
      existingCategory.value++
    } else {
      acc.push({ name: getCategoryName(category), value: 1 })
    }

    return acc
  }, [])

  // Prepare weekly completion data
  const weeklyCompletionData = data.slice(-7).map((day) => {
    const date = new Date(day.date)
    return {
      name: date.toLocaleDateString("en-US", { weekday: "short" }),
      completed: day.tasks_completed || 0,
      total: day.tasks_total || 0,
    }
  })

  // Prepare priority data
  const priorityData = tasks.reduce((acc: any[], task) => {
    const priority = task.priority || "medium"
    const existingPriority = acc.find((item) => item.name === priority)

    if (existingPriority) {
      existingPriority.value++
    } else {
      acc.push({ name: priority, value: 1 })
    }

    return acc
  }, [])

  const PRIORITY_COLORS = {
    high: "hsl(var(--destructive))",
    medium: "hsl(var(--warning))",
    low: "hsl(var(--success))",
  }

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
                  {completedTasks} of {totalTasks} tasks completed
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl border-border shadow-md">
              <CardContent className="pt-6">
                <div className="text-lg font-medium mb-2">Tasks by Priority</div>
                <div className="h-[150px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={priorityData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={60}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {priorityData.map((entry) => (
                          <Cell
                            key={`cell-${entry.name}`}
                            fill={PRIORITY_COLORS[entry.name as keyof typeof PRIORITY_COLORS] || "#8884d8"}
                          />
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
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="rounded-xl border-border shadow-md">
              <CardContent className="pt-6">
                <div className="text-lg font-medium mb-4">Task Status</div>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {statusData.map((entry, index) => (
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
                <div className="text-lg font-medium mb-4">Tasks by Category</div>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
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
          </div>

          <Card className="rounded-xl border-border shadow-md">
            <CardContent className="pt-6">
              <div className="text-lg font-medium mb-4">Weekly Completion</div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyCompletionData}>
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
                    <Legend />
                    <Bar dataKey="completed" name="Completed" fill="hsl(var(--pastel-green))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="total" name="Total" fill="hsl(var(--muted))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border-border shadow-md">
            <CardContent className="pt-6">
              <div className="text-lg font-medium mb-4">Task Completion Trend</div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.slice(-14)}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="date"
                      stroke="hsl(var(--muted-foreground))"
                      tickFormatter={(value) =>
                        new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                      }
                    />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      labelFormatter={(value) =>
                        new Date(value).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
                      }
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        borderColor: "hsl(var(--border))",
                        borderRadius: "0.75rem",
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="tasks_completed"
                      name="Tasks Completed"
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
        </>
      )}
    </div>
  )
}

function getCategoryName(category: string) {
  switch (category) {
    case "greedy":
      return "Greedy Algorithms"
    case "dp":
      return "Dynamic Programming"
    case "graphs":
      return "Graphs"
    case "recursion":
      return "Recursion"
    case "sorting":
      return "Sorting & Searching"
    default:
      return "Other"
  }
}
