# Shopify Customer Dates Backend

This is a Node.js backend service for storing customer birthday and anniversary dates in Shopify customer metafields.

## Environment Variables

Create a `.env` file with the following variables:

```
SHOPIFY_API_KEY=your_api_key
SHOPIFY_API_SECRET=your_api_secret
SHOPIFY_ADMIN_TOKEN=your_admin_token
SHOPIFY_SHOP_DOMAIN=your_shop_domain.myshopify.com
PORT=3001
```

## Local Development

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

## Deployment to Render

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Use the following settings:
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment Variables: Add all variables from your `.env` file

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

Response:
```json
{
  "success": true,
  "message": "Dates saved successfully"
}