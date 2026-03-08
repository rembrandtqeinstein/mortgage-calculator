// Fallback data for popular stocks/ETFs when Yahoo Finance APIs are blocked
// Data should be updated periodically (monthly)
// Last updated: March 2026

export const STOCK_DATA_FALLBACK: { [key: string]: any } = {
  // === US ETFs ===
  'SPY': {
    marketCap: 564000000000,
    peRatio: 25.8,
    eps: 23.95,
    dividendYield: 1.28,
    beta: 1.0,
    fiftyTwoWeekHigh: 625.50,
    fiftyTwoWeekLow: 495.82
  },
  'QQQ': {
    marketCap: 285000000000,
    peRatio: 38.5,
    eps: 15.57,
    dividendYield: 0.52,
    beta: 1.15,
    fiftyTwoWeekHigh: 632.58,
    fiftyTwoWeekLow: 445.23
  },
  'VOO': {
    marketCap: 580000000000,
    peRatio: 25.7,
    eps: 24.08,
    dividendYield: 1.32,
    beta: 1.0,
    fiftyTwoWeekHigh: 625.12,
    fiftyTwoWeekLow: 502.30
  },
  'VTI': {
    marketCap: 429000000000,
    peRatio: 24.5,
    eps: 11.45,
    dividendYield: 1.38,
    beta: 1.0,
    fiftyTwoWeekHigh: 303.25,
    fiftyTwoWeekLow: 240.15
  },
  'IVV': {
    marketCap: 529000000000,
    peRatio: 25.8,
    eps: 24.12,
    dividendYield: 1.29,
    beta: 1.0,
    fiftyTwoWeekHigh: 628.40,
    fiftyTwoWeekLow: 502.85
  },

  // === US Tech Stocks ===
  'AAPL': {
    marketCap: 3450000000000,
    peRatio: 33.5,
    eps: 6.58,
    dividendYield: 0.44,
    beta: 1.25,
    fiftyTwoWeekHigh: 237.23,
    fiftyTwoWeekLow: 164.08
  },
  'MSFT': {
    marketCap: 3200000000000,
    peRatio: 38.2,
    eps: 11.86,
    dividendYield: 0.72,
    beta: 0.92,
    fiftyTwoWeekHigh: 468.35,
    fiftyTwoWeekLow: 362.90
  },
  'GOOGL': {
    marketCap: 2100000000000,
    peRatio: 28.4,
    eps: 6.22,
    dividendYield: 0,
    beta: 1.05,
    fiftyTwoWeekHigh: 193.31,
    fiftyTwoWeekLow: 129.40
  },
  'AMZN': {
    marketCap: 2150000000000,
    peRatio: 52.8,
    eps: 4.12,
    dividendYield: 0,
    beta: 1.15,
    fiftyTwoWeekHigh: 230.08,
    fiftyTwoWeekLow: 144.05
  },
  'TSLA': {
    marketCap: 850000000000,
    peRatio: 68.5,
    eps: 3.89,
    dividendYield: 0,
    beta: 2.05,
    fiftyTwoWeekHigh: 384.29,
    fiftyTwoWeekLow: 138.80
  },
  'META': {
    marketCap: 1350000000000,
    peRatio: 29.8,
    eps: 19.36,
    dividendYield: 0.35,
    beta: 1.18,
    fiftyTwoWeekHigh: 638.40,
    fiftyTwoWeekLow: 362.50
  },
  'NVDA': {
    marketCap: 3100000000000,
    peRatio: 65.2,
    eps: 2.13,
    dividendYield: 0.03,
    beta: 1.68,
    fiftyTwoWeekHigh: 152.89,
    fiftyTwoWeekLow: 47.32
  },

  // === Spanish Stocks ===
  'SAN.MC': {
    marketCap: 68000000000,
    peRatio: 7.2,
    eps: 0.62,
    dividendYield: 3.85,
    beta: 1.15,
    fiftyTwoWeekHigh: 5.12,
    fiftyTwoWeekLow: 3.45
  },
  'BBVA.MC': {
    marketCap: 58000000000,
    peRatio: 8.5,
    eps: 1.15,
    dividendYield: 5.12,
    beta: 1.25,
    fiftyTwoWeekHigh: 12.85,
    fiftyTwoWeekLow: 7.92
  },
  'TEF.MC': {
    marketCap: 22000000000,
    peRatio: 12.3,
    eps: 0.32,
    dividendYield: 7.25,
    beta: 0.82,
    fiftyTwoWeekHigh: 4.82,
    fiftyTwoWeekLow: 3.45
  },
  'IBE.MC': {
    marketCap: 82000000000,
    peRatio: 15.8,
    eps: 0.85,
    dividendYield: 3.15,
    beta: 0.75,
    fiftyTwoWeekHigh: 14.25,
    fiftyTwoWeekLow: 10.15
  },
  'ITX.MC': {
    marketCap: 145000000000,
    peRatio: 28.5,
    eps: 1.82,
    dividendYield: 2.45,
    beta: 1.05,
    fiftyTwoWeekHigh: 55.20,
    fiftyTwoWeekLow: 38.45
  },

  // === Indices - No P/E, EPS for indices ===
  '^GSPC': {
    marketCap: 0,
    peRatio: 0,
    eps: 0,
    dividendYield: 1.28,
    beta: 0,
    fiftyTwoWeekHigh: 6250.50,
    fiftyTwoWeekLow: 4950.00
  },
  '^IXIC': {
    marketCap: 0,
    peRatio: 0,
    eps: 0,
    dividendYield: 0,
    beta: 0,
    fiftyTwoWeekHigh: 20500.00,
    fiftyTwoWeekLow: 15800.00
  },
  '^DJI': {
    marketCap: 0,
    peRatio: 0,
    eps: 0,
    dividendYield: 1.52,
    beta: 0,
    fiftyTwoWeekHigh: 45000.00,
    fiftyTwoWeekLow: 37000.00
  },
  '^IBEX': {
    marketCap: 0,
    peRatio: 0,
    eps: 0,
    dividendYield: 3.25,
    beta: 0,
    fiftyTwoWeekHigh: 12500.00,
    fiftyTwoWeekLow: 9800.00
  }
}

export function getFallbackData(symbol: string) {
  return STOCK_DATA_FALLBACK[symbol] || null
}

export function hasFallbackData(symbol: string): boolean {
  return symbol in STOCK_DATA_FALLBACK
}
