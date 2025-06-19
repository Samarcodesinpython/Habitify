"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Clock, ArrowRight, Trash2 } from "lucide-react"
import Link from "next/link"
import { getClientSupabaseInstance } from "@/lib/supabase"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { getEfficientSelection } from "@/lib/api"

export type Task = {
  id: string
  title: string
  description: string
  category: "greedy" | "dp" | "graphs" | "recursion" | "sorting" | "other"
  completed: boolean
  priority: string
  due_date?: string
}

interface TaskListProps {
  tasks: Task[]
  limit?: number
  onToggle?: (id: string, completed: boolean) => void
}

type AnalysisResult = { task: string; status: string; [key: string]: any };

export function TaskList({ tasks, limit, onToggle }: TaskListProps) {
  const [localTasks, setLocalTasks] = useState<Task[]>(tasks)
  const { user } = useAuth()
  const supabase = getClientSupabaseInstance()
  const { toast } = useToast()
  const [analysis, setAnalysis] = useState<AnalysisResult[]>([])

  useEffect(() => {
    if (!user) return;
    getEfficientSelection(user.id).then(data => setAnalysis(data.analysis));
  }, [tasks, user]);

  const toggleTask = async (id: string) => {
    const task = localTasks.find((t) => t.id === id)
    if (!task) return

    const newCompleted = !task.completed

    // Update local state first for immediate feedback
    setLocalTasks(localTasks.map((task) => (task.id === id ? { ...task, completed: newCompleted } : task)))

    // Call the parent component's onToggle if provided
    if (onToggle) {
      onToggle(id, newCompleted)
    } else {
      // Otherwise handle the update directly
      try {
        const { error } = await supabase.from("tasks").update({ completed: newCompleted }).eq("id", id)

        if (error) {
          console.error("Error updating task:", error)
          // Revert the local state if there was an error
          setLocalTasks(localTasks.map((task) => (task.id === id ? { ...task, completed: !newCompleted } : task)))
          toast({
            title: "Error",
            description: "Failed to update task. Please try again.",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error updating task:", error)
      }
    }
  }

  const deleteTask = async (id: string) => {
    if (!user) return

    try {
      const { error } = await supabase.from("tasks").delete().eq("id", id)

      if (error) {
        console.error("Error deleting task:", error)
        toast({
          title: "Error",
          description: "Failed to delete task. Please try again.",
          variant: "destructive",
        })
        return
      }

      // Update local state
      setLocalTasks(localTasks.filter((task) => task.id !== id))

      toast({
        title: "Success",
        description: "Task deleted successfully.",
      })
    } catch (error) {
      console.error("Error deleting task:", error)
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "greedy":
        return "bg-pastel-peach/30 hover:bg-pastel-peach/40"
      case "dp":
        return "bg-pastel-purple/30 hover:bg-pastel-purple/40"
      case "graphs":
        return "bg-pastel-blue/30 hover:bg-pastel-blue/40"
      case "recursion":
        return "bg-pastel-green/30 hover:bg-pastel-green/40"
      case "sorting":
        return "bg-pastel-pink/30 hover:bg-pastel-pink/40"
      default:
        return "bg-pastel-yellow/30 hover:bg-pastel-yellow/40"
    }
  }

  const getCategoryName = (category: string) => {
    switch (category) {
      case "greedy":
        return "Greedy"
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  const getStatus = (taskName: string) => {
    const found = analysis.find(a => a.task === taskName)
    return found ? found.status : ""
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "feasible":
        return "bg-green-100 text-green-800 border-green-300";
      case "impossible":
        return "bg-red-100 text-red-800 border-red-300";
      case "skip":
        return "bg-gray-100 text-gray-800 border-gray-300";
      case "reschedule":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      default:
        return "bg-blue-100 text-blue-800 border-blue-300";
    }
  };

  const displayTasks = limit ? localTasks.slice(0, limit) : localTasks

  return (
    <div className="space-y-3">
      {displayTasks.length === 0 ? (
        <div className="text-center py-4 text-muted-foreground">No tasks to display</div>
      ) : (
        displayTasks.map((task) => (
          <div
            key={task.id}
            className={`relative rounded-xl border p-4 transition-all duration-300 hover:shadow-md ${
              task.completed ? "bg-muted/50" : `category-card-${task.category}`
            }`}
          >
            <div className="flex items-start gap-3">
              <Checkbox checked={task.completed} onCheckedChange={() => toggleTask(task.id)} className="mt-1" />

              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className={`font-medium ${task.completed ? "line-through text-muted-foreground" : ""}`}>
                    {task.title}
                  </h3>
                  <Badge className={`${getCategoryColor(task.category)}`}>{getCategoryName(task.category)}</Badge>
                  {task.priority && (
                    <Badge variant="outline" className={`${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </Badge>
                  )}
                  {getStatus(task.title) && (
                    <Badge variant="outline" className={`ml-1 ${getStatusColor(getStatus(task.title))}`}>
                      {getStatus(task.title)}
                    </Badge>
                  )}
                </div>

                <p className="text-sm text-muted-foreground">{task.description}</p>

                {task.due_date && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    Due: {new Date(task.due_date).toLocaleDateString()}
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="rounded-xl gap-1">
                      <Clock className="h-3 w-3" />
                      Start Timer
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl text-destructive hover:text-destructive"
                      onClick={() => deleteTask(task.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                  <Link href="/dashboard/focus">
                    <Button
                      size="sm"
                      className="rounded-xl bg-pastel-peach text-primary-foreground hover:bg-pastel-peach/90 gap-1"
                    >
                      Focus <ArrowRight className="h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
