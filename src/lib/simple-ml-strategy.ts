import { RandomForestClassifier } from 'ml-random-forest'
import { TechnicalAnalysis, OHLCV } from './indicators'

export interface MLPrediction {
  action: 'buy' | 'sell' | 'hold'
  confidence: number
  priceTarget?: number
  stopLoss?: number
}

export interface MLFeatures {
  rsi: number
  macd: number
  macdSignal: number
  bollingerPosition: number
  atr: number
  stochK: number
  stochD: number
  williams: number
  cci: number
  obv: number
  priceChange: number
  volumeChange: number
  volatility: number
}

export class SimpleMLTradingStrategy {
  private randomForest: RandomForestClassifier | null = null
  private isModelTrained: boolean = false
  private featureHistory: MLFeatures[] = []
  private maxHistoryLength: number = 1000
  private priceHistory: number[] = []

  constructor() {
    this.initializeModel()
  }

  private initializeModel() {
    try {
      // Initialize Random Forest for signal classification
      this.randomForest = new RandomForestClassifier({
        nEstimators: 50 // Reduced for better performance
      })
      
      console.log('Simple ML model initialized successfully')
    } catch (error) {
      console.error('Error initializing ML model:', error)
    }
  }

  // Extract features from OHLCV data
  private extractFeatures(data: OHLCV[]): MLFeatures[] {
    if (data.length < 50) return []

    const ta = new TechnicalAnalysis(data)
    const indicators = ta.getAllIndicators()
    const features: MLFeatures[] = []

    for (let i = 50; i < data.length; i++) {
      const current = data[i]
      const previous = data[i - 1]
      
      // RSI
      const rsi = indicators.rsi[i] || 50
      
      // MACD
      const macd = indicators.macd[i]?.macd || 0
      const macdSignal = indicators.macd[i]?.signal || 0
      
      // Bollinger Bands position (0-1 scale)
      const bollinger = indicators.bollinger[i]
      const bollingerPosition = bollinger.upper === bollinger.lower ? 0.5 : 
        (current.close - bollinger.lower) / (bollinger.upper - bollinger.lower)
      
      // ATR
      const atr = indicators.atr[i] || 0
      
      // Stochastic
      const stoch = indicators.stoch[i]
      const stochK = stoch.k || 50
      const stochD = stoch.d || 50
      
      // Williams %R
      const williams = indicators.williams[i] || -50
      
      // CCI
      const cci = indicators.cci[i] || 0
      
      // OBV
      const obv = indicators.obv[i] || 0
      
      // Price change
      const priceChange = ((current.close - previous.close) / previous.close) * 100
      
      // Volume change
      const volumeChange = previous.volume > 0 ? 
        ((current.volume - previous.volume) / previous.volume) * 100 : 0
      
      // Volatility (20-period rolling standard deviation)
      const priceSlice = data.slice(Math.max(0, i - 19), i + 1).map(d => d.close)
      const volatility = priceSlice.length > 1 ? 
        Math.sqrt(priceSlice.reduce((acc, price, _idx) => {
          const mean = priceSlice.reduce((a, b) => a + b) / priceSlice.length
          return acc + Math.pow(price - mean, 2)
        }, 0) / (priceSlice.length - 1)) : 0

      features.push({
        rsi: isNaN(rsi) ? 50 : rsi,
        macd: isNaN(macd) ? 0 : macd,
        macdSignal: isNaN(macdSignal) ? 0 : macdSignal,
        bollingerPosition: isNaN(bollingerPosition) ? 0.5 : Math.max(0, Math.min(1, bollingerPosition)),
        atr: isNaN(atr) ? 0 : atr,
        stochK: isNaN(stochK) ? 50 : stochK,
        stochD: isNaN(stochD) ? 50 : stochD,
        williams: isNaN(williams) ? -50 : williams,
        cci: isNaN(cci) ? 0 : cci,
        obv: isNaN(obv) ? 0 : obv,
        priceChange: isNaN(priceChange) ? 0 : priceChange,
        volumeChange: isNaN(volumeChange) ? 0 : volumeChange,
        volatility: isNaN(volatility) ? 0 : volatility
      })
    }

    return features
  }

