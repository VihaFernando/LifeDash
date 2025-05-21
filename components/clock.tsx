"use client"

import { useEffect, useState } from "react"
import { ClockIcon } from "lucide-react"

export function Clock() {
  const [time, setTime] = useState<string>("")
  const [date, setDate] = useState<string>("")

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()

      // Format time as HH:MM:SS
      const timeString = now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      })

      // Format date as Day, Month Date
      const dateString = now.toLocaleDateString([], {
        weekday: "short",
        month: "short",
        day: "numeric",
      })

      setTime(timeString)
      setDate(dateString)
    }

    // Update immediately
    updateTime()

    // Then update every second
    const interval = setInterval(updateTime, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex items-center gap-2 text-sm font-medium bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm px-4 py-2 rounded-full transition-colors duration-300 border border-gray-200/50 dark:border-gray-700/50 shadow-sm">
      <ClockIcon className="h-4 w-4 text-blue-500" />
      <div className="flex flex-col items-center">
        <span className="tabular-nums font-semibold text-gray-800 dark:text-gray-200">{time}</span>
        <span className="text-xs text-gray-500 dark:text-gray-400">{date}</span>
      </div>
    </div>
  )
}
