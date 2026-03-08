import { NextRequest, NextResponse } from 'next/server'
import { getFallbackData, hasFallbackData } from '@/lib/stock-data-fallback'

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

    // Try to enrich with additional data (try multiple methods)
    try {
      // Try method 1: quote endpoint
      let enriched = await enrichWithQuoteData(symbol, details)
      if (enriched) {
        details = enriched
        console.log(`[stock-details] Enriched ${symbol} with quote data`)
      }

      // If still missing data, try method 2: quoteSummary
      if (details.marketCap === 0 || details.peRatio === 0) {
        const summaryEnriched = await enrichWithSummaryData(symbol, details)
        if (summaryEnriched) {
          details = summaryEnriched
          console.log(`[stock-details] Enriched ${symbol} with summary data`)
        }
      }
    } catch (error) {
      console.log(`[stock-details] Could not enrich ${symbol}, using basic data`)
    }

    // If still missing critical data, use fallback data
    if ((details.marketCap === 0 || details.peRatio === 0) && hasFallbackData(symbol)) {
      console.log(`[stock-details] Using fallback data for ${symbol}`)
      const fallbackData = getFallbackData(symbol)
      if (fallbackData) {
        details = {
          ...details,
          marketCap: fallbackData.marketCap || details.marketCap,
          peRatio: fallbackData.peRatio || details.peRatio,
          eps: fallbackData.eps || details.eps,
          dividendYield: fallbackData.dividendYield || details.dividendYield,
          beta: fallbackData.beta || details.beta,
          fiftyTwoWeekHigh: fallbackData.fiftyTwoWeekHigh || details.fiftyTwoWeekHigh,
          fiftyTwoWeekLow: fallbackData.fiftyTwoWeekLow || details.fiftyTwoWeekLow
        }
        console.log(`[stock-details] Applied fallback data for ${symbol}`)
      }
    }

    console.log(`[stock-details] Final data for ${symbol}:`, {
      price: details.price,
      marketCap: details.marketCap,
      peRatio: details.peRatio,
      volume: details.volume,
      usedFallback: hasFallbackData(symbol) && (details.marketCap > 0 || details.peRatio > 0)
    })
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
    console.log(`[quote-enrich] Attempting to enrich ${symbol}`)
    const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbol}`

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': '*/*',
        'Referer': 'https://finance.yahoo.com/',
        'Origin': 'https://finance.yahoo.com'
      },
      signal: AbortSignal.timeout(10000)
    })

    if (!response.ok) {
      console.log(`[quote-enrich] HTTP ${response.status} for ${symbol}`)
      return null
    }

    const data = await response.json()
    const quote = data.quoteResponse?.result?.[0]

    if (!quote) {
      console.log(`[quote-enrich] No quote data for ${symbol}`)
      return null
    }

    console.log(`[quote-enrich] Got data for ${symbol}:`, {
      marketCap: quote.marketCap,
      trailingPE: quote.trailingPE,
      beta: quote.beta
    })

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
    console.log(`[quote-enrich] Exception for ${symbol}:`, error)
    return null
  }
}

// Try to enrich with quoteSummary endpoint (more detailed data)
async function enrichWithSummaryData(symbol: string, baseData: any) {
  try {
    console.log(`[summary-enrich] Attempting to enrich ${symbol}`)
    const modules = 'price,summaryDetail,defaultKeyStatistics,financialData'
    const url = `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${symbol}?modules=${modules}`

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': '*/*',
        'Referer': 'https://finance.yahoo.com/',
        'Origin': 'https://finance.yahoo.com'
      },
      signal: AbortSignal.timeout(10000)
    })

    if (!response.ok) {
      console.log(`[summary-enrich] HTTP ${response.status} for ${symbol}`)
      return null
    }

    const data = await response.json()
    const result = data.quoteSummary?.result?.[0]

    if (!result) {
      console.log(`[summary-enrich] No summary data for ${symbol}`)
      return null
    }

    const price = result.price
    const summaryDetail = result.summaryDetail
    const keyStats = result.defaultKeyStatistics
    const financialData = result.financialData

    console.log(`[summary-enrich] Got modules for ${symbol}:`, Object.keys(result))

    // Extract data from various modules
    const enrichedData = { ...baseData }

    // From price module
    if (price) {
      enrichedData.marketCap = price.marketCap?.raw || enrichedData.marketCap
    }

    // From summaryDetail module
    if (summaryDetail) {
      enrichedData.marketCap = summaryDetail.marketCap?.raw || enrichedData.marketCap
      enrichedData.dividendYield = summaryDetail.dividendYield?.raw ? summaryDetail.dividendYield.raw * 100 : enrichedData.dividendYield
      enrichedData.fiftyTwoWeekHigh = summaryDetail.fiftyTwoWeekHigh?.raw || enrichedData.fiftyTwoWeekHigh
      enrichedData.fiftyTwoWeekLow = summaryDetail.fiftyTwoWeekLow?.raw || enrichedData.fiftyTwoWeekLow
      enrichedData.beta = summaryDetail.beta?.raw || enrichedData.beta
      enrichedData.avgVolume = summaryDetail.averageVolume?.raw || enrichedData.avgVolume
    }

    // From keyStats module
    if (keyStats) {
      enrichedData.beta = enrichedData.beta || keyStats.beta?.raw || 0
    }

    // From financialData module
    if (financialData) {
      if (financialData.currentPrice?.raw && financialData.trailingEps?.raw) {
        enrichedData.peRatio = financialData.currentPrice.raw / financialData.trailingEps.raw
      }
      enrichedData.eps = financialData.trailingEps?.raw || enrichedData.eps
    }

    console.log(`[summary-enrich] Enriched ${symbol} with:`, {
      marketCap: enrichedData.marketCap,
      peRatio: enrichedData.peRatio,
      beta: enrichedData.beta
    })

    return enrichedData
  } catch (error) {
    console.log(`[summary-enrich] Exception for ${symbol}:`, error)
    return null
  }
}
