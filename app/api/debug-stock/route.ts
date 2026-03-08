import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const symbol = request.nextUrl.searchParams.get('symbol') || 'QQQ'

  try {
    // Test quoteSummary endpoint
    const modules = 'price,summaryDetail,defaultKeyStatistics,financialData'
    const url = `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${symbol}?modules=${modules}`

    console.log('Fetching from:', url)

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': '*/*',
        'Referer': 'https://finance.yahoo.com/',
        'Origin': 'https://finance.yahoo.com'
      },
      signal: AbortSignal.timeout(15000)
    })

    console.log('Response status:', response.status)

    if (!response.ok) {
      const text = await response.text()
      return NextResponse.json({
        error: `HTTP ${response.status}`,
        body: text,
        symbol,
        url
      })
    }

    const data = await response.json()
    const result = data.quoteSummary?.result?.[0]

    if (!result) {
      return NextResponse.json({
        error: 'No result in response',
        data,
        symbol,
        url
      })
    }

    // Extract the relevant data
    const extracted = {
      symbol,
      availableModules: Object.keys(result),
      price: result.price ? {
        marketCap: result.price.marketCap,
        regularMarketPrice: result.price.regularMarketPrice,
        currency: result.price.currency
      } : null,
      summaryDetail: result.summaryDetail ? {
        marketCap: result.summaryDetail.marketCap,
        trailingPE: result.summaryDetail.trailingPE,
        dividendYield: result.summaryDetail.dividendYield,
        beta: result.summaryDetail.beta,
        fiftyTwoWeekHigh: result.summaryDetail.fiftyTwoWeekHigh,
        fiftyTwoWeekLow: result.summaryDetail.fiftyTwoWeekLow,
        averageVolume: result.summaryDetail.averageVolume
      } : null,
      keyStats: result.defaultKeyStatistics ? {
        beta: result.defaultKeyStatistics.beta,
        trailingEps: result.defaultKeyStatistics.trailingEps
      } : null,
      financialData: result.financialData ? {
        currentPrice: result.financialData.currentPrice,
        trailingEps: result.financialData.trailingEps,
        revenuePerShare: result.financialData.revenuePerShare
      } : null,
      fullResponse: result // Include full response for inspection
    }

    return NextResponse.json(extracted, {
      headers: {
        'Content-Type': 'application/json'
      }
    })

  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      stack: error.stack,
      symbol
    })
  }
}
