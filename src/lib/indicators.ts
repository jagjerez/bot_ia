import { mean, standardDeviation } from 'simple-statistics'

export interface OHLCV {
  open: number
  high: number
  low: number
  close: number
  volume: number
  timestamp: number
}

export interface TechnicalIndicators {
  sma: number[]
  ema: number[]
  rsi: number[]
  macd: { macd: number; signal: number; histogram: number }[]
  bollinger: { upper: number; middle: number; lower: number }[]
  atr: number[]
  stoch: { k: number; d: number }[]
  williams: number[]
  cci: number[]
  obv: number[]
}

export class TechnicalAnalysis {
  private data: OHLCV[]

  constructor(data: OHLCV[]) {
    this.data = data
  }

  // Simple Moving Average
  sma(period: number): number[] {
    const result: number[] = []
    for (let i = 0; i < this.data.length; i++) {
      if (i < period - 1) {
        result.push(NaN)
      } else {
        const slice = this.data.slice(i - period + 1, i + 1)
        const sum = slice.reduce((acc, candle) => acc + candle.close, 0)
        result.push(sum / period)
      }
    }
    return result
  }

  // Exponential Moving Average
  ema(period: number): number[] {
    const result: number[] = []
    const multiplier = 2 / (period + 1)
    
    for (let i = 0; i < this.data.length; i++) {
      if (i === 0) {
        result.push(this.data[i].close)
      } else {
        const ema = (this.data[i].close * multiplier) + (result[i - 1] * (1 - multiplier))
        result.push(ema)
      }
    }
    return result
  }

  // Relative Strength Index
  rsi(period: number = 14): number[] {
    const result: number[] = []
    const gains: number[] = []
    const losses: number[] = []

    for (let i = 0; i < this.data.length; i++) {
      if (i === 0) {
        gains.push(0)
        losses.push(0)
        result.push(NaN)
      } else {
        const change = this.data[i].close - this.data[i - 1].close
        gains.push(change > 0 ? change : 0)
        losses.push(change < 0 ? Math.abs(change) : 0)

        if (i < period) {
          result.push(NaN)
        } else {
          const avgGain = gains.slice(i - period + 1, i + 1).reduce((a, b) => a + b) / period
          const avgLoss = losses.slice(i - period + 1, i + 1).reduce((a, b) => a + b) / period
          
          if (avgLoss === 0) {
            result.push(100)
          } else {
            const rs = avgGain / avgLoss
            const rsi = 100 - (100 / (1 + rs))
            result.push(rsi)
          }
        }
      }
    }
    return result
  }

  // MACD
  macd(fastPeriod: number = 12, slowPeriod: number = 26, signalPeriod: number = 9) {
    const fastEMA = this.ema(fastPeriod)
    const slowEMA = this.ema(slowPeriod)
    const macdLine = fastEMA.map((fast, i) => fast - slowEMA[i])
    
    // Calculate signal line (EMA of MACD)
    const signalLine: number[] = []
    const multiplier = 2 / (signalPeriod + 1)
    
    for (let i = 0; i < macdLine.length; i++) {
      if (i === 0) {
        signalLine.push(macdLine[i])
      } else {
        const signal = (macdLine[i] * multiplier) + (signalLine[i - 1] * (1 - multiplier))
        signalLine.push(signal)
      }
    }
    
    const histogram = macdLine.map((macd, i) => macd - signalLine[i])
    
    return {
      macd: macdLine,
      signal: signalLine,
      histogram
    }
  }

  // Bollinger Bands
  bollinger(period: number = 20, stdDev: number = 2) {
    const sma = this.sma(period)
    const result: { upper: number; middle: number; lower: number }[] = []
    
    for (let i = 0; i < this.data.length; i++) {
      if (i < period - 1) {
        result.push({ upper: NaN, middle: NaN, lower: NaN })
      } else {
        const slice = this.data.slice(i - period + 1, i + 1)
        const prices = slice.map(candle => candle.close)
        const std = standardDeviation(prices)
        const middle = sma[i]
        const upper = middle + (stdDev * std)
        const lower = middle - (stdDev * std)
        
        result.push({ upper, middle, lower })
      }
    }
    
    return result
  }

