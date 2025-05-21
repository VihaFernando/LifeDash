"use client"

import { useEffect, useState } from "react"
import { ArrowRight, DollarSign, RefreshCw, Search } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface LocationData {
  country: string
}

interface CurrencyData {
  code: string
  name: string
  symbol: string
}

interface CurrencyConverterProps {
  locationData: LocationData
}

// Comprehensive list of currencies with symbols
const allCurrencies: { [key: string]: CurrencyData } = {
  USD: { code: "USD", name: "US Dollar", symbol: "$" },
  EUR: { code: "EUR", name: "Euro", symbol: "€" },
  GBP: { code: "GBP", name: "British Pound", symbol: "£" },
  JPY: { code: "JPY", name: "Japanese Yen", symbol: "¥" },
  CAD: { code: "CAD", name: "Canadian Dollar", symbol: "C$" },
  AUD: { code: "AUD", name: "Australian Dollar", symbol: "A$" },
  CHF: { code: "CHF", name: "Swiss Franc", symbol: "Fr" },
  CNY: { code: "CNY", name: "Chinese Yuan", symbol: "¥" },
  INR: { code: "INR", name: "Indian Rupee", symbol: "₹" },
  BRL: { code: "BRL", name: "Brazilian Real", symbol: "R$" },
  RUB: { code: "RUB", name: "Russian Ruble", symbol: "₽" },
  KRW: { code: "KRW", name: "South Korean Won", symbol: "₩" },
  SGD: { code: "SGD", name: "Singapore Dollar", symbol: "S$" },
  NZD: { code: "NZD", name: "New Zealand Dollar", symbol: "NZ$" },
  MXN: { code: "MXN", name: "Mexican Peso", symbol: "Mex$" },
  HKD: { code: "HKD", name: "Hong Kong Dollar", symbol: "HK$" },
  TRY: { code: "TRY", name: "Turkish Lira", symbol: "₺" },
  ZAR: { code: "ZAR", name: "South African Rand", symbol: "R" },
  SEK: { code: "SEK", name: "Swedish Krona", symbol: "kr" },
  NOK: { code: "NOK", name: "Norwegian Krone", symbol: "kr" },
  DKK: { code: "DKK", name: "Danish Krone", symbol: "kr" },
  PLN: { code: "PLN", name: "Polish Złoty", symbol: "zł" },
  THB: { code: "THB", name: "Thai Baht", symbol: "฿" },
  IDR: { code: "IDR", name: "Indonesian Rupiah", symbol: "Rp" },
  HUF: { code: "HUF", name: "Hungarian Forint", symbol: "Ft" },
  CZK: { code: "CZK", name: "Czech Koruna", symbol: "Kč" },
  ILS: { code: "ILS", name: "Israeli New Shekel", symbol: "₪" },
  CLP: { code: "CLP", name: "Chilean Peso", symbol: "$" },
  PHP: { code: "PHP", name: "Philippine Peso", symbol: "₱" },
  AED: { code: "AED", name: "United Arab Emirates Dirham", symbol: "د.إ" },
  COP: { code: "COP", name: "Colombian Peso", symbol: "$" },
  SAR: { code: "SAR", name: "Saudi Riyal", symbol: "﷼" },
  MYR: { code: "MYR", name: "Malaysian Ringgit", symbol: "RM" },
  RON: { code: "RON", name: "Romanian Leu", symbol: "lei" },
  LKR: { code: "LKR", name: "Sri Lankan Rupee", symbol: "Rs" },
  NGN: { code: "NGN", name: "Nigerian Naira", symbol: "₦" },
  VND: { code: "VND", name: "Vietnamese Dong", symbol: "₫" },
  PKR: { code: "PKR", name: "Pakistani Rupee", symbol: "₨" },
  EGP: { code: "EGP", name: "Egyptian Pound", symbol: "E£" },
  BGN: { code: "BGN", name: "Bulgarian Lev", symbol: "лв" },
  HRK: { code: "HRK", name: "Croatian Kuna", symbol: "kn" },
  QAR: { code: "QAR", name: "Qatari Riyal", symbol: "﷼" },
  KWD: { code: "KWD", name: "Kuwaiti Dinar", symbol: "د.ك" },
  ISK: { code: "ISK", name: "Icelandic Króna", symbol: "kr" },
  KES: { code: "KES", name: "Kenyan Shilling", symbol: "KSh" },
  BHD: { code: "BHD", name: "Bahraini Dinar", symbol: ".د.ب" },
  ARS: { code: "ARS", name: "Argentine Peso", symbol: "$" },
  PEN: { code: "PEN", name: "Peruvian Sol", symbol: "S/" },
  UAH: { code: "UAH", name: "Ukrainian Hryvnia", symbol: "₴" },
}

