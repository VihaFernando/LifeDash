"use client"

import { MapPin, Wifi, Clock, CheckCircle2, AlertCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface LocationData {
  ip: string
  city: string
  region: string
  country: string
  loc: string
  timezone: string
  org?: string
  postal?: string
  isAccurate?: boolean
}

interface LocationInsightsProps {
  locationData: LocationData
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
  ZA: "South Africa",
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

// Function to get country name from country code
const getCountryName = (countryCode: string): string => {
  return countryCodeToName[countryCode] || countryCode
}

export function LocationInsights({ locationData }: LocationInsightsProps) {
  const countryCode = locationData.country.toLowerCase()

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <Card className="overflow-hidden transition-all duration-300 hover:shadow-md bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
        <CardContent className="p-0">
          <div className="flex items-center gap-3 p-4">
            <div className="flex-shrink-0 h-12 w-12 rounded-full bg-blue-100/80 dark:bg-blue-900/30 flex items-center justify-center">
              <MapPin className="h-6 w-6 text-blue-500" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-1">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Location</p>
                {locationData.isAccurate ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-500">
                    <title>Precise location</title>
                  </CheckCircle2>
                ) : (
                  <AlertCircle className="h-3.5 w-3.5 text-amber-500">
                    <title>Approximate location</title>
                  </AlertCircle>
                )}
              </div>
              <p className="font-semibold text-gray-800 dark:text-gray-200">
                {locationData.city}, {locationData.region}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

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
