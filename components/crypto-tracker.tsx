"use client"

import { useEffect, useState } from "react"
import { ArrowDown, ArrowUp, Coins, Star, RefreshCw } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface CryptoData {
  id: string
  symbol: string
  name: string
  image: string
  current_price: number
  price_change_percentage_24h: number
  sparkline_in_7d: {
    price: number[]
  }
}

export function CryptoTracker() {
  const [cryptoData, setCryptoData] = useState<CryptoData[]>([])
  const [favorites, setFavorites] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const fetchCryptoData = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(
        "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=true&price_change_percentage=24h",
      )

      if (!response.ok) {
        throw new Error("Failed to fetch crypto data")
      }

      const data = await response.json()
      setCryptoData(data)
      setError(null)

      // Cache the data
      localStorage.setItem("crypto-data", JSON.stringify(data))
      localStorage.setItem("crypto-timestamp", Date.now().toString())
    } catch (error) {
      console.error("Error fetching crypto data:", error)
      setError("Failed to load cryptocurrency data")

      // Try to use cached data if available
      const cachedData = localStorage.getItem("crypto-data")
      const cachedTimestamp = localStorage.getItem("crypto-timestamp")

      if (cachedData && cachedTimestamp) {
        try {
          const parsedData = JSON.parse(cachedData)
          const timestamp = Number.parseInt(cachedTimestamp)
          const now = Date.now()

          // Only use cached data if it's less than 1 hour old
          if (now - timestamp < 60 * 60 * 1000) {
            setCryptoData(parsedData)
            setError("Using cached data")
          } else {
            // Set fallback data if cached data is too old
            setFallbackData()
          }
        } catch (e) {
          console.error("Error parsing cached data:", e)
          setFallbackData()
        }
      } else {
        setFallbackData()
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const setFallbackData = () => {
    // Set fallback data if API fails and no valid cache
    setCryptoData([
      {
        id: "bitcoin",
        symbol: "btc",
        name: "Bitcoin",
        image: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
        current_price: 65432.1,
        price_change_percentage_24h: 2.5,
        sparkline_in_7d: { price: [64000, 64500, 65000, 64800, 65200, 65400, 65432] },
      },
      {
        id: "ethereum",
        symbol: "eth",
        name: "Ethereum",
        image: "https://assets.coingecko.com/coins/images/279/large/ethereum.png",
        current_price: 3521.45,
        price_change_percentage_24h: 1.8,
        sparkline_in_7d: { price: [3400, 3450, 3500, 3480, 3510, 3520, 3521] },
      },
      {
        id: "tether",
        symbol: "usdt",
        name: "Tether",
        image: "https://assets.coingecko.com/coins/images/325/large/Tether.png",
        current_price: 1.0,
        price_change_percentage_24h: 0.01,
        sparkline_in_7d: { price: [1, 1, 1, 1, 1, 1, 1] },
      },
      {
        id: "binancecoin",
        symbol: "bnb",
        name: "Binance Coin",
        image: "https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png",
        current_price: 608.32,
        price_change_percentage_24h: -0.8,
        sparkline_in_7d: { price: [615, 610, 605, 608, 607, 609, 608] },
      },
      {
        id: "solana",
        symbol: "sol",
        name: "Solana",
        image: "https://assets.coingecko.com/coins/images/4128/large/solana.png",
        current_price: 142.75,
        price_change_percentage_24h: 3.2,
        sparkline_in_7d: { price: [135, 138, 140, 139, 141, 143, 142] },
      },
    ])
  }

  useEffect(() => {
    fetchCryptoData()

    // Load favorites from localStorage
    const savedFavorites = localStorage.getItem("crypto-favorites")
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites))
    }
  }, [])

  const handleRefresh = () => {
    setRefreshing(true)
    fetchCryptoData()
  }

  const toggleFavorite = (id: string) => {
    const newFavorites = favorites.includes(id) ? favorites.filter((fav) => fav !== id) : [...favorites, id]

    setFavorites(newFavorites)
    localStorage.setItem("crypto-favorites", JSON.stringify(newFavorites))
  }

  const renderSparkline = (prices: number[], change: number) => {
    if (!prices || prices.length === 0) return null

    const min = Math.min(...prices)
    const max = Math.max(...prices)
    const range = max - min

    const points = prices
      .map((price, i) => {
        const x = (i / (prices.length - 1)) * 100
        const y = 100 - ((price - min) / range) * 100
        return `${x},${y}`
      })
      .join(" ")

    return (
      <svg className="w-full h-12" viewBox="0 0 100 100" preserveAspectRatio="none">
        <polyline
          points={points}
          fill="none"
          stroke={change >= 0 ? "#10b981" : "#ef4444"}
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    )
  }

  return (
    <Card className="w-full overflow-hidden transition-all duration-300 hover:shadow-md bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2">
          <Coins className="h-5 w-5 text-blue-500" />
          Crypto Tracker
        </CardTitle>
        <button
          onClick={handleRefresh}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Refresh crypto data"
          disabled={refreshing}
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
        </button>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="text-amber-600 dark:text-amber-400 text-sm mb-4 p-2 bg-amber-50 dark:bg-amber-900/20 rounded-md">
            {error}
          </div>
        )}

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="all">All Cryptocurrencies</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-0">
            <div className="h-[400px] overflow-y-auto pr-1">
              <div className="space-y-3">
                {loading && cryptoData.length === 0 ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className="flex items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 animate-pulse"
                      >
                        <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full mr-3"></div>
                        <div className="flex-1">
                          <div className="h-5 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                          <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        </div>
                        <div className="h-12 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded ml-3"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  cryptoData.map((crypto) => (
                    <div
                      key={crypto.id}
                      className="flex items-center p-3 rounded-lg bg-white/90 dark:bg-gray-800/50 transition-all duration-300 hover:bg-white dark:hover:bg-gray-800 shadow-sm"
                    >
                      <button
                        onClick={() => toggleFavorite(crypto.id)}
                        className="mr-2 focus:outline-none"
                        aria-label={favorites.includes(crypto.id) ? "Remove from favorites" : "Add to favorites"}
                      >
                        <Star
                          className={`h-5 w-5 ${
                            favorites.includes(crypto.id)
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-gray-300 dark:text-gray-600"
                          } transition-colors duration-300`}
                        />
                      </button>

                      <img src={crypto.image || "/placeholder.svg"} alt={crypto.name} className="w-8 h-8 mr-3" />

                      <div className="flex-1">
                        <div className="flex items-center">
                          <h3 className="font-medium">{crypto.name}</h3>
                          <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                            {crypto.symbol.toUpperCase()}
                          </span>
                        </div>
                      </div>

                      <div className="w-24 h-12 mx-2">
                        {renderSparkline(crypto.sparkline_in_7d?.price || [], crypto.price_change_percentage_24h)}
                      </div>

                      <div className="text-right">
                        <div className="font-bold">${crypto.current_price.toLocaleString()}</div>
                        <div
                          className={`flex items-center justify-end text-xs ${
                            crypto.price_change_percentage_24h >= 0 ? "text-green-500" : "text-red-500"
                          }`}
                        >
                          {crypto.price_change_percentage_24h >= 0 ? (
                            <ArrowUp className="h-3 w-3 mr-1" />
                          ) : (
                            <ArrowDown className="h-3 w-3 mr-1" />
                          )}
                          {Math.abs(crypto.price_change_percentage_24h).toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="favorites" className="mt-0">
            <div className="h-[400px] overflow-y-auto pr-1">
              {favorites.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <Star className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">
                    You haven't added any cryptocurrencies to your favorites yet.
                  </p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                    Click the star icon next to a cryptocurrency to add it to your favorites.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cryptoData
                    .filter((crypto) => favorites.includes(crypto.id))
                    .map((crypto) => (
                      <div
                        key={crypto.id}
                        className="flex items-center p-3 rounded-lg bg-white/90 dark:bg-gray-800/50 transition-all duration-300 hover:bg-white dark:hover:bg-gray-800 shadow-sm"
                      >
                        <button
                          onClick={() => toggleFavorite(crypto.id)}
                          className="mr-2 focus:outline-none"
                          aria-label="Remove from favorites"
                        >
                          <Star className="h-5 w-5 text-yellow-400 fill-yellow-400 transition-colors duration-300" />
                        </button>

                        <img src={crypto.image || "/placeholder.svg"} alt={crypto.name} className="w-8 h-8 mr-3" />

                        <div className="flex-1">
                          <div className="flex items-center">
                            <h3 className="font-medium">{crypto.name}</h3>
                            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                              {crypto.symbol.toUpperCase()}
                            </span>
                          </div>
                        </div>

                        <div className="w-24 h-12 mx-2">
                          {renderSparkline(crypto.sparkline_in_7d?.price || [], crypto.price_change_percentage_24h)}
                        </div>

                        <div className="text-right">
                          <div className="font-bold">${crypto.current_price.toLocaleString()}</div>
                          <div
                            className={`flex items-center justify-end text-xs ${
                              crypto.price_change_percentage_24h >= 0 ? "text-green-500" : "text-red-500"
                            }`}
                          >
                            {crypto.price_change_percentage_24h >= 0 ? (
                              <ArrowUp className="h-3 w-3 mr-1" />
                            ) : (
                              <ArrowDown className="h-3 w-3 mr-1" />
                            )}
                            {Math.abs(crypto.price_change_percentage_24h).toFixed(2)}%
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
