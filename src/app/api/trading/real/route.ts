import { NextRequest, NextResponse } from 'next/server'
import { tradingBot } from '@/lib/bot'
import { ApiResponse } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { enabled } = body

    if (typeof enabled !== 'boolean') {
      const response: ApiResponse<never> = {
        success: false,
        error: 'Invalid enabled parameter. Must be boolean.',
      }
      return NextResponse.json(response, { status: 400 })
    }

    if (enabled) {
      tradingBot.enableRealTrading()
    } else {
      tradingBot.disableRealTrading()
    }
    
    const response: ApiResponse<{ message: string; enabled: boolean }> = {
      success: true,
      data: { 
        message: `Real trading ${enabled ? 'enabled' : 'disabled'}`,
        enabled
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error updating real trading:', error)
    
    const response: ApiResponse<never> = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update real trading',
    }

    return NextResponse.json(response, { status: 500 })
  }
}
