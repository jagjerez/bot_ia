export interface Trade {
  id: string
  symbol: string
  side: 'buy' | 'sell'
  price: number
  amount: number
  timestamp: string
  createdAt: string
}

export interface BotStatus {
  id: string
  running: boolean
  updatedAt: string
}

export interface TickerData {
  symbol: string
  price: number
  timestamp: number
}

export interface TradingStrategy {
  buyThreshold: number // percentage drop to trigger buy
  sellThreshold: number // percentage gain to trigger sell
  timeWindow: number // minutes to look back for price changes
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export interface TradeCreateInput {
  symbol: string
  side: 'buy' | 'sell'
  price: number
  amount: number
}
