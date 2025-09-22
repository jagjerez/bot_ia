import { NextRequest, NextResponse } from 'next/server'
import { tradingBot } from '@/lib/bot'
import { ApiResponse } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const symbol = searchParams.get('symbol') || 'BTC/USDT'
    const limit = parseInt(searchParams.get('limit') || '200')

    await tradingBot.loadHistoricalData(symbol, limit)
    const historicalData = tradingBot.getHistoricalData()
    
    const response: ApiResponse<typeof historicalData> = {
      success: true,
      data: historicalData,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error loading historical data:', error)
    
    const response: ApiResponse<never> = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load historical data',
    }

    return NextResponse.json(response, { status: 500 })
  }
}
