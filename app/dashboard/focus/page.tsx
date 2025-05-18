"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, Pause, RotateCcw, CheckCircle, Settings, Link, Music, BookOpen, Coffee, Brain, Timer, Target, Zap, Moon, Sun } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { getClientSupabaseInstance } from "@/lib/supabase"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"

export default function FocusPage() {
  const [isActive, setIsActive] = useState(false)
  const [isPaused, setIsPaused] = useState(true)
  const [time, setTime] = useState(25 * 60) // 25 minutes in seconds
  const [initialTime, setInitialTime] = useState(25 * 60)
  const [isBreak, setIsBreak] = useState(false)
  const [cycles, setCycles] = useState(0)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [focusMode, setFocusMode] = useState<"pomodoro" | "custom">("pomodoro")
  const [focusTime, setFocusTime] = useState("25")
  const [breakTime, setBreakTime] = useState("5")
  const [soundTheme, setSoundTheme] = useState("rain")
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [customFocusTime, setCustomFocusTime] = useState("25")
  const [customBreakTime, setCustomBreakTime] = useState("5")
  const { user } = useAuth()
  const { toast } = useToast()
  const supabase = getClientSupabaseInstance()
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    // Create audio element for sound effects
    audioRef.current = new Audio("/notification.mp3")

    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isActive && !isPaused) {
      interval = setInterval(() => {
        setTime((time) => {
          if (time <= 1) {
            clearInterval(interval as NodeJS.Timeout)
            setIsPaused(true)

            // Play sound if enabled
            if (soundEnabled && audioRef.current) {
              audioRef.current.play().catch((e) => console.error("Error playing sound:", e))
            }

            // Show notification
            toast({
              title: isBreak ? "Break finished!" : "Focus session completed!",
              description: isBreak ? "Time to get back to work!" : "Take a short break now.",
            })

            // If we just finished a focus session
            if (!isBreak) {
              // Update the focus session in the database
              if (sessionId && user) {
                updateFocusSession(sessionId, true)
              }

              setCycles(cycles + 1)
              setIsBreak(true)
              const newBreakTime = Number.parseInt(breakTime) * 60
              setInitialTime(newBreakTime)
              setTime(newBreakTime)
            } else {
              // If we just finished a break
              setIsBreak(false)
              const newFocusTime = Number.parseInt(focusTime) * 60
              setInitialTime(newFocusTime)
              setTime(newFocusTime)
            }

            return 0
          }
          return time - 1
        })
      }, 1000)
    } else if (interval) {
      clearInterval(interval)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isActive, isPaused, isBreak, cycles, focusTime, breakTime, soundEnabled, sessionId, user, toast])

  const handleStart = async () => {
    if (!isBreak) {
      // Create a new focus session in the database
      if (user) {
        const newSessionId = await createFocusSession()
        setSessionId(newSessionId)
      }
    }

    setIsActive(true)
    setIsPaused(false)
  }

  const handlePause = () => {
    setIsPaused(true)
  }

  const handleResume = () => {
    setIsPaused(false)
  }

  const handleReset = () => {
    setIsActive(false)
    setIsPaused(true)
    setTime(initialTime)

    // If we're resetting an active session, mark it as incomplete
    if (sessionId && user && !isBreak) {
      updateFocusSession(sessionId, false)
      setSessionId(null)
    }
  }

  const createFocusSession = async () => {
    if (!user) return null

    try {
      const { data, error } = await supabase
        .from("focus_sessions")
        .insert({
          user_id: user.id,
          duration: Number.parseInt(focusTime) * 60,
          break_duration: Number.parseInt(breakTime) * 60,
          started_at: new Date().toISOString(),
          completed: false,
        })
        .select("id")
        .single()

      if (error) {
        console.error("Error creating focus session:", error.message, JSON.stringify(error))
        return null
      }

      return data.id
    } catch (error) {
      console.error("Error creating focus session:", error)
      return null
    }
  }

  const updateFocusSession = async (id: string, completed: boolean) => {
    try {
      const { error } = await supabase
        .from("focus_sessions")
        .update({
          ended_at: new Date().toISOString(),
          completed,
        })
        .eq("id", id)

      if (error) {
        console.error("Error updating focus session:", error)
      }

      // Update analytics
      if (completed) {
        updateAnalytics()
      }
    } catch (error) {
      console.error("Error updating focus session:", error)
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
            focus_time: data.focus_time + Number.parseInt(focusTime) * 60,
            focus_sessions: data.focus_sessions + 1,
          })
          .eq("id", data.id)
      } else {
        // Create new record
        await supabase.from("analytics").insert({
          user_id: user.id,
          date: today,
          focus_time: Number.parseInt(focusTime) * 60,
          focus_sessions: 1,
          habits_completed: 0,
          habits_total: 0,
          tasks_completed: 0,
          tasks_total: 0,
          productivity_score: 0,
        })
      }
    } catch (error) {
      console.error("Error updating analytics:", error)
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = time % 60
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }

  const handleFocusTimeChange = (value: string) => {
    setFocusTime(value)
    if (!isActive) {
      setInitialTime(Number.parseInt(value) * 60)
      setTime(Number.parseInt(value) * 60)
    }
  }

  const handleBreakTimeChange = (value: string) => {
    setBreakTime(value)
  }

  const handleStudyClick = () => {
    setFocusTime("60") // 1 hour
    setBreakTime("10") // 10 minutes break
    if (!isActive) {
      setInitialTime(60 * 60) // 1 hour in seconds
      setTime(60 * 60)
    }
    toast({
      title: "Study Mode Activated",
      description: "Focus timer set to 1 hour with 10-minute breaks",
    })
  }

  const handleBreakClick = () => {
    setFocusTime("10") // 10 minutes
    setBreakTime("5") // 5 minutes break
    if (!isActive) {
      setInitialTime(10 * 60) // 10 minutes in seconds
      setTime(10 * 60)
    }
    toast({
      title: "Break Mode Activated",
      description: "Focus timer set to 10 minutes with 5-minute breaks",
    })
  }

  const handleCustomTimeSave = () => {
    const focusMinutes = parseInt(customFocusTime)
    const breakMinutes = parseInt(customBreakTime)
    
    if (isNaN(focusMinutes) || isNaN(breakMinutes) || focusMinutes <= 0 || breakMinutes <= 0) {
      toast({
        title: "Invalid Time",
        description: "Please enter valid positive numbers for both focus and break times",
        variant: "destructive"
      })
      return
    }

    setFocusTime(customFocusTime)
    setBreakTime(customBreakTime)
    if (!isActive) {
      setInitialTime(focusMinutes * 60)
      setTime(focusMinutes * 60)
    }
    
    toast({
      title: "Timer Settings Updated",
      description: `Focus: ${focusMinutes}min, Break: ${breakMinutes}min`
    })
  }

  const getTimerColor = () => {
    const progress = (time / initialTime) * 100;
    if (isBreak) {
      // Pastel oranges/yellows for break
      return progress > 66 ? "rgb(255, 218, 185)" : // Pastel Peach (lighter)
             progress > 33 ? "rgb(255, 183, 119)" : // Pastel Orange (medium)
             "rgb(255, 165, 0)"; // Orange (can adjust if too bright) (darker)
    }
    // Pastel blues for focus
    return progress > 66 ? "rgb(173, 216, 230)" : // Pastel Light Blue (lighter)
           progress > 33 ? "rgb(135, 206, 235)" : // Pastel Sky Blue (medium)
           "rgb(100, 149, 237)"; // Pastel Cornflower Blue (darker)
  }

  return (
    <div className="flex flex-col gap-6 pb-16 md:pb-0">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Focus Mode</h1>
            <p className="text-muted-foreground">Stay focused and productive with timed sessions</p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Timer Settings</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="focus-time">Focus Duration (minutes)</Label>
                  <Input
                    id="focus-time"
                    type="number"
                    min="1"
                    value={customFocusTime}
                    onChange={(e) => setCustomFocusTime(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="break-time">Break Duration (minutes)</Label>
                  <Input
                    id="break-time"
                    type="number"
                    min="1"
                    value={customBreakTime}
                    onChange={(e) => setCustomBreakTime(e.target.value)}
                  />
                </div>
                <Button onClick={handleCustomTimeSave}>Save Settings</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="rounded-2xl border-border shadow-md">
          <CardHeader className="pb-2">
            <CardTitle>{isBreak ? "Break Time" : "Focus Time"}</CardTitle>
            <CardDescription>
              {isBreak ? "Take a short break to recharge" : "Stay focused on your current task"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center">
              <div className="focus-timer mb-8">
                <div className="focus-timer-circle">
                  <svg className="absolute h-full w-full" viewBox="0 0 200 200">
                    <circle
                      className="timer-progress transition-colors duration-1000"
                      cx="100"
                      cy="100"
                      r="90"
                      fill="none"
                      strokeWidth="8"
                      strokeDasharray="565.48"
                      strokeDashoffset={565.48 * (time / initialTime)}
                      stroke={getTimerColor()}
                      transform="rotate(-90 100 100)"
                    />
                  </svg>
                  <div className="focus-timer-inner">
                    <div className="focus-timer-time">{formatTime(time)}</div>
                    <div className="focus-timer-label">{isBreak ? "Break" : "Focus"}</div>
                  </div>
                </div>
              </div>

              <div className="focus-controls">
                {isPaused ? (
                  <Button
                    onClick={isActive ? handleResume : handleStart}
                    className="focus-button focus-button-primary"
                    size="icon"
                  >
                    <Play className="h-6 w-6" />
                    <span className="sr-only">{isActive ? "Resume" : "Start"}</span>
                  </Button>
                ) : (
                  <Button onClick={handlePause} className="focus-button focus-button-primary" size="icon">
                    <Pause className="h-6 w-6" />
                    <span className="sr-only">Pause</span>
                  </Button>
                )}
                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="focus-button focus-button-outline"
                  size="icon"
                >
                  <RotateCcw className="h-5 w-5" />
                  <span className="sr-only">Reset</span>
                </Button>
              </div>

              {cycles > 0 && (
                <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>
                    {cycles} {cycles === 1 ? "cycle" : "cycles"} completed today
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-3 gap-4">
          <a href="https://open.spotify.com/" target="_blank" rel="noopener noreferrer" 
             className="flex flex-col items-center justify-center p-6 rounded-xl transition-all duration-300 hover:scale-105 hover:bg-green-300"
             style={{ backgroundColor: 'rgb(193, 222, 193)' }}>
            <img src="/icons/Spotify_icon.svg" alt="Spotify" className="h-12 w-12 mb-2" />
            <span className="text-sm font-medium">Spotify</span>
          </a>
          
          <a href="https://leetcode.com/" target="_blank" rel="noopener noreferrer"
             className="flex flex-col items-center justify-center p-6 rounded-xl transition-all duration-300 hover:scale-105 hover:bg-orange-300"
             style={{ backgroundColor: 'rgb(255, 223, 186)' }}>
            <img src="/icons/LeetCode_Logo_black_with_text.svg" alt="LeetCode" className="h-30 w-30 mb-2" />
            <span className="text-sm font-medium"></span>
          </a>

          <a href="https://github.com/" target="_blank" rel="noopener noreferrer"
             className="flex flex-col items-center justify-center p-6 rounded-xl transition-all duration-300 hover:scale-105 hover:bg-purple-300"
             style={{ backgroundColor: 'rgb(221, 160, 221)' }}>
            <img src="/icons/GitHub_Invertocat_Logo.svg" alt="GitHub" className="h-12 w-12  mb-2" />
            <span className="text-sm font-medium">GitHub</span>
          </a>

          <div className="flex flex-col items-center justify-center p-6 rounded-xl transition-all duration-300 hover:scale-105 cursor-pointer hover:bg-blue-300"
               style={{ backgroundColor: 'rgb(176, 224, 230)' }}>
            <Target className="h-8 w-8 mb-2" />
            <span className="text-sm font-medium">{cycles * Number.parseInt(focusTime)} min</span>
          </div>

          <div className="flex flex-col items-center justify-center p-6 rounded-xl transition-all duration-300 hover:scale-105 cursor-pointer hover:bg-indigo-300"
               style={{ backgroundColor: 'rgb(197, 179, 228)' }}
               onClick={handleStudyClick}>
            <BookOpen className="h-8 w-8 mb-2" />
            <span className="text-sm font-medium">Study</span>
          </div>

          <div className="flex flex-col items-center justify-center p-6 rounded-xl transition-all duration-300 hover:scale-105 cursor-pointer hover:bg-amber-300"
               style={{ backgroundColor: 'rgb(255, 228, 181)' }}
               onClick={handleBreakClick}>
            <Coffee className="h-8 w-8 mb-2" />
            <span className="text-sm font-medium">Break</span>
          </div>

          <div className="flex flex-col items-center justify-center p-6 rounded-xl transition-all duration-300 hover:scale-105 cursor-pointer hover:bg-yellow-300"
               style={{ backgroundColor: 'rgb(255, 250, 205)' }}>
            <Zap className="h-8 w-8 mb-2" />
            <span className="text-sm font-medium">Energy</span>
          </div>

          <div className="flex flex-col items-center justify-center p-6 rounded-xl transition-all duration-300 hover:scale-105 cursor-pointer hover:bg-slate-300"
               style={{ backgroundColor: 'rgb(220, 220, 220)' }}>
            <Moon className="h-8 w-8 mb-2" />
            <span className="text-sm font-medium">Night</span>
          </div>

          <div className="flex flex-col items-center justify-center p-6 rounded-xl transition-all duration-300 hover:scale-105 cursor-pointer hover:bg-orange-300"
               style={{ backgroundColor: 'rgb(255, 223, 186)' }}>
            <Sun className="h-8 w-8 mb-2" />
            <span className="text-sm font-medium">Day</span>
          </div>
        </div>
      </div>
    </div>
  )
}
