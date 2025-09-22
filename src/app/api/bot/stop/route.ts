import { NextResponse } from 'next/server'
import { tradingBot } from '@/lib/bot'
import { ApiResponse } from '@/types'

export async function POST() {
  try {
    await tradingBot.stop()
    
    const response: ApiResponse<{ message: string }> = {
      success: true,
      data: { message: 'Bot stopped successfully' },
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error stopping bot:', error)
    
    const response: ApiResponse<never> = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to stop bot',
    }

    return NextResponse.json(response, { status: 500 })
  }
}
