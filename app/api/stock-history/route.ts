import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const symbol = searchParams.get('symbol')
    const range = searchParams.get('range') || '1mo' // 1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y, 10y, ytd, max

    if (!symbol) {
      return NextResponse.json(
        { error: 'Se requiere el parámetro symbol' },
        { status: 400 }
      )
    }

    const history = await fetchYahooFinanceHistory(symbol, range)

    if (!history || history.length === 0) {
      return NextResponse.json(
        { error: 'No se pudieron obtener datos históricos' },
        { status: 404 }
      )
    }

    return NextResponse.json(history)
  } catch (error) {
    console.error('Error en API stock-history:', error)
    return NextResponse.json(
      { error: 'Error al obtener historial de la acción' },
      { status: 500 }
    )
  }
}

async function fetchYahooFinanceHistory(symbol: string, range: string) {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=${range}`

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'application/json'
      },
      signal: AbortSignal.timeout(10000)
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
    const timestamps = result.timestamp || []
    const quotes = result.indicators?.quote?.[0]

    if (!quotes || !quotes.close) {
      return null
    }

    const history = timestamps.map((timestamp: number, index: number) => {
      const close = quotes.close[index]
      if (close === null) return null

      return {
        date: new Date(timestamp * 1000).toISOString(),
        price: close
      }
    }).filter((item: any) => item !== null)

    return history
  } catch (error) {
    console.warn(`Failed to fetch history for ${symbol}:`, error instanceof Error ? error.message : 'Unknown error')
    return null
  }
}
