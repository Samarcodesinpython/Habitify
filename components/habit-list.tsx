"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Check, AlarmClockIcon as Alarm, Sun, Droplet, Phone, Dumbbell, SpaceIcon as Yoga } from "lucide-react"

type Habit = {
  id: string
  title: string
  icon: React.ReactNode
  completed: boolean
  color: "violet" | "mint" | "peach" | "rose"
}

export function HabitList() {
  const [habits, setHabits] = useState<Habit[]>([
    {
      id: "1",
      title: "Wake up early",
      icon: <Alarm className="h-5 w-5" />,
      completed: false,
      color: "violet",
    },
    {
      id: "2",
      title: "Stretching",
      icon: <Yoga className="h-5 w-5" />,
      completed: false,
      color: "violet",
    },
    {
      id: "3",
      title: "Balanced Breakfast",
      icon: <span className="text-lg">🍳</span>,
      completed: true,
      color: "violet",
    },
    {
      id: "4",
      title: "Sunlight Exposure",
      icon: <Sun className="h-5 w-5" />,
      completed: false,
      color: "violet",
    },
    {
      id: "5",
      title: "Quick Workout",
      icon: <Dumbbell className="h-5 w-5" />,
      completed: false,
      color: "mint",
    },
    {
      id: "6",
      title: "Hydration",
      icon: <Droplet className="h-5 w-5" />,
      completed: false,
      color: "mint",
    },
    {
      id: "7",
      title: "Call Mom Daily",
      icon: <Phone className="h-5 w-5" />,
      completed: false,
      color: "mint",
    },
  ])

  // For touch/swipe functionality
  const [swipingId, setSwipingId] = useState<string | null>(null)
  const touchStartX = useRef<number | null>(null)
  const touchEndX = useRef<number | null>(null)
  const minSwipeDistance = 50

  const toggleHabit = (id: string) => {
    setHabits(
      habits.map((habit) => {
        if (habit.id === id) {
          return { ...habit, completed: !habit.completed }
        }
        return habit
      }),
    )

    // If completing via swipe, add a delay before removing
    if (swipingId === id) {
      setTimeout(() => {
        setHabits(habits.filter((habit) => habit.id !== id))
      }, 500)
    }
  }

  const skipHabit = (id: string) => {
    // In a real app, this would mark the habit as skipped for the day
    setHabits(habits.filter((habit) => habit.id !== id))
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

  return (
    <div className="space-y-3">
      {habits.map((habit) => (
        <div
          key={habit.id}
          className={`habit-item ${habit.completed ? "completed" : ""} ${swipingId === habit.id ? "swiping" : ""}`}
          onTouchStart={(e) => onTouchStart(e, habit.id)}
          onTouchMove={(e) => onTouchMove(e, habit.id)}
          onTouchEnd={(e) => onTouchEnd(e, habit.id)}
        >
          <div className={`habit-card ${habit.completed ? "habit-card-mint" : `habit-card-${habit.color}`} group`}>
            {habit.completed ? (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-mint text-white">
                <Check className="h-5 w-5" />
              </div>
            ) : (
              <div className="flex h-8 w-8 items-center justify-center">{habit.icon}</div>
            )}
            <span className="ml-3 flex-1 font-medium">{habit.title}</span>

            <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 rounded-full p-0"
                onClick={() => toggleHabit(habit.id)}
              >
                <Check className="h-4 w-4" />
                <span className="sr-only">Complete</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 rounded-full p-0"
                onClick={() => skipHabit(habit.id)}
              >
                <span className="sr-only">Skip</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
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
