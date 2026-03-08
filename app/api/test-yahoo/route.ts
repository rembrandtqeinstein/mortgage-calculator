import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const symbol = request.nextUrl.searchParams.get('symbol') || 'VOO'

  const results: any = {
    symbol,
    timestamp: new Date().toISOString(),
    tests: []
  }

  // Test 1: v7/quote endpoint
  try {
    const url1 = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbol}`
    const response1 = await fetch(url1, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(10000)
    })
    results.tests.push({
      name: 'v7/quote',
      status: response1.status,
      ok: response1.ok,
      url: url1,
      data: response1.ok ? await response1.json() : await response1.text()
    })
  } catch (error: any) {
    results.tests.push({
      name: 'v7/quote',
      error: error.message
    })
  }

  // Test 2: v8/chart endpoint
  try {
    const url2 = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`
    const response2 = await fetch(url2, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(10000)
    })
    results.tests.push({
      name: 'v8/chart',
      status: response2.status,
      ok: response2.ok,
      url: url2,
      data: response2.ok ? await response2.json() : await response2.text()
    })
  } catch (error: any) {
    results.tests.push({
      name: 'v8/chart',
      error: error.message
    })
  }

  // Test 3: query2 endpoint
  try {
    const url3 = `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${symbol}?modules=price,summaryDetail`
    const response3 = await fetch(url3, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(10000)
    })
    results.tests.push({
      name: 'v10/quoteSummary',
      status: response3.status,
      ok: response3.ok,
      url: url3,
      data: response3.ok ? await response3.json() : await response3.text()
    })
  } catch (error: any) {
    results.tests.push({
      name: 'v10/quoteSummary',
      error: error.message
    })
  }

  return NextResponse.json(results, {
    headers: {
      'Content-Type': 'application/json'
    }
  })
}
