"use client"
import { useState } from "react"
import type { Habit } from "@/components/habit-list"
import { AddHabitDialog } from "@/components/add-habit-dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { HabitList } from "@/components/habit-list"
import { HabitWeeklyView } from "@/components/habit-weekly-view"
import { HabitOverallView } from "@/components/habit-overall-view"

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([])
  return (
    <div className="flex flex-col gap-4 pb-16 md:pb-0">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Habits</h1>
        <p className="text-muted-foreground">Track and manage your daily habits</p>
      </div>

      <Tabs defaultValue="today" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
          <TabsTrigger value="overall">Overall</TabsTrigger>
        </TabsList>
        <TabsContent value="today" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Today&apos;s Habits</CardTitle>
              <CardDescription>You have {habits.length} habits scheduled for today</CardDescription>
            </CardHeader>
            <CardContent>
              <HabitList habits={habits} setHabits={setHabits} />
              <AddHabitDialog setHabits={setHabits} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="weekly" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Weekly Progress</CardTitle>
              <CardDescription>Track your habits throughout the week</CardDescription>
            </CardHeader>
            <CardContent>
              <HabitWeeklyView habits={habits} setHabits={setHabits} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="overall" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Overall Progress</CardTitle>
              <CardDescription>View your long-term habit progress</CardDescription>
            </CardHeader>
            <CardContent>
              <HabitOverallView habits={habits} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
