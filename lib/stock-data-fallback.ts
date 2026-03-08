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
  },

  // === Mutual Funds ===
  'POLRX': {
    marketCap: 0, // N/A for mutual funds
    peRatio: 0,
    eps: 0,
    dividendYield: 2.85,
    beta: 0.45,
    fiftyTwoWeekHigh: 68.50,
    fiftyTwoWeekLow: 55.20
  },
  'VFIAX': {
    marketCap: 0,
    peRatio: 25.8,
    eps: 0,
    dividendYield: 1.32,
    beta: 1.0,
    fiftyTwoWeekHigh: 625.00,
    fiftyTwoWeekLow: 502.00
  },
  'FXAIX': {
    marketCap: 0,
    peRatio: 25.7,
    eps: 0,
    dividendYield: 1.31,
    beta: 1.0,
    fiftyTwoWeekHigh: 228.50,
    fiftyTwoWeekLow: 183.40
  },
  'VTSAX': {
    marketCap: 0,
    peRatio: 24.5,
    eps: 0,
    dividendYield: 1.38,
    beta: 1.0,
    fiftyTwoWeekHigh: 140.20,
    fiftyTwoWeekLow: 111.25
  },
  'VGTSX': {
    marketCap: 0,
    peRatio: 16.8,
    eps: 0,
    dividendYield: 2.95,
    beta: 0.92,
    fiftyTwoWeekHigh: 21.45,
    fiftyTwoWeekLow: 16.80
  },
  'VBTLX': {
    marketCap: 0,
    peRatio: 0,
    eps: 0,
    dividendYield: 3.85,
    beta: 0.15,
    fiftyTwoWeekHigh: 12.85,
    fiftyTwoWeekLow: 10.20
  },
  'PRMTX': {
    marketCap: 0,
    peRatio: 28.5,
    eps: 0,
    dividendYield: 0.42,
    beta: 1.15,
    fiftyTwoWeekHigh: 195.80,
    fiftyTwoWeekLow: 142.50
  },
  'FCNTX': {
    marketCap: 0,
    peRatio: 24.8,
    eps: 0,
    dividendYield: 0.18,
    beta: 1.08,
    fiftyTwoWeekHigh: 28.45,
    fiftyTwoWeekLow: 21.30
  },
  'VWELX': {
    marketCap: 0,
    peRatio: 20.5,
    eps: 0,
    dividendYield: 2.15,
    beta: 0.68,
    fiftyTwoWeekHigh: 52.80,
    fiftyTwoWeekLow: 43.20
  },
  'VWINX': {
    marketCap: 0,
    peRatio: 18.2,
    eps: 0,
    dividendYield: 2.85,
    beta: 0.45,
    fiftyTwoWeekHigh: 31.50,
    fiftyTwoWeekLow: 27.80
  },
  'DODGX': {
    marketCap: 0,
    peRatio: 16.8,
    eps: 0,
    dividendYield: 1.25,
    beta: 0.95,
    fiftyTwoWeekHigh: 315.40,
    fiftyTwoWeekLow: 248.90
  },
  'TRBCX': {
    marketCap: 0,
    peRatio: 26.5,
    eps: 0,
    dividendYield: 0.52,
    beta: 1.12,
    fiftyTwoWeekHigh: 92.50,
    fiftyTwoWeekLow: 68.40
  },

  // === REITs ===
  'O': {
    marketCap: 48000000000,
    peRatio: 52.5,
    eps: 1.42,
    dividendYield: 5.85,
    beta: 0.62,
    fiftyTwoWeekHigh: 68.50,
    fiftyTwoWeekLow: 52.40
  },
  'PLD': {
    marketCap: 125000000000,
    peRatio: 42.8,
    eps: 3.15,
    dividendYield: 3.12,
    beta: 0.85,
    fiftyTwoWeekHigh: 142.50,
    fiftyTwoWeekLow: 108.20
  },
  'AMT': {
    marketCap: 98000000000,
    peRatio: 48.5,
    eps: 4.52,
    dividendYield: 3.45,
    beta: 0.58,
    fiftyTwoWeekHigh: 228.40,
    fiftyTwoWeekLow: 182.50
  },

  // === Bond ETFs ===
  'BND': {
    marketCap: 102000000000,
    peRatio: 0,
    eps: 0,
    dividendYield: 4.25,
    beta: 0.08,
    fiftyTwoWeekHigh: 73.50,
    fiftyTwoWeekLow: 69.20
  },
  'TLT': {
    marketCap: 45000000000,
    peRatio: 0,
    eps: 0,
    dividendYield: 4.85,
    beta: -0.32,
    fiftyTwoWeekHigh: 98.50,
    fiftyTwoWeekLow: 82.40
  },
  'LQD': {
    marketCap: 38000000000,
    peRatio: 0,
    eps: 0,
    dividendYield: 5.15,
    beta: 0.18,
    fiftyTwoWeekHigh: 108.50,
    fiftyTwoWeekLow: 98.20
  },

  // === Sector ETFs ===
  'XLF': {
    marketCap: 52000000000,
    peRatio: 15.2,
    eps: 0,
    dividendYield: 1.85,
    beta: 1.12,
    fiftyTwoWeekHigh: 48.50,
    fiftyTwoWeekLow: 36.20
  },
  'XLK': {
    marketCap: 68000000000,
    peRatio: 35.8,
    eps: 0,
    dividendYield: 0.68,
    beta: 1.18,
    fiftyTwoWeekHigh: 245.80,
    fiftyTwoWeekLow: 182.40
  },
  'XLE': {
    marketCap: 38000000000,
    peRatio: 12.5,
    eps: 0,
    dividendYield: 3.45,
    beta: 1.05,
    fiftyTwoWeekHigh: 95.50,
    fiftyTwoWeekLow: 72.80
  },

  // === Thematic ETFs ===
  'ARKK': {
    marketCap: 8500000000,
    peRatio: 0,
    eps: 0,
    dividendYield: 0,
    beta: 1.85,
    fiftyTwoWeekHigh: 58.20,
    fiftyTwoWeekLow: 38.50
  },
  'ICLN': {
    marketCap: 5200000000,
    peRatio: 0,
    eps: 0,
    dividendYield: 0.85,
    beta: 1.42,
    fiftyTwoWeekHigh: 24.80,
    fiftyTwoWeekLow: 17.20
  },
  'SOXX': {
    marketCap: 12000000000,
    peRatio: 0,
    eps: 0,
    dividendYield: 0.52,
    beta: 1.45,
    fiftyTwoWeekHigh: 265.80,
    fiftyTwoWeekLow: 182.50
  },

  // === Additional ETFs ===
  'SLV': {
    marketCap: 14000000000,
    peRatio: 0,
    eps: 0,
    dividendYield: 0,
    beta: 0.52,
    fiftyTwoWeekHigh: 32.50,
    fiftyTwoWeekLow: 22.80
  },
  'DIA': {
    marketCap: 32000000000,
    peRatio: 23.5,
    eps: 0,
    dividendYield: 1.68,
    beta: 0.98,
    fiftyTwoWeekHigh: 450.20,
    fiftyTwoWeekLow: 370.80
  },
  'IWM': {
    marketCap: 68000000000,
    peRatio: 0,
    eps: 0,
    dividendYield: 1.25,
    beta: 1.18,
    fiftyTwoWeekHigh: 235.50,
    fiftyTwoWeekLow: 185.40
  },
  'SCHD': {
    marketCap: 62000000000,
    peRatio: 16.8,
    eps: 0,
    dividendYield: 3.52,
    beta: 0.92,
    fiftyTwoWeekHigh: 32.80,
    fiftyTwoWeekLow: 26.50
  },
  'VXUS': {
    marketCap: 95000000000,
    peRatio: 16.2,
    eps: 0,
    dividendYield: 3.15,
    beta: 0.88,
    fiftyTwoWeekHigh: 72.50,
    fiftyTwoWeekLow: 58.20
  },
  'FXI': {
    marketCap: 8200000000,
    peRatio: 10.5,
    eps: 0,
    dividendYield: 4.25,
    beta: 0.95,
    fiftyTwoWeekHigh: 32.80,
    fiftyTwoWeekLow: 22.40
  }
}

export function getFallbackData(symbol: string) {
  return STOCK_DATA_FALLBACK[symbol] || null
}

export function hasFallbackData(symbol: string): boolean {
  return symbol in STOCK_DATA_FALLBACK
}
