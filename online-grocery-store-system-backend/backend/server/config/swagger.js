import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'QuickCart Inventory API',
      version: '1.0.0',
      description: 'Modern MERN stack grocery inventory system API with admin dashboard and storefront',
      contact: {
        name: 'QuickCart Support',
        email: 'support@quickcart.com'
      }
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' 
          ? 'https://quickcart-api-zeta.vercel.app' 
          : 'http://localhost:3000',
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        Product: {
          type: 'object',
          properties: {
            _id: { type: 'string', description: 'Product ID' },
            name: { type: 'string', description: 'Product name' },
            description: { type: 'string', description: 'Product description' },
            price: { type: 'number', description: 'Product price' },
            category: { type: 'string', description: 'Product category' },
            stock: { type: 'number', description: 'Current stock quantity' },
            reorderPoint: { type: 'number', description: 'Reorder alert threshold' },
            images: { type: 'array', items: { type: 'string' }, description: 'Product images URLs' }
          }
        },
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string', description: 'User ID' },
            email: { type: 'string', description: 'User email' },
            role: { type: 'string', enum: ['admin', 'inventory_manager'], description: 'User role' }
          }
        },
        Supplier: {
          type: 'object',
          properties: {
            _id: { type: 'string', description: 'Supplier ID' },
            name: { type: 'string', description: 'Supplier name' },
            email: { type: 'string', description: 'Supplier email' },
            phone: { type: 'string', description: 'Supplier phone' },
            address: { type: 'object', description: 'Supplier address' },
            productsSupplied: { type: 'array', items: { type: 'string' }, description: 'List of product IDs' }
          }
        }
      }
    }
  },
  apis: [
    './route/auth.route.js',
    './route/product.route.js',
    './route/supplier.route.js',
    './route/stock.route.js'
  ]
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
