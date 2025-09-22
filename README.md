# Crypto Trading Bot

A complete Next.js 14 trading bot application with real-time monitoring, automated trading strategies, and a modern dashboard interface.

## Features

- 🤖 **Automated Trading**: Simple strategy that buys when price drops 1% and sells when it rises 1%
- 📊 **Real-time Dashboard**: Live price charts using TradingView lightweight-charts
- 💾 **Database Integration**: Prisma ORM with SQLite (local) / PostgreSQL (production)
- 🔄 **Real-time Updates**: Live trade updates and bot status monitoring
- 🎨 **Modern UI**: Clean, responsive interface built with TailwindCSS
- 🐳 **Docker Ready**: Complete Docker setup for easy deployment
- 🔐 **Secure**: Environment-based API key management

## Tech Stack

- **Frontend**: Next.js 14, React 19, TypeScript, TailwindCSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: SQLite (dev) / PostgreSQL (production)
- **Trading**: CCXT library for exchange integration
- **Charts**: TradingView lightweight-charts
- **Real-time**: SWR for data fetching and polling
- **Deployment**: Docker, Vercel-ready

## Quick Start

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm
- Binance API credentials (optional for demo)

### Installation

1. **Clone and install dependencies:**
   ```bash
   git clone <your-repo>
   cd bot-crypto
   pnpm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and add your Binance API credentials:
   ```env
   DATABASE_URL="file:./dev.db"
   BINANCE_API_KEY="your-api-key"
   BINANCE_SECRET="your-secret"
   BINANCE_SANDBOX=true
   ```

3. **Set up the database:**
   ```bash
   pnpm db:generate
   pnpm db:push
   pnpm db:seed
   ```

4. **Start the development server:**
   ```bash
   pnpm dev
   ```

5. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

### Dashboard

Visit `/dashboard` to access the trading bot interface:

- **Price Chart**: Real-time BTC/USDT price visualization
- **Bot Controls**: Start/stop the trading bot
- **Status Monitor**: Live bot status and trade count
- **Trade History**: Recent trades table with buy/sell signals

### Trading Strategy

The bot implements a simple strategy:

- **Buy Signal**: When price drops 1% in the last 5 minutes
- **Sell Signal**: When price rises 1% in the last 5 minutes
- **Time Window**: 5-minute lookback period
- **Trading Pair**: BTC/USDT (configurable)

### API Endpoints

- `GET /api/trades` - Fetch recent trades
- `GET /api/bot/status` - Get bot status
- `POST /api/bot/start` - Start the bot
- `POST /api/bot/stop` - Stop the bot
- `GET /api/price?symbol=BTC/USDT` - Get current price

## Database Schema

### Trade Model
```prisma
model Trade {
  id        String   @id @default(cuid())
  symbol    String
  side      String   // "buy" or "sell"
  price     Float
  amount    Float
  timestamp DateTime @default(now())
  createdAt DateTime @default(now())
}
```

### BotStatus Model
```prisma
model BotStatus {
  id        String   @id @default(cuid())
  running   Boolean  @default(false)
  updatedAt DateTime @default(now())
}
```

## Deployment

### Docker Deployment

1. **Build and run with Docker:**
   ```bash
   docker build -t crypto-bot .
   docker run -p 3000:3000 --env-file .env.local crypto-bot
   ```

2. **Using Docker Compose:**
   ```bash
   docker-compose up -d
   ```

### Vercel Deployment

1. **Connect your repository to Vercel**
2. **Set environment variables in Vercel dashboard**
3. **Deploy automatically on push**

### Production Database

For production, update your `DATABASE_URL` to use PostgreSQL:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/crypto_bot"
```

## Configuration

### Trading Strategy

Modify the strategy in `src/lib/bot.ts`:

```typescript
const strategy: TradingStrategy = {
  buyThreshold: 1.0,  // 1% drop to trigger buy
  sellThreshold: 1.0, // 1% gain to trigger sell
  timeWindow: 5,      // 5 minutes lookback
}
```

### Exchange Settings

Configure exchange settings in `src/lib/exchange.ts`:

- Change trading pair
- Adjust rate limits
- Switch between sandbox and live trading

## Development

### Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm db:generate` - Generate Prisma client
- `pnpm db:push` - Push schema to database
- `pnpm db:seed` - Seed database with sample data
- `pnpm db:studio` - Open Prisma Studio

### Project Structure

```
src/
├── app/
│   ├── api/           # API routes
│   ├── dashboard/     # Dashboard page
│   └── page.tsx       # Home page
├── lib/
│   ├── bot.ts         # Trading bot logic
│   ├── exchange.ts    # Exchange integration
│   └── prisma.ts      # Database client
└── types/
    └── index.ts       # TypeScript interfaces
```

## Security Notes

- ⚠️ **Never commit API keys** to version control
- 🔒 **Use environment variables** for all sensitive data
- 🧪 **Test with sandbox mode** before live trading
- 💰 **Start with small amounts** when going live
- 📊 **Monitor your trades** regularly

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Disclaimer

This software is for educational purposes only. Cryptocurrency trading involves substantial risk of loss. Use at your own risk and never trade with money you cannot afford to lose.
