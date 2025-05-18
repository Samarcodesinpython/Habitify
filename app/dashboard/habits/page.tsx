"use client"
import { useEffect, useState } from "react"
import type { Habit as HabitComponentType } from "@/components/habit-list"
import { AddHabitDialog } from "@/components/add-habit-dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { HabitList } from "@/components/habit-list"
import { HabitWeeklyView } from "@/components/habit-weekly-view"
import { HabitOverallView } from "@/components/habit-overall-view"
import { useAuth } from "@/components/auth-provider"
import { fetchHabits, addHabit, updateHabit, deleteHabit } from "@/lib/habitsApi"

export default function HabitsPage() {
  const { user, isLoading } = useAuth()
  const [habits, setHabits] = useState<HabitComponentType[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      setLoading(true)
      fetchHabits(user.id)
        .then((data) => setHabits(data.map(mapDbHabitToUiHabit)))
        .finally(() => setLoading(false))
    }
  }, [user])

  async function handleAddHabit() {
    if (!user) return
    const newHabit = await addHabit(user.id, { name: "New Habit" })
    setHabits((prev) => [mapDbHabitToUiHabit(newHabit), ...prev])
  }

  async function handleUpdateHabit(habitId: string, updates: Partial<HabitComponentType>) {
    const updated = await updateHabit(habitId, updates)
    setHabits((prev) => prev.map(h => h.id === habitId ? mapDbHabitToUiHabit(updated) : h))
  }

  async function handleDeleteHabit(habitId: string) {
    await deleteHabit(habitId)
    setHabits((prev) => prev.filter(h => h.id !== habitId))
  }

  function mapDbHabitToUiHabit(dbHabit: any): HabitComponentType {
    return {
      id: dbHabit.id,
      title: dbHabit.name,
      icon: <span role="img" aria-label="Habit">🏷️</span>, // or pick based on dbHabit.color/type
      completed: false, // or derive from your logic
      color: (dbHabit.color as HabitComponentType["color"]) || "violet",
      days: dbHabit.days,
      frequency: dbHabit.frequency,
      completionDates: dbHabit.completionDates,
    };
  }

  if (isLoading || loading) return <div>Loading...</div>

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
