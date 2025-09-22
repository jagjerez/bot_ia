import { OHLCV } from './indicators'
import { SimpleMLTradingStrategy } from './simple-ml-strategy'

export interface BacktestResult {
  totalTrades: number
  winningTrades: number
  losingTrades: number
  winRate: number
  totalReturn: number
  maxDrawdown: number
  sharpeRatio: number
  trades: TradeResult[]
  equityCurve: number[]
  metrics: {
    avgWin: number
    avgLoss: number
    profitFactor: number
    maxConsecutiveWins: number
    maxConsecutiveLosses: number
  }
}

export interface TradeResult {
  entryTime: number
  exitTime: number
  entryPrice: number
  exitPrice: number
  side: 'buy' | 'sell'
  return: number
  duration: number
  confidence: number
}

export class Backtester {
  private strategy: SimpleMLTradingStrategy
  private initialCapital: number
  private positionSize: number
  private commission: number

  constructor(
    initialCapital: number = 10000,
    positionSize: number = 0.1, // 10% of capital per trade
    commission: number = 0.001 // 0.1% commission
  ) {
    this.strategy = new SimpleMLTradingStrategy()
    this.initialCapital = initialCapital
    this.positionSize = positionSize
    this.commission = commission
  }

  async runBacktest(
    data: OHLCV[],
    trainingPeriod: number = 500,
    minConfidence: number = 0.6
  ): Promise<BacktestResult> {
    console.log('Starting backtest...')
    
    // Split data into training and testing
    const trainingData = data.slice(0, trainingPeriod)
    const testingData = data.slice(trainingPeriod)
    
    // Train the model
    const trainingSuccess = await this.strategy.trainModels(trainingData)
    if (!trainingSuccess) {
      throw new Error('Failed to train ML models')
    }

    // Run backtest
    const trades: TradeResult[] = []
    const equityCurve: number[] = []
    let currentCapital = this.initialCapital
    let currentPosition: { side: 'buy' | 'sell'; entryPrice: number; entryTime: number; confidence: number } | null = null
    let maxCapital = this.initialCapital
    let maxDrawdown = 0

    equityCurve.push(currentCapital)

    for (let i = 0; i < testingData.length; i++) {
      const currentData = testingData.slice(0, i + 1)
      const currentPrice = testingData[i].close
      const currentTime = testingData[i].timestamp

      // Get ML prediction
      const prediction = await this.strategy.predict(currentData)
      
      // Check if we should enter a position
      if (!currentPosition && prediction.confidence >= minConfidence) {
        if (prediction.action === 'buy' || prediction.action === 'sell') {
          currentPosition = {
            side: prediction.action,
            entryPrice: currentPrice,
            entryTime: currentTime,
            confidence: prediction.confidence
          }
        }
      }
      
      // Check if we should exit a position
      if (currentPosition) {
        let shouldExit = false
        // let exitReason = ''

        // Check stop loss
        if (prediction.stopLoss) {
          if (currentPosition.side === 'buy' && currentPrice <= prediction.stopLoss) {
            shouldExit = true
            // exitReason = 'stop_loss'
          } else if (currentPosition.side === 'sell' && currentPrice >= prediction.stopLoss) {
            shouldExit = true
            // exitReason = 'stop_loss'
          }
        }

        // Check take profit (price target)
        if (prediction.priceTarget) {
          if (currentPosition.side === 'buy' && currentPrice >= prediction.priceTarget) {
            shouldExit = true
            // exitReason = 'take_profit'
          } else if (currentPosition.side === 'sell' && currentPrice <= prediction.priceTarget) {
            shouldExit = true
            // exitReason = 'take_profit'
          }
        }

        // Check opposite signal
        if (prediction.action === (currentPosition.side === 'buy' ? 'sell' : 'buy') && 
            prediction.confidence >= minConfidence) {
          shouldExit = true
          // exitReason = 'opposite_signal'
        }

        // Exit position
        if (shouldExit) {
          const tradeReturn = this.calculateTradeReturn(
            currentPosition.side,
            currentPosition.entryPrice,
            currentPrice
          )
          
          const trade: TradeResult = {
            entryTime: currentPosition.entryTime,
            exitTime: currentTime,
            entryPrice: currentPosition.entryPrice,
            exitPrice: currentPrice,
            side: currentPosition.side,
            return: tradeReturn,
            duration: currentTime - currentPosition.entryTime,
            confidence: currentPosition.confidence
          }
          
          trades.push(trade)
          
          // Update capital
          const tradeValue = currentCapital * this.positionSize
          const profit = tradeValue * tradeReturn
          const commissionCost = tradeValue * this.commission * 2 // Entry + exit
          currentCapital += profit - commissionCost
          
          // Update max drawdown
          if (currentCapital > maxCapital) {
            maxCapital = currentCapital
          }
          const drawdown = (maxCapital - currentCapital) / maxCapital
          if (drawdown > maxDrawdown) {
            maxDrawdown = drawdown
          }
          
          currentPosition = null
        }
      }

      equityCurve.push(currentCapital)
    }

    // Close any remaining position
    if (currentPosition) {
      const lastPrice = testingData[testingData.length - 1].close
      const lastTime = testingData[testingData.length - 1].timestamp
      
      const tradeReturn = this.calculateTradeReturn(
        currentPosition.side,
        currentPosition.entryPrice,
        lastPrice
      )
      
      const trade: TradeResult = {
        entryTime: currentPosition.entryTime,
        exitTime: lastTime,
        entryPrice: currentPosition.entryPrice,
        exitPrice: lastPrice,
        side: currentPosition.side,
        return: tradeReturn,
        duration: lastTime - currentPosition.entryTime,
        confidence: currentPosition.confidence
      }
      
      trades.push(trade)
      
      const tradeValue = currentCapital * this.positionSize
      const profit = tradeValue * tradeReturn
      const commissionCost = tradeValue * this.commission * 2
      currentCapital += profit - commissionCost
      equityCurve.push(currentCapital)
    }

    // Calculate metrics
    const result = this.calculateMetrics(trades, equityCurve, this.initialCapital)
    
    console.log('Backtest completed')
    console.log(`Total Return: ${(result.totalReturn * 100).toFixed(2)}%`)
    console.log(`Win Rate: ${(result.winRate * 100).toFixed(2)}%`)
    console.log(`Max Drawdown: ${(result.maxDrawdown * 100).toFixed(2)}%`)
    console.log(`Sharpe Ratio: ${result.sharpeRatio.toFixed(2)}`)
    
    return result
  }

