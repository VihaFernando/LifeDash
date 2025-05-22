"use client"

import type React from "react"

import { useState, useRef, useEffect, useCallback } from "react"
import { MapPin, Wifi, Clock, Search, X } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

interface LocationData {
  ip: string
  city: string
  region: string
  country: string
  loc: string
  timezone: string
  org?: string
  postal?: string
}

interface LocationInsightsProps {
  locationData: LocationData
  onLocationChange: (newLocation: LocationData) => void
}

interface NominatimResult {
  place_id: number
  licence: string
  osm_type: string
  osm_id: number
  boundingbox: string[]
  lat: string
  lon: string
  display_name: string
  class: string
  type: string
  importance: number
  address: {
    city?: string
    town?: string
    village?: string
    county?: string
    state?: string
    country: string
    country_code: string
    [key: string]: string | undefined
  }
}

// Country code to country name mapping
const countryCodeToName: { [key: string]: string } = {
  US: "United States",
  GB: "United Kingdom",
  CA: "Canada",
  AU: "Australia",
  DE: "Germany",
  FR: "France",
  IT: "Italy",
  ES: "Spain",
  JP: "Japan",
  CN: "China",
  IN: "India",
  BR: "Brazil",
  RU: "Russia",
  ZA: "South Africa",
  MX: "Mexico",
  AR: "Argentina",
  NL: "Netherlands",
  BE: "Belgium",
  SE: "Sweden",
  NO: "Norway",
  DK: "Denmark",
  FI: "Finland",
  PL: "Poland",
  AT: "Austria",
  CH: "Switzerland",
  NZ: "New Zealand",
  SG: "Singapore",
  MY: "Malaysia",
  TH: "Thailand",
  ID: "Indonesia",
  PH: "Philippines",
  VN: "Vietnam",
  TR: "Turkey",
  SA: "Saudi Arabia",
  AE: "United Arab Emirates",
  EG: "Egypt",
  NG: "Nigeria",
  KE: "Kenya",
  IL: "Israel",
  KR: "South Korea",
  TW: "Taiwan",
  HK: "Hong Kong",
  LK: "Sri Lanka",
  PK: "Pakistan",
  BD: "Bangladesh",
  NP: "Nepal",
  // Add more countries as needed
}

// Timezone mapping by country code
const countryTimezones: { [key: string]: string } = {
  US: "America/New_York", // Default for US
  CA: "America/Toronto",
  GB: "Europe/London",
  DE: "Europe/Berlin",
  FR: "Europe/Paris",
  IT: "Europe/Rome",
  ES: "Europe/Madrid",
  JP: "Asia/Tokyo",
  CN: "Asia/Shanghai",
  IN: "Asia/Kolkata",
  AU: "Australia/Sydney",
  RU: "Europe/Moscow",
  BR: "America/Sao_Paulo",
  ZA: "Africa/Johannesburg",
  MX: "America/Mexico_City",
  AR: "America/Argentina/Buenos_Aires",
  NL: "Europe/Amsterdam",
  BE: "Europe/Brussels",
  SE: "Europe/Stockholm",
  NO: "Europe/Oslo",
  DK: "Europe/Copenhagen",
  FI: "Europe/Helsinki",
  PL: "Europe/Warsaw",
  AT: "Europe/Vienna",
  CH: "Europe/Zurich",
  NZ: "Pacific/Auckland",
  SG: "Asia/Singapore",
  MY: "Asia/Kuala_Lumpur",
  TH: "Asia/Bangkok",
  ID: "Asia/Jakarta",
  PH: "Asia/Manila",
  VN: "Asia/Ho_Chi_Minh",
  TR: "Europe/Istanbul",
  SA: "Asia/Riyadh",
  AE: "Asia/Dubai",
  EG: "Africa/Cairo",
  NG: "Africa/Lagos",
  KE: "Africa/Nairobi",
  IL: "Asia/Jerusalem",
  KR: "Asia/Seoul",
  TW: "Asia/Taipei",
  HK: "Asia/Hong_Kong",
  LK: "Asia/Colombo",
  PK: "Asia/Karachi",
  BD: "Asia/Dhaka",
  NP: "Asia/Kathmandu",
}

// Function to get country name from country code
const getCountryName = (countryCode: string): string => {
  return countryCodeToName[countryCode] || countryCode
}

// Function to estimate timezone from coordinates and country
const estimateTimezone = (lat: string, lon: string, countryCode: string): string => {
  // First try to get timezone by country
  if (countryCode && countryTimezones[countryCode]) {
    return countryTimezones[countryCode]
  }

  // If country-based lookup fails, estimate based on longitude
  // This is a very rough approximation
  const longitude = Number.parseFloat(lon)

  // Calculate UTC offset based on longitude (15 degrees = 1 hour)
  const utcOffset = Math.round(longitude / 15)

  // Format the UTC offset
  const hours = Math.abs(utcOffset)
  const sign = utcOffset >= 0 ? "+" : "-"

  return `UTC${sign}${hours.toString().padStart(2, "0")}:00`
}

