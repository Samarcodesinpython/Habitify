"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ThemeToggle } from "@/components/theme-toggle"
import { useToast } from "@/hooks/use-toast"
import { getClientSupabaseInstance } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Info } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [needsConfirmation, setNeedsConfirmation] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const supabase = getClientSupabaseInstance()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setNeedsConfirmation(false)

    try {
      // Use direct Supabase auth instead of the context
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error("Login error:", error.message)

        // Handle the specific case of email not confirmed
        if (error.message.includes("Email not confirmed")) {
          setNeedsConfirmation(true)
          return
        }

        toast({
          title: "Login Failed",
          description: error.message || "Invalid email or password. Please try again.",
          variant: "destructive",
        })
        return
      }

      // If no error, login was successful
      toast({
        title: "Success",
        description: "You have been logged in successfully.",
      })

      // Redirect to dashboard
      router.push("/dashboard")
    } catch (error) {
      console.error("Login error:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const resendConfirmationEmail = async () => {
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter your email address first.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
      })

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Confirmation Email Sent",
        description: "Please check your email for the confirmation link.",
      })
    } catch (error) {
      console.error("Error resending confirmation:", error)
      toast({
        title: "Error",
        description: "Failed to resend confirmation email. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // For demo purposes, let's create a function that creates a demo user with auto-confirmation
  const handleDemoLogin = async () => {
    setIsLoading(true)

    try {
      // For demo purposes, we'll use a special demo account
      // In a real app, you might want to use a different approach
      const { data, error } = await supabase.auth.signInWithPassword({
        email: "demo@habitify.app",
        password: "demo12345",
      })

      // If the user doesn't exist or there's an error, create a new demo user
      if (error) {
        // Create a new demo user with auto-confirmation
        // Note: In a real production app, you would handle this differently
        // This is just for demonstration purposes
        const { error: signUpError } = await supabase.auth.signUp({
          email: "demo@habitify.app",
          password: "demo12345",
          options: {
            data: {
              full_name: "Demo User",
            },
            // This would normally require server-side code with admin privileges
            // For demo purposes, we'll just create a new user each time
          },
        })

        if (signUpError) {
          console.error("Demo signup error:", signUpError.message)
          toast({
            title: "Demo Login Failed",
            description: "Could not create demo account. Please try again or use regular signup.",
            variant: "destructive",
          })
          return
        }

        // Try to sign in again
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: "demo@habitify.app",
          password: "demo12345",
        })

        if (signInError) {
          console.error("Demo login error after signup:", signInError.message)
          toast({
            title: "Demo Login Failed",
            description: "Please try the regular signup process instead.",
            variant: "destructive",
          })
          return
        }
      }

      toast({
        title: "Demo Login Successful",
        description: "You are now logged in as a demo user.",
      })

      router.push("/dashboard")
    } catch (error) {
      console.error("Demo login error:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="absolute right-4 top-4 md:right-8 md:top-8">
        <ThemeToggle />
      </div>
      <Link href="/" className="absolute left-4 top-4 md:left-8 md:top-8">
        <Button variant="ghost" className="rounded-xl">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-2 h-4 w-4"
          >
            <path d="m12 19-7-7 7-7" />
            <path d="M19 12H5" />
          </svg>
          Back
        </Button>
      </Link>
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
          <p className="text-sm text-muted-foreground">Enter your credentials to sign in to your account</p>
        </div>

        {needsConfirmation && (
          <Alert variant="warning" className="bg-amber-50 text-amber-900 border-amber-200">
            <Info className="h-4 w-4" />
            <AlertTitle>Email not confirmed</AlertTitle>
            <AlertDescription>
              Please check your email and click the confirmation link to activate your account.
              <Button
                variant="link"
                className="p-0 h-auto text-amber-900 font-semibold hover:text-amber-700 ml-1"
                onClick={resendConfirmationEmail}
                disabled={isLoading}
              >
                Resend confirmation email
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <Card className="rounded-2xl border-border shadow-md">
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Sign In</CardTitle>
              <CardDescription>Enter your email and password to sign in</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  className="rounded-xl"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  className="rounded-xl"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="text-right text-sm">
                <Link href="/forgot-password" className="text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
              <Button
                type="submit"
                className="w-full rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full rounded-xl"
                onClick={handleDemoLogin}
                disabled={isLoading}
              >
                Try Demo Account
              </Button>
            </CardFooter>
          </form>
        </Card>
        <div className="text-center text-sm">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-primary hover:underline">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  )
}
