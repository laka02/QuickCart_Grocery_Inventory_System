import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import connectDB from './utils/util.js';
import productRouter from './route/product.route.js';
import supplierRouter from './route/supplier.route.js';
import authRouter from './route/auth.route.js';
import stockRouter from './route/stock.route.js';
import swaggerSpec from './config/swagger.js';

const app = express();

const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map((origin) => origin.trim())
    : ['http://localhost:5175'];

app.use(
    cors({
        origin: allowedOrigins,
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true
    })
);
app.use(express.json());

// Swagger API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    swaggerOptions: {
        url: '/api-docs/swagger.json',
        displayOperationId: false,
    },
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'QuickCart API Documentation'
}));

connectDB();

app.use('/api/auth', authRouter);
app.use('/api/products', productRouter);
app.use('/api/suppliers', supplierRouter);
app.use('/api/stock', stockRouter);

app.get('/api/health', (_, res) => {
    res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

export default app;