# Environment Variables

This document describes all environment variables used in the Crypto Trading Bot application.

## Required Variables

### Database

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `DATABASE_URL` | Database connection string | `file:./dev.db` | Yes |

**Examples:**
- SQLite (development): `file:./dev.db`
- PostgreSQL (production): `postgresql://user:password@localhost:5432/crypto_bot`

### Exchange API

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `BINANCE_API_KEY` | Binance API key | `your-api-key-here` | Yes |
| `BINANCE_SECRET` | Binance API secret | `your-secret-key-here` | Yes |
| `BINANCE_SANDBOX` | Use sandbox mode | `true` or `false` | Yes |

## Optional Variables

### Next.js

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NEXTAUTH_SECRET` | Secret for NextAuth | Random | No |
| `NEXTAUTH_URL` | Base URL for NextAuth | `http://localhost:3000` | No |

### Trading Bot Configuration

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `BOT_BUY_THRESHOLD` | Price drop percentage to trigger buy | `1.0` | No |
| `BOT_SELL_THRESHOLD` | Price rise percentage to trigger sell | `1.0` | No |
| `BOT_TIME_WINDOW` | Lookback window in minutes | `5` | No |
| `BOT_TRADING_PAIR` | Default trading pair | `BTC/USDT` | No |

### Logging

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `LOG_LEVEL` | Logging level | `info` | No |
| `ENABLE_TRADE_LOGGING` | Enable detailed trade logging | `true` | No |

## Environment Files

### .env.local (Development)

```env
# Database
DATABASE_URL="file:./dev.db"

# Binance API
BINANCE_API_KEY="your-api-key"
BINANCE_SECRET="your-secret"
BINANCE_SANDBOX=true

# Next.js
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Optional Bot Configuration
BOT_BUY_THRESHOLD=1.0
BOT_SELL_THRESHOLD=1.0
BOT_TIME_WINDOW=5
BOT_TRADING_PAIR="BTC/USDT"
```

### .env.production (Production)

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/crypto_bot"

# Binance API
BINANCE_API_KEY="your-production-api-key"
BINANCE_SECRET="your-production-secret"
BINANCE_SANDBOX=false

# Next.js
NEXTAUTH_SECRET="your-production-secret"
NEXTAUTH_URL="https://your-domain.com"

# Bot Configuration
BOT_BUY_THRESHOLD=0.5
BOT_SELL_THRESHOLD=0.5
BOT_TIME_WINDOW=10
BOT_TRADING_PAIR="BTC/USDT"
```

## Security Considerations

### API Keys

1. **Never commit API keys** to version control
2. **Use different keys** for development and production
3. **Rotate keys regularly** for security
4. **Use IP whitelisting** when possible
5. **Enable 2FA** on your exchange account

### Database

1. **Use strong passwords** for database connections
2. **Enable SSL** for production databases
3. **Restrict database access** to application servers only
4. **Regular backups** of your database

### Environment Files

1. **Add .env* to .gitignore**
2. **Use .env.example** for documentation
3. **Validate environment variables** at startup
4. **Use different files** for different environments

## Validation

The application validates required environment variables at startup:

```typescript
// Example validation
const requiredEnvVars = [
  'DATABASE_URL',
  'BINANCE_API_KEY',
  'BINANCE_SECRET',
  'BINANCE_SANDBOX'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}
```

## Platform-Specific Notes

### Vercel

Set environment variables in the Vercel dashboard:
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add each variable with appropriate values
4. Set the environment (Production, Preview, Development)

### Docker

Use environment files with Docker:

```bash
# Using .env file
docker run --env-file .env.local crypto-bot

# Using docker-compose
docker-compose up -d
```

### Local Development

Create `.env.local` in the project root:

```bash
cp .env.example .env.local
# Edit .env.local with your values
```

## Troubleshooting

### Common Issues

1. **"Missing required environment variable"**
   - Check that all required variables are set
   - Verify the variable name spelling
   - Ensure the .env file is in the correct location

2. **Database connection errors**
   - Verify DATABASE_URL format
   - Check database server is running
   - Ensure database exists

3. **API authentication errors**
   - Verify API key and secret are correct
   - Check IP whitelist settings
   - Ensure sandbox mode matches your setup

4. **Build errors**
   - Run `pnpm db:generate` before building
   - Check all environment variables are available at build time
