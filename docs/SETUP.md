# Setup Guide

## Quick Start

### 1. Prerequisites

- Node.js 18 or higher
- pnpm (recommended) or npm
- Git

### 2. Installation

#### Windows
```bash
# Run the setup script
scripts\setup.bat
```

#### Linux/macOS
```bash
# Make script executable and run
chmod +x scripts/setup.sh
./scripts/setup.sh
```

#### Manual Setup
```bash
# Install dependencies
pnpm install

# Copy environment file
cp .env.example .env.local

# Generate Prisma client
pnpm db:generate

# Setup database
pnpm db:push

# Seed database
pnpm db:seed

# Start development server
pnpm dev
```

### 3. Environment Configuration

Edit `.env.local` with your configuration:

```env
# Database
DATABASE_URL="file:./dev.db"

# Binance API (get from https://www.binance.com/en/my/settings/api-management)
BINANCE_API_KEY="your-api-key"
BINANCE_SECRET="your-secret"
BINANCE_SANDBOX=true

# Next.js
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

### 4. Binance API Setup

1. Go to [Binance API Management](https://www.binance.com/en/my/settings/api-management)
2. Create a new API key
3. Enable "Enable Spot & Margin Trading" (for live trading)
4. Add your IP address to the whitelist
5. Copy the API key and secret to your `.env.local`

**Important**: Always test with `BINANCE_SANDBOX=true` first!

### 5. Running the Application

```bash
# Development
pnpm dev

# Production build
pnpm build
pnpm start

# Database management
pnpm db:studio  # Open Prisma Studio
pnpm db:push    # Push schema changes
pnpm db:seed    # Seed with sample data
```

### 6. Docker Deployment

```bash
# Build image
docker build -t crypto-bot .

# Run container
docker run -p 3000:3000 --env-file .env.local crypto-bot

# Using docker-compose
docker-compose up -d
```

## Troubleshooting

### Common Issues

1. **Database connection errors**
   - Ensure `DATABASE_URL` is correctly set
   - Run `pnpm db:push` to create the database

2. **Binance API errors**
   - Check API key and secret are correct
   - Verify IP whitelist settings
   - Ensure sandbox mode is enabled for testing

3. **Build errors**
   - Run `pnpm db:generate` before building
   - Check all environment variables are set

4. **Chart not loading**
   - Ensure you're using a modern browser
   - Check browser console for errors

### Getting Help

- Check the [README.md](../README.md) for detailed documentation
- Review the [API documentation](./API.md)
- Open an issue on GitHub for bugs or feature requests

## Security Best Practices

1. **Never commit API keys** to version control
2. **Use environment variables** for all sensitive data
3. **Test with sandbox mode** before live trading
4. **Start with small amounts** when going live
5. **Monitor your trades** regularly
6. **Use strong, unique passwords** for all accounts
7. **Enable 2FA** on your exchange accounts