  // Average True Range
  atr(period: number = 14): number[] {
    const trueRanges: number[] = []
    
    for (let i = 0; i < this.data.length; i++) {
      if (i === 0) {
        trueRanges.push(this.data[i].high - this.data[i].low)
      } else {
        const tr1 = this.data[i].high - this.data[i].low
        const tr2 = Math.abs(this.data[i].high - this.data[i - 1].close)
        const tr3 = Math.abs(this.data[i].low - this.data[i - 1].close)
        trueRanges.push(Math.max(tr1, tr2, tr3))
      }
    }
    
    const result: number[] = []
    for (let i = 0; i < this.data.length; i++) {
      if (i < period - 1) {
        result.push(NaN)
      } else {
        const slice = trueRanges.slice(i - period + 1, i + 1)
        const atr = slice.reduce((a, b) => a + b) / period
        result.push(atr)
      }
    }
    
    return result
  }

  // Stochastic Oscillator
  stoch(kPeriod: number = 14, dPeriod: number = 3) {
    const result: { k: number; d: number }[] = []
    const kValues: number[] = []
    
    for (let i = 0; i < this.data.length; i++) {
      if (i < kPeriod - 1) {
        kValues.push(NaN)
        result.push({ k: NaN, d: NaN })
      } else {
        const slice = this.data.slice(i - kPeriod + 1, i + 1)
        const highest = Math.max(...slice.map(c => c.high))
        const lowest = Math.min(...slice.map(c => c.low))
        const current = this.data[i].close
        
        const k = ((current - lowest) / (highest - lowest)) * 100
        kValues.push(k)
        
        if (i < kPeriod + dPeriod - 2) {
          result.push({ k, d: NaN })
        } else {
          const dSlice = kValues.slice(i - dPeriod + 1, i + 1)
          const d = dSlice.reduce((a, b) => a + b) / dPeriod
          result.push({ k, d })
        }
      }
    }
    
    return result
  }

  // Williams %R
  williams(period: number = 14): number[] {
    const result: number[] = []
    
    for (let i = 0; i < this.data.length; i++) {
      if (i < period - 1) {
        result.push(NaN)
      } else {
        const slice = this.data.slice(i - period + 1, i + 1)
        const highest = Math.max(...slice.map(c => c.high))
        const lowest = Math.min(...slice.map(c => c.low))
        const current = this.data[i].close
        
        const williams = ((highest - current) / (highest - lowest)) * -100
        result.push(williams)
      }
    }
    
    return result
  }

  // Commodity Channel Index
  cci(period: number = 20): number[] {
    const result: number[] = []
    
    for (let i = 0; i < this.data.length; i++) {
      if (i < period - 1) {
        result.push(NaN)
      } else {
        const slice = this.data.slice(i - period + 1, i + 1)
        const typicalPrices = slice.map(c => (c.high + c.low + c.close) / 3)
        const sma = typicalPrices.reduce((a, b) => a + b) / period
        const meanDeviation = typicalPrices.reduce((acc, tp) => acc + Math.abs(tp - sma), 0) / period
        
        const currentTP = (this.data[i].high + this.data[i].low + this.data[i].close) / 3
        const cci = (currentTP - sma) / (0.015 * meanDeviation)
        result.push(cci)
      }
    }
    
    return result
  }

  // On-Balance Volume
  obv(): number[] {
    const result: number[] = []
    let obv = 0
    
    for (let i = 0; i < this.data.length; i++) {
      if (i === 0) {
        obv = this.data[i].volume
      } else {
        if (this.data[i].close > this.data[i - 1].close) {
          obv += this.data[i].volume
        } else if (this.data[i].close < this.data[i - 1].close) {
          obv -= this.data[i].volume
        }
      }
      result.push(obv)
    }
    
    return result
  }

  // Get all indicators
  getAllIndicators(): TechnicalIndicators {
    return {
      sma: this.sma(20),
      ema: this.ema(20),
      rsi: this.rsi(14),
      macd: this.macd(12, 26, 9),
      bollinger: this.bollinger(20, 2),
      atr: this.atr(14),
      stoch: this.stoch(14, 3),
      williams: this.williams(14),
      cci: this.cci(20),
      obv: this.obv()
    }
  }
}
