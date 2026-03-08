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
  // === ESPAÑA (IBEX 35) ===
  { symbol: '^IBEX', name: 'IBEX 35 Index', market: '🇪🇸', category: 'Índices España' },
  { symbol: 'SAN.MC', name: 'Banco Santander', market: '🇪🇸', category: 'España' },
  { symbol: 'BBVA.MC', name: 'BBVA', market: '🇪🇸', category: 'España' },
  { symbol: 'TEF.MC', name: 'Telefónica', market: '🇪🇸', category: 'España' },
  { symbol: 'IBE.MC', name: 'Iberdrola', market: '🇪🇸', category: 'España' },
  { symbol: 'ITX.MC', name: 'Inditex', market: '🇪🇸', category: 'España' },
  { symbol: 'REP.MC', name: 'Repsol', market: '🇪🇸', category: 'España' },
  { symbol: 'CABK.MC', name: 'CaixaBank', market: '🇪🇸', category: 'España' },
  { symbol: 'FER.MC', name: 'Ferrovial', market: '🇪🇸', category: 'España' },

  // === ÍNDICES EUROPEOS ===
  { symbol: '^STOXX50E', name: 'Euro Stoxx 50', market: '🇪🇺', category: 'Índices Europa' },
  { symbol: '^GDAXI', name: 'DAX (Alemania)', market: '🇩🇪', category: 'Índices Europa' },
  { symbol: '^FCHI', name: 'CAC 40 (Francia)', market: '🇫🇷', category: 'Índices Europa' },
  { symbol: '^FTSE', name: 'FTSE 100 (UK)', market: '🇬🇧', category: 'Índices Europa' },
  { symbol: 'FTSEMIB.MI', name: 'FTSE MIB (Italia)', market: '🇮🇹', category: 'Índices Europa' },
  { symbol: '^AEX', name: 'AEX (Holanda)', market: '🇳🇱', category: 'Índices Europa' },
  { symbol: '^SSMI', name: 'SMI (Suiza)', market: '🇨🇭', category: 'Índices Europa' },

  // === ACCIONES EUROPEAS ===
  { symbol: 'VOW3.DE', name: 'Volkswagen', market: '🇩🇪', category: 'Europa' },
  { symbol: 'SAP.DE', name: 'SAP', market: '🇩🇪', category: 'Europa' },
  { symbol: 'SIE.DE', name: 'Siemens', market: '🇩🇪', category: 'Europa' },
  { symbol: 'MC.PA', name: 'LVMH', market: '🇫🇷', category: 'Europa' },
  { symbol: 'OR.PA', name: "L'Oreal", market: '🇫🇷', category: 'Europa' },
  { symbol: 'TTE.PA', name: 'TotalEnergies', market: '🇫🇷', category: 'Europa' },
  { symbol: 'ASML.AS', name: 'ASML', market: '🇳🇱', category: 'Europa' },
  { symbol: 'NESN.SW', name: 'Nestlé', market: '🇨🇭', category: 'Europa' },
  { symbol: 'NOVN.SW', name: 'Novartis', market: '🇨🇭', category: 'Europa' },

  // === ÍNDICES ASIÁTICOS ===
  { symbol: '^N225', name: 'Nikkei 225 (Japón)', market: '🇯🇵', category: 'Índices Asia' },
  { symbol: '^HSI', name: 'Hang Seng (Hong Kong)', market: '🇭🇰', category: 'Índices Asia' },
  { symbol: '000001.SS', name: 'Shanghai Composite', market: '🇨🇳', category: 'Índices Asia' },
  { symbol: '^KS11', name: 'KOSPI (Corea del Sur)', market: '🇰🇷', category: 'Índices Asia' },
  { symbol: '^BSESN', name: 'BSE Sensex (India)', market: '🇮🇳', category: 'Índices Asia' },

  // === ACCIONES ASIÁTICAS ===
  { symbol: '7203.T', name: 'Toyota', market: '🇯🇵', category: 'Asia' },
  { symbol: '9984.T', name: 'SoftBank', market: '🇯🇵', category: 'Asia' },
  { symbol: '6758.T', name: 'Sony', market: '🇯🇵', category: 'Asia' },
  { symbol: 'BABA', name: 'Alibaba (US)', market: '🇨🇳', category: 'Asia' },
  { symbol: 'BIDU', name: 'Baidu (US)', market: '🇨🇳', category: 'Asia' },
  { symbol: '005930.KS', name: 'Samsung', market: '🇰🇷', category: 'Asia' },
  { symbol: 'TSMC', name: 'TSMC (US)', market: '🇹🇼', category: 'Asia' },

  // === ÍNDICES USA ===
  { symbol: '^GSPC', name: 'S&P 500', market: '🇺🇸', category: 'Índices USA' },
  { symbol: '^IXIC', name: 'NASDAQ', market: '🇺🇸', category: 'Índices USA' },
  { symbol: '^DJI', name: 'Dow Jones', market: '🇺🇸', category: 'Índices USA' },
  { symbol: '^RUT', name: 'Russell 2000', market: '🇺🇸', category: 'Índices USA' },
  { symbol: '^VIX', name: 'VIX (Volatilidad)', market: '🇺🇸', category: 'Índices USA' },

  // === ACCIONES USA ===
  { symbol: 'AAPL', name: 'Apple', market: '🇺🇸', category: 'USA Tech' },
  { symbol: 'MSFT', name: 'Microsoft', market: '🇺🇸', category: 'USA Tech' },
  { symbol: 'GOOGL', name: 'Alphabet', market: '🇺🇸', category: 'USA Tech' },
  { symbol: 'AMZN', name: 'Amazon', market: '🇺🇸', category: 'USA Tech' },
  { symbol: 'TSLA', name: 'Tesla', market: '🇺🇸', category: 'USA Tech' },
  { symbol: 'META', name: 'Meta', market: '🇺🇸', category: 'USA Tech' },
  { symbol: 'NVDA', name: 'NVIDIA', market: '🇺🇸', category: 'USA Tech' },
  { symbol: 'JPM', name: 'JP Morgan', market: '🇺🇸', category: 'USA' },
  { symbol: 'JNJ', name: 'Johnson & Johnson', market: '🇺🇸', category: 'USA' },
  { symbol: 'V', name: 'Visa', market: '🇺🇸', category: 'USA' },
  { symbol: 'WMT', name: 'Walmart', market: '🇺🇸', category: 'USA' },
  { symbol: 'PG', name: 'Procter & Gamble', market: '🇺🇸', category: 'USA' },

  // === ETFs ===
  { symbol: 'SPY', name: 'SPDR S&P 500 ETF', market: '📊', category: 'ETFs' },
  { symbol: 'QQQ', name: 'Invesco QQQ Trust', market: '📊', category: 'ETFs' },
  { symbol: 'VTI', name: 'Vanguard Total Stock', market: '📊', category: 'ETFs' },
  { symbol: 'VOO', name: 'Vanguard S&P 500', market: '📊', category: 'ETFs' },
  { symbol: 'IVV', name: 'iShares Core S&P 500', market: '📊', category: 'ETFs' },
  { symbol: 'EEM', name: 'iShares MSCI Emerging', market: '📊', category: 'ETFs' },
  { symbol: 'VEA', name: 'Vanguard FTSE Developed', market: '📊', category: 'ETFs' },
  { symbol: 'GLD', name: 'SPDR Gold Trust', market: '📊', category: 'ETFs' },
  { symbol: 'SLV', name: 'iShares Silver Trust', market: '📊', category: 'ETFs' },
  { symbol: 'VNQ', name: 'Vanguard Real Estate', market: '📊', category: 'ETFs' },
  { symbol: 'DIA', name: 'SPDR Dow Jones Industrial', market: '📊', category: 'ETFs' },
  { symbol: 'IWM', name: 'iShares Russell 2000', market: '📊', category: 'ETFs' },
  { symbol: 'SCHD', name: 'Schwab US Dividend Equity', market: '📊', category: 'ETFs' },

  // === FONDOS MUTUOS USA ===
  { symbol: 'POLRX', name: 'Prologis Institutional Fund', market: '🏢', category: 'Fondos USA' },
  { symbol: 'VFIAX', name: 'Vanguard 500 Index Fund', market: '🏢', category: 'Fondos USA' },
  { symbol: 'FXAIX', name: 'Fidelity 500 Index Fund', market: '🏢', category: 'Fondos USA' },
  { symbol: 'VTSAX', name: 'Vanguard Total Stock Market', market: '🏢', category: 'Fondos USA' },
  { symbol: 'VGTSX', name: 'Vanguard Total Intl Stock', market: '🏢', category: 'Fondos USA' },
  { symbol: 'VBTLX', name: 'Vanguard Total Bond Market', market: '🏢', category: 'Fondos USA' },
  { symbol: 'PRMTX', name: 'T. Rowe Price Blue Chip Growth', market: '🏢', category: 'Fondos USA' },
  { symbol: 'FCNTX', name: 'Fidelity Contrafund', market: '🏢', category: 'Fondos USA' },
  { symbol: 'VWELX', name: 'Vanguard Wellington Fund', market: '🏢', category: 'Fondos USA' },
  { symbol: 'VWINX', name: 'Vanguard Wellesley Income', market: '🏢', category: 'Fondos USA' },
  { symbol: 'DODGX', name: 'Dodge & Cox Stock Fund', market: '🏢', category: 'Fondos USA' },
  { symbol: 'TRBCX', name: 'T. Rowe Price Capital App', market: '🏢', category: 'Fondos USA' },

  // === FONDOS ESPAÑOLES (CaixaBank y otros) ===
  { symbol: 'ES0114910031.MF', name: 'CaixaBank Tendencias', market: '🇪🇸', category: 'Fondos España' },
  { symbol: 'ES0114043074.MF', name: 'CaixaBank Bolsa USA', market: '🇪🇸', category: 'Fondos España' },
  { symbol: 'ES0114043082.MF', name: 'CaixaBank Bolsa Europa', market: '🇪🇸', category: 'Fondos España' },
  { symbol: 'ES0138420030.MF', name: 'CaixaBank Master Renta Fija', market: '🇪🇸', category: 'Fondos España' },
  { symbol: 'ES0114043058.MF', name: 'CaixaBank Multiasset', market: '🇪🇸', category: 'Fondos España' },
  { symbol: 'ES0113211031.MF', name: 'Santander Acciones Españolas', market: '🇪🇸', category: 'Fondos España' },
  { symbol: 'ES0173678034.MF', name: 'Santander Small Caps Euro', market: '🇪🇸', category: 'Fondos España' },
  { symbol: 'ES0114925005.MF', name: 'BBVA Bolsa', market: '🇪🇸', category: 'Fondos España' },
  { symbol: 'ES0114925039.MF', name: 'BBVA Futuro Sostenible', market: '🇪🇸', category: 'Fondos España' },

  // === REITs (Real Estate Investment Trusts) ===
  { symbol: 'O', name: 'Realty Income', market: '🏘️', category: 'REITs' },
  { symbol: 'PLD', name: 'Prologis', market: '🏘️', category: 'REITs' },
  { symbol: 'AMT', name: 'American Tower', market: '🏘️', category: 'REITs' },
  { symbol: 'SPG', name: 'Simon Property Group', market: '🏘️', category: 'REITs' },
  { symbol: 'EQIX', name: 'Equinix', market: '🏘️', category: 'REITs' },
  { symbol: 'PSA', name: 'Public Storage', market: '🏘️', category: 'REITs' },
  { symbol: 'WELL', name: 'Welltower', market: '🏘️', category: 'REITs' },
  { symbol: 'DLR', name: 'Digital Realty', market: '🏘️', category: 'REITs' },

  // === BONOS ETFs ===
  { symbol: 'BND', name: 'Vanguard Total Bond Market', market: '💰', category: 'Bonos' },
  { symbol: 'AGG', name: 'iShares Core US Aggregate', market: '💰', category: 'Bonos' },
  { symbol: 'TLT', name: 'iShares 20+ Year Treasury', market: '💰', category: 'Bonos' },
  { symbol: 'IEF', name: 'iShares 7-10 Year Treasury', market: '💰', category: 'Bonos' },
  { symbol: 'LQD', name: 'iShares Corporate Bond', market: '💰', category: 'Bonos' },
  { symbol: 'HYG', name: 'iShares High Yield Corp', market: '💰', category: 'Bonos' },
  { symbol: 'MUB', name: 'iShares National Muni Bond', market: '💰', category: 'Bonos' },
  { symbol: 'BNDX', name: 'Vanguard Intl Bond', market: '💰', category: 'Bonos' },

  // === ETFs SECTORIALES ===
  { symbol: 'XLF', name: 'Financial Select Sector', market: '📊', category: 'ETFs Sector' },
  { symbol: 'XLE', name: 'Energy Select Sector', market: '📊', category: 'ETFs Sector' },
  { symbol: 'XLK', name: 'Technology Select Sector', market: '📊', category: 'ETFs Sector' },
  { symbol: 'XLV', name: 'Health Care Select Sector', market: '📊', category: 'ETFs Sector' },
  { symbol: 'XLI', name: 'Industrial Select Sector', market: '📊', category: 'ETFs Sector' },
  { symbol: 'XLP', name: 'Consumer Staples Select', market: '📊', category: 'ETFs Sector' },
  { symbol: 'XLY', name: 'Consumer Discret Select', market: '📊', category: 'ETFs Sector' },
  { symbol: 'XLU', name: 'Utilities Select Sector', market: '📊', category: 'ETFs Sector' },
  { symbol: 'XLB', name: 'Materials Select Sector', market: '📊', category: 'ETFs Sector' },
  { symbol: 'XLRE', name: 'Real Estate Select Sector', market: '📊', category: 'ETFs Sector' },
  { symbol: 'XLC', name: 'Communication Services Select', market: '📊', category: 'ETFs Sector' },

  // === ETFs TEMÁTICOS ===
  { symbol: 'ARKK', name: 'ARK Innovation ETF', market: '🚀', category: 'ETFs Temático' },
  { symbol: 'ARKG', name: 'ARK Genomic Revolution', market: '🚀', category: 'ETFs Temático' },
  { symbol: 'ARKW', name: 'ARK Next Generation Internet', market: '🚀', category: 'ETFs Temático' },
  { symbol: 'ICLN', name: 'iShares Clean Energy', market: '🚀', category: 'ETFs Temático' },
  { symbol: 'TAN', name: 'Invesco Solar', market: '🚀', category: 'ETFs Temático' },
  { symbol: 'SOXX', name: 'iShares Semiconductor', market: '🚀', category: 'ETFs Temático' },
  { symbol: 'ROBO', name: 'ROBO Global Robotics', market: '🚀', category: 'ETFs Temático' },
  { symbol: 'FINX', name: 'Global X FinTech', market: '🚀', category: 'ETFs Temático' },
  { symbol: 'CLOU', name: 'Global X Cloud Computing', market: '🚀', category: 'ETFs Temático' },
  { symbol: 'GNOM', name: 'Global X Genomics', market: '🚀', category: 'ETFs Temático' },

  // === ETFs INTERNACIONALES ===
  { symbol: 'VXUS', name: 'Vanguard Total Intl Stock', market: '🌍', category: 'ETFs Intl' },
  { symbol: 'IEFA', name: 'iShares Core MSCI EAFE', market: '🌍', category: 'ETFs Intl' },
  { symbol: 'EFA', name: 'iShares MSCI EAFE', market: '🌍', category: 'ETFs Intl' },
  { symbol: 'VWO', name: 'Vanguard FTSE Emerging', market: '🌍', category: 'ETFs Intl' },
  { symbol: 'IEMG', name: 'iShares Core MSCI Emerging', market: '🌍', category: 'ETFs Intl' },
  { symbol: 'FXI', name: 'iShares China Large-Cap', market: '🌍', category: 'ETFs Intl' },
  { symbol: 'EWJ', name: 'iShares MSCI Japan', market: '🌍', category: 'ETFs Intl' },
  { symbol: 'EWG', name: 'iShares MSCI Germany', market: '🌍', category: 'ETFs Intl' },
  { symbol: 'EWU', name: 'iShares MSCI United Kingdom', market: '🌍', category: 'ETFs Intl' },
  { symbol: 'EWY', name: 'iShares MSCI South Korea', market: '🌍', category: 'ETFs Intl' },

  // === COMMODITIES ===
  { symbol: 'GC=F', name: 'Oro (Gold)', market: '🥇', category: 'Commodities' },
  { symbol: 'SI=F', name: 'Plata (Silver)', market: '🥈', category: 'Commodities' },
  { symbol: 'CL=F', name: 'Petróleo WTI', market: '🛢️', category: 'Commodities' },
  { symbol: 'BZ=F', name: 'Petróleo Brent', market: '🛢️', category: 'Commodities' },
  { symbol: 'NG=F', name: 'Gas Natural', market: '⛽', category: 'Commodities' },
  { symbol: 'HG=F', name: 'Cobre', market: '🔶', category: 'Commodities' },
  { symbol: 'PL=F', name: 'Platino', market: '⚪', category: 'Commodities' },
  { symbol: 'PA=F', name: 'Paladio', market: '⚪', category: 'Commodities' },

  // === FOREX (Divisas) ===
  { symbol: 'EURUSD=X', name: 'EUR/USD', market: '💱', category: 'Forex' },
  { symbol: 'GBPUSD=X', name: 'GBP/USD', market: '💱', category: 'Forex' },
  { symbol: 'USDJPY=X', name: 'USD/JPY', market: '💱', category: 'Forex' },
  { symbol: 'AUDUSD=X', name: 'AUD/USD', market: '💱', category: 'Forex' },
  { symbol: 'USDCAD=X', name: 'USD/CAD', market: '💱', category: 'Forex' },
  { symbol: 'USDCHF=X', name: 'USD/CHF', market: '💱', category: 'Forex' },
  { symbol: 'EURGBP=X', name: 'EUR/GBP', market: '💱', category: 'Forex' },
  { symbol: 'EURJPY=X', name: 'EUR/JPY', market: '💱', category: 'Forex' },
  { symbol: 'USDINR=X', name: 'USD/INR', market: '💱', category: 'Forex' },
  { symbol: 'USDCNY=X', name: 'USD/CNY', market: '💱', category: 'Forex' },

  // === CRIPTOMONEDAS ===
  { symbol: 'BTC-USD', name: 'Bitcoin', market: '₿', category: 'Crypto' },
  { symbol: 'ETH-USD', name: 'Ethereum', market: '💎', category: 'Crypto' },
  { symbol: 'BNB-USD', name: 'Binance Coin', market: '💎', category: 'Crypto' },
  { symbol: 'ADA-USD', name: 'Cardano', market: '💎', category: 'Crypto' },
  { symbol: 'SOL-USD', name: 'Solana', market: '💎', category: 'Crypto' },
  { symbol: 'XRP-USD', name: 'Ripple', market: '💎', category: 'Crypto' },
  { symbol: 'DOT-USD', name: 'Polkadot', market: '💎', category: 'Crypto' },
  { symbol: 'DOGE-USD', name: 'Dogecoin', market: '💎', category: 'Crypto' },
  { symbol: 'AVAX-USD', name: 'Avalanche', market: '💎', category: 'Crypto' },
  { symbol: 'MATIC-USD', name: 'Polygon', market: '💎', category: 'Crypto' }
]

