# API Documentation

## Overview

The Crypto Trading Bot API provides endpoints for managing trades, bot status, and price data.

## Base URL

- Development: `http://localhost:3000/api`
- Production: `https://your-domain.com/api`

## Authentication

Currently, the API does not require authentication. In production, consider implementing API keys or JWT tokens.

## Endpoints

### Trades

#### GET /api/trades

Fetch recent trades from the database.

**Query Parameters:**
- `limit` (optional): Number of trades to return (default: 50)
- `symbol` (optional): Filter by trading pair (e.g., "BTC/USDT")

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "clx1234567890",
      "symbol": "BTC/USDT",
      "side": "buy",
      "price": 45000.00,
      "amount": 0.001,
      "timestamp": "2024-01-15T10:30:00.000Z",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Failed to fetch trades"
}
```

### Bot Status

#### GET /api/bot/status

Get the current bot status.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "1",
    "running": true,
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

#### POST /api/bot/start

Start the trading bot.

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Bot started successfully"
  }
}
```

#### POST /api/bot/stop

Stop the trading bot.

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Bot stopped successfully"
  }
}
```

### Price Data

#### GET /api/price

Get current price for a trading pair.

**Query Parameters:**
- `symbol` (optional): Trading pair (default: "BTC/USDT")

**Response:**
```json
{
  "success": true,
  "data": {
    "symbol": "BTC/USDT",
    "price": 45000.00,
    "timestamp": 1705312200000
  }
}
```

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

Common HTTP status codes:
- `200`: Success
- `400`: Bad Request
- `500`: Internal Server Error

## Rate Limiting

The API implements basic rate limiting to prevent abuse:
- 100 requests per minute per IP address
- 1000 requests per hour per IP address

## Data Models

### Trade

```typescript
interface Trade {
  id: string;           // Unique identifier
  symbol: string;       // Trading pair (e.g., "BTC/USDT")
  side: 'buy' | 'sell'; // Trade direction
  price: number;        // Price at time of trade
  amount: number;       // Amount traded
  timestamp: string;    // ISO 8601 timestamp
  createdAt: string;    // ISO 8601 creation timestamp
}
```

### BotStatus

```typescript
interface BotStatus {
  id: string;        // Always "1" for single bot instance
  running: boolean;  // Whether bot is currently running
  updatedAt: string; // ISO 8601 last update timestamp
}
```

### TickerData

```typescript
interface TickerData {
  symbol: string;    // Trading pair
  price: number;     // Current price
  timestamp: number; // Unix timestamp in milliseconds
}
```

## WebSocket Events (Future)

Planned WebSocket events for real-time updates:

- `trade:created` - New trade executed
- `price:updated` - Price data updated
- `bot:status_changed` - Bot status changed
- `error:occurred` - Error occurred

## Examples

### Fetching Recent Trades

```bash
curl "http://localhost:3000/api/trades?limit=10&symbol=BTC/USDT"
```

### Starting the Bot

```bash
curl -X POST "http://localhost:3000/api/bot/start"
```

### Getting Current Price

```bash
curl "http://localhost:3000/api/price?symbol=ETH/USDT"
```

### JavaScript/TypeScript

```typescript
// Fetch trades
const response = await fetch('/api/trades?limit=20');
const data = await response.json();

if (data.success) {
  console.log('Trades:', data.data);
} else {
  console.error('Error:', data.error);
}

// Start bot
const startResponse = await fetch('/api/bot/start', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
});

const startData = await startResponse.json();
console.log(startData.message);
```

## Testing

Use tools like Postman, curl, or the built-in dashboard to test the API endpoints.

### Test Data

The application includes sample data that can be seeded using:

```bash
pnpm db:seed
```

This creates sample trades and initializes the bot status.
