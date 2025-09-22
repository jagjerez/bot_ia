import { exchangeManager } from './exchange'
import { prisma } from './prisma'
import { TradingStrategy, TradeCreateInput } from '@/types'
import { SimpleMLTradingStrategy, MLPrediction } from './simple-ml-strategy'
import { Backtester, BacktestResult } from './backtesting'
import { OHLCV } from './indicators'

class TradingBot {
  private isRunning: boolean = false
  private intervalId: NodeJS.Timeout | null = null
  private strategy: TradingStrategy = {
    buyThreshold: 1.0, // 1% drop
    sellThreshold: 1.0, // 1% gain
    timeWindow: 5, // 5 minutes
  }
  private mlStrategy: SimpleMLTradingStrategy
  private backtester: Backtester
  private useMLStrategy: boolean = true
  private minConfidence: number = 0.6
  private historicalData: OHLCV[] = []
  private maxHistoricalData: number = 1000
  private simulationMode: boolean = true // Por defecto en modo simulación
  private realTradingEnabled: boolean = false // Solo se puede activar manualmente

  constructor() {
    this.mlStrategy = new SimpleMLTradingStrategy()
    this.backtester = new Backtester()
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      throw new Error('Bot is already running')
    }

    this.isRunning = true
    
    // Update database status
    await prisma.botStatus.upsert({
      where: { id: '1' },
      update: { running: true, updatedAt: new Date() },
      create: { id: '1', running: true, updatedAt: new Date() },
    })

    // Start the trading loop
    this.intervalId = setInterval(async () => {
      try {
        await this.executeStrategy()
      } catch (error) {
        console.error('Error in trading loop:', error)
      }
    }, 30000) // Run every 30 seconds

