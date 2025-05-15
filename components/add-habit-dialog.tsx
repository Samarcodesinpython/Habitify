"use client"

import type React from "react"

import { useState } from "react"
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
import { Switch } from "@/components/ui/switch"
import { Dumbbell, BookOpen, Coffee, Brain, Heart, Droplet } from "lucide-react"

export function AddHabitDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [selectedDays, setSelectedDays] = useState<string[]>(["mon", "tue", "wed", "thu", "fri"])

  const toggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter((d) => d !== day))
    } else {
      setSelectedDays([...selectedDays, day])
    }
  }

  const days = [
    { key: "mon", label: "M" },
    { key: "tue", label: "T" },
    { key: "wed", label: "W" },
    { key: "thu", label: "T" },
    { key: "fri", label: "F" },
    { key: "sat", label: "S" },
    { key: "sun", label: "S" },
  ]

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-2xl">
        <DialogHeader>
          <DialogTitle>Add New Habit</DialogTitle>
          <DialogDescription>Create a new habit to track. Click save when you're done.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Habit Name</Label>
            <Input id="title" placeholder="e.g., Morning Meditation" className="rounded-xl" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="icon">Icon</Label>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="rounded-full h-10 w-10 bg-primary/10 border-primary/20"
              >
                <Dumbbell className="h-5 w-5" />
                <span className="sr-only">Exercise</span>
              </Button>
              <Button type="button" variant="outline" size="icon" className="rounded-full h-10 w-10">
                <BookOpen className="h-5 w-5" />
                <span className="sr-only">Reading</span>
              </Button>
              <Button type="button" variant="outline" size="icon" className="rounded-full h-10 w-10">
                <Coffee className="h-5 w-5" />
                <span className="sr-only">Coffee</span>
              </Button>
              <Button type="button" variant="outline" size="icon" className="rounded-full h-10 w-10">
                <Brain className="h-5 w-5" />
                <span className="sr-only">Learning</span>
              </Button>
              <Button type="button" variant="outline" size="icon" className="rounded-full h-10 w-10">
                <Heart className="h-5 w-5" />
                <span className="sr-only">Health</span>
              </Button>
              <Button type="button" variant="outline" size="icon" className="rounded-full h-10 w-10">
                <Droplet className="h-5 w-5" />
                <span className="sr-only">Water</span>
              </Button>
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="frequency">Frequency</Label>
            <Select defaultValue="daily">
              <SelectTrigger id="frequency" className="rounded-xl">
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Days of the week</Label>
            <div className="flex justify-between">
              {days.map((day) => (
                <Button
                  key={day.key}
                  type="button"
                  variant={selectedDays.includes(day.key) ? "default" : "outline"}
                  className={`h-10 w-10 rounded-full p-0 ${
                    selectedDays.includes(day.key) ? "bg-primary text-primary-foreground" : ""
                  }`}
                  onClick={() => toggleDay(day.key)}
                >
                  {day.label}
                </Button>
              ))}
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea id="notes" placeholder="Add any additional notes here" className="rounded-xl" />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="reminder" className="text-base">
              Set Reminder
            </Label>
            <Switch id="reminder" />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="submit"
            onClick={() => setOpen(false)}
            className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Save Habit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
