import ccxt from 'ccxt'
import { TickerData } from '@/types'

class ExchangeManager {
  private exchange: any
  private isSandbox: boolean

  constructor() {
    const apiKey = process.env.BINANCE_API_KEY
    const secret = process.env.BINANCE_SECRET
    this.isSandbox = process.env.BINANCE_SANDBOX === 'true'

    if (!apiKey || !secret) {
      throw new Error('Binance API credentials not found in environment variables')
    }

    this.exchange = new ccxt.binance({
      apiKey,
      secret,
      sandbox: this.isSandbox,
      enableRateLimit: true,
      options: {
        defaultType: 'spot', // or 'future' for futures trading
      },
    })
  }

  async getTicker(symbol: string): Promise<TickerData> {
    try {
      const ticker = await this.exchange.fetchTicker(symbol)
      return {
        symbol: ticker.symbol,
        price: ticker.last || 0,
        timestamp: ticker.timestamp || Date.now(),
      }
    } catch (error) {
      console.error(`Error fetching ticker for ${symbol}:`, error)
      throw new Error(`Failed to fetch ticker for ${symbol}`)
    }
  }

  async getHistoricalPrices(symbol: string, timeframe: string = '1m', limit: number = 100): Promise<any[]> {
    try {
      const ohlcv = await this.exchange.fetchOHLCV(symbol, timeframe, undefined, limit)
      return ohlcv
    } catch (error) {
      console.error(`Error fetching historical prices for ${symbol}:`, error)
      throw new Error(`Failed to fetch historical prices for ${symbol}`)
    }
  }

  async getAccountBalance(): Promise<any> {
    try {
      const balance = await this.exchange.fetchBalance()
      return balance
    } catch (error) {
      console.error('Error fetching account balance:', error)
      throw new Error('Failed to fetch account balance')
    }
  }

  async createOrder(symbol: string, type: string, side: string, amount: number, price?: number): Promise<any> {
    try {
      const order = await this.exchange.createOrder(symbol, type, side, amount, price)
      return order
    } catch (error) {
      console.error(`Error creating ${side} order for ${symbol}:`, error)
      throw new Error(`Failed to create ${side} order for ${symbol}`)
    }
  }

  isConnected(): boolean {
    return this.exchange && this.exchange.has['fetchTicker']
  }

  getExchangeInfo() {
    return {
      name: this.exchange.name,
      sandbox: this.isSandbox,
      has: this.exchange.has,
    }
  }
}

// Singleton instance
export const exchangeManager = new ExchangeManager()
