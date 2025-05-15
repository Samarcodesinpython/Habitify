"use client"

import type React from "react"
import type { Task } from "@/components/task-list"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TaskList } from "@/components/task-list"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Filter, Search, Plus } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { getClientSupabaseInstance } from "@/lib/supabase"
import { useAuth } from "@/components/auth-provider"
import { AddTaskDialog } from "@/components/add-task-dialog"

export default function TasksPage() {
  const [openFilter, setOpenFilter] = useState(false)
  const [tasks, setTasks] = useState<any[]>([])
  const [filteredTasks, setFilteredTasks] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [activeTab, setActiveTab] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()
  const supabase = getClientSupabaseInstance()

  useEffect(() => {
    if (user) {
      fetchTasks()
    }
  }, [user])

  useEffect(() => {
    filterTasks()
  }, [tasks, searchQuery, categoryFilter, activeTab])

  const fetchTasks = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

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

  const filterTasks = () => {
    let filtered = [...tasks]

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.description.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Filter by category
    if (categoryFilter !== "all") {
      filtered = filtered.filter((task) => task.category === categoryFilter)
    }

    // Filter by completion status
    if (activeTab === "active") {
      filtered = filtered.filter((task) => !task.completed)
    } else if (activeTab === "completed") {
      filtered = filtered.filter((task) => task.completed)
    }

    setFilteredTasks(filtered)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const handleCategoryFilterChange = (value: string) => {
    setCategoryFilter(value)
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value)
  }

  const handleTaskAdded = () => {
    fetchTasks()
  }

  const handleTaskToggle = async (id: string, completed: boolean) => {
    try {
      const { error } = await supabase.from("tasks").update({ completed }).eq("id", id)

      if (error) {
        console.error("Error updating task:", error)
        return
      }

      // Update local state
      setTasks(tasks.map((task) => (task.id === id ? { ...task, completed } : task)))

      // Update analytics
      updateAnalytics(completed)
    } catch (error) {
      console.error("Error updating task:", error)
    }
  }

  const updateAnalytics = async (completed: boolean) => {
    if (!user) return

    const today = new Date().toISOString().split("T")[0]

    try {
      // Check if we have an analytics record for today
      const { data, error } = await supabase
        .from("analytics")
        .select("*")
        .eq("user_id", user.id)
        .eq("date", today)
        .single()

      if (error && error.code !== "PGRST116") {
        // PGRST116 is "no rows returned"
        console.error("Error checking analytics:", error)
        return
      }

      if (data) {
        // Update existing record
        await supabase
          .from("analytics")
          .update({
            tasks_completed: completed ? data.tasks_completed + 1 : Math.max(0, data.tasks_completed - 1),
          })
          .eq("id", data.id)
      } else {
        // Create new record
        await supabase.from("analytics").insert({
          user_id: user.id,
          date: today,
          focus_time: 0,
          focus_sessions: 0,
          habits_completed: 0,
          habits_total: 0,
          tasks_completed: completed ? 1 : 0,
          tasks_total: tasks.length,
          productivity_score: 0,
        })
      }
    } catch (error) {
      console.error("Error updating analytics:", error)
    }
  }

  // Group tasks by category
  const groupedTasks = filteredTasks.reduce(
    (acc, task) => {
      const category = task.category || "other"
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push(task)
      return acc
    },
    {} as Record<string, any[]>,
  )

  const getCategoryName = (category: string) => {
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

  return (
    <div className="flex flex-col gap-6 pb-16 md:pb-0">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
        <p className="text-muted-foreground">Organize and focus on your tasks by algorithm category</p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            className="pl-9 rounded-xl"
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
        <div className="flex gap-2">
          <Collapsible open={openFilter} onOpenChange={setOpenFilter} className="w-full space-y-2 sm:w-auto">
            <div className="flex items-center justify-between space-x-4">
              <CollapsibleTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto rounded-xl gap-2">
                  <Filter className="h-4 w-4" />
                  Filter
                </Button>
              </CollapsibleTrigger>
            </div>
            <CollapsibleContent className="space-y-2">
              <div className="rounded-xl border p-4">
                <div className="space-y-2">
                  <Label htmlFor="category-filter">Category</Label>
                  <Select value={categoryFilter} onValueChange={handleCategoryFilterChange}>
                    <SelectTrigger id="category-filter" className="rounded-xl">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="greedy">Greedy Algorithms</SelectItem>
                      <SelectItem value="dp">Dynamic Programming</SelectItem>
                      <SelectItem value="graphs">Graphs</SelectItem>
                      <SelectItem value="recursion">Recursion</SelectItem>
                      <SelectItem value="sorting">Sorting & Searching</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          <AddTaskDialog onTaskAdded={handleTaskAdded}>
            <Button className="rounded-xl gap-2">
              <Plus className="h-4 w-4" />
              Add Task
            </Button>
          </AddTaskDialog>
        </div>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="mb-4 rounded-xl bg-muted p-1">
          <TabsTrigger value="all" className="rounded-lg">
            All
          </TabsTrigger>
          <TabsTrigger value="active" className="rounded-lg">
            Active
          </TabsTrigger>
          <TabsTrigger value="completed" className="rounded-lg">
            Completed
          </TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredTasks.length === 0 ? (
            <Card className="rounded-2xl border-border shadow-md">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="text-4xl mb-4">📝</div>
                <h3 className="text-xl font-medium mb-2">No tasks found</h3>
                <p className="text-muted-foreground text-center mb-4">
                  {searchQuery || categoryFilter !== "all"
                    ? "Try changing your search or filter criteria"
                    : "Add your first task to get started"}
                </p>
                <AddTaskDialog onTaskAdded={handleTaskAdded}>
                  <Button className="rounded-xl gap-2">
                    <Plus className="h-4 w-4" />
                    Add Task
                  </Button>
                </AddTaskDialog>
              </CardContent>
            </Card>
          ) : (
            Object.entries(groupedTasks).map(([category, tasks]) => (
              <Card key={category} className="rounded-2xl border-border shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle>{getCategoryName(category)}</CardTitle>
                  <CardDescription>Tasks related to {category} problems</CardDescription>
                </CardHeader>
                <CardContent>
                  <TaskList tasks={tasks as Task[]} onToggle={handleTaskToggle} />
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
        <TabsContent value="active" className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredTasks.length === 0 ? (
            <Card className="rounded-2xl border-border shadow-md">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="text-4xl mb-4">🎉</div>
                <h3 className="text-xl font-medium mb-2">No active tasks</h3>
                <p className="text-muted-foreground text-center mb-4">All your tasks are completed. Great job!</p>
                <AddTaskDialog onTaskAdded={handleTaskAdded}>
                  <Button className="rounded-xl gap-2">
                    <Plus className="h-4 w-4" />
                    Add Task
                  </Button>
                </AddTaskDialog>
              </CardContent>
            </Card>
          ) : (
            <Card className="rounded-2xl border-border shadow-md">
              <CardHeader className="pb-2">
                <CardTitle>Active Tasks</CardTitle>
                <CardDescription>Tasks you're currently working on</CardDescription>
              </CardHeader>
              <CardContent>
                <TaskList tasks={filteredTasks as Task[]} onToggle={handleTaskToggle} />
              </CardContent>
            </Card>
          )}
        </TabsContent>
        <TabsContent value="completed" className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredTasks.length === 0 ? (
            <Card className="rounded-2xl border-border shadow-md">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="text-4xl mb-4">📋</div>
                <h3 className="text-xl font-medium mb-2">No completed tasks</h3>
                <p className="text-muted-foreground text-center mb-4">Complete some tasks to see them here</p>
              </CardContent>
            </Card>
          ) : (
            <Card className="rounded-2xl border-border shadow-md">
              <CardHeader className="pb-2">
                <CardTitle>Completed Tasks</CardTitle>
                <CardDescription>Tasks you have completed</CardDescription>
              </CardHeader>
              <CardContent>
                <TaskList tasks={filteredTasks as Task[]} onToggle={handleTaskToggle} />
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
