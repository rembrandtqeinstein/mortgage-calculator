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

    console.log(`[stock-details] Fetching details for: ${symbol}`)
    const details = await fetchYahooFinanceDetails(symbol)

    if (!details) {
      console.error(`[stock-details] Failed to get details for: ${symbol}`)
      return NextResponse.json(
        { error: `No se pudieron obtener datos para ${symbol}` },
        { status: 404 }
      )
    }

    console.log(`[stock-details] Successfully fetched: ${symbol}`)
    return NextResponse.json(details)
  } catch (error) {
    console.error('[stock-details] Error:', error)
    return NextResponse.json(
      {
        error: 'Error al obtener detalles de la acción',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

async function fetchYahooFinanceDetails(symbol: string) {
  try {
    // Use the quote endpoint which is more reliable and has all data in one call
    const quoteUrl = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbol}`

    console.log(`[fetch] Calling Yahoo Finance for ${symbol}`)
    const response = await fetch(quoteUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/json',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      signal: AbortSignal.timeout(15000)
    })

    console.log(`[fetch] Response status for ${symbol}: ${response.status}`)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[fetch] Yahoo Finance error for ${symbol}:`, errorText)
      return null
    }

    const data = await response.json()
    console.log(`[fetch] Response data keys for ${symbol}:`, Object.keys(data))

    if (!data.quoteResponse?.result?.[0]) {
      console.warn(`[fetch] No quote data in response for ${symbol}`)
      console.log(`[fetch] Full response:`, JSON.stringify(data, null, 2))
      return null
    }

    const quote = data.quoteResponse.result[0]
    console.log(`[fetch] Quote keys for ${symbol}:`, Object.keys(quote))

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

    const result = {
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

    console.log(`[fetch] Successfully extracted data for ${symbol}:`, {
      price: currentPrice,
      marketCap,
      peRatio,
      volume
    })

    return result
  } catch (error) {
    console.error(`[fetch] Exception for ${symbol}:`, error)
    if (error instanceof Error) {
      console.error(`[fetch] Error details:`, error.message, error.stack)
    }

    // Try fallback with simpler endpoint
    return await fetchFallbackDetails(symbol)
  }
}

// Fallback using simpler chart endpoint
async function fetchFallbackDetails(symbol: string) {
  try {
    console.log(`[fallback] Trying fallback for ${symbol}`)
    const chartUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`

    const response = await fetch(chartUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'application/json'
      },
      signal: AbortSignal.timeout(10000)
    })

    if (!response.ok) {
      console.error(`[fallback] Failed with status ${response.status}`)
      return null
    }

    const data = await response.json()

    if (!data.chart?.result?.[0]) {
      console.error(`[fallback] No chart data for ${symbol}`)
      return null
    }

    const result = data.chart.result[0]
    const meta = result.meta

    console.log(`[fallback] Success for ${symbol}`)

    return {
      symbol,
      name: meta.longName || meta.shortName || symbol,
      price: meta.regularMarketPrice || meta.previousClose || 0,
      change: (meta.regularMarketPrice || 0) - (meta.chartPreviousClose || 0),
      changePercent: ((meta.regularMarketPrice || 0) - (meta.chartPreviousClose || 0)) / (meta.chartPreviousClose || 1) * 100,
      currency: meta.currency || 'USD',
      marketCap: 0,
      peRatio: 0,
      eps: 0,
      dividendYield: 0,
      beta: 0,
      fiftyTwoWeekHigh: 0,
      fiftyTwoWeekLow: 0,
      volume: 0,
      avgVolume: 0,
      marketState: meta.marketState || 'REGULAR'
    }
  } catch (error) {
    console.error(`[fallback] Exception:`, error)
    return null
  }
}
