"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { getClientSupabaseInstance } from "@/lib/supabase"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import type { PostgrestError } from '@supabase/supabase-js'

interface AddTaskDialogProps {
  children: React.ReactNode
  onTaskAdded?: () => void
}

type Task = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  time_estimate: number;
  energy_level: string;
  due_date: string | null;
  completed: boolean;
  created_at: string;
};

export function AddTaskDialog({ children, onTaskAdded }: AddTaskDialogProps) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("other")
  const [priority, setPriority] = useState("medium")
  const [timeEstimate, setTimeEstimate] = useState("30")
  const [energyLevel, setEnergyLevel] = useState("medium")
  const [dueDate, setDueDate] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [tasks, setTasks] = useState<Task[]>([])
  const [fetchError, setFetchError] = useState<PostgrestError | null>(null)

  const { user } = useAuth()
  const supabase = getClientSupabaseInstance()
  const { toast } = useToast()

  useEffect(() => {
    if (!user) return
    const fetchTasks = async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      if (error) setFetchError(error)
      else setTasks(data)
    }
    fetchTasks()
  }, [user])

  const handleSubmit = async () => {
    if (!title || !user) return

    setIsSubmitting(true)

    try {
      const { error } = await supabase.from("tasks").insert({
        user_id: user.id,
        title,
        description,
        category,
        priority,
        time_estimate: Number.parseInt(timeEstimate),
        energy_level: energyLevel,
        due_date: dueDate || null,
        completed: false,
      })

      if (error) {
        console.error("Error adding task:", error.message || error)
        toast({
          title: "Error",
          description: "Failed to add task. Please try again.",
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Success",
        description: "Task added successfully.",
      })

      // Reset form
      setTitle("")
      setDescription("")
      setCategory("other")
      setPriority("medium")
      setTimeEstimate("30")
      setEnergyLevel("medium")
      setDueDate("")

      // Close dialog
      setOpen(false)

      // Update analytics
      updateAnalytics()

      // Call onTaskAdded callback if provided
      if (onTaskAdded) {
        onTaskAdded()
      }
    } catch (error) {
      console.error("Error adding task:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const updateAnalytics = async () => {
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
            tasks_total: data.tasks_total + 1,
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
          tasks_completed: 0,
          tasks_total: 1,
          productivity_score: 0,
        })
      }
    } catch (error) {
      console.error("Error updating analytics:", error)
    }
  }

  if (!user) return;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-2xl">
        <DialogHeader>
          <DialogTitle>Add New Task</DialogTitle>
          <DialogDescription>Create a new task to focus on. Click save when you're done.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Task title"
              className="rounded-xl"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="category" className="rounded-xl">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="study">Study</SelectItem>
                <SelectItem value="wellness">Wellness</SelectItem>
                <SelectItem value="sports">Sports</SelectItem>
                <SelectItem value="fitness">Fitness</SelectItem>
                <SelectItem value="work">Work</SelectItem>
                <SelectItem value="personal">Personal</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="notes">Description</Label>
            <Textarea
              id="notes"
              placeholder="Add any additional notes here"
              className="rounded-xl"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label>Priority</Label>
            <RadioGroup
              defaultValue="medium"
              value={priority}
              onValueChange={setPriority}
              className="grid grid-cols-3 gap-2"
            >
              <div className="flex items-center space-x-2 rounded-md border p-2">
                <RadioGroupItem value="low" id="low" />
                <Label htmlFor="low">Low</Label>
              </div>
              <div className="flex items-center space-x-2 rounded-md border p-2">
                <RadioGroupItem value="medium" id="medium" />
                <Label htmlFor="medium">Medium</Label>
              </div>
              <div className="flex items-center space-x-2 rounded-md border p-2">
                <RadioGroupItem value="high" id="high" />
                <Label htmlFor="high">High</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="grid gap-2">
            <Label>Time Estimate</Label>
            <RadioGroup
              defaultValue="30"
              value={timeEstimate}
              onValueChange={setTimeEstimate}
              className="grid grid-cols-4 gap-2"
            >
              <div className="flex items-center space-x-2 rounded-md border p-2">
                <RadioGroupItem value="15" id="15min" />
                <Label htmlFor="15min">15m</Label>
              </div>
              <div className="flex items-center space-x-2 rounded-md border p-2">
                <RadioGroupItem value="30" id="30min" />
                <Label htmlFor="30min">30m</Label>
              </div>
              <div className="flex items-center space-x-2 rounded-md border p-2">
                <RadioGroupItem value="60" id="60min" />
                <Label htmlFor="60min">1h</Label>
              </div>
              <div className="flex items-center space-x-2 rounded-md border p-2">
                <RadioGroupItem value="120" id="120min" />
                <Label htmlFor="120min">2h+</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="grid gap-2">
            <Label>Energy Level</Label>
            <RadioGroup
              defaultValue="medium"
              value={energyLevel}
              onValueChange={setEnergyLevel}
              className="grid grid-cols-3 gap-2"
            >
              <div className="flex items-center space-x-2 rounded-md border p-2">
                <RadioGroupItem value="low" id="energy-low" />
                <Label htmlFor="energy-low">Low</Label>
              </div>
              <div className="flex items-center space-x-2 rounded-md border p-2">
                <RadioGroupItem value="medium" id="energy-medium" />
                <Label htmlFor="energy-medium">Medium</Label>
              </div>
              <div className="flex items-center space-x-2 rounded-md border p-2">
                <RadioGroupItem value="high" id="energy-high" />
                <Label htmlFor="energy-high">High</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="due-date">Due Date (Optional)</Label>
            <Input
              id="due-date"
              type="date"
              className="rounded-xl"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="submit"
            onClick={handleSubmit}
            className="rounded-xl bg-pastel-peach text-primary-foreground hover:bg-pastel-peach/90"
            disabled={isSubmitting || !title}
          >
            {isSubmitting ? "Saving..." : "Save Task"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
