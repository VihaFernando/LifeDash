"use client"

import { useEffect, useState, useCallback } from "react"
import { Calendar, Gift } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface LocationData {
  country: string
}

interface Holiday {
  date: string
  localName: string
  name: string
  countryCode: string
}

interface HolidayCountdownProps {
  locationData: LocationData
}

// Common holidays for fallback
const commonHolidays: { [key: string]: Holiday[] } = {
  // Default holidays that exist in most countries
  default: [
    { date: "2025-01-01", localName: "New Year's Day", name: "New Year's Day", countryCode: "GLOBAL" },
    { date: "2025-12-25", localName: "Christmas Day", name: "Christmas Day", countryCode: "GLOBAL" },
    { date: "2025-12-31", localName: "New Year's Eve", name: "New Year's Eve", countryCode: "GLOBAL" },
  ],
  // United States
  US: [
    { date: "2025-01-01", localName: "New Year's Day", name: "New Year's Day", countryCode: "US" },
    {
      date: "2025-01-20",
      localName: "Martin Luther King Jr. Day",
      name: "Martin Luther King Jr. Day",
      countryCode: "US",
    },
    { date: "2025-02-17", localName: "Presidents' Day", name: "Washington's Birthday", countryCode: "US" },
    { date: "2025-05-26", localName: "Memorial Day", name: "Memorial Day", countryCode: "US" },
    { date: "2025-07-04", localName: "Independence Day", name: "Independence Day", countryCode: "US" },
    { date: "2025-09-01", localName: "Labor Day", name: "Labor Day", countryCode: "US" },
    { date: "2025-10-13", localName: "Columbus Day", name: "Columbus Day", countryCode: "US" },
    { date: "2025-11-11", localName: "Veterans Day", name: "Veterans Day", countryCode: "US" },
    { date: "2025-11-27", localName: "Thanksgiving Day", name: "Thanksgiving Day", countryCode: "US" },
    { date: "2025-12-25", localName: "Christmas Day", name: "Christmas Day", countryCode: "US" },
  ],
  // United Kingdom
  GB: [
    { date: "2025-01-01", localName: "New Year's Day", name: "New Year's Day", countryCode: "GB" },
    { date: "2025-04-18", localName: "Good Friday", name: "Good Friday", countryCode: "GB" },
    { date: "2025-04-21", localName: "Easter Monday", name: "Easter Monday", countryCode: "GB" },
    { date: "2025-05-05", localName: "Early May Bank Holiday", name: "Early May Bank Holiday", countryCode: "GB" },
    { date: "2025-05-26", localName: "Spring Bank Holiday", name: "Spring Bank Holiday", countryCode: "GB" },
    { date: "2025-08-25", localName: "Summer Bank Holiday", name: "Summer Bank Holiday", countryCode: "GB" },
    { date: "2025-12-25", localName: "Christmas Day", name: "Christmas Day", countryCode: "GB" },
    { date: "2025-12-26", localName: "Boxing Day", name: "Boxing Day", countryCode: "GB" },
  ],
  // Canada
  CA: [
    { date: "2025-01-01", localName: "New Year's Day", name: "New Year's Day", countryCode: "CA" },
    { date: "2025-04-18", localName: "Good Friday", name: "Good Friday", countryCode: "CA" },
    { date: "2025-05-19", localName: "Victoria Day", name: "Victoria Day", countryCode: "CA" },
    { date: "2025-07-01", localName: "Canada Day", name: "Canada Day", countryCode: "CA" },
    { date: "2025-09-01", localName: "Labour Day", name: "Labour Day", countryCode: "CA" },
    { date: "2025-10-13", localName: "Thanksgiving", name: "Thanksgiving", countryCode: "CA" },
    { date: "2025-12-25", localName: "Christmas Day", name: "Christmas Day", countryCode: "CA" },
    { date: "2025-12-26", localName: "Boxing Day", name: "Boxing Day", countryCode: "CA" },
  ],
  // Australia
  AU: [
    { date: "2025-01-01", localName: "New Year's Day", name: "New Year's Day", countryCode: "AU" },
    { date: "2025-01-26", localName: "Australia Day", name: "Australia Day", countryCode: "AU" },
    { date: "2025-04-18", localName: "Good Friday", name: "Good Friday", countryCode: "AU" },
    { date: "2025-04-21", localName: "Easter Monday", name: "Easter Monday", countryCode: "AU" },
    { date: "2025-04-25", localName: "Anzac Day", name: "Anzac Day", countryCode: "AU" },
    { date: "2025-12-25", localName: "Christmas Day", name: "Christmas Day", countryCode: "AU" },
    { date: "2025-12-26", localName: "Boxing Day", name: "Boxing Day", countryCode: "AU" },
  ],
}

