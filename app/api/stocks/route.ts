import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const symbolsParam = searchParams.get('symbols')

    if (!symbolsParam) {
      return NextResponse.json(
        { error: 'Se requiere el parámetro symbols' },
        { status: 400 }
      )
    }

    const symbols = symbolsParam.split(',').map(s => s.trim())
    const results: { [key: string]: any } = {}

    // Fetch data for each symbol from Yahoo Finance
    await Promise.all(
      symbols.map(async (symbol) => {
        try {
          const data = await fetchYahooFinance(symbol)
          if (data) {
            results[symbol] = data
          }
        } catch (error) {
          console.warn(`Error fetching ${symbol}:`, error)
          results[symbol] = {
            price: 0,
            change: 0,
            changePercent: 0,
            currency: 'USD',
            error: true
          }
        }
      })
    )

    return NextResponse.json(results)
  } catch (error) {
    console.error('Error en API stocks:', error)
    return NextResponse.json(
      { error: 'Error al obtener datos de stocks' },
      { status: 500 }
    )
  }
}

async function fetchYahooFinance(symbol: string) {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json'
      },
      signal: AbortSignal.timeout(8000)
    })

    if (!response.ok) {
      console.warn(`Yahoo Finance returned ${response.status} for ${symbol}`)
      return null
    }

    const data = await response.json()

    if (!data.chart?.result?.[0]) {
      return null
    }

    const result = data.chart.result[0]
    const meta = result.meta

    // Extract price data
    const currentPrice = meta.regularMarketPrice || meta.previousClose || 0
    const previousClose = meta.chartPreviousClose || meta.previousClose || currentPrice
    const change = currentPrice - previousClose
    const changePercent = previousClose !== 0 ? (change / previousClose) * 100 : 0

    return {
      price: currentPrice,
      change: change,
      changePercent: changePercent,
      currency: meta.currency || 'USD',
      marketState: meta.marketState || 'REGULAR'
    }
  } catch (error) {
    console.warn(`Failed to fetch Yahoo Finance data for ${symbol}:`, error instanceof Error ? error.message : 'Unknown error')
    return null
  }
}
