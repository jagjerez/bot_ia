#!/bin/bash

# Crypto Trading Bot Setup Script

echo "🚀 Setting up Crypto Trading Bot..."

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm is not installed. Please install pnpm first:"
    echo "npm install -g pnpm"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Copy environment file
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local file..."
    cp .env.example .env.local
    echo "✅ Please edit .env.local with your API credentials"
else
    echo "✅ .env.local already exists"
fi

# Generate Prisma client
echo "🗄️ Generating Prisma client..."
pnpm db:generate

# Push database schema
echo "🗄️ Setting up database..."
pnpm db:push

# Seed database
echo "🌱 Seeding database..."
pnpm db:seed

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env.local with your Binance API credentials"
echo "2. Run 'pnpm dev' to start the development server"
echo "3. Open http://localhost:3000 in your browser"
echo ""
echo "Happy trading! 🎯"
