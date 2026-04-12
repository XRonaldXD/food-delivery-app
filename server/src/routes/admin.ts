import { Router, Response } from 'express';
import { users, orders, restaurants } from '../data/store';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authenticate, requireRole('admin'));

// GET /admin/users
router.get('/users', (_req: AuthRequest, res: Response): void => {
  const sanitized = users.map(({ id, email, role, name, restaurantId }) => ({
    id,
    email,
    role,
    name,
    restaurantId,
  }));
  res.json(sanitized);
});

// GET /admin/orders
router.get('/orders', (_req: AuthRequest, res: Response): void => {
  res.json(orders);
});

// GET /admin/restaurants
router.get('/restaurants', (_req: AuthRequest, res: Response): void => {
  res.json(restaurants);
});

export default router;