const TIME_RANGES = [
  { value: '1d', label: '1 Día' },
  { value: '5d', label: '5 Días' },
  { value: '1mo', label: '1 Mes' },
  { value: '3mo', label: '3 Meses' },
  { value: '6mo', label: '6 Meses' },
  { value: '1y', label: '1 Año' },
  { value: '2y', label: '2 Años' },
  { value: '5y', label: '5 Años' },
  { value: 'ytd', label: 'Este año' },
  { value: 'max', label: 'Máximo' }
]

export default function InversionesMejorado() {
  const [selectedStocks, setSelectedStocks] = useState<string[]>([])
  const [stockDetails, setStockDetails] = useState<{ [key: string]: StockDetails }>({})
  const [historicalData, setHistoricalData] = useState<{ [key: string]: HistoricalData[] }>({})
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [timeRange, setTimeRange] = useState('1mo')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Get unique categories
  const categories = ['all', ...Array.from(new Set(POPULAR_STOCKS.map(s => s.category)))]

  const filteredStocks = POPULAR_STOCKS.filter(stock => {
    const matchesSearch = stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stock.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || stock.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const addStock = async (symbol: string) => {
    if (selectedStocks.includes(symbol)) {
      setError(`${symbol} ya está en la lista`)
      return
    }
    if (selectedStocks.length >= 5) {
      setError('Máximo 5 acciones para comparar')
      return
    }

    setLoading(true)
    setError(null)

    try {
      console.log(`Adding stock: ${symbol}`)

      // Fetch details first
      const details = await fetchStockDetails(symbol)
      console.log(`Got details for ${symbol}`)

      // Then fetch historical data
      const historical = await fetchHistoricalData(symbol, timeRange)
      console.log(`Got historical data for ${symbol}`)

      setSelectedStocks([...selectedStocks, symbol])
      setStockDetails({ ...stockDetails, [symbol]: details })
      setHistoricalData({ ...historicalData, [symbol]: historical })
      setSearchTerm('')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar datos del símbolo'
      setError(`${symbol}: ${errorMessage}`)
      console.error(`Error loading stock ${symbol}:`, err)
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
          fetchHistoricalData(symbol, timeRange)
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

  const changeTimeRange = async (newRange: string) => {
    setTimeRange(newRange)
    if (selectedStocks.length === 0) return

    setLoading(true)
    setError(null)

    try {
      const promises = selectedStocks.map(async (symbol) => {
        const historical = await fetchHistoricalData(symbol, newRange)
        return { symbol, historical }
      })

      const results = await Promise.all(promises)
      const newHistorical: { [key: string]: HistoricalData[] } = {}

      results.forEach(({ symbol, historical }) => {
        newHistorical[symbol] = historical
      })

      setHistoricalData(newHistorical)
    } catch (err) {
      setError('Error al cambiar rango de tiempo')
      console.error('Error changing time range:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchStockDetails = async (symbol: string): Promise<StockDetails> => {
    const response = await fetch(`/api/stock-details?symbol=${symbol}`)
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      console.error(`Failed to fetch details for ${symbol}:`, errorData)
      throw new Error(errorData.error || `Error fetching ${symbol}`)
    }
    const data = await response.json()
    console.log(`Successfully fetched details for ${symbol}:`, data)
    return data
  }

  const fetchHistoricalData = async (symbol: string, range: string): Promise<HistoricalData[]> => {
    const response = await fetch(`/api/stock-history?symbol=${symbol}&range=${range}`)
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
          <CardTitle className="font-serif">Buscar Activos Financieros</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por símbolo o nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="all">Todas las categorías</option>
              {categories.filter(c => c !== 'all').sort().map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {(searchTerm || selectedCategory !== 'all') && (
            <div className="max-h-96 overflow-y-auto space-y-1">
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
                      <div className="text-xs text-muted-foreground">
                        {stock.symbol} · {stock.category}
                      </div>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" disabled={loading}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              {filteredStocks.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No se encontraron resultados</p>
              )}
            </div>
          )}

          <p className="text-xs text-muted-foreground mt-2">
            {POPULAR_STOCKS.length} activos disponibles · {filteredStocks.length} mostrados
          </p>
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
            <div className="flex items-center justify-between flex-wrap gap-4">
              <CardTitle className="font-serif">
                Comparación de Precios ({TIME_RANGES.find(r => r.value === timeRange)?.label})
              </CardTitle>
              <div className="flex flex-wrap gap-2">
                {TIME_RANGES.map((range) => (
                  <Button
                    key={range.value}
                    size="sm"
                    variant={timeRange === range.value ? "default" : "outline"}
                    onClick={() => changeTimeRange(range.value)}
                    disabled={loading}
                  >
                    {range.label}
                  </Button>
                ))}
              </div>
            </div>
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
