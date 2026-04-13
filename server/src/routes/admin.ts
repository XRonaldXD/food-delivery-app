import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { users, orders, restaurants } from '../data/store';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';
import { Role } from '../types';

const router = Router();
router.use(authenticate, requireRole('admin'));

// GET /admin/users
router.get('/users', (req: AuthRequest, res: Response): void => {
  const { search } = req.query as { search?: string };
  let list = users.map(({ id, email, role, name, phone, restaurantId }) => ({
    id, email, role, name, phone, restaurantId,
  }));
  if (search) {
    const q = search.toLowerCase();
    list = list.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  }
  res.json(list);
});

// POST /admin/users
router.post('/users', async (req: AuthRequest, res: Response): Promise<void> => {
  const { email, password, role, name, phone, restaurantId } = req.body as {
    email: string; password: string; role: Role; name?: string; phone?: string; restaurantId?: string;
  };
  if (!email || !password || !role) {
    res.status(400).json({ error: 'email, password, and role are required' });
    return;
  }
  if (users.find((u) => u.email === email)) {
    res.status(409).json({ error: 'Email already registered' });
    return;
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const user = { id: uuidv4(), email, passwordHash, role, name: name ?? email.split('@')[0], phone, restaurantId };
  users.push(user);
  res.status(201).json({ id: user.id, email: user.email, role: user.role, name: user.name, phone: user.phone, restaurantId: user.restaurantId });
});

// PUT /admin/users/:id
router.put('/users/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  const user = users.find((u) => u.id === req.params.id);
  if (!user) { res.status(404).json({ error: 'User not found' }); return; }
  const { name, phone, email, role, password } = req.body as {
    name?: string; phone?: string; email?: string; role?: Role; password?: string;
  };
  if (email && email !== user.email && users.find((u) => u.email === email)) {
    res.status(409).json({ error: 'Email already in use' }); return;
  }
  if (email) user.email = email;
  if (name !== undefined) user.name = name;
  if (phone !== undefined) user.phone = phone;
  if (role) user.role = role;
  if (password) user.passwordHash = await bcrypt.hash(password, 10);
  res.json({ id: user.id, email: user.email, role: user.role, name: user.name, phone: user.phone, restaurantId: user.restaurantId });
});

// DELETE /admin/users/:id
router.delete('/users/:id', (req: AuthRequest, res: Response): void => {
  if (req.params.id === req.user!.userId) {
    res.status(403).json({ error: 'You cannot delete your own account' });
    return;
  }
  const idx = users.findIndex((u) => u.id === req.params.id);
  if (idx === -1) { res.status(404).json({ error: 'User not found' }); return; }
  users.splice(idx, 1);
  res.json({ success: true });
});

// GET /admin/orders
router.get('/orders', (_req: AuthRequest, res: Response): void => {
  res.json(orders);
});

// GET /admin/restaurants
router.get('/restaurants', (_req: AuthRequest, res: Response): void => {
  res.json(restaurants);
});

// GET /admin/revenue
router.get('/revenue', (_req: AuthRequest, res: Response): void => {
  const totalRevenue = orders
    .filter((o) => o.status === 'delivered')
    .reduce((sum, o) => sum + o.total, 0);

  const perRestaurant = restaurants.map((r) => {
    const restOrders = orders.filter((o) => o.restaurantId === r.id && o.status === 'delivered');
    return {
      restaurantId: r.id,
      restaurantName: r.name,
      revenue: restOrders.reduce((sum, o) => sum + o.total, 0),
      orderCount: restOrders.length,
    };
  });

  const byStatus = orders.reduce<Record<string, number>>((acc, o) => {
    acc[o.status] = (acc[o.status] ?? 0) + 1;
    return acc;
  }, {});

  res.json({ totalRevenue, perRestaurant, ordersByStatus: byStatus, totalOrders: orders.length });
});

export default router;

