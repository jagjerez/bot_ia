import * as tf from '@tensorflow/tfjs-node'
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

export class MLTradingStrategy {
  private lstmModel: tf.LayersModel | null = null
  private randomForest: RandomForestClassifier | null = null
  private isModelTrained: boolean = false
  private featureHistory: MLFeatures[] = []
  private maxHistoryLength: number = 1000

  constructor() {
    this.initializeModels()
  }

  private async initializeModels() {
    try {
      // Initialize LSTM model for price prediction
      this.lstmModel = this.createLSTMModel()
      
      // Initialize Random Forest for signal classification
      this.randomForest = new RandomForestClassifier({
        nEstimators: 100
      })
      
      console.log('ML models initialized successfully')
    } catch (error) {
      console.error('Error initializing ML models:', error)
    }
  }

  private createLSTMModel(): tf.LayersModel {
    const model = tf.sequential({
      layers: [
        tf.layers.lstm({
          units: 50,
          returnSequences: true,
          inputShape: [60, 1] // 60 time steps, 1 feature (price)
        }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.lstm({
          units: 50,
          returnSequences: false
        }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({ units: 25, activation: 'relu' }),
        tf.layers.dense({ units: 1, activation: 'linear' }) // Price prediction
      ]
    })

    model.compile({
      optimizer: 'adam',
      loss: 'meanSquaredError',
      metrics: ['mae']
    })

    return model
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

  // Train the ML models
  async trainModels(historicalData: OHLCV[]) {
    try {
      console.log('Training ML models...')
      
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
        if (priceChange > 2) {
          labels.push(1) // Buy
        } else if (priceChange < -2) {
          labels.push(2) // Sell
        } else {
          labels.push(0) // Hold
        }
      }

      // Train Random Forest
      if (this.randomForest && X.length > 0 && labels.length > 0) {
        this.randomForest.train(X.slice(0, labels.length), labels)
        console.log('Random Forest trained successfully')
      }

      // Train LSTM for price prediction
      if (this.lstmModel && historicalData.length > 60) {
        const priceData = historicalData.map(d => d.close)
        const sequences = this.createSequences(priceData, 60)
        
        if (sequences.length > 0) {
          const X_lstm = tf.tensor3d(sequences)
          const y_lstm = tf.tensor2d(priceData.slice(60).map(p => [p]))
          
          await this.lstmModel.fit(X_lstm, y_lstm, {
            epochs: 50,
            batchSize: 32,
            validationSplit: 0.2,
            verbose: 0
          })
          
          console.log('LSTM model trained successfully')
        }
      }

      this.isModelTrained = true
      console.log('ML models training completed')
      return true
    } catch (error) {
      console.error('Error training ML models:', error)
      return false
    }
  }

  private createSequences(data: number[], sequenceLength: number): number[][][] {
    const sequences: number[][][] = []
    
    for (let i = 0; i <= data.length - sequenceLength - 1; i++) {
      const sequence = data.slice(i, i + sequenceLength).map(val => [val])
      sequences.push(sequence)
    }
    
    return sequences
  }

  // Make prediction using trained models
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
        confidence += 0.1
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
      
      confidence = Math.min(0.95, confidence)

      // Get price prediction from LSTM
      let priceTarget: number | undefined
      let stopLoss: number | undefined
      
      if (this.lstmModel && currentData.length > 60) {
        const priceData = currentData.slice(-60).map(d => d.close)
        const sequence = tf.tensor3d([priceData.map(p => [p])])
        const prediction = await this.lstmModel.predict(sequence) as tf.Tensor
        const predictedPrice = await prediction.data()
        priceTarget = predictedPrice[0] as number
        
        // Calculate stop loss (2% below/above current price)
        const currentPrice = currentData[currentData.length - 1].close
        if (action === 'buy') {
          stopLoss = currentPrice * 0.98
        } else if (action === 'sell') {
          stopLoss = currentPrice * 1.02
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
      hasLSTM: this.lstmModel !== null,
      hasRandomForest: this.randomForest !== null,
      featureHistoryLength: this.featureHistory.length
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
