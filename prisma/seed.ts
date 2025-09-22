import { PrismaClient } from "@prisma/client/extension"


const prisma = new PrismaClient()

async function main() {
  // Create initial bot status
  await prisma.botStatus.upsert({
    where: { id: '1' },
    update: {},
    create: {
      id: '1',
      running: false,
    },
  })

  // Create some sample trades
  const sampleTrades = [
    {
      symbol: 'BTC/USDT',
      side: 'buy',
      price: 45000.00,
      amount: 0.001,
    },
    {
      symbol: 'BTC/USDT',
      side: 'sell',
      price: 45100.00,
      amount: 0.001,
    },
    {
      symbol: 'ETH/USDT',
      side: 'buy',
      price: 3200.00,
      amount: 0.01,
    },
    {
      symbol: 'ETH/USDT',
      side: 'sell',
      price: 3250.00,
      amount: 0.01,
    },
  ]

  for (const trade of sampleTrades) {
    await prisma.trade.create({
      data: trade,
    })
  }

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