// Country code to currency code mapping (expanded)
const countryCurrencyMap: { [key: string]: string } = {
  US: "USD",
  GB: "GBP",
  DE: "EUR",
  FR: "EUR",
  IT: "EUR",
  ES: "EUR",
  JP: "JPY",
  CN: "CNY",
  CA: "CAD",
  AU: "AUD",
  CH: "CHF",
  IN: "INR",
  BR: "BRL",
  RU: "RUB",
  KR: "KRW",
  SG: "SGD",
  NZ: "NZD",
  MX: "MXN",
  HK: "HKD",
  TR: "TRY",
  ZA: "ZAR",
  SE: "SEK",
  NO: "NOK",
  DK: "DKK",
  PL: "PLN",
  TH: "THB",
  ID: "IDR",
  HU: "HUF",
  CZ: "CZK",
  IL: "ILS",
  CL: "CLP",
  PH: "PHP",
  AE: "AED",
  CO: "COP",
  SA: "SAR",
  MY: "MYR",
  RO: "RON",
  LK: "LKR",
  NG: "NGN",
  VN: "VND",
  PK: "PKR",
  EG: "EGP",
  BG: "BGN",
  HR: "HRK",
  QA: "QAR",
  KW: "KWD",
  IS: "ISK",
  KE: "KES",
  BH: "BHD",
  AR: "ARS",
  PE: "PEN",
  UA: "UAH",
}

