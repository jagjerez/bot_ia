import { NextRequest, NextResponse } from 'next/server'
import { exchangeManager } from '@/lib/exchange'
import { ApiResponse, TickerData } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const symbol = searchParams.get('symbol') || 'BTC/USDT'

    const ticker = await exchangeManager.getTicker(symbol)

    const response: ApiResponse<TickerData> = {
      success: true,
      data: ticker,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching price:', error)
    
    const response: ApiResponse<never> = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch price',
    }

    return NextResponse.json(response, { status: 500 })
  }
}
