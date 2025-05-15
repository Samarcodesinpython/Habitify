"use client"

import { useEffect, useState } from "react"

const quotes = [
  "Stay consistent. Stay focused. Achieve your goals.",
  "Small habits make big changes over time.",
  "Consistency is the key to achieving and maintaining momentum.",
  "Success is the sum of small efforts repeated day in and day out.",
  "The only bad workout is the one that didn't happen.",
  "Don't count the days, make the days count.",
  "You don't have to be great to start, but you have to start to be great.",
  "The difference between try and triumph is just a little umph!",
  "The way to get started is to quit talking and begin doing.",
  "Your habits determine your future.",
]

export function MotivationalQuote() {
  const [quote, setQuote] = useState("")

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * quotes.length)
    setQuote(quotes[randomIndex])
  }, [])

  return <p className="text-muted-foreground">{quote}</p>
}
