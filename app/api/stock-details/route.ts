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

    // Try multiple methods in order of preference
    let details = null

    // Method 1: Try chart endpoint (most reliable for price)
    details = await fetchFromChart(symbol)

    if (!details) {
      console.error(`[stock-details] All methods failed for: ${symbol}`)
      return NextResponse.json(
        { error: `No se pudieron obtener datos para ${symbol}` },
        { status: 404 }
      )
    }

    // Try to enrich with additional data from quote endpoint (best effort)
    try {
      const enriched = await enrichWithQuoteData(symbol, details)
      if (enriched) {
        details = enriched
      }
    } catch (error) {
      console.log(`[stock-details] Could not enrich ${symbol}, using basic data`)
    }

    console.log(`[stock-details] Successfully fetched: ${symbol}`)
    return NextResponse.json(details)
  } catch (error) {
    console.error('[stock-details] Unexpected error:', error)
    return NextResponse.json(
      {
        error: 'Error al obtener detalles de la acción',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Primary method: Use chart endpoint (most reliable)
async function fetchFromChart(symbol: string) {
  try {
    console.log(`[chart] Fetching ${symbol}`)
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=5d`

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': '*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://finance.yahoo.com/',
        'Origin': 'https://finance.yahoo.com'
      },
      signal: AbortSignal.timeout(15000)
    })

    if (!response.ok) {
      console.error(`[chart] HTTP ${response.status} for ${symbol}`)
      return null
    }

    const data = await response.json()

    if (!data.chart?.result?.[0]) {
      console.error(`[chart] No chart data for ${symbol}`)
      return null
    }

    const result = data.chart.result[0]
    const meta = result.meta
    const indicators = result.indicators?.quote?.[0]

    // Get latest values
    const timestamps = result.timestamp || []
    const closes = indicators?.close || []
    const volumes = indicators?.volume || []

    // Find most recent non-null values
    let latestPrice = meta.regularMarketPrice
    let latestVolume = meta.regularMarketVolume || 0

    if (!latestPrice && closes.length > 0) {
      // Find last non-null close price
      for (let i = closes.length - 1; i >= 0; i--) {
        if (closes[i] !== null) {
          latestPrice = closes[i]
          break
        }
      }
    }

    if (!latestVolume && volumes.length > 0) {
      // Find last non-null volume
      for (let i = volumes.length - 1; i >= 0; i--) {
        if (volumes[i] !== null) {
          latestVolume = volumes[i]
          break
        }
      }
    }

    const previousClose = meta.chartPreviousClose || meta.previousClose || latestPrice
    const change = latestPrice - previousClose
    const changePercent = previousClose !== 0 ? (change / previousClose) * 100 : 0

    console.log(`[chart] Success for ${symbol}: price=${latestPrice}`)

    return {
      symbol,
      name: meta.longName || meta.shortName || symbol,
      price: latestPrice || 0,
      change,
      changePercent,
      currency: meta.currency || 'USD',
      marketCap: 0, // Will be enriched if possible
      peRatio: 0,
      eps: 0,
      dividendYield: 0,
      beta: 0,
      fiftyTwoWeekHigh: 0,
      fiftyTwoWeekLow: 0,
      volume: latestVolume,
      avgVolume: 0,
      marketState: meta.marketState || 'REGULAR'
    }
  } catch (error) {
    console.error(`[chart] Exception for ${symbol}:`, error)
    return null
  }
}

// Try to enrich basic data with quote endpoint (best effort, non-blocking)
async function enrichWithQuoteData(symbol: string, baseData: any) {
  try {
    console.log(`[enrich] Attempting to enrich ${symbol}`)
    const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbol}`

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': '*/*',
        'Referer': 'https://finance.yahoo.com/'
      },
      signal: AbortSignal.timeout(8000) // Shorter timeout for enrichment
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    const quote = data.quoteResponse?.result?.[0]

    if (!quote) {
      return null
    }

    console.log(`[enrich] Success for ${symbol}`)

    // Merge enriched data with base data
    return {
      ...baseData,
      marketCap: quote.marketCap || baseData.marketCap,
      peRatio: quote.trailingPE || baseData.peRatio,
      eps: quote.epsTrailingTwelveMonths || baseData.eps,
      dividendYield: quote.dividendYield ? quote.dividendYield * 100 : baseData.dividendYield,
      beta: quote.beta || baseData.beta,
      fiftyTwoWeekHigh: quote.fiftyTwoWeekHigh || baseData.fiftyTwoWeekHigh,
      fiftyTwoWeekLow: quote.fiftyTwoWeekLow || baseData.fiftyTwoWeekLow,
      avgVolume: quote.averageDailyVolume3Month || quote.averageVolume || baseData.avgVolume
    }
  } catch (error) {
    console.log(`[enrich] Could not enrich ${symbol}:`, error)
    return null
  }
}
