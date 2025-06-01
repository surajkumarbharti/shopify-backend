require('dotenv').config();
require('@shopify/shopify-api/adapters/node');
const express = require('express');
const cors = require('cors');
const { shopifyApi, LATEST_API_VERSION } = require('@shopify/shopify-api');

const app = express();
const port = process.env.PORT || 3001;

// CORS configuration
app.use(cors({
  origin: [
    process.env.SHOPIFY_SHOP_DOMAIN,
    'http://localhost:3001',
    'https://*.myshopify.com',
    'https://*.myshopify.io',
    'https://shopify-customer-dates-backend.onrender.com'
  ],
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
    console.log('Received request body:', req.body);
    const { birthday, anniversary, orderId, customerId } = req.body;

    if (!birthday || !anniversary || !customerId) {
      console.log('Missing fields:', { birthday, anniversary, customerId });
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields',
        received: { birthday, anniversary, orderId, customerId }
      });
    }

    // Create REST client with access token
    const client = new shopify.clients.Rest({
      session: {
        shop: process.env.SHOPIFY_SHOP_DOMAIN,
        accessToken: process.env.SHOPIFY_ADMIN_TOKEN
      }
    });

    // Extract customer ID from the Shopify GID
    const customerIdNumber = customerId.split('/').pop();
    console.log('Customer ID number:', customerIdNumber);

    try {
      // Save birthday metafield
      const birthdayResponse = await client.post({
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
      console.log('Birthday metafield saved:', birthdayResponse.body);

      // Save anniversary metafield
      const anniversaryResponse = await client.post({
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
      console.log('Anniversary metafield saved:', anniversaryResponse.body);

      res.status(200).json({ 
        success: true, 
        message: 'Dates saved successfully',
        data: {
          birthday: birthdayResponse.body.metafield,
          anniversary: anniversaryResponse.body.metafield
        }
      });
    } catch (apiError) {
      console.error('Shopify API Error:', apiError);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to save dates to Shopify',
        error: apiError.message,
        details: apiError.response?.body || apiError
      });
    }
  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error occurred',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
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
      error: error.message,
      details: error.response?.body || error
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log('Environment:', process.env.NODE_ENV);
  console.log('Shopify Domain:', process.env.SHOPIFY_SHOP_DOMAIN);
}); 