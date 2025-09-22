import { NextRequest, NextResponse } from 'next/server'
import { tradingBot } from '@/lib/bot'
import { ApiResponse } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { initialCapital = 10000, minConfidence = 0.6 } = body

    const result = await tradingBot.runBacktest(initialCapital, minConfidence)
    
    if (!result) {
      const response: ApiResponse<never> = {
        success: false,
        error: 'Not enough historical data for backtesting',
      }
      return NextResponse.json(response, { status: 400 })
    }

    const response: ApiResponse<typeof result> = {
      success: true,
      data: result,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error running backtest:', error)
    
    const response: ApiResponse<never> = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to run backtest',
    }

    return NextResponse.json(response, { status: 500 })
  }
}
