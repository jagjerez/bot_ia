@echo off
echo 🚀 Setting up Crypto Trading Bot...

REM Check if pnpm is installed
where pnpm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ pnpm is not installed. Please install pnpm first:
    echo npm install -g pnpm
    pause
    exit /b 1
)

REM Install dependencies
echo 📦 Installing dependencies...
pnpm install

REM Copy environment file
if not exist .env.local (
    echo 📝 Creating .env.local file...
    copy .env.example .env.local
    echo ✅ Please edit .env.local with your API credentials
) else (
    echo ✅ .env.local already exists
)

REM Generate Prisma client
echo 🗄️ Generating Prisma client...
pnpm db:generate

REM Push database schema
echo 🗄️ Setting up database...
pnpm db:push

REM Seed database
echo 🌱 Seeding database...
pnpm db:seed

echo ✅ Setup complete!
echo.
echo Next steps:
echo 1. Edit .env.local with your Binance API credentials
echo 2. Run 'pnpm dev' to start the development server
echo 3. Open http://localhost:3000 in your browser
echo.
echo Happy trading! 🎯
pause
