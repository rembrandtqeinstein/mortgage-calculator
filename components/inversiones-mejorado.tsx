"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, X, TrendingUp, TrendingDown, Plus, RefreshCw, AlertCircle } from "lucide-react"
import { Line } from 'recharts'
import { LineChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface StockDetails {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  currency: string
  marketCap: number
  peRatio: number
  eps: number
  dividendYield: number
  beta: number
  fiftyTwoWeekHigh: number
  fiftyTwoWeekLow: number
  volume: number
  avgVolume: number
  marketState: string
}

interface HistoricalData {
  date: string
  price: number
}

const POPULAR_STOCKS = [
  // Spanish
  { symbol: 'SAN.MC', name: 'Santander', market: '🇪🇸' },
  { symbol: 'BBVA.MC', name: 'BBVA', market: '🇪🇸' },
  { symbol: 'TEF.MC', name: 'Telefónica', market: '🇪🇸' },
  { symbol: 'IBE.MC', name: 'Iberdrola', market: '🇪🇸' },
  { symbol: 'ITX.MC', name: 'Inditex', market: '🇪🇸' },
  // US Tech
  { symbol: 'AAPL', name: 'Apple', market: '🇺🇸' },
  { symbol: 'MSFT', name: 'Microsoft', market: '🇺🇸' },
  { symbol: 'GOOGL', name: 'Alphabet', market: '🇺🇸' },
  { symbol: 'AMZN', name: 'Amazon', market: '🇺🇸' },
  { symbol: 'TSLA', name: 'Tesla', market: '🇺🇸' },
  { symbol: 'META', name: 'Meta', market: '🇺🇸' },
  { symbol: 'NVDA', name: 'NVIDIA', market: '🇺🇸' },
  // Indices
  { symbol: '^IBEX', name: 'IBEX 35', market: '📊' },
  { symbol: '^GSPC', name: 'S&P 500', market: '📊' },
  { symbol: '^IXIC', name: 'NASDAQ', market: '📊' },
  { symbol: '^DJI', name: 'Dow Jones', market: '📊' }
]

export default function InversionesMejorado() {
  const [selectedStocks, setSelectedStocks] = useState<string[]>([])
  const [stockDetails, setStockDetails] = useState<{ [key: string]: StockDetails }>({})
  const [historicalData, setHistoricalData] = useState<{ [key: string]: HistoricalData[] }>({})
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const filteredStocks = POPULAR_STOCKS.filter(stock =>
    stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stock.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const addStock = async (symbol: string) => {
    if (selectedStocks.includes(symbol)) return
    if (selectedStocks.length >= 5) {
      setError('Máximo 5 acciones para comparar')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const [details, historical] = await Promise.all([
        fetchStockDetails(symbol),
        fetchHistoricalData(symbol)
      ])

      setSelectedStocks([...selectedStocks, symbol])
      setStockDetails({ ...stockDetails, [symbol]: details })
      setHistoricalData({ ...historicalData, [symbol]: historical })
      setSearchTerm('')
    } catch (err) {
      setError('Error al cargar datos del símbolo')
      console.error('Error loading stock:', err)
    } finally {
      setLoading(false)
    }
  }

  const removeStock = (symbol: string) => {
    setSelectedStocks(selectedStocks.filter(s => s !== symbol))
    const newDetails = { ...stockDetails }
    const newHistorical = { ...historicalData }
    delete newDetails[symbol]
    delete newHistorical[symbol]
    setStockDetails(newDetails)
    setHistoricalData(newHistorical)
  }

  const refreshAll = async () => {
    setLoading(true)
    setError(null)

    try {
      const promises = selectedStocks.map(async (symbol) => {
        const [details, historical] = await Promise.all([
          fetchStockDetails(symbol),
          fetchHistoricalData(symbol)
        ])
        return { symbol, details, historical }
      })

      const results = await Promise.all(promises)
      const newDetails: { [key: string]: StockDetails } = {}
      const newHistorical: { [key: string]: HistoricalData[] } = {}

      results.forEach(({ symbol, details, historical }) => {
        newDetails[symbol] = details
        newHistorical[symbol] = historical
      })

      setStockDetails(newDetails)
      setHistoricalData(newHistorical)
    } catch (err) {
      setError('Error al actualizar datos')
      console.error('Error refreshing stocks:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchStockDetails = async (symbol: string): Promise<StockDetails> => {
    const response = await fetch(`/api/stock-details?symbol=${symbol}`)
    if (!response.ok) throw new Error('Error fetching stock details')
    return await response.json()
  }

  const fetchHistoricalData = async (symbol: string): Promise<HistoricalData[]> => {
    const response = await fetch(`/api/stock-history?symbol=${symbol}&range=1mo`)
    if (!response.ok) throw new Error('Error fetching historical data')
    return await response.json()
  }

  const formatPrice = (price: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency === 'EUR' ? 'EUR' : 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price)
  }

  const formatLargeNumber = (num: number) => {
    if (num >= 1e12) return `${(num / 1e12).toFixed(2)}T`
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`
    return num.toLocaleString('es-ES')
  }

  // Preparar datos para el gráfico
  const chartData = historicalData[selectedStocks[0]]?.map((item, index) => {
    const dataPoint: any = { date: new Date(item.date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }) }
    selectedStocks.forEach(symbol => {
      if (historicalData[symbol]?.[index]) {
        dataPoint[symbol] = historicalData[symbol][index].price
      }
    })
    return dataPoint
  }) || []

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#8dd1e1']

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="font-serif text-3xl text-foreground">Análisis de Mercados</h2>
          <p className="text-muted-foreground mt-2">
            Busca, compara y analiza acciones, ETFs e índices
          </p>
        </div>
        {selectedStocks.length > 0 && (
          <Button onClick={refreshAll} disabled={loading} variant="outline" className="gap-2">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        )}
      </div>

      {error && (
        <Card className="bg-destructive/10 border-destructive/20">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-destructive" />
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="font-serif">Buscar Acciones</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por símbolo o nombre (ej: AAPL, Tesla, BBVA.MC)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          {searchTerm && (
            <div className="max-h-60 overflow-y-auto space-y-1">
              {filteredStocks.map((stock) => (
                <div
                  key={stock.symbol}
                  className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg transition-colors cursor-pointer"
                  onClick={() => addStock(stock.symbol)}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{stock.market}</span>
                    <div>
                      <div className="font-medium">{stock.name}</div>
                      <div className="text-xs text-muted-foreground">{stock.symbol}</div>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              {filteredStocks.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No se encontraron resultados</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Selected Stocks Chips */}
      {selectedStocks.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedStocks.map((symbol) => {
            const details = stockDetails[symbol]
            if (!details) return null

            return (
              <div
                key={symbol}
                className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-full"
              >
                <span className="font-medium text-sm">{symbol}</span>
                <span className="text-xs">
                  {details.price > 0 && formatPrice(details.price, details.currency)}
                </span>
                {details.changePercent !== 0 && (
                  <span className={`text-xs ${details.changePercent > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {details.changePercent > 0 ? '+' : ''}{details.changePercent.toFixed(2)}%
                  </span>
                )}
                <button onClick={() => removeStock(symbol)} className="hover:bg-primary/20 rounded-full p-0.5">
                  <X className="w-3 h-3" />
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Chart */}
      {selectedStocks.length > 0 && chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="font-serif">Comparación de Precios (último mes)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                {selectedStocks.map((symbol, index) => (
                  <Line
                    key={symbol}
                    type="monotone"
                    dataKey={symbol}
                    stroke={COLORS[index % COLORS.length]}
                    strokeWidth={2}
                    dot={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Detailed Metrics */}
      {selectedStocks.map((symbol) => {
        const details = stockDetails[symbol]
        if (!details) return null

        const stockInfo = POPULAR_STOCKS.find(s => s.symbol === symbol)

        return (
          <Card key={symbol}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{stockInfo?.market}</span>
                  <div>
                    <CardTitle className="font-serif">{details.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{symbol}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{formatPrice(details.price, details.currency)}</div>
                  <div className={`text-sm flex items-center gap-1 justify-end ${details.changePercent > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {details.changePercent > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    {details.change > 0 ? '+' : ''}{details.change.toFixed(2)} ({details.changePercent > 0 ? '+' : ''}{details.changePercent.toFixed(2)}%)
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <MetricItem label="Capitalización" value={formatLargeNumber(details.marketCap)} />
                <MetricItem label="P/E Ratio" value={details.peRatio > 0 ? details.peRatio.toFixed(2) : 'N/A'} />
                <MetricItem label="EPS" value={details.eps > 0 ? details.eps.toFixed(2) : 'N/A'} />
                <MetricItem label="Dividendo" value={details.dividendYield > 0 ? `${details.dividendYield.toFixed(2)}%` : 'N/A'} />
                <MetricItem label="Beta" value={details.beta > 0 ? details.beta.toFixed(2) : 'N/A'} />
                <MetricItem label="Máximo 52s" value={formatPrice(details.fiftyTwoWeekHigh, details.currency)} />
                <MetricItem label="Mínimo 52s" value={formatPrice(details.fiftyTwoWeekLow, details.currency)} />
                <MetricItem label="Volumen" value={formatLargeNumber(details.volume)} />
              </div>
            </CardContent>
          </Card>
        )
      })}

      {selectedStocks.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Busca y selecciona acciones para comenzar el análisis
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function MetricItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-semibold">{value}</div>
    </div>
  )
}
