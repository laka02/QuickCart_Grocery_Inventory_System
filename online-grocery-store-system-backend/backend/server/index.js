import express from 'express';
import cors from 'cors';
import connectDB from './utils/util.js';
import productRouter from './route/product.route.js';
import supplierRouter from './route/supplier.route.js';
import authRouter from './route/auth.route.js';

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

connectDB();

app.use('/api/auth', authRouter);
app.use('/api/products', productRouter);
app.use('/api/suppliers', supplierRouter);

app.get('/api/health', (_, res) => {
    res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

export default app;