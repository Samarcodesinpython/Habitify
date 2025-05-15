"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function AddPage() {
  const [selectedDays, setSelectedDays] = useState<string[]>([])

  const toggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter((d) => d !== day))
    } else {
      setSelectedDays([...selectedDays, day])
    }
  }

  const days = ["M", "T", "W", "T", "F", "S", "S"]

  return (
    <div className="mx-auto max-w-md pb-16 md:pb-0">
      <div className="mb-6 flex items-center">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="gap-1">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
        <h1 className="ml-2 text-2xl font-bold">Create New</h1>
      </div>

      <Tabs defaultValue="habit" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="habit">Habit</TabsTrigger>
          <TabsTrigger value="task">Task</TabsTrigger>
        </TabsList>

        <TabsContent value="habit">
          <Card>
            <CardHeader>
              <CardTitle>Create Habit</CardTitle>
              <CardDescription>Add a new habit to track regularly</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="habit-title">Title</Label>
                <Input id="habit-title" placeholder="e.g., Morning Meditation" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="habit-description">Description</Label>
                <Textarea id="habit-description" placeholder="Optional details about your habit" />
              </div>

              <div className="space-y-2">
                <Label>Color</Label>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="h-8 w-8 rounded-full bg-[hsl(var(--habit-blue))] p-0"
                    aria-label="Blue"
                  />
                  <Button
                    variant="outline"
                    className="h-8 w-8 rounded-full bg-[hsl(var(--habit-green))] p-0"
                    aria-label="Green"
                  />
                  <Button
                    variant="outline"
                    className="h-8 w-8 rounded-full bg-[hsl(var(--habit-orange))] p-0"
                    aria-label="Orange"
                  />
                  <Button
                    variant="outline"
                    className="h-8 w-8 rounded-full bg-[hsl(var(--habit-purple))] p-0"
                    aria-label="Purple"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="repeat">Repeat</Label>
                <Switch id="repeat" />
              </div>

              <div className="space-y-2">
                <Label>Frequency</Label>
                <RadioGroup defaultValue="daily" className="flex">
                  <div className="flex flex-1 items-center justify-center space-x-2 rounded-l-md border p-2">
                    <RadioGroupItem value="daily" id="daily" />
                    <Label htmlFor="daily">Daily</Label>
                  </div>
                  <div className="flex flex-1 items-center justify-center space-x-2 border-y border-r p-2">
                    <RadioGroupItem value="weekly" id="weekly" />
                    <Label htmlFor="weekly">Weekly</Label>
                  </div>
                  <div className="flex flex-1 items-center justify-center space-x-2 rounded-r-md border-y border-r p-2">
                    <RadioGroupItem value="monthly" id="monthly" />
                    <Label htmlFor="monthly">Monthly</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label>On these days</Label>
                <div className="flex justify-between">
                  {days.map((day) => (
                    <Button
                      key={day}
                      type="button"
                      variant={selectedDays.includes(day) ? "default" : "outline"}
                      className="h-10 w-10 rounded-full p-0"
                      onClick={() => toggleDay(day)}
                    >
                      {day}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="reminder">Reminder</Label>
                <Switch id="reminder" />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="goal">Goal</Label>
                <Switch id="goal" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="routine">Routine</Label>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Select a routine</span>
                  <Button variant="ghost" size="sm">
                    Select
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" asChild>
                <Link href="/dashboard/habits">Save</Link>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="task">
          <Card>
            <CardHeader>
              <CardTitle>Create Task</CardTitle>
              <CardDescription>Add a new task to your list</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="task-title">Task Name</Label>
                <Input id="task-title" placeholder="e.g., Complete project proposal" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="task-description">Description</Label>
                <Textarea id="task-description" placeholder="Optional details about your task" />
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <RadioGroup defaultValue="work" className="grid grid-cols-3 gap-2">
                  <div className="flex items-center space-x-2 rounded-md border p-2">
                    <RadioGroupItem value="work" id="work" />
                    <Label htmlFor="work">Work</Label>
                  </div>
                  <div className="flex items-center space-x-2 rounded-md border p-2">
                    <RadioGroupItem value="personal" id="personal" />
                    <Label htmlFor="personal">Personal</Label>
                  </div>
                  <div className="flex items-center space-x-2 rounded-md border p-2">
                    <RadioGroupItem value="other" id="other" />
                    <Label htmlFor="other">Other</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label>Priority</Label>
                <RadioGroup defaultValue="medium" className="grid grid-cols-3 gap-2">
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

              <div className="space-y-2">
                <Label>Time Estimate</Label>
                <RadioGroup defaultValue="15" className="grid grid-cols-4 gap-2">
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

              <div className="space-y-2">
                <Label>Energy Level</Label>
                <RadioGroup defaultValue="medium" className="grid grid-cols-3 gap-2">
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

              <div className="space-y-2">
                <Label htmlFor="due-date">Due Date</Label>
                <Input id="due-date" type="date" />
              </div>

              <div className="space-y-2">
                <Label>Repeat</Label>
                <RadioGroup defaultValue="once" className="grid grid-cols-3 gap-2">
                  <div className="flex items-center space-x-2 rounded-md border p-2">
                    <RadioGroupItem value="once" id="once" />
                    <Label htmlFor="once">Once</Label>
                  </div>
                  <div className="flex items-center space-x-2 rounded-md border p-2">
                    <RadioGroupItem value="daily" id="task-daily" />
                    <Label htmlFor="task-daily">Daily</Label>
                  </div>
                  <div className="flex items-center space-x-2 rounded-md border p-2">
                    <RadioGroupItem value="weekly" id="task-weekly" />
                    <Label htmlFor="task-weekly">Weekly</Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" asChild>
                <Link href="/dashboard/habits">Save</Link>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
