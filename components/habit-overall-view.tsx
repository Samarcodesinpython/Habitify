"use client"

import type React from "react"

import { useState } from "react"
import { AlarmClockIcon as Alarm, SpaceIcon as Yoga, Check, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

type Habit = {
  id: string
  title: string
  icon: React.ReactNode
  completed: boolean
  streaks: Record<string, StreakMonth[]>
}

type StreakMonth = {
  month: string
  days: StreakDay[]
}

type StreakDay = {
  date: string
  status: "completed" | "missed" | "empty" | "future"
}

export function HabitOverallView() {
  // Generate streak data for the current and past months
  const generateStreakData = () => {
    const months = ["January", "February", "March", "April", "May", "June"]
    const streakData: Record<string, StreakMonth[]> = {}

    const habits = ["Wake up early", "Stretching", "Balanced Breakfast"]

    habits.forEach((habit) => {
      streakData[habit] = months.map((month) => {
        // Generate between 28-31 days per month
        const daysInMonth = month === "February" ? 28 : [4, 6, 9, 11].includes(months.indexOf(month)) ? 30 : 31

        return {
          month,
          days: Array.from({ length: daysInMonth }, (_, i) => {
            // Current date for comparison
            const today = new Date()
            const currentMonth = today.getMonth()
            const currentDay = today.getDate()
            const monthIndex = months.indexOf(month)

            // If this day is in the future
            if (monthIndex > currentMonth || (monthIndex === currentMonth && i + 1 > currentDay)) {
              return {
                date: `${month} ${i + 1}`,
                status: "future",
              }
            }

            // Random status for past days
            const rand = Math.random()
            let status: "completed" | "missed" | "empty"

            if (rand < 0.7) {
              status = "completed"
            } else if (rand < 0.9) {
              status = "missed"
            } else {
              status = "empty"
            }

            return {
              date: `${month} ${i + 1}`,
              status,
            }
          }),
        }
      })
    })

    return streakData
  }

  const [streakData] = useState(generateStreakData())
  const [habits] = useState([
    {
      id: "1",
      title: "Wake up early",
      icon: <Alarm className="h-5 w-5" />,
      completed: true,
    },
    {
      id: "2",
      title: "Stretching",
      icon: <Yoga className="h-5 w-5" />,
      completed: true,
    },
    {
      id: "3",
      title: "Balanced Breakfast",
      icon: <span className="text-lg">🍳</span>,
      completed: false,
    },
  ])

  // Function to group days into weeks
  const groupIntoWeeks = (days: StreakDay[]) => {
    const weeks: StreakDay[][] = []
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7))
    }
    return weeks
  }

  return (
    <div className="space-y-8">
      <TooltipProvider>
        {habits.map((habit) => (
          <div key={habit.id} className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">{habit.icon}</div>
              <h3 className="font-medium">{habit.title}</h3>
              <Badge variant="outline" className="ml-auto">
                {habit.completed ? "Active" : "Inactive"}
              </Badge>
            </div>

            <div className="streak-calendar">
              {streakData[habit.title]?.map((monthData, monthIndex) => (
                <div key={monthIndex} className="streak-month">
                  <div className="month-label">{monthData.month}</div>

                  {groupIntoWeeks(monthData.days).map((week, weekIndex) => (
                    <div key={weekIndex} className="streak-week">
                      {week.map((day, dayIndex) => (
                        <Tooltip key={dayIndex}>
                          <TooltipTrigger asChild>
                            <div className={`streak-dot streak-dot-${day.status}`}>
                              {day.status === "completed" && <Check className="h-3 w-3" />}
                              {day.status === "missed" && <X className="h-3 w-3" />}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              {day.date}: {day.status}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      ))}
                    </div>
                  ))}

                  {monthIndex < streakData[habit.title].length - 1 && <div className="month-divider"></div>}
                </div>
              ))}
            </div>
          </div>
        ))}
      </TooltipProvider>
    </div>
  )
}
