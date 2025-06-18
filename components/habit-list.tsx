"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Check, AlarmClockIcon as Alarm, Sun, Droplet, Phone, Dumbbell, SpaceIcon as Yoga, BookOpen, Coffee, Brain, Heart } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { updateHabit, deleteHabit, markHabitComplete, unmarkHabitComplete, getHabitCompletions } from "@/lib/habitsApi"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

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

const completedBg: Record<string, string> = {
  violet: "bg-blue-100",
  mint: "bg-blue-100",
  peach: "bg-blue-100",
  rose: "bg-blue-100",
};
const completedText: Record<string, string> = {
  violet: "text-blue-900",
  mint: "text-blue-900",
  peach: "text-blue-900",
  rose: "text-blue-900",
};

function mapDbHabitToUiHabit(dbHabit: any): Habit {
  let icon: React.ReactNode = null;
  switch (dbHabit.icon) {
    case "dumbbell":
      icon = <Dumbbell className="h-5 w-5" />;
      break;
    case "book":
      icon = <BookOpen className="h-5 w-5" />;
      break;
    case "coffee":
      icon = <Coffee className="h-5 w-5" />;
      break;
    case "brain":
      icon = <Brain className="h-5 w-5" />;
      break;
    case "heart":
      icon = <Heart className="h-5 w-5" />;
      break;
    case "droplet":
      icon = <Droplet className="h-5 w-5" />;
      break;
    default:
      icon = <Dumbbell className="h-5 w-5" />;
  }
  return {
    id: dbHabit.id,
    title: dbHabit.name,
    icon,
    completed: dbHabit.completed ?? false,
    color: (dbHabit.color as Habit["color"]) || "violet",
    days: dbHabit.days,
    frequency: dbHabit.frequency,
    completionDates: dbHabit.completionDates,
  };
}

export function HabitList({ habits = [], setHabits }: HabitListProps) {
  const { user } = useAuth();

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
          className={`habit-item-sm habit-item ${habit.completed ? "completed" : ""}`}
        >
          <div
            className={`habit-card habit-card-sm group transition-colors duration-200 ${
              habit.completed
                ? `${completedBg[habit.color]} ${completedText[habit.color]}`
                : `habit-card-${habit.color} bg-white text-black`
            }`}
          >
            <div className="flex h-8 w-8 items-center justify-center">{habit.icon}</div>
            <span className="ml-3 flex-1 font-medium text-sm">{habit.title}</span>
            <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
              <Button
                variant="ghost"
                size="sm"
                className={`h-8 w-8 rounded-full p-0 ${habit.completed ? "bg-green-500 text-white" : ""}`}
                onClick={() => toggleHabit(habit.id)}
              >
                <Check className={`h-4 w-4 ${habit.completed ? "text-white" : "text-muted-foreground"}`} />
                <span className="sr-only">Complete</span>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 rounded-full p-0">
                    <span role="img" aria-label="More">⋮</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => {/* edit handler */}}>Edit</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setHabits(habits.filter(h => h.id !== habit.id))}>Delete</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
