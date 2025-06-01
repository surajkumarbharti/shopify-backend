require('dotenv').config();
require('@shopify/shopify-api/adapters/node');
const express = require('express');
const cors = require('cors');
const { shopifyApi, LATEST_API_VERSION } = require('@shopify/shopify-api');

const app = express();
const port = process.env.PORT || 3001;

// CORS configuration
app.use(cors({
  origin: [process.env.SHOPIFY_SHOP_DOMAIN, 'http://localhost:3001'],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true
}));

app.use(express.json());

// Initialize Shopify API client
const shopify = shopifyApi({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET,
  scopes: ['write_customers', 'read_customers'],
  hostName: process.env.SHOPIFY_SHOP_DOMAIN,
  apiVersion: LATEST_API_VERSION,
  isEmbeddedApp: true,
  adminApiAccessToken: process.env.SHOPIFY_ADMIN_TOKEN
});

// Routes
app.post('/api/save-dates', async (req, res) => {
  try {
    const { birthday, anniversary, orderId, customerId } = req.body;

    if (!birthday || !anniversary || !customerId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields' 
      });
    }

    console.log('Received request:', { birthday, anniversary, orderId, customerId });

    // Create REST client with access token
    const client = new shopify.clients.Rest({
      session: {
        shop: process.env.SHOPIFY_SHOP_DOMAIN,
        accessToken: process.env.SHOPIFY_ADMIN_TOKEN
      }
    });

    // Extract customer ID from the Shopify GID
    const customerIdNumber = customerId.split('/').pop();

    // Save birthday metafield
    await client.post({
      path: `customers/${customerIdNumber}/metafields`,
      data: {
        metafield: {
          namespace: "custom",
          key: "birthday",
          value: birthday,
          type: "date"
        }
      }
    });

    // Save anniversary metafield
    await client.post({
      path: `customers/${customerIdNumber}/metafields`,
      data: {
        metafield: {
          namespace: "custom",
          key: "anniversary",
          value: anniversary,
          type: "date"
        }
      }
    });

    res.status(200).json({ 
      success: true, 
      message: 'Dates saved successfully' 
    });
  } catch (error) {
    console.error('Error saving dates:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to save dates',
      error: error.message 
    });
  }
});

// Test endpoint to get customer information
app.get('/api/test-customer', async (req, res) => {
  try {
    const client = new shopify.clients.Rest({
      session: {
        shop: process.env.SHOPIFY_SHOP_DOMAIN,
        accessToken: process.env.SHOPIFY_ADMIN_TOKEN
      }
    });

    const response = await client.get({
      path: 'customers',
      query: { limit: 1 }
    });

    res.status(200).json({ 
      success: true,
      customers: response.body.customers
    });
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch customer',
      error: error.message 
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 