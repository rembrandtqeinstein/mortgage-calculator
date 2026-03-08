"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw, TrendingUp, TrendingDown, Minus, AlertCircle } from "lucide-react"

interface AssetData {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  currency: string
}

interface CryptoData {
  id: string
  symbol: string
  name: string
  current_price: number
  price_change_percentage_24h: number
  market_cap: number
}

export default function Inversiones() {
  const [loading, setLoading] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Stocks y ETFs
  const [ibexStocks, setIbexStocks] = useState<AssetData[]>([])
  const [usStocks, setUsStocks] = useState<AssetData[]>([])
  const [etfs, setEtfs] = useState<AssetData[]>([])
  const [crypto, setCrypto] = useState<CryptoData[]>([])

  // Símbolos a consultar
  const ibexSymbols = [
    { symbol: 'SAN.MC', name: 'Banco Santander' },
    { symbol: 'BBVA.MC', name: 'BBVA' },
    { symbol: 'TEF.MC', name: 'Telefónica' },
    { symbol: 'IBE.MC', name: 'Iberdrola' },
    { symbol: 'ITX.MC', name: 'Inditex' },
    { symbol: '^IBEX', name: 'IBEX 35' }
  ]

  const usSymbols = [
    { symbol: 'AAPL', name: 'Apple' },
    { symbol: 'MSFT', name: 'Microsoft' },
    { symbol: 'GOOGL', name: 'Alphabet' },
    { symbol: 'TSLA', name: 'Tesla' },
    { symbol: '^GSPC', name: 'S&P 500' },
    { symbol: '^IXIC', name: 'NASDAQ' }
  ]

  const etfSymbols = [
    { symbol: 'SPY', name: 'SPDR S&P 500 ETF' },
    { symbol: 'QQQ', name: 'Invesco QQQ Trust' },
    { symbol: 'VTI', name: 'Vanguard Total Stock' },
    { symbol: 'VOO', name: 'Vanguard S&P 500' }
  ]

  const fetchAllData = async () => {
    setLoading(true)
    setError(null)

    try {
      // Fetch stocks and ETFs via our API proxy
      const [ibexData, usData, etfData, cryptoData] = await Promise.allSettled([
        fetchStocksData(ibexSymbols),
        fetchStocksData(usSymbols),
        fetchStocksData(etfSymbols),
        fetchCryptoData()
      ])

      if (ibexData.status === 'fulfilled') setIbexStocks(ibexData.value)
      if (usData.status === 'fulfilled') setUsStocks(usData.value)
      if (etfData.status === 'fulfilled') setEtfs(etfData.value)
      if (cryptoData.status === 'fulfilled') setCrypto(cryptoData.value)

      setLastUpdate(new Date())
    } catch (err) {
      setError('Error al cargar datos de mercado')
      console.error('Error fetching market data:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchStocksData = async (symbols: { symbol: string; name: string }[]): Promise<AssetData[]> => {
    const response = await fetch(`/api/stocks?symbols=${symbols.map(s => s.symbol).join(',')}`)
    if (!response.ok) throw new Error('Error fetching stocks')
    const data = await response.json()

    return symbols.map(s => ({
      symbol: s.symbol,
      name: s.name,
      price: data[s.symbol]?.price || 0,
      change: data[s.symbol]?.change || 0,
      changePercent: data[s.symbol]?.changePercent || 0,
      currency: data[s.symbol]?.currency || 'USD'
    }))
  }

  const fetchCryptoData = async (): Promise<CryptoData[]> => {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/coins/markets?vs_currency=eur&ids=bitcoin,ethereum,cardano,solana,polkadot,chainlink&order=market_cap_desc'
    )
    if (!response.ok) throw new Error('Error fetching crypto')
    return await response.json()
  }

  useEffect(() => {
    fetchAllData()
  }, [])

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency === 'USD' ? 'USD' : 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price)
  }

  const formatCryptoPrice = (price: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: price < 1 ? 4 : 2,
      maximumFractionDigits: price < 1 ? 4 : 2
    }).format(price)
  }

  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1e12) return `€${(marketCap / 1e12).toFixed(2)}T`
    if (marketCap >= 1e9) return `€${(marketCap / 1e9).toFixed(2)}B`
    if (marketCap >= 1e6) return `€${(marketCap / 1e6).toFixed(2)}M`
    return `€${marketCap.toFixed(0)}`
  }

  const getPriceChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-4 h-4 text-green-600" />
    if (change < 0) return <TrendingDown className="w-4 h-4 text-red-600" />
    return <Minus className="w-4 h-4 text-gray-600" />
  }

  const getPriceChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600 dark:text-green-400'
    if (change < 0) return 'text-red-600 dark:text-red-400'
    return 'text-gray-600 dark:text-gray-400'
  }

  const AssetRow = ({ asset }: { asset: AssetData }) => (
    <div className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg transition-colors">
      <div className="flex-1">
        <div className="font-medium">{asset.name}</div>
        <div className="text-xs text-muted-foreground">{asset.symbol}</div>
      </div>
      <div className="text-right">
        <div className="font-semibold">{formatPrice(asset.price, asset.currency)}</div>
        <div className={`text-xs flex items-center gap-1 justify-end ${getPriceChangeColor(asset.changePercent)}`}>
          {getPriceChangeIcon(asset.changePercent)}
          {asset.changePercent > 0 ? '+' : ''}{asset.changePercent.toFixed(2)}%
        </div>
      </div>
    </div>
  )

  const CryptoRow = ({ crypto }: { crypto: CryptoData }) => (
    <div className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg transition-colors">
      <div className="flex-1">
        <div className="font-medium">{crypto.name}</div>
        <div className="text-xs text-muted-foreground">
          {crypto.symbol.toUpperCase()} · {formatMarketCap(crypto.market_cap)}
        </div>
      </div>
      <div className="text-right">
        <div className="font-semibold">{formatCryptoPrice(crypto.current_price)}</div>
        <div className={`text-xs flex items-center gap-1 justify-end ${getPriceChangeColor(crypto.price_change_percentage_24h)}`}>
          {getPriceChangeIcon(crypto.price_change_percentage_24h)}
          {crypto.price_change_percentage_24h > 0 ? '+' : ''}{crypto.price_change_percentage_24h.toFixed(2)}%
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-3xl text-foreground">Mercados Financieros</h2>
          <p className="text-muted-foreground mt-2">
            Cotizaciones en tiempo real de acciones, ETFs y criptomonedas
          </p>
          {lastUpdate && (
            <p className="text-xs text-muted-foreground mt-1">
              Última actualización: {lastUpdate.toLocaleTimeString('es-ES')}
            </p>
          )}
        </div>
        <Button
          onClick={fetchAllData}
          disabled={loading}
          variant="outline"
          className="gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      {error && (
        <Card className="bg-destructive/10 border-destructive/20">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-destructive" />
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* IBEX 35 */}
      <Card>
        <CardHeader>
          <CardTitle className="font-serif flex items-center gap-2">
            <span className="text-2xl">🇪🇸</span>
            IBEX 35 y Acciones Españolas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading && ibexStocks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">Cargando...</div>
          ) : (
            <div className="space-y-1">
              {ibexStocks.map((asset) => (
                <AssetRow key={asset.symbol} asset={asset} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* US Markets */}
      <Card>
        <CardHeader>
          <CardTitle className="font-serif flex items-center gap-2">
            <span className="text-2xl">🇺🇸</span>
            Mercados Estadounidenses
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading && usStocks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">Cargando...</div>
          ) : (
            <div className="space-y-1">
              {usStocks.map((asset) => (
                <AssetRow key={asset.symbol} asset={asset} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ETFs */}
      <Card>
        <CardHeader>
          <CardTitle className="font-serif flex items-center gap-2">
            <span className="text-2xl">📊</span>
            ETFs Populares
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading && etfs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">Cargando...</div>
          ) : (
            <div className="space-y-1">
              {etfs.map((asset) => (
                <AssetRow key={asset.symbol} asset={asset} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Crypto */}
      <Card>
        <CardHeader>
          <CardTitle className="font-serif flex items-center gap-2">
            <span className="text-2xl">₿</span>
            Criptomonedas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading && crypto.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">Cargando...</div>
          ) : (
            <div className="space-y-1">
              {crypto.map((c) => (
                <CryptoRow key={c.id} crypto={c} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="space-y-1 text-sm text-amber-900 dark:text-amber-200">
              <p className="font-medium">⚠️ Aviso legal</p>
              <p className="text-xs">
                Los precios mostrados son orientativos y pueden tener un retraso de 15-20 minutos.
                Esta información no constituye asesoramiento financiero. Los datos de criptomonedas
                provienen de CoinGecko. Consulta siempre con un asesor financiero antes de invertir.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