  private calculateTradeReturn(side: 'buy' | 'sell', entryPrice: number, exitPrice: number): number {
    if (side === 'buy') {
      return (exitPrice - entryPrice) / entryPrice
    } else {
      return (entryPrice - exitPrice) / entryPrice
    }
  }

  private calculateMetrics(trades: TradeResult[], equityCurve: number[], initialCapital: number): BacktestResult {
    const totalTrades = trades.length
    const winningTrades = trades.filter(t => t.return > 0).length
    const losingTrades = trades.filter(t => t.return < 0).length
    const winRate = totalTrades > 0 ? winningTrades / totalTrades : 0
    
    const totalReturn = (equityCurve[equityCurve.length - 1] - initialCapital) / initialCapital
    
    // Calculate max drawdown
    let maxDrawdown = 0
    let peak = initialCapital
    for (const equity of equityCurve) {
      if (equity > peak) {
        peak = equity
      }
      const drawdown = (peak - equity) / peak
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown
      }
    }
    
    // Calculate Sharpe ratio
    const returns = equityCurve.slice(1).map((equity, i) => 
      (equity - equityCurve[i]) / equityCurve[i]
    )
    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length
    const returnStd = Math.sqrt(
      returns.reduce((acc, ret) => acc + Math.pow(ret - avgReturn, 2), 0) / returns.length
    )
    const sharpeRatio = returnStd > 0 ? avgReturn / returnStd : 0
    
    // Calculate additional metrics
    const winningReturns = trades.filter(t => t.return > 0).map(t => t.return)
    const losingReturns = trades.filter(t => t.return < 0).map(t => t.return)
    
    const avgWin = winningReturns.length > 0 ? 
      winningReturns.reduce((a, b) => a + b, 0) / winningReturns.length : 0
    const avgLoss = losingReturns.length > 0 ? 
      Math.abs(losingReturns.reduce((a, b) => a + b, 0) / losingReturns.length) : 0
    
    const profitFactor = avgLoss > 0 ? (avgWin * winningReturns.length) / (avgLoss * losingReturns.length) : 0
    
    // Calculate consecutive wins/losses
    let maxConsecutiveWins = 0
    let maxConsecutiveLosses = 0
    let currentWins = 0
    let currentLosses = 0
    
    for (const trade of trades) {
      if (trade.return > 0) {
        currentWins++
        currentLosses = 0
        maxConsecutiveWins = Math.max(maxConsecutiveWins, currentWins)
      } else {
        currentLosses++
        currentWins = 0
        maxConsecutiveLosses = Math.max(maxConsecutiveLosses, currentLosses)
      }
    }

    return {
      totalTrades,
      winningTrades,
      losingTrades,
      winRate,
      totalReturn,
      maxDrawdown,
      sharpeRatio,
      trades,
      equityCurve,
      metrics: {
        avgWin,
        avgLoss,
        profitFactor,
        maxConsecutiveWins,
        maxConsecutiveLosses
      }
    }
  }
}
