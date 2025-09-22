import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApiResponse, Trade } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const symbol = searchParams.get('symbol');

    const where = symbol ? { symbol } : {};

    const trades = await prisma.trade.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: limit,
    });

    const response: ApiResponse<Trade[]> = {
      success: true,
      data: trades.map(
        (trade: {
          symbol: string;
          id: string;
          side: string;
          price: number;
          amount: number;
          timestamp: Date;
          createdAt: Date;
        }) => ({
          id: trade.id,
          symbol: trade.symbol,
          side: trade.side as 'buy' | 'sell',
          price: trade.price,
          amount: trade.amount,
          timestamp: trade.timestamp.toISOString(),
          createdAt: trade.createdAt.toISOString(),
        })
      ),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching trades:', error);

    const response: ApiResponse<never> = {
      success: false,
      error: 'Failed to fetch trades',
    };

    return NextResponse.json(response, { status: 500 });
  }
}
