'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { createChart, ColorType, IChartApi, ISeriesApi } from 'lightweight-charts'
import useSWR from 'swr'
import { Trade, BotStatus, TickerData } from '@/types'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import LoadingSpinner from '@/components/LoadingSpinner'
import { formatPrice, formatRelativeTime } from '@/lib/utils'

// Fetcher functions for SWR
const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function Dashboard() {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const seriesRef = useRef<ISeriesApi<'Line'> | null>(null)
  const [priceData, setPriceData] = useState<{ time: number; value: number }[]>([])

  // Fetch data
  const { data: tradesData, mutate: mutateTrades } = useSWR<{ success: boolean; data: Trade[] }>('/api/trades', fetcher, {
    refreshInterval: 5000,
  })
  
  const { data: botStatusData, mutate: mutateBotStatus } = useSWR<{ success: boolean; data: BotStatus }>('/api/bot/status', fetcher, {
    refreshInterval: 2000,
  })
  
  const { data: priceDataResponse } = useSWR<{ success: boolean; data: TickerData }>('/api/price?symbol=BTC/USDT', fetcher, {
    refreshInterval: 1000,
  })

  const { data: mlStatusData } = useSWR<{ success: boolean; data: any }>('/api/ml/status', fetcher, {
    refreshInterval: 5000,
  })

  const { data: tradingStatusData, mutate: mutateTradingStatus } = useSWR<{ success: boolean; data: any }>('/api/trading/status', fetcher, {
    refreshInterval: 2000,
  })

  const { data: historicalDataResponse, mutate: mutateHistorical } = useSWR<{ success: boolean; data: any[] }>('/api/historical?symbol=BTC/USDT&limit=200', fetcher, {
    refreshInterval: 30000, // Refresh every 30 seconds
  })

  // Extract data from responses
  const historicalData = historicalDataResponse?.data || []

  // Helper function to create chart data (memoized)
  const createChartData = useCallback((candles: any[]) => {
    return candles
      .map((candle: any) => ({
        time: Math.floor(candle.timestamp / 1000) as any,
        value: candle.close,
      }))
      .sort((a: any, b: any) => a.time - b.time) // Sort by time ascending
  }, [])

  // Helper function to merge and deduplicate chart data (memoized)
  const mergeChartData = useCallback((historical: any[], realtime: any[], existing: any[]) => {
    const allData = [...historical, ...existing, ...realtime]
    
    // Remove duplicates based on time
    const uniqueData = allData.reduce((acc: any[], current: any) => {
      const existingIndex = acc.findIndex((item: any) => item.time === current.time)
      if (existingIndex === -1) {
        acc.push(current)
      } else {
        // Keep the most recent data for the same timestamp
        acc[existingIndex] = current
      }
      return acc
    }, [])
    
    return uniqueData
      .sort((a: any, b: any) => a.time - b.time) // Sort by time ascending
      .slice(-200) // Keep last 200 points
  }, [])

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current) return

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'white' },
        textColor: 'black',
      },
      width: chartContainerRef.current.clientWidth,
      height: 400,
      grid: {
        vertLines: { color: '#f0f0f0' },
        horzLines: { color: '#f0f0f0' },
      },
      crosshair: {
        mode: 1,
      },
      rightPriceScale: {
        borderColor: '#cccccc',
      },
      timeScale: {
        borderColor: '#cccccc',
      },
    })

    const series = chart.addLineSeries({
      color: '#2962FF',
      lineWidth: 2,
    })

    chartRef.current = chart
    seriesRef.current = series

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        })
      }
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (chartRef.current) {
        chartRef.current.remove()
      }
    }
  }, [])

  // Load historical data into chart (only when historical data changes)
  useEffect(() => {
    if (historicalData.length > 0 && seriesRef.current) {
      const historicalChartData = createChartData(historicalData)
      setPriceData(historicalChartData)
      seriesRef.current?.setData(historicalChartData)
    }
  }, [historicalData.length, createChartData])

  // Update chart data with real-time prices (only when price changes)
  useEffect(() => {
    if (priceDataResponse?.data && seriesRef.current) {
      const newData = {
        time: Math.floor(priceDataResponse.data.timestamp / 1000) as any,
        value: priceDataResponse.data.price,
      }
      
      setPriceData(prev => {
        // Avoid infinite loops by checking if this data point already exists
        const lastData = prev[prev.length - 1]
        if (lastData && lastData.time === newData.time) {
          return prev // Don't update if we already have this timestamp
        }
        
        const updated = [...prev, newData]
          .sort((a: any, b: any) => a.time - b.time)
          .slice(-200)
        
        seriesRef.current?.setData(updated)
        return updated
      })
    }
  }, [priceDataResponse?.data?.timestamp, priceDataResponse?.data?.price])

  // Bot control functions
  const startBot = async () => {
    try {
      const response = await fetch('/api/bot/start', { method: 'POST' })
      const result = await response.json()
      
      if (result.success) {
        mutateBotStatus()
        alert('Bot started successfully!')
      } else {
        alert(`Error: ${result.error}`)
      }
    } catch (error) {
      console.error('Error starting bot:', error)
      alert('Failed to start bot')
    }
  }

  const stopBot = async () => {
    try {
      const response = await fetch('/api/bot/stop', { method: 'POST' })
      const result = await response.json()
      
      if (result.success) {
        mutateBotStatus()
        alert('Bot stopped successfully!')
      } else {
        alert(`Error: ${result.error}`)
      }
    } catch (error) {
      console.error('Error stopping bot:', error)
      alert('Failed to stop bot')
    }
  }

  // ML Control functions
  const trainMLModel = async () => {
    try {
      const response = await fetch('/api/ml/train', { method: 'POST' })
      const result = await response.json()
      
      if (result.success) {
        alert(result.data.message)
      } else {
        alert(`Error: ${result.error}`)
      }
    } catch (error) {
      console.error('Error training ML model:', error)
      alert('Failed to train ML model')
    }
  }

  const runBacktest = async () => {
    try {
      const response = await fetch('/api/ml/backtest', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initialCapital: 10000, minConfidence: 0.6 })
      })
      const result = await response.json()
      
      if (result.success) {
        const data = result.data
        alert(`Backtest Results:\nTotal Return: ${(data.totalReturn * 100).toFixed(2)}%\nWin Rate: ${(data.winRate * 100).toFixed(2)}%\nMax Drawdown: ${(data.maxDrawdown * 100).toFixed(2)}%`)
      } else {
        alert(`Error: ${result.error}`)
      }
    } catch (error) {
      console.error('Error running backtest:', error)
      alert('Failed to run backtest')
    }
  }

  const toggleMLStrategy = async (enabled: boolean) => {
    try {
      const response = await fetch('/api/ml/config', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ useMLStrategy: enabled })
      })
      const result = await response.json()
      
      if (result.success) {
        alert(`ML Strategy ${enabled ? 'enabled' : 'disabled'}`)
      } else {
        alert(`Error: ${result.error}`)
      }
    } catch (error) {
      console.error('Error toggling ML strategy:', error)
      alert('Failed to toggle ML strategy')
    }
  }

  // Trading Control functions
  const toggleSimulationMode = async (enabled: boolean) => {
    try {
      const response = await fetch('/api/trading/simulation', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled })
      })
      const result = await response.json()
      
      if (result.success) {
        mutateTradingStatus()
        alert(`Simulation mode ${enabled ? 'enabled' : 'disabled'}`)
      } else {
        alert(`Error: ${result.error}`)
      }
    } catch (error) {
      console.error('Error toggling simulation mode:', error)
      alert('Failed to toggle simulation mode')
    }
  }

  const toggleRealTrading = async (enabled: boolean) => {
    try {
      const response = await fetch('/api/trading/real', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled })
      })
      const result = await response.json()
      
      if (result.success) {
        mutateTradingStatus()
        alert(`Real trading ${enabled ? 'enabled' : 'disabled'}`)
      } else {
        alert(`Error: ${result.error}`)
      }
    } catch (error) {
      console.error('Error toggling real trading:', error)
      alert('Failed to toggle real trading')
    }
  }

  const loadHistoricalData = async () => {
    try {
      await mutateHistorical()
      alert('Historical data loaded successfully!')
    } catch (error) {
      console.error('Error loading historical data:', error)
      alert('Failed to load historical data')
    }
  }

  const isRunning = botStatusData?.data?.running || false
  const trades = tradesData?.data || []
  const currentPrice = priceDataResponse?.data?.price || 0
  const mlStatus = mlStatusData?.data || {}
  const tradingStatus = tradingStatusData?.data || { simulationMode: true, realTradingEnabled: false, isRealTrading: false }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Crypto Trading Bot Dashboard</h1>
        
          {/* Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Bot Status</h3>
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-3 ${isRunning ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-lg font-medium">
                  {isRunning ? 'Running' : 'Stopped'}
                </span>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Current Price</h3>
              <div className="text-2xl font-bold text-blue-600">
                {priceDataResponse ? formatPrice(currentPrice) : <LoadingSpinner size="sm" />}
              </div>
              <div className="text-sm text-gray-500">BTC/USDT</div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Trades</h3>
              <div className="text-2xl font-bold text-green-600">
                {trades.length}
              </div>
              <div className="text-sm text-gray-500">All time</div>
            </div>
          </div>

          {/* Trading Controls */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">🎮 Trading Controls</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className={`text-2xl font-bold ${tradingStatus.simulationMode ? 'text-blue-600' : 'text-orange-600'}`}>
                  {tradingStatus.simulationMode ? 'SIMULATION' : 'REAL'}
                </div>
                <div className="text-sm text-gray-500 mb-3">Trading Mode</div>
                <button
                  onClick={() => toggleSimulationMode(!tradingStatus.simulationMode)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    tradingStatus.simulationMode 
                      ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                      : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                  }`}
                >
                  {tradingStatus.simulationMode ? 'Switch to Real' : 'Switch to Simulation'}
                </button>
              </div>
              
              <div className="text-center">
                <div className={`text-2xl font-bold ${tradingStatus.realTradingEnabled ? 'text-red-600' : 'text-gray-600'}`}>
                  {tradingStatus.realTradingEnabled ? 'ENABLED' : 'DISABLED'}
                </div>
                <div className="text-sm text-gray-500 mb-3">Real Trading</div>
                <button
                  onClick={() => toggleRealTrading(!tradingStatus.realTradingEnabled)}
                  disabled={tradingStatus.simulationMode}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    tradingStatus.realTradingEnabled
                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  } ${tradingStatus.simulationMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {tradingStatus.realTradingEnabled ? 'Disable Real Trading' : 'Enable Real Trading'}
                </button>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {historicalData.length}
                </div>
                <div className="text-sm text-gray-500 mb-3">Historical Points</div>
                <button
                  onClick={loadHistoricalData}
                  className="px-4 py-2 bg-green-100 text-green-700 rounded-lg font-medium hover:bg-green-200 transition-colors"
                >
                  Load Historical Data
                </button>
              </div>
            </div>
            
            {tradingStatus.simulationMode && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-blue-500 rounded-full mr-3"></div>
                  <span className="text-blue-800 font-medium">Simulation Mode Active</span>
                </div>
                <p className="text-blue-700 text-sm mt-1">
                  All trades are simulated and will not execute real orders on Binance.
                </p>
              </div>
            )}
            
            {!tradingStatus.simulationMode && tradingStatus.realTradingEnabled && (
              <div className="mt-4 p-4 bg-red-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-red-500 rounded-full mr-3"></div>
                  <span className="text-red-800 font-medium">⚠️ REAL TRADING ENABLED</span>
                </div>
                <p className="text-red-700 text-sm mt-1">
                  This will execute real trades on Binance. Use with caution!
                </p>
              </div>
            )}
          </div>

          {/* Chart */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Price Chart</h3>
            <div ref={chartContainerRef} className="w-full h-96" />
          </div>

        {/* ML Status */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">🤖 AI/ML Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className={`text-2xl font-bold ${mlStatus.useMLStrategy ? 'text-green-600' : 'text-red-600'}`}>
                {mlStatus.useMLStrategy ? 'ON' : 'OFF'}
              </div>
              <div className="text-sm text-gray-500">ML Strategy</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {mlStatus.minConfidence ? `${(mlStatus.minConfidence * 100).toFixed(0)}%` : '60%'}
              </div>
              <div className="text-sm text-gray-500">Min Confidence</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {mlStatus.historicalDataLength || 0}
              </div>
              <div className="text-sm text-gray-500">Data Points</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${mlStatus.modelStatus?.isTrained ? 'text-green-600' : 'text-orange-600'}`}>
                {mlStatus.modelStatus?.isTrained ? '✓' : '○'}
              </div>
              <div className="text-sm text-gray-500">Model Trained</div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => toggleMLStrategy(!mlStatus.useMLStrategy)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                mlStatus.useMLStrategy
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {mlStatus.useMLStrategy ? 'Disable ML' : 'Enable ML'}
            </button>
            <button
              onClick={trainMLModel}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Train Model
            </button>
            <button
              onClick={runBacktest}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
            >
              Run Backtest
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Bot Controls</h3>
          <div className="flex space-x-4">
            <button
              onClick={startBot}
              disabled={isRunning}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                isRunning
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              Start Bot
            </button>
            <button
              onClick={stopBot}
              disabled={!isRunning}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                !isRunning
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-red-600 text-white hover:bg-red-700'
              }`}
            >
              Stop Bot
            </button>
          </div>
        </div>

          {/* Recent Trades */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Recent Trades</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Symbol
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Side
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {trades.slice(0, 10).map((trade) => (
                    <tr key={trade.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {trade.symbol}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          trade.side === 'buy'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {trade.side.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatPrice(trade.price)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {trade.amount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatRelativeTime(trade.timestamp)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}