# Shopify Customer Dates Backend

A Node.js backend service for storing customer birthday and anniversary dates in Shopify customer metafields.

## Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/shopify-customer-dates-backend.git
cd shopify-customer-dates-backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```
SHOPIFY_API_KEY=your_api_key_here
SHOPIFY_API_SECRET=your_api_secret_here
SHOPIFY_ADMIN_TOKEN=your_admin_token_here
SHOPIFY_SHOP_DOMAIN=your_shop_domain.myshopify.com
PORT=3001
```

4. Start the development server:
```bash
npm run dev
```

## API Endpoints

### POST /api/save-dates
Save customer birthday and anniversary dates.

Request body:
```json
{
  "birthday": "1990-01-01",
  "anniversary": "2020-01-01",
  "orderId": "gid://shopify/Order/1234567890",
  "customerId": "gid://shopify/Customer/1234567890"
}
```

### GET /api/test-customer
Test endpoint to verify customer API access.

### GET /health
Health check endpoint.

## Environment Variables

- `SHOPIFY_API_KEY`: Your Shopify API key
- `SHOPIFY_API_SECRET`: Your Shopify API secret
- `SHOPIFY_ADMIN_TOKEN`: Your Shopify Admin API access token
- `SHOPIFY_SHOP_DOMAIN`: Your Shopify store domain (e.g., mystore.myshopify.com)
- `PORT`: Server port (default: 3001)