    console.log('Trading bot started')
  }

  async stop(): Promise<void> {
    if (!this.isRunning) {
      throw new Error('Bot is not running')
    }

    this.isRunning = false
    
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }

    // Update database status
    await prisma.botStatus.upsert({
      where: { id: '1' },
      update: { running: false, updatedAt: new Date() },
      create: { id: '1', running: false, updatedAt: new Date() },
    })

    console.log('Trading bot stopped')
  }

  async getStatus(): Promise<boolean> {
    return this.isRunning
  }

  private async executeStrategy(): Promise<void> {
    try {
      const symbol = 'BTC/USDT' // Default trading pair
      
      // Get current price
      const currentTicker = await exchangeManager.getTicker(symbol)
      const currentPrice = currentTicker.price

      // Get historical prices for ML analysis
      const historicalPrices = await exchangeManager.getHistoricalPrices(symbol, '1m', 100)
      
      if (historicalPrices.length < 50) {
        console.log('Not enough historical data for ML analysis')
        return
      }

      // Convert to OHLCV format for indicators (object format)
      const ohlcvData = historicalPrices.map(candle => ({
        timestamp: candle[0] || 0,
        open: candle[1] || 0,
        high: candle[2] || 0,
        low: candle[3] || 0,
        close: candle[4] || 0,
        volume: candle[5] || 0
      }))

      // Update historical data
      this.updateHistoricalData(ohlcvData)

      if (this.useMLStrategy) {
        // Use ML strategy
        await this.executeMLStrategy(symbol, currentPrice, ohlcvData)
      } else {
        // Use simple strategy
        await this.executeSimpleStrategy(symbol, currentPrice, historicalPrices as number[][])
      }
    } catch (error) {
      console.error('Error executing strategy:', error)
    }
  }

  private async executeMLStrategy(symbol: string, currentPrice: number, ohlcvData: OHLCV[]): Promise<void> {
    try {
      // Get ML prediction
      const prediction = await this.mlStrategy.predict(ohlcvData)
      
      console.log(`ML Prediction: ${prediction.action} (confidence: ${(prediction.confidence * 100).toFixed(1)}%)`)
      
      if (prediction.confidence >= this.minConfidence) {
        if (prediction.action === 'buy') {
          await this.executeBuy(symbol, currentPrice, prediction)
        } else if (prediction.action === 'sell') {
          await this.executeSell(symbol, currentPrice, prediction)
        }
      }
    } catch (error) {
      console.error('Error executing ML strategy:', error)
    }
  }

  private async executeSimpleStrategy(symbol: string, currentPrice: number, historicalPrices: number[][]): Promise<void> {
    // Calculate price change percentage
    const oldestPrice = historicalPrices[0][4] // Close price of oldest candle
    const priceChangePercent = ((currentPrice - oldestPrice) / oldestPrice) * 100

    console.log(`Price change: ${priceChangePercent.toFixed(2)}%`)

    // Check if we should buy (price dropped by threshold)
    if (priceChangePercent <= -this.strategy.buyThreshold) {
      await this.executeBuy(symbol, currentPrice)
    }
    // Check if we should sell (price increased by threshold)
    else if (priceChangePercent >= this.strategy.sellThreshold) {
      await this.executeSell(symbol, currentPrice)
    }
  }

  private updateHistoricalData(newData: OHLCV[]): void {
    this.historicalData = [...this.historicalData, ...newData]
    if (this.historicalData.length > this.maxHistoricalData) {
      this.historicalData = this.historicalData.slice(-this.maxHistoricalData)
    }
  }

  private async executeBuy(symbol: string, price: number, prediction?: MLPrediction): Promise<void> {
    try {
      const amount = 0.001 // Small amount for demo
      
      const confidence = prediction ? ` (confidence: ${(prediction.confidence * 100).toFixed(1)}%)` : ''
      const priceTarget = prediction?.priceTarget ? ` (target: $${prediction.priceTarget.toFixed(2)})` : ''
      const stopLoss = prediction?.stopLoss ? ` (stop: $${prediction.stopLoss.toFixed(2)})` : ''
      const mode = this.simulationMode ? ' [SIMULATION]' : ' [REAL TRADE]'
      
      console.log(`BUY signal: ${symbol} at ${price}${confidence}${priceTarget}${stopLoss}${mode}`)
      
      if (this.simulationMode) {
        // Modo simulación - solo logear
        console.log(`🔄 SIMULATED BUY: ${symbol} at $${price} (Amount: ${amount})`)
      } else if (this.realTradingEnabled) {
        // Modo real - ejecutar orden real
        try {
          const order = await exchangeManager.createOrder(symbol, 'market', 'buy', amount)
          console.log('✅ REAL BUY order executed:', order)
        } catch (error) {
          console.error('❌ Error executing real buy order:', error)
          return
        }
      } else {
        console.log('⚠️ Real trading is disabled. Enable it manually to execute real trades.')
        return
      }
      
      // Log trade to database (tanto simulado como real)
      await this.logTrade({
        symbol,
        side: 'buy',
        price,
        amount,
      })
    } catch (error) {
      console.error('Error executing buy:', error)
    }
  }

  private async executeSell(symbol: string, price: number, prediction?: MLPrediction): Promise<void> {
    try {
      const amount = 0.001 // Small amount for demo
      
      const confidence = prediction ? ` (confidence: ${(prediction.confidence * 100).toFixed(1)}%)` : ''
      const priceTarget = prediction?.priceTarget ? ` (target: $${prediction.priceTarget.toFixed(2)})` : ''
      const stopLoss = prediction?.stopLoss ? ` (stop: $${prediction.stopLoss.toFixed(2)})` : ''
      const mode = this.simulationMode ? ' [SIMULATION]' : ' [REAL TRADE]'
      
      console.log(`SELL signal: ${symbol} at ${price}${confidence}${priceTarget}${stopLoss}${mode}`)
      
      if (this.simulationMode) {
        // Modo simulación - solo logear
        console.log(`🔄 SIMULATED SELL: ${symbol} at $${price} (Amount: ${amount})`)
      } else if (this.realTradingEnabled) {
        // Modo real - ejecutar orden real
        try {
          const order = await exchangeManager.createOrder(symbol, 'market', 'sell', amount)
          console.log('✅ REAL SELL order executed:', order)
        } catch (error) {
          console.error('❌ Error executing real sell order:', error)
          return
        }
      } else {
        console.log('⚠️ Real trading is disabled. Enable it manually to execute real trades.')
        return
      }
      
      // Log trade to database (tanto simulado como real)
      await this.logTrade({
        symbol,
        side: 'sell',
        price,
        amount,
      })
    } catch (error) {
      console.error('Error executing sell:', error)
    }
  }

  private async logTrade(trade: TradeCreateInput): Promise<void> {
    try {
      await prisma.trade.create({
        data: trade,
      })
      console.log('Trade logged to database:', trade)
    } catch (error) {
      console.error('Error logging trade:', error)
    }
  }

  updateStrategy(newStrategy: Partial<TradingStrategy>): void {
    this.strategy = { ...this.strategy, ...newStrategy }
    console.log('Strategy updated:', this.strategy)
  }

  getStrategy(): TradingStrategy {
    return { ...this.strategy }
  }

  // ML Strategy methods
  async trainMLModel(): Promise<boolean> {
    try {
      if (this.historicalData.length < 500) {
        console.log('Not enough historical data for training. Need at least 500 data points.')
        return false
      }

      console.log('Training ML model with historical data...')
      const success = await this.mlStrategy.trainModels(this.historicalData)
      
      if (success) {
        console.log('ML model trained successfully!')
      } else {
        console.log('Failed to train ML model')
      }
      
      return success
    } catch (error) {
      console.error('Error training ML model:', error)
      return false
    }
  }

  async runBacktest(_initialCapital: number = 10000, minConfidence: number = 0.6): Promise<BacktestResult | null> {
    try {
      if (this.historicalData.length < 500) {
        console.log('Not enough historical data for backtesting. Need at least 500 data points.')
        return null
      }

      console.log('Running backtest...')
      const result = await this.backtester.runBacktest(this.historicalData, 500, minConfidence)
      
      console.log('Backtest completed!')
      console.log(`Total Return: ${(result.totalReturn * 100).toFixed(2)}%`)
      console.log(`Win Rate: ${(result.winRate * 100).toFixed(2)}%`)
      console.log(`Max Drawdown: ${(result.maxDrawdown * 100).toFixed(2)}%`)
      
      return result
    } catch (error) {
      console.error('Error running backtest:', error)
      return null
    }
  }

  setMLStrategy(enabled: boolean): void {
    this.useMLStrategy = enabled
    console.log(`ML Strategy ${enabled ? 'enabled' : 'disabled'}`)
  }

  setMinConfidence(confidence: number): void {
    this.minConfidence = Math.max(0, Math.min(1, confidence))
    console.log(`Minimum confidence set to ${(this.minConfidence * 100).toFixed(1)}%`)
  }

  getMLStatus() {
    return {
      useMLStrategy: this.useMLStrategy,
      minConfidence: this.minConfidence,
      historicalDataLength: this.historicalData.length,
      modelStatus: this.mlStrategy.getModelStatus()
    }
  }

  // Simulation and Real Trading Control
  setSimulationMode(enabled: boolean): void {
    this.simulationMode = enabled
    console.log(`Simulation mode ${enabled ? 'enabled' : 'disabled'}`)
  }

  enableRealTrading(): void {
    if (this.simulationMode) {
      console.log('⚠️ Cannot enable real trading while in simulation mode. Disable simulation first.')
      return
    }
    this.realTradingEnabled = true
    console.log('✅ Real trading ENABLED - This will execute real trades!')
  }

  disableRealTrading(): void {
    this.realTradingEnabled = false
    console.log('🔒 Real trading DISABLED - All trades will be simulated')
  }

  getTradingStatus() {
    return {
      simulationMode: this.simulationMode,
      realTradingEnabled: this.realTradingEnabled,
      isRealTrading: !this.simulationMode && this.realTradingEnabled
    }
  }

  // Historical data methods
  async loadHistoricalData(symbol: string = 'BTC/USDT', limit: number = 200): Promise<void> {
    try {
      console.log(`Loading historical data for ${symbol}...`)
      const historicalPrices = await exchangeManager.getHistoricalPrices(symbol, '1m', limit)
      
      const ohlcvData: OHLCV[] = historicalPrices.map(candle => ({
        open: candle[1] || 0,
        high: candle[2] || 0,
        low: candle[3] || 0,
        close: candle[4] || 0,
        volume: candle[5] || 0,
        timestamp: candle[0] || 0
      }))

      this.historicalData = ohlcvData
      console.log(`✅ Loaded ${ohlcvData.length} historical data points`)
    } catch (error) {
      console.error('Error loading historical data:', error)
    }
  }

  getHistoricalData(): OHLCV[] {
    return this.historicalData
  }
}

// Singleton instance
export const tradingBot = new TradingBot()