export function CurrencyConverter({ locationData }: CurrencyConverterProps) {
  const [amount, setAmount] = useState<string>("1")
  const [fromCurrency, setFromCurrency] = useState<string>("USD")
  const [toCurrency, setToCurrency] = useState<string>("EUR")
  const [result, setResult] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [converting, setConverting] = useState(false)
  const [rates, setRates] = useState<{ [key: string]: number }>({})
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [lastUpdated, setLastUpdated] = useState<string>("")

  // Hardcoded exchange rates as fallback (approximate values as of May 2025)
  const fallbackRates: { [key: string]: number } = {
    USD: 1.0,
    EUR: 0.93,
    GBP: 0.79,
    JPY: 151.72,
    CAD: 1.36,
    AUD: 1.51,
    CHF: 0.91,
    CNY: 7.24,
    INR: 83.12,
    BRL: 5.06,
    RUB: 92.5,
    KRW: 1345.2,
    SGD: 1.35,
    NZD: 1.63,
    MXN: 16.82,
    HKD: 7.82,
    TRY: 32.15,
    ZAR: 18.45,
    SEK: 10.42,
    NOK: 10.65,
    DKK: 6.92,
    PLN: 3.94,
    THB: 35.67,
    IDR: 15650,
    HUF: 354.2,
    CZK: 22.94,
    ILS: 3.67,
    CLP: 912.5,
    PHP: 56.78,
    AED: 3.67,
    COP: 3950,
    SAR: 3.75,
    MYR: 4.65,
    RON: 4.62,
    LKR: 310.25,
    NGN: 1450,
    VND: 25000,
    PKR: 278.5,
    EGP: 48.2,
    BGN: 1.82,
    HRK: 7.02,
    QAR: 3.64,
    KWD: 0.31,
    ISK: 138.5,
    KES: 128.3,
    BHD: 0.376,
    ARS: 880,
    PEN: 3.72,
    UAH: 39.5,
  }

  useEffect(() => {
    // Set default currencies based on user's country
    if (locationData.country && countryCurrencyMap[locationData.country]) {
      setToCurrency(countryCurrencyMap[locationData.country])
    }

    // Try to load cached rates
    const cachedRates = localStorage.getItem("currency-rates")
    const cachedTimestamp = localStorage.getItem("currency-rates-timestamp")

    if (cachedRates && cachedTimestamp) {
      try {
        const parsedRates = JSON.parse(cachedRates)
        const timestamp = Number.parseInt(cachedTimestamp)
        const now = Date.now()

        // Only use cached rates if they're less than 6 hours old
        if (now - timestamp < 6 * 60 * 60 * 1000) {
          setRates(parsedRates)
          setLastUpdated(new Date(timestamp).toLocaleString())
          return
        }
      } catch (e) {
        console.error("Error parsing cached rates:", e)
      }
    }

    // Fetch fresh rates if no valid cache
    fetchExchangeRates()
  }, [locationData])

  const fetchExchangeRates = async () => {
    setLoading(true)
    setError(null)

    try {
      // Try multiple free exchange rate APIs
      const apis = [
        "https://open.er-api.com/v6/latest/USD",
        "https://api.exchangerate.host/latest?base=USD",
        "https://api.exchangerate-api.com/v4/latest/USD",
      ]

      let success = false

      for (const api of apis) {
        try {
          const response = await fetch(api)

          if (response.ok) {
            const data = await response.json()

            // Different APIs have different response structures
            const fetchedRates = data.rates || (data.conversion_rates ? data.conversion_rates : null)

            if (fetchedRates && Object.keys(fetchedRates).length > 0) {
              setRates(fetchedRates)
              const timestamp = Date.now()
              setLastUpdated(new Date(timestamp).toLocaleString())

              // Cache the rates
              localStorage.setItem("currency-rates", JSON.stringify(fetchedRates))
              localStorage.setItem("currency-rates-timestamp", timestamp.toString())

              success = true
              break
            }
          }
        } catch (e) {
          console.error(`API ${api} failed:`, e)
          // Continue to next API
        }
      }

      if (!success) {
        console.warn("All exchange rate APIs failed, using fallback rates")
        setRates(fallbackRates)
        setLastUpdated("Using fallback rates")
        setError("Could not fetch live rates. Using approximate values.")
      }
    } catch (error) {
      console.error("Error fetching exchange rates:", error)
      setError("Failed to fetch exchange rates. Using approximate values.")
      setRates(fallbackRates)
      setLastUpdated("Using fallback rates")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (fromCurrency && toCurrency && amount && rates && Object.keys(rates).length > 0) {
      try {
        // Convert amount based on exchange rates
        let fromRate = rates[fromCurrency]
        let toRate = rates[toCurrency]

        // If rates are missing, use fallback
        if (!fromRate) fromRate = fallbackRates[fromCurrency] || 1
        if (!toRate) toRate = fallbackRates[toCurrency] || 1

        const convertedAmount = (Number.parseFloat(amount) / fromRate) * toRate
        setResult(convertedAmount)
        setError(null)
      } catch (error) {
        console.error("Conversion error:", error)
        setError("Error calculating conversion")
        setResult(null)
      }
    }
  }, [fromCurrency, toCurrency, amount, rates])

  const handleConvert = () => {
    setConverting(true)
    fetchExchangeRates().then(() => {
      setTimeout(() => {
        setConverting(false)
      }, 500)
    })
  }

  const handleSwapCurrencies = () => {
    setFromCurrency(toCurrency)
    setToCurrency(fromCurrency)
  }

  // Filter currencies based on search query
  const filteredCurrencies = Object.entries(allCurrencies)
    .filter(
      ([code, currency]) =>
        searchQuery === "" ||
        code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        currency.name.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    .sort((a, b) => a[1].name.localeCompare(b[1].name))

  return (
    <Card className="w-full overflow-hidden transition-all duration-300 hover:shadow-md bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-blue-500" />
          Currency Converter
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col space-y-2">
            <label htmlFor="amount" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Amount
            </label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-gray-50 dark:bg-gray-800/50"
              placeholder="Enter amount"
              min="0"
              step="0.01"
            />
          </div>

          <div className="grid grid-cols-[1fr,auto,1fr] gap-2 items-center">
            <div className="flex flex-col space-y-2">
              <label htmlFor="from-currency" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                From
              </label>
              <Select value={fromCurrency} onValueChange={setFromCurrency}>
                <SelectTrigger id="from-currency" className="bg-gray-50 dark:bg-gray-800/50">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  <div className="p-2 sticky top-0 bg-white dark:bg-gray-800 z-10">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search currencies..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="max-h-[200px] overflow-auto">
                    {filteredCurrencies.map(([code, currency]) => (
                      <SelectItem key={code} value={code}>
                        <div className="flex items-center">
                          <span className="mr-2">{currency.symbol}</span>
                          <span>{code}</span>
                          <span className="ml-2 text-xs text-gray-500 truncate">- {currency.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </div>
                </SelectContent>
              </Select>
            </div>

            <button
              onClick={handleSwapCurrencies}
              className="mt-6 p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
              aria-label="Swap currencies"
            >
              <ArrowRight className="h-4 w-4" />
            </button>

            <div className="flex flex-col space-y-2">
              <label htmlFor="to-currency" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                To
              </label>
              <Select value={toCurrency} onValueChange={setToCurrency}>
                <SelectTrigger id="to-currency" className="bg-gray-50 dark:bg-gray-800/50">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  <div className="p-2 sticky top-0 bg-white dark:bg-gray-800 z-10">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search currencies..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="max-h-[200px] overflow-auto">
                    {filteredCurrencies.map(([code, currency]) => (
                      <SelectItem key={code} value={code}>
                        <div className="flex items-center">
                          <span className="mr-2">{currency.symbol}</span>
                          <span>{code}</span>
                          <span className="ml-2 text-xs text-gray-500 truncate">- {currency.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </div>
                </SelectContent>
              </Select>
            </div>
          </div>

          <button
            onClick={handleConvert}
            className="w-full py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center"
          >
            {converting ? <RefreshCw className="h-5 w-5 animate-spin" /> : "Convert"}
          </button>

          {error && <div className="text-sm text-amber-600 dark:text-amber-400 text-center">{error}</div>}

          {result !== null && (
            <div className="mt-4 p-4 rounded-lg bg-gradient-to-r from-blue-50/80 to-teal-50/80 dark:from-blue-900/20 dark:to-teal-900/20 text-center">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {Number.parseFloat(amount).toLocaleString()} {fromCurrency} =
              </div>
              <div className="text-2xl font-bold text-gray-800 dark:text-gray-100 mt-1 transition-all duration-300">
                {result.toLocaleString(undefined, { maximumFractionDigits: 4 })} {toCurrency}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                1 {fromCurrency} ={" "}
                {(
                  (rates[toCurrency] || fallbackRates[toCurrency] || 1) /
                  (rates[fromCurrency] || fallbackRates[fromCurrency] || 1)
                ).toFixed(6)}{" "}
                {toCurrency}
              </div>
              <div className="text-xs text-gray-400 mt-2">Rates last updated: {lastUpdated}</div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
