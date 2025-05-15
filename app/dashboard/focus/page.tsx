"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, Pause, RotateCcw, CheckCircle, Settings } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
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
        console.error("Error creating focus session:", error)
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

  return (
    <div className="flex flex-col gap-6 pb-16 md:pb-0">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Focus Mode</h1>
        <p className="text-muted-foreground">Stay focused and productive with timed sessions</p>
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
                      className="timer-progress"
                      cx="100"
                      cy="100"
                      r="90"
                      fill="none"
                      strokeWidth="8"
                      strokeDasharray="565.48"
                      strokeDashoffset={565.48 - (565.48 * time) / initialTime}
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

        <Card className="rounded-2xl border-border shadow-md">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <div>
              <CardTitle>Settings</CardTitle>
              <CardDescription>Customize your focus session</CardDescription>
            </div>
            <Settings className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs
              defaultValue={focusMode}
              value={focusMode}
              onValueChange={(value) => setFocusMode(value as "pomodoro" | "custom")}
              className="w-full"
            >
              <TabsList className="mb-4 rounded-xl">
                <TabsTrigger value="pomodoro" className="rounded-lg">
                  Pomodoro
                </TabsTrigger>
                <TabsTrigger value="custom" className="rounded-lg">
                  Custom
                </TabsTrigger>
              </TabsList>
              <TabsContent value="pomodoro" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl bg-primary/10 p-4 text-center">
                    <div className="text-lg font-medium mb-1">25:00</div>
                    <div className="text-sm text-muted-foreground">Focus Time</div>
                  </div>
                  <div className="rounded-xl bg-secondary/10 p-4 text-center">
                    <div className="text-lg font-medium mb-1">05:00</div>
                    <div className="text-sm text-muted-foreground">Break Time</div>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  The Pomodoro Technique is a time management method that uses a timer to break work into intervals,
                  traditionally 25 minutes in length, separated by short breaks.
                </div>
              </TabsContent>
              <TabsContent value="custom" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="focus-time">Focus Time</Label>
                  <Select defaultValue={focusTime} value={focusTime} onValueChange={handleFocusTimeChange}>
                    <SelectTrigger id="focus-time" className="rounded-xl">
                      <SelectValue placeholder="Select focus time" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="25">25 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="45">45 minutes</SelectItem>
                      <SelectItem value="60">60 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="break-time">Break Time</Label>
                  <Select defaultValue={breakTime} value={breakTime} onValueChange={handleBreakTimeChange}>
                    <SelectTrigger id="break-time" className="rounded-xl">
                      <SelectValue placeholder="Select break time" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="5">5 minutes</SelectItem>
                      <SelectItem value="10">10 minutes</SelectItem>
                      <SelectItem value="15">15 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>
            </Tabs>

            <div className="space-y-2">
              <Label>Sound Theme</Label>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant="outline"
                  className={`rounded-xl h-auto py-3 flex flex-col items-center gap-1 ${
                    soundTheme === "rain" ? "bg-primary/10 border-primary/20" : ""
                  }`}
                  onClick={() => setSoundTheme("rain")}
                >
                  <span className="text-lg">🌧️</span>
                  <span className="text-xs">Rain</span>
                </Button>
                <Button
                  variant="outline"
                  className={`rounded-xl h-auto py-3 flex flex-col items-center gap-1 ${
                    soundTheme === "cafe" ? "bg-primary/10 border-primary/20" : ""
                  }`}
                  onClick={() => setSoundTheme("cafe")}
                >
                  <span className="text-lg">☕</span>
                  <span className="text-xs">Café</span>
                </Button>
                <Button
                  variant="outline"
                  className={`rounded-xl h-auto py-3 flex flex-col items-center gap-1 ${
                    soundTheme === "waves" ? "bg-primary/10 border-primary/20" : ""
                  }`}
                  onClick={() => setSoundTheme("waves")}
                >
                  <span className="text-lg">🌊</span>
                  <span className="text-xs">Waves</span>
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label>Sound Notifications</Label>
              <Switch checked={soundEnabled} onCheckedChange={setSoundEnabled} />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl border-border shadow-md">
        <CardHeader className="pb-2">
          <CardTitle>Focus Stats</CardTitle>
          <CardDescription>Your focus session statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl bg-primary/10 p-4 text-center">
              <div className="text-2xl font-bold mb-1">{cycles}</div>
              <div className="text-sm text-muted-foreground">Pomodoro Cycles</div>
            </div>
            <div className="rounded-xl bg-secondary/10 p-4 text-center">
              <div className="text-2xl font-bold mb-1">{cycles * Number.parseInt(focusTime)} min</div>
              <div className="text-sm text-muted-foreground">Focus Time Today</div>
            </div>
            <div className="rounded-xl bg-accent/10 p-4 text-center">
              <div className="text-2xl font-bold mb-1">3</div>
              <div className="text-sm text-muted-foreground">Tasks Completed</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-border shadow-md">
        <CardHeader className="pb-2">
          <CardTitle>Focus Tips</CardTitle>
          <CardDescription>Tips to help you stay focused</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center mt-0.5">
                <span className="text-xs font-bold">1</span>
              </div>
              <span>Remove distractions: silence your phone and close unnecessary tabs</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="h-5 w-5 rounded-full bg-secondary flex items-center justify-center mt-0.5">
                <span className="text-xs font-bold">2</span>
              </div>
              <span>Take short breaks between focus sessions to maintain productivity</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="h-5 w-5 rounded-full bg-accent flex items-center justify-center mt-0.5">
                <span className="text-xs font-bold">3</span>
              </div>
              <span>Stay hydrated and maintain good posture while working</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="h-5 w-5 rounded-full bg-rose flex items-center justify-center mt-0.5">
                <span className="text-xs font-bold">4</span>
              </div>
              <span>Use the Pomodoro technique: 25 minutes of focus, 5 minutes of rest</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