export function LocationInsights({ locationData, onLocationChange }: LocationInsightsProps) {
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const searchTimeout = useRef<NodeJS.Timeout | null>(null)
  const countryCode = locationData.country.toLowerCase()

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearch(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Search for locations using Nominatim API
  const searchLocations = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)

    try {
      // Use OpenStreetMap Nominatim API for geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          query,
        )}&format=json&addressdetails=1&limit=10`,
        {
          headers: {
            "Accept-Language": "en-US,en;q=0.9",
            "User-Agent": "PulseNest/1.0",
          },
        },
      )

      if (!response.ok) {
        throw new Error(`Geocoding API returned ${response.status}`)
      }

      const data: NominatimResult[] = await response.json()

      // Process and format the results
      const formattedResults = data
        .filter((item) => {
          // Filter out results that don't have enough location data
          const hasCity = !!(item.address.city || item.address.town || item.address.village)
          const hasRegion = !!(item.address.state || item.address.county)
          const hasCountry = !!item.address.country

          return hasCity && hasRegion && hasCountry
        })
        .map((item) => {
          // Extract city, region, and country from the result
          const city = item.address.city || item.address.town || item.address.village || "Unknown"
          const region = item.address.state || item.address.county || "Unknown"
          const country = item.address.country_code.toUpperCase()

          return {
            city,
            region,
            country,
            loc: `${item.lat},${item.lon}`,
            timezone: estimateTimezone(item.lat, item.lon, item.address.country_code.toUpperCase()),
            display_name: item.display_name,
            // Include original data for reference
            original: item,
          }
        })

      setSearchResults(formattedResults)
    } catch (error) {
      console.error("Error searching locations:", error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }, [])

  // Handle input change with debounce
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)

    // Clear any existing timeout
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current)
    }

    // Debounce the search to avoid too many API calls
    searchTimeout.current = setTimeout(() => {
      searchLocations(query)
    }, 500)
  }

  // Handle location selection
  const handleLocationSelect = (location: any) => {
    try {
      // Preserve the original IP and org data
      const newLocationData = {
        ...locationData,
        city: location.city,
        region: location.region,
        country: location.country,
        loc: location.loc,
        timezone: location.timezone,
      }

      onLocationChange(newLocationData)
    } catch (error) {
      console.error("Error updating location:", error)
    } finally {
      setSearchQuery("")
      setSearchResults([])
      setShowSearch(false)
    }
  }

  // Clear search
  const clearSearch = () => {
    setSearchQuery("")
    setSearchResults([])

    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current)
    }
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div ref={searchRef} className="relative">
        <Card
          className="overflow-hidden transition-all duration-300 hover:shadow-md bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 cursor-pointer"
          onClick={() => setShowSearch(true)}
        >
          <CardContent className="p-0">
            <div className="flex items-center gap-3 p-4">
              <div className="flex-shrink-0 h-12 w-12 rounded-full bg-blue-100/80 dark:bg-blue-900/30 flex items-center justify-center">
                <MapPin className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Location</p>
                <p className="font-semibold text-gray-800 dark:text-gray-200">
                  {locationData.city}, {locationData.region}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {showSearch && (
          <div className="absolute z-20 top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-3">
            <div className="relative mb-3">
              <Input
                type="text"
                placeholder="Search for a city..."
                value={searchQuery}
                onChange={handleInputChange}
                autoFocus
                className="pl-10 pr-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="max-h-60 overflow-y-auto">
              {isSearching ? (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                  <div className="animate-spin inline-block w-5 h-5 border-2 border-current border-t-transparent rounded-full mr-2"></div>
                  Searching...
                </div>
              ) : searchResults.length > 0 ? (
                <>
                  {searchResults.map((location, index) => (
                    <div
                      key={index}
                      className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center rounded-md"
                      onClick={() => handleLocationSelect(location)}
                    >
                      <MapPin className="h-4 w-4 text-blue-500 mr-2 flex-shrink-0" />
                      <div>
                        <div className="font-medium">
                          {location.city}, {location.region}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {countryCodeToName[location.country] || location.country}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="text-xs text-gray-400 mt-2 text-center">Data © OpenStreetMap contributors</div>
                </>
              ) : searchQuery ? (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                  No cities found. Try a different search.
                </div>
              ) : (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400">Type to search for a city</div>
              )}
            </div>
          </div>
        )}
      </div>

      <Card className="overflow-hidden transition-all duration-300 hover:shadow-md bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
        <CardContent className="p-0">
          <div className="flex items-center gap-3 p-4">
            <div className="flex-shrink-0 h-12 w-12 rounded-full bg-blue-100/80 dark:bg-blue-900/30 flex items-center justify-center">
              <img
                src={`https://flagcdn.com/w40/${countryCode}.png`}
                alt={`${getCountryName(locationData.country)} flag`}
                className="h-6 rounded"
              />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Country</p>
              <p className="font-semibold text-gray-800 dark:text-gray-200">{getCountryName(locationData.country)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden transition-all duration-300 hover:shadow-md bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
        <CardContent className="p-0">
          <div className="flex items-center gap-3 p-4">
            <div className="flex-shrink-0 h-12 w-12 rounded-full bg-blue-100/80 dark:bg-blue-900/30 flex items-center justify-center">
              <Wifi className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">IP Address</p>
              <p className="font-semibold text-gray-800 dark:text-gray-200">{locationData.ip}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden transition-all duration-300 hover:shadow-md bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
        <CardContent className="p-0">
          <div className="flex items-center gap-3 p-4">
            <div className="flex-shrink-0 h-12 w-12 rounded-full bg-blue-100/80 dark:bg-blue-900/30 flex items-center justify-center">
              <Clock className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Timezone</p>
              <p className="font-semibold text-gray-800 dark:text-gray-200">{locationData.timezone}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
