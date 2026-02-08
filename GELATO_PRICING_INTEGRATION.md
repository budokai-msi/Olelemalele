# Gelato Pricing Integration

## Overview
Pricing is now dynamically fetched from Gelato's API based on canvas size. This ensures accurate, real-time pricing that matches Gelato's production costs.

## API Key Setup

### Environment Variables
Add your Gelato API key to `.env.local`:
```bash
GELATO_API_KEY=86e44594-f701-40b8-951e-99aad32e9f4a-5e8be0f2-107d-4875-aac9-7c9e411ce86f:43112656-0bcf-4e17-abfa-0f0849c014fb
```

**Important**: Replace this with your actual production API key before deploying.

## API Endpoints Created

### 1. `/api/gelato/prices` (GET)
Fetch price for a specific canvas size.

**Query Parameters:**
- `size` (required): Canvas size (e.g., "24x36")
- `country` (optional): Country code (default: "US")
- `currency` (optional): Currency code (default: "USD")

**Response:**
```json
{
  "price": {
    "productUid": "canvas_24x36",
    "country": "US",
    "quantity": 1,
    "price": 5200,
    "currency": "USD"
  },
  "source": "gelato",
  "size": "24x36"
}
```

### 2. `/api/gelato/prices` (POST)
Fetch prices for multiple sizes at once.

**Request Body:**
```json
{
  "sizes": ["12x16", "16x20", "24x36"],
  "country": "US",
  "currency": "USD"
}
```

**Response:**
```json
{
  "prices": [
    { "size": "12x16", "price": 1800, "currency": "USD", "source": "gelato" },
    { "size": "16x20", "price": 2400, "currency": "USD", "source": "gelato" },
    { "size": "24x36", "price": 5200, "currency": "USD", "source": "gelato" }
  ],
  "country": "US",
  "currency": "USD"
}
```

## Frontend Integration

### Custom Upload Page (`/upload`)
- Prices load dynamically when page mounts
- Shows loading state while fetching
- Falls back to default prices if API fails
- Price updates immediately when size is selected

### Supported Canvas Sizes
All sizes match Gelato's canvas product catalog:

| Size | UID Pattern |
|------|-------------|
| 12×16" | `canvas_12x16` |
| 16×20" | `canvas_16x20` |
| 20×24" | `canvas_20x24` |
| 24×30" | `canvas_24x30` |
| 24×36" | `canvas_24x36` |
| 30×40" | `canvas_30x40` |
| 36×48" | `canvas_36x48` |
| 40×60" | `canvas_40x60` |

## Gelato Product UIDs

### Finding Your Product UIDs
To get actual product UIDs from Gelato:

1. Log into your [Gelato Dashboard](https://dashboard.gelato.com/)
2. Go to API → Product Catalog
3. Find "Canvas" products
4. Copy the UIDs for each size variant

### Updating UIDs in Code

Edit `src/app/api/gelato/prices/route.ts`:
```typescript
const SIZE_TO_PRODUCT: Record<string, string> = {
  '12x16': 'your-actual-gelato-uid-for-12x16',
  '16x20': 'your-actual-gelato-uid-for-16x20',
  // ... etc
}
```

## Fallback Pricing

When Gelato API is unavailable, the system falls back to these prices:

| Size | Price (USD) |
|------|-------------|
| 12×16" | $18.00 |
| 16×20" | $24.00 |
| 20×24" | $32.00 |
| 24×30" | $42.00 |
| 24×36" | $52.00 |
| 30×40" | $68.00 |
| 36×48" | $89.00 |
| 40×60" | $120.00 |

## Utility Functions

### `src/lib/gelato.ts`

Reusable functions for Gelato integration:

```typescript
// Get price for single product
const price = await getGelatoPrice('canvas_24x36', 'US', 'USD')

// Get prices for multiple products
const prices = await getGelatoPrices(['canvas_12x16', 'canvas_24x36'])

// Create an order
const order = await createGelatoOrder({
  items: [...],
  shippingAddress: {...}
})
```

## Testing

### Local Development
1. Add your API key to `.env.local`
2. Start the dev server: `npm run dev`
3. Visit `/upload`
4. Prices should load from Gelato API

### API Testing
```bash
# Test single price
curl "http://localhost:3000/api/gelato/prices?size=24x36&country=US"

# Test bulk prices
curl -X POST "http://localhost:3000/api/gelato/prices" \
  -H "Content-Type: application/json" \
  -d '{"sizes":["12x16","24x36"],"country":"US"}'
```

## Production Checklist

- [ ] Replace test API key with production key
- [ ] Update product UIDs with actual Gelato values
- [ ] Test all canvas sizes
- [ ] Verify currency conversion (if multi-currency)
- [ ] Check shipping calculations
- [ ] Monitor API rate limits

## Notes

- API responses are cached for 1 hour to reduce load
- Fallback prices ensure site works even if Gelato is down
- All prices are in cents (e.g., $52.00 = 5200) for precision
- The API key should never be exposed to client-side code