export function HolidayCountdown({ locationData }: HolidayCountdownProps) {
  const [holiday, setHoliday] = useState<Holiday | null>(null)
  const [daysRemaining, setDaysRemaining] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [usingFallback, setUsingFallback] = useState(false)

  const calculateDaysRemaining = useCallback((dateString: string) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const holidayDate = new Date(dateString)
    const timeDiff = holidayDate.getTime() - today.getTime()
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24))
    setDaysRemaining(daysDiff)
  }, [])

  const useFallbackHolidays = useCallback(
    (countryCode: string) => {
      setUsingFallback(true)

      // Get country-specific holidays if available, otherwise use default
      const countryHolidays = commonHolidays[countryCode] || commonHolidays.default

      // Find the next upcoming holiday from our fallback list
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const upcomingHolidays = countryHolidays.filter((h) => {
        const holidayDate = new Date(h.date)
        return holidayDate >= today
      })

      if (upcomingHolidays.length > 0) {
        // Sort by date to get the closest upcoming holiday
        upcomingHolidays.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        const nextHoliday = upcomingHolidays[0]
        setHoliday(nextHoliday)
        calculateDaysRemaining(nextHoliday.date)
      } else {
        // If no upcoming holidays in our list, use New Year's next year
        const nextYear = new Date().getFullYear() + 1
        const newYearsDate = `${nextYear}-01-01`
        setHoliday({
          date: newYearsDate,
          localName: "New Year's Day",
          name: "New Year's Day",
          countryCode: countryCode,
        })
        calculateDaysRemaining(newYearsDate)
      }
    },
    [calculateDaysRemaining],
  )

  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        // Validate country code
        const countryCode = locationData.country
        if (!countryCode || countryCode.length !== 2) {
          throw new Error("Invalid country code")
        }

        // Try to fetch from API first
        const currentYear = new Date().getFullYear()
        const response = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${currentYear}/${countryCode}`, {
          // Add timeout to prevent long waiting
          signal: AbortSignal.timeout(5000),
        })

        if (!response.ok) {
          throw new Error(`API returned ${response.status}: ${response.statusText}`)
        }

        // Check if response is empty
        const responseText = await response.text()
        if (!responseText || responseText.trim() === "") {
          throw new Error("Empty response from holiday API")
        }

        // Parse the JSON response
        const holidays: Holiday[] = JSON.parse(responseText)

        if (!Array.isArray(holidays) || holidays.length === 0) {
          throw new Error("No holidays returned from API")
        }

        // Find the next upcoming holiday
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const upcomingHolidays = holidays.filter((h) => {
          const holidayDate = new Date(h.date)
          return holidayDate >= today
        })

        if (upcomingHolidays.length > 0) {
          const nextHoliday = upcomingHolidays[0]
          setHoliday(nextHoliday)
          calculateDaysRemaining(nextHoliday.date)
          setUsingFallback(false)
        } else {
          // No upcoming holidays this year, use fallback
          useFallbackHolidays(countryCode)
        }
      } catch (error) {
        console.error("Error fetching holidays:", error)
        // Use fallback holiday data
        useFallbackHolidays(locationData.country)
      } finally {
        setLoading(false)
      }
    }

    if (locationData && locationData.country) {
      fetchHolidays()
    }
  }, [locationData, calculateDaysRemaining, useFallbackHolidays])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" })
  }

  // Calculate progress percentage (inverse of days remaining)
  // Assuming max 100 days countdown
  const progressPercentage = Math.max(0, Math.min(100, 100 - (daysRemaining / 100) * 100))

  if (loading) {
    return (
      <Card className="w-full h-[400px] flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-10 w-40 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          <div className="h-32 w-32 bg-gray-200 dark:bg-gray-700 rounded-full mb-4"></div>
          <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
          <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </Card>
    )
  }

  if (!holiday) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-500" />
            Holiday Countdown
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center p-6">
          <Gift className="h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
          <p className="text-gray-500 dark:text-gray-400 text-center">No upcoming holidays found for your country.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full overflow-hidden transition-all duration-300 hover:shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Calendar className="h-5 w-5 text-blue-500" />
          Holiday Countdown
          {usingFallback && <span className="text-xs text-amber-500 font-normal ml-2">(Using local data)</span>}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center p-4 rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-4xl font-bold text-purple-600 dark:text-purple-400">{daysRemaining}</span>
            </div>
            <svg className="w-32 h-32 transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="60"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-gray-200 dark:text-gray-700"
              />
              <circle
                cx="64"
                cy="64"
                r="60"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                strokeDasharray="377"
                strokeDashoffset={377 - (377 * progressPercentage) / 100}
                className="text-purple-500 dark:text-purple-400 transition-all duration-1000 ease-in-out"
              />
            </svg>
          </div>

          <h3 className="text-xl font-bold text-center mb-1">{holiday.localName}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-4">{formatDate(holiday.date)}</p>

          <div className="w-full mt-2">
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
              <span>Today</span>
              <span>{holiday.localName}</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>

          <div className="mt-4 p-3 bg-white/80 dark:bg-gray-800/50 rounded-lg w-full text-center">
            <p className="text-sm">
              <span className="font-medium">Fun fact:</span> {holiday.localName}
              {holiday.localName !== holiday.name ? ` (${holiday.name})` : ""} is a public holiday in{" "}
              {locationData.country}.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
