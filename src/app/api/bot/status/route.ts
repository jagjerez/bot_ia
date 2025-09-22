import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ApiResponse, BotStatus } from '@/types'

export async function GET() {
  try {
    let botStatus = await prisma.botStatus.findFirst({
      where: { id: '1' },
    })

    // If no status exists, create one
    if (!botStatus) {
      botStatus = await prisma.botStatus.create({
        data: {
          id: '1',
          running: false,
        },
      })
    }

    const response: ApiResponse<BotStatus> = {
      success: true,
      data: botStatus,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching bot status:', error)
    
    const response: ApiResponse<never> = {
      success: false,
      error: 'Failed to fetch bot status',
    }

    return NextResponse.json(response, { status: 500 })
  }
}
