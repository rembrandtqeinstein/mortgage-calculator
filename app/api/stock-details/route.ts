import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const symbol = searchParams.get('symbol')

    if (!symbol) {
      return NextResponse.json(
        { error: 'Se requiere el parámetro symbol' },
        { status: 400 }
      )
    }

    const details = await fetchYahooFinanceDetails(symbol)

    if (!details) {
      return NextResponse.json(
        { error: 'No se pudieron obtener datos del símbolo' },
        { status: 404 }
      )
    }

    return NextResponse.json(details)
  } catch (error) {
    console.error('Error en API stock-details:', error)
    return NextResponse.json(
      { error: 'Error al obtener detalles de la acción' },
      { status: 500 }
    )
  }
}

async function fetchYahooFinanceDetails(symbol: string) {
  try {
    // Use the quote endpoint which is more reliable and has all data in one call
    const quoteUrl = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbol}&fields=symbol,shortName,longName,regularMarketPrice,regularMarketChange,regularMarketChangePercent,currency,marketCap,trailingPE,epsTrailingTwelveMonths,dividendYield,beta,fiftyTwoWeekHigh,fiftyTwoWeekLow,regularMarketVolume,averageVolume,marketState,quoteType`

    const response = await fetch(quoteUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/json',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      signal: AbortSignal.timeout(10000)
    })

    if (!response.ok) {
      console.warn(`Yahoo Finance quote API returned ${response.status} for ${symbol}`)
      return null
    }

    const data = await response.json()

    if (!data.quoteResponse?.result?.[0]) {
      console.warn(`No quote data found for ${symbol}`)
      return null
    }

    const quote = data.quoteResponse.result[0]

    // Extract all data with proper fallbacks
    const currentPrice = quote.regularMarketPrice || 0
    const change = quote.regularMarketChange || 0
    const changePercent = quote.regularMarketChangePercent || 0
    const currency = quote.currency || 'USD'
    const name = quote.longName || quote.shortName || symbol
    const marketState = quote.marketState || 'REGULAR'

    // Financial metrics
    const marketCap = quote.marketCap || 0
    const peRatio = quote.trailingPE || 0
    const eps = quote.epsTrailingTwelveMonths || 0
    const dividendYield = (quote.dividendYield || 0) * 100 // Convert to percentage
    const beta = quote.beta || 0
    const fiftyTwoWeekHigh = quote.fiftyTwoWeekHigh || 0
    const fiftyTwoWeekLow = quote.fiftyTwoWeekLow || 0
    const volume = quote.regularMarketVolume || 0
    const avgVolume = quote.averageDailyVolume3Month || quote.averageVolume || 0

    console.log(`Stock details for ${symbol}:`, {
      symbol,
      name,
      price: currentPrice,
      marketCap,
      peRatio,
      eps,
      volume
    })

    return {
      symbol,
      name,
      price: currentPrice,
      change,
      changePercent,
      currency,
      marketCap,
      peRatio,
      eps,
      dividendYield,
      beta,
      fiftyTwoWeekHigh,
      fiftyTwoWeekLow,
      volume,
      avgVolume,
      marketState
    }
  } catch (error) {
    console.error(`Failed to fetch details for ${symbol}:`, error instanceof Error ? error.message : 'Unknown error')
    return null
  }
}
