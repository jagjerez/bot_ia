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

    tradingBot.setSimulationMode(enabled)
    
    const response: ApiResponse<{ message: string; enabled: boolean }> = {
      success: true,
      data: { 
        message: `Simulation mode ${enabled ? 'enabled' : 'disabled'}`,
        enabled
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error updating simulation mode:', error)
    
    const response: ApiResponse<never> = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update simulation mode',
    }

    return NextResponse.json(response, { status: 500 })
  }
}
