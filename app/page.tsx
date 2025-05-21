"use client"

import { useEffect, useState } from "react"
import { Clock } from "@/components/clock"
import { CryptoTracker } from "@/components/crypto-tracker"
import { CurrencyConverter } from "@/components/currency-converter"
import { LocationInsights } from "@/components/location-insights"
import { ThemeToggle } from "@/components/theme-toggle"
import { WeatherPanel } from "@/components/weather-panel"
import { Loader } from "@/components/loader"
import { SpeedTest } from "@/components/speed-test"
import { AirQualityMonitor } from "@/components/air-quality-monitor"

interface LocationData {
  ip: string
  city: string
  region: string
  country: string
  loc: string
  timezone: string
  org: string
  postal?: string
}

export default function Dashboard() {
  const [locationData, setLocationData] = useState<LocationData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLocationData = async () => {
      try {
        const response = await fetch(`https://ipinfo.io/json?token=6599e8e6d1890f`)
        const data = await response.json()
        setLocationData(data)
      } catch (error) {
        console.error("Error fetching location data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchLocationData()
  }, [])

  if (loading) {
    return <Loader />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      <header className="sticky top-0 z-10 backdrop-blur-md bg-white/70 dark:bg-gray-900/70 border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-teal-400">
            PulseNest
          </h1>
          <div className="flex items-center gap-4">
            <Clock />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {locationData && (
          <>
            <LocationInsights locationData={locationData} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <WeatherPanel locationData={locationData} />
              <SpeedTest locationData={locationData} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <div className="lg:col-span-2">
                <CryptoTracker />
              </div>
              <div>
                <CurrencyConverter locationData={locationData} />
              </div>
            </div>

            <div className="mb-6">
              <AirQualityMonitor locationData={locationData} />
            </div>
          </>
        )}
      </main>
    </div>
  )
}
