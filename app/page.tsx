import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { ArrowRight, CheckCircle2, Clock, BarChart3, Calendar } from "lucide-react"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-2xl">
            <span className="text-primary">Habitify</span>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link href="/login">
              <Button variant="ghost" className="rounded-xl">
                Log in
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90">Sign up</Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="container flex flex-col items-center justify-center py-20 md:py-32">
          <div className="mx-auto flex max-w-[980px] flex-col items-center gap-8 text-center px-4">
            <h1 className="text-4xl font-bold leading-tight tracking-tighter md:text-6xl lg:text-7xl lg:leading-[1.1]">
              Track, Focus, <span className="text-primary">Achieve</span>
            </h1>
            <p className="max-w-[750px] text-lg text-muted-foreground sm:text-xl">
              Stay consistent. Stay focused. Achieve your goals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/signup">
                <Button
                  size="lg"
                  className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto"
                >
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="rounded-xl w-full sm:w-auto">
                  Log in
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="container py-16 md:py-24">
          <h2 className="text-center text-3xl font-bold mb-16">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="rounded-2xl border border-border bg-violet/10 p-6 shadow-md transition-all duration-300 hover:shadow-lg">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary">
                <CheckCircle2 className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-2">Habit Tracking</h3>
              <p className="text-muted-foreground">Build consistency with daily, weekly, and custom habit tracking.</p>
            </div>
            <div className="rounded-2xl border border-border bg-mint/10 p-6 shadow-md transition-all duration-300 hover:shadow-lg">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
                <Clock className="h-6 w-6 text-secondary-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-2">Focus Timer</h3>
              <p className="text-muted-foreground">Stay productive with customizable focus sessions and breaks.</p>
            </div>
            <div className="rounded-2xl border border-border bg-peach/10 p-6 shadow-md transition-all duration-300 hover:shadow-lg">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent">
                <Calendar className="h-6 w-6 text-accent-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-2">Streak Tracking</h3>
              <p className="text-muted-foreground">Visualize your progress with beautiful streak calendars.</p>
            </div>
            <div className="rounded-2xl border border-border bg-rose/10 p-6 shadow-md transition-all duration-300 hover:shadow-lg">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-rose">
                <BarChart3 className="h-6 w-6 text-accent-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-2">Analytics</h3>
              <p className="text-muted-foreground">
                Gain insights into your habits with detailed statistics and charts.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-ivory/50 dark:bg-muted/20 py-16 md:py-24">
          <div className="container">
            <div className="mx-auto max-w-[800px] text-center">
              <h2 className="text-3xl font-bold mb-6">Ready to build better habits?</h2>
              <p className="text-muted-foreground mb-8">
                Join thousands of users who have transformed their lives with Habitify.
              </p>
              <Link href="/signup">
                <Button size="lg" className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90">
                  Sign up for free
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t py-8">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-center text-sm text-muted-foreground md:text-left">
            &copy; {new Date().getFullYear()} Habitify. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="text-sm text-muted-foreground hover:underline">
              Terms
            </Link>
            <Link href="/privacy" className="text-sm text-muted-foreground hover:underline">
              Privacy
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </footer>
    </div>
  )
}
