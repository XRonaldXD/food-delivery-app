import express from 'express';
import cors from 'cors';
import { rateLimit } from 'express-rate-limit';
import authRouter from './routes/auth';
import restaurantsRouter from './routes/restaurants';
import ordersRouter from './routes/orders';

const app = express();
const PORT = process.env.PORT ?? 3000;

app.use(cors());
app.use(express.json());

// General rate limiter: 100 requests per minute per IP
const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter limiter for auth endpoints to mitigate brute-force attacks
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});

app.use(generalLimiter);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.use('/auth', authLimiter, authRouter);
app.use('/restaurants', restaurantsRouter);
app.use('/orders', ordersRouter);

app.listen(PORT, () => {
  console.log(`Food Delivery API running on port ${PORT}`);
});

export default app;
