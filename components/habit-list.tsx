"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Check, AlarmClockIcon as Alarm, Sun, Droplet, Phone, Dumbbell, SpaceIcon as Yoga } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { updateHabit, deleteHabit, markHabitComplete, unmarkHabitComplete, getHabitCompletions } from "@/lib/habitsApi"

export type Habit = {
  id: string
  title: string
  icon: React.ReactNode
  completed: boolean
  color: "violet" | "mint" | "peach" | "rose"
  days?: { [key: string]: boolean }
  frequency?: string
  completionDates?: string[]
}

interface HabitListProps {
  habits: Habit[]
  setHabits: React.Dispatch<React.SetStateAction<Habit[]>>
}

function mapDbHabitToUiHabit(dbHabit: any): Habit {
  return {
    id: dbHabit.id,
    title: dbHabit.name,
    icon: <span role="img" aria-label="Habit">🏷️</span>,
    completed: dbHabit.completed ?? false,
    color: (dbHabit.color as Habit["color"]) || "violet",
    days: dbHabit.days,
    frequency: dbHabit.frequency,
    completionDates: dbHabit.completionDates,
  }
}

export function HabitList({ habits = [], setHabits }: HabitListProps) {
  const { user } = useAuth();
  // For touch/swipe functionality
  const [swipingId, setSwipingId] = useState<string | null>(null)
  const touchStartX = useRef<number | null>(null)
  const touchEndX = useRef<number | null>(null)
  const minSwipeDistance = 50

  // On mount or when habits change, fetch completions for today
  useEffect(() => {
    if (!user || habits.length === 0) return;
    const today = new Date().toISOString().slice(0, 10);
    Promise.all(habits.map(async (habit) => {
      const completions = await getHabitCompletions(habit.id);
      return { ...habit, completed: completions.includes(today) };
    })).then(setHabits);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, habits.length]);

  const toggleHabit = async (id: string) => {
    if (!user) return;
    const today = new Date().toISOString().slice(0, 10);
    const habit = habits.find(h => h.id === id);
    if (!habit) return;
    if (habit.completed) {
      await unmarkHabitComplete(id, today);
    } else {
      await markHabitComplete(id, today);
    }
    setHabits(habits.map(h => h.id === id ? { ...h, completed: !h.completed } : h));
  }

  const skipHabit = async (id: string) => {
    if (!user) return;
    await deleteHabit(id);
    setHabits(habits.filter((habit) => habit.id !== id));
  }

  const onTouchStart = (e: React.TouchEvent, id: string) => {
    touchStartX.current = e.targetTouches[0].clientX
  }

  const onTouchMove = (e: React.TouchEvent, id: string) => {
    touchEndX.current = e.targetTouches[0].clientX

    if (touchStartX.current && touchEndX.current) {
      const distance = touchStartX.current - touchEndX.current

      if (distance > minSwipeDistance) {
        setSwipingId(id)
      } else {
        setSwipingId(null)
      }
    }
  }

  const onTouchEnd = (e: React.TouchEvent, id: string) => {
    if (!touchStartX.current || !touchEndX.current) return

    const distance = touchStartX.current - touchEndX.current

    if (distance > minSwipeDistance * 2) {
      // Complete the habit if swiped far enough
      toggleHabit(id)
    }

    // Reset
    touchStartX.current = null
    touchEndX.current = null
    setSwipingId(null)
  }

  // Complete all habits
  const completeAllHabits = async () => {
    if (!user) return;
    const today = new Date().toISOString().slice(0, 10);
    await Promise.all(habits.map(habit => markHabitComplete(habit.id, today)));
    setHabits(habits.map(habit => ({ ...habit, completed: true })));
  }

  // Skip all habits
  const skipAllHabits = async () => {
    if (!user) return;
    const today = new Date().toISOString().slice(0, 10);
    await Promise.all(habits.map(habit => unmarkHabitComplete(habit.id, today)));
    setHabits(habits.map(habit => ({ ...habit, completed: false })));
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2 mb-2">
        <Button size="sm" className="rounded-xl" onClick={completeAllHabits}>Complete All Habits</Button>
        <Button size="sm" variant="outline" className="rounded-xl" onClick={skipAllHabits}>Skip All</Button>
      </div>
      {habits.map((habit) => (
        <div
          key={habit.id}
          className={`habit-item-sm habit-item ${habit.completed ? "completed" : ""} ${swipingId === habit.id ? "swiping" : ""}`}
          onTouchStart={(e) => onTouchStart(e, habit.id)}
          onTouchMove={(e) => onTouchMove(e, habit.id)}
          onTouchEnd={(e) => onTouchEnd(e, habit.id)}
        >
          <div className={`habit-card habit-card-sm ${habit.completed ? "habit-card-mint" : `habit-card-${habit.color}`} group`}>
            {habit.completed ? (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-mint text-white animate-checkmark">
                <Check className="h-5 w-5" />
              </div>
            ) : (
              <div className="flex h-8 w-8 items-center justify-center">{habit.icon}</div>
            )}
            <span className="ml-3 flex-1 font-medium text-sm">{habit.title}</span>
            <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
              <Button variant="ghost" size="sm" className="h-8 w-8 rounded-full p-0" onClick={() => toggleHabit(habit.id)}>
                <Check className="h-4 w-4" />
                <span className="sr-only">Complete</span>
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 rounded-full p-0" onClick={() => skipHabit(habit.id)}>
                <span className="sr-only">Skip</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 rounded-full p-0" onClick={() => {/* edit handler */}}>
                <span role="img" aria-label="Edit">✏️</span>
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 rounded-full p-0" onClick={() => setHabits(habits.filter(h => h.id !== habit.id))}>
                <span role="img" aria-label="Delete">🗑️</span>
              </Button>
            </div>
          </div>
          <div className="swipe-action">
            <Check className="h-5 w-5" />
          </div>
        </div>
      ))}
    </div>
  )
}
