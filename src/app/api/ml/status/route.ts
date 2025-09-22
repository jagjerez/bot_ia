import { NextResponse } from 'next/server'
import { tradingBot } from '@/lib/bot'
import { ApiResponse } from '@/types'

export async function GET() {
  try {
    const status = tradingBot.getMLStatus()
    
    const response: ApiResponse<typeof status> = {
      success: true,
      data: status,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching ML status:', error)
    
    const response: ApiResponse<never> = {
      success: false,
      error: 'Failed to fetch ML status',
    }

    return NextResponse.json(response, { status: 500 })
  }
}
