import express from 'express';
import cors from 'cors';
import authRouter from './routes/auth';
import restaurantsRouter from './routes/restaurants';
import ordersRouter from './routes/orders';

const app = express();
const PORT = process.env.PORT ?? 3000;

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.use('/auth', authRouter);
app.use('/restaurants', restaurantsRouter);
app.use('/orders', ordersRouter);

app.listen(PORT, () => {
  console.log(`Food Delivery API running on port ${PORT}`);
});

export default app;