  // Train the ML model
  async trainModels(historicalData: OHLCV[]) {
    try {
      console.log('Training Simple ML model...')
      
      // Extract features
      const features = this.extractFeatures(historicalData)
      if (features.length < 100) {
        console.log('Not enough data for training')
        return false
      }

      // Prepare training data
      const X = features.map(f => [
        f.rsi / 100, // Normalize RSI
        f.macd,
        f.macdSignal,
        f.bollingerPosition,
        f.atr,
        f.stochK / 100, // Normalize Stochastic
        f.stochD / 100,
        (f.williams + 100) / 100, // Normalize Williams %R
        f.cci / 100, // Normalize CCI
        f.priceChange / 100, // Normalize price change
        f.volumeChange / 100, // Normalize volume change
        f.volatility
      ])

      // Create labels based on future price movements
      const labels: number[] = []
      for (let i = 0; i < features.length - 5; i++) {
        const currentPrice = historicalData[i + 50].close
        const futurePrice = historicalData[i + 55].close
        const priceChange = ((futurePrice - currentPrice) / currentPrice) * 100
        
        // 0: hold, 1: buy, 2: sell
        if (priceChange > 1.5) {
          labels.push(1) // Buy
        } else if (priceChange < -1.5) {
          labels.push(2) // Sell
        } else {
          labels.push(0) // Hold
        }
      }

      // Train Random Forest
      if (this.randomForest && X.length > 0 && labels.length > 0) {
        this.randomForest.train(X.slice(0, labels.length), labels)
        console.log('Random Forest trained successfully')
        this.isModelTrained = true
      }

      // Store price history for simple price prediction
      this.priceHistory = historicalData.map(d => d.close)

      console.log('Simple ML model training completed')
      return true
    } catch (error) {
      console.error('Error training Simple ML model:', error)
      return false
    }
  }

  // Make prediction using trained model
  async predict(currentData: OHLCV[]): Promise<MLPrediction> {
    if (!this.isModelTrained || !this.randomForest) {
      return { action: 'hold', confidence: 0 }
    }

    try {
      // Extract features for current data
      const features = this.extractFeatures(currentData)
      if (features.length === 0) {
        return { action: 'hold', confidence: 0 }
      }

      const latestFeatures = features[features.length - 1]
      const X = [[
        latestFeatures.rsi / 100,
        latestFeatures.macd,
        latestFeatures.macdSignal,
        latestFeatures.bollingerPosition,
        latestFeatures.atr,
        latestFeatures.stochK / 100,
        latestFeatures.stochD / 100,
        (latestFeatures.williams + 100) / 100,
        latestFeatures.cci / 100,
        latestFeatures.priceChange / 100,
        latestFeatures.volumeChange / 100,
        latestFeatures.volatility
      ]]

      // Get Random Forest prediction
      const rfPrediction = this.randomForest.predict(X)
      const action = rfPrediction[0] === 1 ? 'buy' : rfPrediction[0] === 2 ? 'sell' : 'hold'
      
      // Calculate confidence based on feature strength
      let confidence = 0.5
      
      // RSI confidence
      if (latestFeatures.rsi < 30 || latestFeatures.rsi > 70) {
        confidence += 0.15
      }
      
      // MACD confidence
      if (Math.abs(latestFeatures.macd) > Math.abs(latestFeatures.macdSignal)) {
        confidence += 0.1
      }
      
      // Bollinger Bands confidence
      if (latestFeatures.bollingerPosition < 0.2 || latestFeatures.bollingerPosition > 0.8) {
        confidence += 0.1
      }
      
      // Stochastic confidence
      if (latestFeatures.stochK < 20 || latestFeatures.stochK > 80) {
        confidence += 0.1
      }

      // Williams %R confidence
      if (latestFeatures.williams < -80 || latestFeatures.williams > -20) {
        confidence += 0.1
      }
      
      confidence = Math.min(0.95, confidence)

      // Simple price prediction based on moving average
      let priceTarget: number | undefined
      let stopLoss: number | undefined
      
      if (this.priceHistory.length > 20) {
        // const recentPrices = this.priceHistory.slice(-20)
        // const avgPrice = recentPrices.reduce((a, b) => a + b) / recentPrices.length
        const currentPrice = currentData[currentData.length - 1].close
        
        // Simple trend-based price target
        if (action === 'buy') {
          priceTarget = currentPrice * 1.02 // 2% target
          stopLoss = currentPrice * 0.98 // 2% stop loss
        } else if (action === 'sell') {
          priceTarget = currentPrice * 0.98 // 2% target
          stopLoss = currentPrice * 1.02 // 2% stop loss
        }
      }

      return {
        action,
        confidence,
        priceTarget,
        stopLoss
      }
    } catch (error) {
      console.error('Error making ML prediction:', error)
      return { action: 'hold', confidence: 0 }
    }
  }

  // Get model status
  getModelStatus() {
    return {
      isTrained: this.isModelTrained,
      hasRandomForest: this.randomForest !== null,
      featureHistoryLength: this.featureHistory.length,
      priceHistoryLength: this.priceHistory.length
    }
  }

  // Update feature history
  updateFeatureHistory(features: MLFeatures) {
    this.featureHistory.push(features)
    if (this.featureHistory.length > this.maxHistoryLength) {
      this.featureHistory.shift()
    }
  }
}
