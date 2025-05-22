"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Search, MapPin, X } from "lucide-react"
import { Input } from "@/components/ui/input"

interface LocationSearchProps {
  onLocationSelect: (locationData: any) => void
  currentLocation: {
    city: string
    region: string
    country: string
  }
}

// Mock geocoding data for demonstration
const mockLocations = [
  {
    city: "New York",
    region: "New York",
    country: "US",
    loc: "40.7128,-74.0060",
    timezone: "America/New_York",
    ip: "0.0.0.0", // Placeholder
    org: "AS0000 Demo ISP", // Placeholder
  },
  {
    city: "London",
    region: "England",
    country: "GB",
    loc: "51.5074,-0.1278",
    timezone: "Europe/London",
    ip: "0.0.0.0", // Placeholder
    org: "AS0000 Demo ISP", // Placeholder
  },
  {
    city: "Tokyo",
    region: "Tokyo",
    country: "JP",
    loc: "35.6762,139.6503",
    timezone: "Asia/Tokyo",
    ip: "0.0.0.0", // Placeholder
    org: "AS0000 Demo ISP", // Placeholder
  },
  {
    city: "Sydney",
    region: "New South Wales",
    country: "AU",
    loc: "-33.8688,151.2093",
    timezone: "Australia/Sydney",
    ip: "0.0.0.0", // Placeholder
    org: "AS0000 Demo ISP", // Placeholder
  },
  {
    city: "Paris",
    region: "Île-de-France",
    country: "FR",
    loc: "48.8566,2.3522",
    timezone: "Europe/Paris",
    ip: "0.0.0.0", // Placeholder
    org: "AS0000 Demo ISP", // Placeholder
  },
  {
    city: "Berlin",
    region: "Berlin",
    country: "DE",
    loc: "52.5200,13.4050",
    timezone: "Europe/Berlin",
    ip: "0.0.0.0", // Placeholder
    org: "AS0000 Demo ISP", // Placeholder
  },
  {
    city: "Toronto",
    region: "Ontario",
    country: "CA",
    loc: "43.6532,-79.3832",
    timezone: "America/Toronto",
    ip: "0.0.0.0", // Placeholder
    org: "AS0000 Demo ISP", // Placeholder
  },
  {
    city: "Mumbai",
    region: "Maharashtra",
    country: "IN",
    loc: "19.0760,72.8777",
    timezone: "Asia/Kolkata",
    ip: "0.0.0.0", // Placeholder
    org: "AS0000 Demo ISP", // Placeholder
  },
  {
    city: "Singapore",
    region: "Singapore",
    country: "SG",
    loc: "1.3521,103.8198",
    timezone: "Asia/Singapore",
    ip: "0.0.0.0", // Placeholder
    org: "AS0000 Demo ISP", // Placeholder
  },
  {
    city: "Dubai",
    region: "Dubai",
    country: "AE",
    loc: "25.2048,55.2708",
    timezone: "Asia/Dubai",
    ip: "0.0.0.0", // Placeholder
    org: "AS0000 Demo ISP", // Placeholder
  },
]

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
}

export function LocationSearch({ onLocationSelect, currentLocation }: LocationSearchProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Search for locations
  const searchLocations = (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)

    // Simulate API call delay
    setTimeout(() => {
      const results = mockLocations.filter(
        (location) =>
          location.city.toLowerCase().includes(query.toLowerCase()) ||
          location.region.toLowerCase().includes(query.toLowerCase()) ||
          countryCodeToName[location.country]?.toLowerCase().includes(query.toLowerCase()),
      )

      setSearchResults(results)
      setIsSearching(false)
    }, 500)
  }

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)
    searchLocations(query)
  }

  // Handle location selection
  const handleLocationSelect = (location: any) => {
    onLocationSelect(location)
    setSearchQuery("")
    setSearchResults([])
    setShowResults(false)
  }

  // Clear search
  const clearSearch = () => {
    setSearchQuery("")
    setSearchResults([])
  }

  return (
    <div className="relative w-full" ref={searchRef}>
      <div className="relative">
        <Input
          type="text"
          placeholder="Search for a location..."
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={() => setShowResults(true)}
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

      {showResults && (searchResults.length > 0 || isSearching) && (
        <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 shadow-lg rounded-md border border-gray-200 dark:border-gray-700 max-h-60 overflow-auto">
          {isSearching ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              <div className="animate-spin inline-block w-5 h-5 border-2 border-current border-t-transparent rounded-full mr-2"></div>
              Searching...
            </div>
          ) : (
            searchResults.map((location, index) => (
              <div
                key={index}
                className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center"
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
            ))
          )}
        </div>
      )}

      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex items-center">
        <MapPin className="h-3 w-3 mr-1" />
        Current: {currentLocation.city}, {currentLocation.region},{" "}
        {countryCodeToName[currentLocation.country] || currentLocation.country}
      </div>
    </div>
  )
}
