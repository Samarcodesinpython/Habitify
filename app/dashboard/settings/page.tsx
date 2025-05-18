"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ThemeToggle } from "@/components/theme-toggle"
import { useTheme } from "next-themes"
import { toast } from "sonner"

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const [themeMode, setThemeMode] = useState(theme || "system")
  const [accentColor, setAccentColor] = useState("violet")

  useEffect(() => {
    // Get the current accent color from localStorage or default to violet
    const savedAccentColor = localStorage.getItem('accentColor') || "violet"
    setAccentColor(savedAccentColor)
    document.documentElement.setAttribute('data-accent', savedAccentColor)
  }, [])

  const handleThemeChange = (value: string) => {
    setThemeMode(value)
    setTheme(value)
  }

  const handleAccentColorChange = (value: string) => {
    setAccentColor(value)
    document.documentElement.setAttribute('data-accent', value)
  }

  const handleSavePreferences = () => {
    try {
      // Save theme
      setTheme(themeMode)
      localStorage.setItem('theme', themeMode)

      // Save accent color
      document.documentElement.setAttribute('data-accent', accentColor)
      localStorage.setItem('accentColor', accentColor)

      toast.success('Preferences saved successfully')
    } catch (error) {
      toast.error('Failed to save preferences')
      console.error('Error saving preferences:', error)
    }
  }

  return (
    <div className="space-y-6 pb-16 md:pb-0">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your app settings and preferences.</p>
      </div>
      <Separator />
      <Tabs defaultValue="appearance" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
        </TabsList>
        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Theme</CardTitle>
              <CardDescription>Customize the appearance of the application.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Theme Mode</Label>
                <div className="flex items-center justify-between">
                  <RadioGroup defaultValue={themeMode} className="flex gap-4" onValueChange={handleThemeChange}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="light" id="light" />
                      <Label htmlFor="light">Light</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="dark" id="dark" />
                      <Label htmlFor="dark">Dark</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="system" id="system" />
                      <Label htmlFor="system">System</Label>
                    </div>
                  </RadioGroup>
                  <ThemeToggle />
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="accent-color">Accent Color</Label>
                <Select value={accentColor} onValueChange={handleAccentColorChange}>
                  <SelectTrigger id="accent-color">
                    <SelectValue placeholder="Select accent color" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="violet">Violet</SelectItem>
                    <SelectItem value="mint">Mint</SelectItem>
                    <SelectItem value="peach">Peach</SelectItem>
                    <SelectItem value="rose">Rose</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={handleSavePreferences}
              >
                Save Preferences
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
