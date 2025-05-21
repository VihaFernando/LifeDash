"use client"

import { useEffect, useState } from "react"
import {
  Cloud,
  CloudRain,
  CloudSnow,
  Droplets,
  Sun,
  Sunrise,
  Sunset,
  ThermometerSun,
  Wind,
  RefreshCw,
  CloudLightning,
  CloudFog,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface LocationData {
  loc: string
  timezone: string
}

interface WeatherData {
  current: {
    temperature_2m: number
    apparent_temperature: number
    relative_humidity_2m: number
    precipitation: number
    weather_code: number
    wind_speed_10m: number
    is_day: number
  }
  daily: {
    time: string[]
    temperature_2m_max: number[]
    temperature_2m_min: number[]
    weather_code: number[]
    sunrise: string[]
    sunset: string[]
  }
  hourly?: {
    time: string[]
    temperature_2m: number[]
    precipitation_probability: number[]
    weather_code: number[]
  }
}

interface WeatherPanelProps {
  locationData: LocationData
}

export function WeatherPanel({ locationData }: WeatherPanelProps) {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedDay, setSelectedDay] = useState<number>(0)

  const fetchWeatherData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [lat, lon] = locationData.loc.split(",")

      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,is_day&hourly=temperature_2m,precipitation_probability,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset&timezone=${locationData.timezone}`,
      )

      if (!response.ok) {
        throw new Error(`Weather API returned ${response.status}`)
      }

      const data = await response.json()
      setWeatherData(data)
      setError(null)

      // Cache the weather data
      localStorage.setItem("weather-data", JSON.stringify(data))
      localStorage.setItem("weather-timestamp", Date.now().toString())
    } catch (error) {
      console.error("Error fetching weather data:", error)
      setError("Failed to load weather data")

      // Try to use cached data if available
      const cachedData = localStorage.getItem("weather-data")
      const cachedTimestamp = localStorage.getItem("weather-timestamp")

      if (cachedData && cachedTimestamp) {
        try {
          const parsedData = JSON.parse(cachedData)
          const timestamp = Number.parseInt(cachedTimestamp)
          const now = Date.now()

          // Only use cached data if it's less than 6 hours old
          if (now - timestamp < 6 * 60 * 60 * 1000) {
            setWeatherData(parsedData)
            setError("Using cached weather data")
          }
        } catch (e) {
          console.error("Error parsing cached weather data:", e)
        }
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    if (locationData) {
      fetchWeatherData()
    }
  }, [locationData])

  const handleRefresh = () => {
    setRefreshing(true)
    fetchWeatherData()
  }

  const getWeatherIcon = (code: number, isDay = 1, size = "h-6 w-6") => {
    // WMO Weather interpretation codes
    if (code === 0)
      return isDay ? <Sun className={`${size} text-yellow-500`} /> : <Sun className={`${size} text-gray-400`} />
    if (code >= 1 && code <= 3) return <Cloud className={`${size} text-gray-400`} />
    if (code >= 45 && code <= 48) return <CloudFog className={`${size} text-gray-400`} />
    if (code >= 51 && code <= 67) return <CloudRain className={`${size} text-blue-400`} />
    if (code >= 71 && code <= 86) return <CloudSnow className={`${size} text-blue-200`} />
    if (code >= 95 && code <= 99) return <CloudLightning className={`${size} text-purple-500`} />
    return <Cloud className={`${size} text-gray-400`} />
  }

  const getWeatherDescription = (code: number) => {
    if (code === 0) return "Clear sky"
    if (code === 1) return "Mainly clear"
    if (code === 2) return "Partly cloudy"
    if (code === 3) return "Overcast"
    if (code >= 45 && code <= 48) return "Fog"
    if (code >= 51 && code <= 55) return "Light drizzle"
    if (code >= 56 && code <= 57) return "Freezing drizzle"
    if (code >= 61 && code <= 65) return "Rain"
    if (code >= 66 && code <= 67) return "Freezing rain"
    if (code >= 71 && code <= 75) return "Snow"
    if (code >= 77 && code <= 77) return "Snow grains"
    if (code >= 80 && code <= 82) return "Rain showers"
    if (code >= 85 && code <= 86) return "Snow showers"
    if (code >= 95 && code <= 95) return "Thunderstorm"
    if (code >= 96 && code <= 99) return "Thunderstorm with hail"
    return "Unknown"
  }

  const formatTime = (timeString: string) => {
    const date = new Date(timeString)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })
  }

  const formatHour = (timeString: string) => {
    const date = new Date(timeString)
    return date.toLocaleTimeString([], { hour: "numeric" })
  }

  const getHourlyForecast = () => {
    if (!weatherData?.hourly) return []

    const now = new Date()
    const currentHour = now.getHours()

    // Get the next 24 hours of forecast
    const hourlyData = []
    let startIndex = 0

    // Find the current hour in the hourly data
    for (let i = 0; i < weatherData.hourly.time.length; i++) {
      const forecastDate = new Date(weatherData.hourly.time[i])
      if (forecastDate > now) {
        startIndex = i
        break
      }
    }

    // Get 24 hours of data
    for (let i = 0; i < 24; i++) {
      const index = startIndex + i
      if (index < weatherData.hourly.time.length) {
        hourlyData.push({
          time: weatherData.hourly.time[index],
          temperature: weatherData.hourly.temperature_2m[index],
          precipitation: weatherData.hourly.precipitation_probability[index],
          weatherCode: weatherData.hourly.weather_code[index],
        })
      }
    }

    return hourlyData
  }

  if (loading && !weatherData) {
    return (
      <Card className="w-full h-[400px] flex items-center justify-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-10 w-40 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          <div className="h-32 w-32 bg-gray-200 dark:bg-gray-700 rounded-full mb-4"></div>
          <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
          <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="w-full overflow-hidden transition-all duration-300 hover:shadow-md bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2">
          <ThermometerSun className="h-5 w-5 text-blue-500" />
          Weather Forecast
        </CardTitle>
        <button
          onClick={handleRefresh}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Refresh weather"
          disabled={refreshing}
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
        </button>
      </CardHeader>
      <CardContent>
        {error && !weatherData && (
          <div className="p-8 text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {weatherData && (
          <Tabs defaultValue="current" className="w-full">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="current">Current</TabsTrigger>
              <TabsTrigger value="hourly">Hourly</TabsTrigger>
              <TabsTrigger value="forecast">7-Day Forecast</TabsTrigger>
            </TabsList>

            <TabsContent value="current" className="mt-0">
              <div className="flex flex-col items-center p-4 rounded-lg bg-gradient-to-br from-blue-50/80 to-blue-100/80 dark:from-blue-900/20 dark:to-blue-800/20">
                <div className="flex items-center justify-center mb-2">
                  <div className="text-center">
                    <div className="flex justify-center mb-2">
                      {getWeatherIcon(weatherData.current.weather_code, weatherData.current.is_day, "h-16 w-16")}
                    </div>
                    <div className="text-4xl font-bold">{Math.round(weatherData.current.temperature_2m)}°C</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Feels like {Math.round(weatherData.current.apparent_temperature)}°C
                    </div>
                    <div className="text-md font-medium mt-1">
                      {getWeatherDescription(weatherData.current.weather_code)}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full mt-6">
                  <div className="flex flex-col items-center p-3 rounded-lg bg-white/90 dark:bg-gray-800/50 transition-all duration-300 hover:bg-white dark:hover:bg-gray-800 shadow-sm">
                    <Droplets className="h-5 w-5 text-blue-500 mb-1" />
                    <span className="text-sm font-medium">{weatherData.current.relative_humidity_2m}%</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Humidity</span>
                  </div>

                  <div className="flex flex-col items-center p-3 rounded-lg bg-white/90 dark:bg-gray-800/50 transition-all duration-300 hover:bg-white dark:hover:bg-gray-800 shadow-sm">
                    <Wind className="h-5 w-5 text-blue-500 mb-1" />
                    <span className="text-sm font-medium">{weatherData.current.wind_speed_10m} km/h</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Wind</span>
                  </div>

                  <div className="flex flex-col items-center p-3 rounded-lg bg-white/90 dark:bg-gray-800/50 transition-all duration-300 hover:bg-white dark:hover:bg-gray-800 shadow-sm">
                    <Sunrise className="h-5 w-5 text-orange-500 mb-1" />
                    <span className="text-sm font-medium">{formatTime(weatherData.daily.sunrise[0])}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Sunrise</span>
                  </div>

                  <div className="flex flex-col items-center p-3 rounded-lg bg-white/90 dark:bg-gray-800/50 transition-all duration-300 hover:bg-white dark:hover:bg-gray-800 shadow-sm">
                    <Sunset className="h-5 w-5 text-red-500 mb-1" />
                    <span className="text-sm font-medium">{formatTime(weatherData.daily.sunset[0])}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Sunset</span>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="hourly" className="mt-0">
              <div className="rounded-lg bg-gradient-to-br from-blue-50/80 to-blue-100/80 dark:from-blue-900/20 dark:to-blue-800/20 p-4">
                <div className="flex overflow-x-auto pb-2 space-x-4">
                  {getHourlyForecast().map((hour, index) => (
                    <div
                      key={index}
                      className="flex-shrink-0 w-20 p-3 rounded-lg bg-white/90 dark:bg-gray-800/50 flex flex-col items-center shadow-sm"
                    >
                      <span className="text-xs font-medium">{formatHour(hour.time)}</span>
                      {getWeatherIcon(hour.weatherCode, 1, "h-5 w-5")}
                      <span className="text-sm font-bold mt-1">{Math.round(hour.temperature)}°</span>
                      <span className="text-xs text-blue-500 mt-1">{hour.precipitation}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="forecast" className="mt-0">
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                {weatherData.daily.time.map((day, index) => (
                  <div
                    key={day}
                    className={`flex flex-col items-center p-3 rounded-lg ${
                      selectedDay === index ? "bg-blue-100/90 dark:bg-blue-900/50" : "bg-white/90 dark:bg-gray-800/50"
                    } transition-all duration-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 shadow-sm cursor-pointer`}
                    onClick={() => setSelectedDay(index)}
                  >
                    <span className="text-xs font-medium mb-1">{formatDate(day)}</span>
                    {getWeatherIcon(weatherData.daily.weather_code[index])}
                    <div className="flex items-center gap-1 mt-2">
                      <span className="text-xs font-bold text-red-500">
                        {Math.round(weatherData.daily.temperature_2m_max[index])}°
                      </span>
                      <span className="text-xs text-gray-400">|</span>
                      <span className="text-xs font-medium text-blue-500">
                        {Math.round(weatherData.daily.temperature_2m_min[index])}°
                      </span>
                    </div>
                    <span className="text-xs mt-1 text-center">
                      {getWeatherDescription(weatherData.daily.weather_code[index])}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-3 bg-blue-50/80 dark:bg-blue-900/20 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium">{formatDate(weatherData.daily.time[selectedDay])}</h3>
                  <div className="flex items-center">
                    {getWeatherIcon(weatherData.daily.weather_code[selectedDay])}
                    <span className="ml-1 text-sm">
                      {getWeatherDescription(weatherData.daily.weather_code[selectedDay])}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div className="flex items-center p-2 bg-white/80 dark:bg-gray-800/50 rounded">
                    <Sunrise className="h-4 w-4 text-orange-500 mr-2" />
                    <div>
                      <span className="text-xs text-gray-500">Sunrise</span>
                      <p className="text-sm font-medium">{formatTime(weatherData.daily.sunrise[selectedDay])}</p>
                    </div>
                  </div>

                  <div className="flex items-center p-2 bg-white/80 dark:bg-gray-800/50 rounded">
                    <Sunset className="h-4 w-4 text-red-500 mr-2" />
                    <div>
                      <span className="text-xs text-gray-500">Sunset</span>
                      <p className="text-sm font-medium">{formatTime(weatherData.daily.sunset[selectedDay])}</p>
                    </div>
                  </div>

                  <div className="flex items-center p-2 bg-white/80 dark:bg-gray-800/50 rounded">
                    <ThermometerSun className="h-4 w-4 text-red-500 mr-2" />
                    <div>
                      <span className="text-xs text-gray-500">High</span>
                      <p className="text-sm font-medium">
                        {Math.round(weatherData.daily.temperature_2m_max[selectedDay])}°C
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center p-2 bg-white/80 dark:bg-gray-800/50 rounded">
                    <ThermometerSun className="h-4 w-4 text-blue-500 mr-2" />
                    <div>
                      <span className="text-xs text-gray-500">Low</span>
                      <p className="text-sm font-medium">
                        {Math.round(weatherData.daily.temperature_2m_min[selectedDay])}°C
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  )
}
