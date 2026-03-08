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
    // Get quote and summary data
    const [quoteResponse, summaryResponse] = await Promise.allSettled([
      fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`, {
        headers: {
          'User-Agent': 'Mozilla/5.0',
          'Accept': 'application/json'
        },
        signal: AbortSignal.timeout(8000)
      }),
      fetch(`https://query2.finance.yahoo.com/v10/finance/quoteSummary/${symbol}?modules=summaryDetail,defaultKeyStatistics,financialData`, {
        headers: {
          'User-Agent': 'Mozilla/5.0',
          'Accept': 'application/json'
        },
        signal: AbortSignal.timeout(8000)
      })
    ])

    let currentPrice = 0
    let change = 0
    let changePercent = 0
    let currency = 'USD'
    let marketState = 'REGULAR'
    let name = symbol

    // Process quote data
    if (quoteResponse.status === 'fulfilled' && quoteResponse.value.ok) {
      const quoteData = await quoteResponse.value.json()
      if (quoteData.chart?.result?.[0]) {
        const result = quoteData.chart.result[0]
        const meta = result.meta
        currentPrice = meta.regularMarketPrice || meta.previousClose || 0
        const previousClose = meta.chartPreviousClose || meta.previousClose || currentPrice
        change = currentPrice - previousClose
        changePercent = previousClose !== 0 ? (change / previousClose) * 100 : 0
        currency = meta.currency || 'USD'
        marketState = meta.marketState || 'REGULAR'
        name = meta.longName || meta.shortName || symbol
      }
    }

    // Default values
    let marketCap = 0
    let peRatio = 0
    let eps = 0
    let dividendYield = 0
    let beta = 0
    let fiftyTwoWeekHigh = 0
    let fiftyTwoWeekLow = 0
    let volume = 0
    let avgVolume = 0

    // Process summary data
    if (summaryResponse.status === 'fulfilled' && summaryResponse.value.ok) {
      const summaryData = await summaryResponse.value.json()
      const result = summaryData.quoteSummary?.result?.[0]

      if (result) {
        const summary = result.summaryDetail
        const keyStats = result.defaultKeyStatistics
        const financial = result.financialData

        if (summary) {
          marketCap = summary.marketCap?.raw || 0
          dividendYield = (summary.dividendYield?.raw || 0) * 100
          fiftyTwoWeekHigh = summary.fiftyTwoWeekHigh?.raw || 0
          fiftyTwoWeekLow = summary.fiftyTwoWeekLow?.raw || 0
          volume = summary.volume?.raw || 0
          avgVolume = summary.averageVolume?.raw || 0
          beta = summary.beta?.raw || 0
        }

        if (keyStats) {
          beta = beta || keyStats.beta?.raw || 0
        }

        if (financial) {
          peRatio = financial.currentPrice?.raw && financial.trailingEps?.raw
            ? financial.currentPrice.raw / financial.trailingEps.raw
            : 0
          eps = financial.trailingEps?.raw || 0
        }
      }
    }

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
    console.warn(`Failed to fetch details for ${symbol}:`, error instanceof Error ? error.message : 'Unknown error')
    return null
  }
}
