import { NextRequest, NextResponse } from 'next/server'
import { tradingBot } from '@/lib/bot'
import { ApiResponse } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { useMLStrategy, minConfidence } = body

    if (typeof useMLStrategy === 'boolean') {
      tradingBot.setMLStrategy(useMLStrategy)
    }

    if (typeof minConfidence === 'number') {
      tradingBot.setMinConfidence(minConfidence)
    }
    
    const response: ApiResponse<{ message: string }> = {
      success: true,
      data: { message: 'ML configuration updated successfully' },
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error updating ML config:', error)
    
    const response: ApiResponse<never> = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update ML configuration',
    }

    return NextResponse.json(response, { status: 500 })
  }
}
