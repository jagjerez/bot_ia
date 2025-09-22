import { NextResponse } from 'next/server'
import { tradingBot } from '@/lib/bot'
import { ApiResponse } from '@/types'

export async function POST() {
  try {
    const success = await tradingBot.trainMLModel()
    
    const response: ApiResponse<{ success: boolean; message: string }> = {
      success: true,
      data: { 
        success, 
        message: success ? 'ML model trained successfully' : 'Failed to train ML model' 
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error training ML model:', error)
    
    const response: ApiResponse<never> = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to train ML model',
    }

    return NextResponse.json(response, { status: 500 })
  }
}
