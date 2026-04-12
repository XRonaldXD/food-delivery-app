import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { restaurants, orders } from '../data/store';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';
import { MenuItem } from '../types';

const router = Router();

// GET /restaurants
router.get('/', authenticate, (_req: AuthRequest, res: Response): void => {
  const list = restaurants.map(({ id, name, description, cuisine, imageUrl }) => ({
    id,
    name,
    description,
    cuisine,
    imageUrl,
  }));
  res.json(list);
});

// GET /restaurants/menu/items – restaurant owner's menu (must be before /:id routes)
router.get('/menu/items', authenticate, requireRole('restaurant'), (req: AuthRequest, res: Response): void => {
  const { restaurantId } = req.user!;
  if (!restaurantId) { res.status(403).json({ error: 'No restaurant linked' }); return; }
  const restaurant = restaurants.find((r) => r.id === restaurantId);
  if (!restaurant) { res.status(404).json({ error: 'Restaurant not found' }); return; }
  res.json(restaurant.menu);
});

// POST /restaurants/menu – add menu item
router.post('/menu', authenticate, requireRole('restaurant'), (req: AuthRequest, res: Response): void => {
  const { restaurantId } = req.user!;
  if (!restaurantId) { res.status(403).json({ error: 'No restaurant linked' }); return; }
  const restaurant = restaurants.find((r) => r.id === restaurantId);
  if (!restaurant) { res.status(404).json({ error: 'Restaurant not found' }); return; }
  const { name, description, price, imageUrl } = req.body as Partial<MenuItem>;
  if (!name || !description || price === undefined) {
    res.status(400).json({ error: 'name, description, and price are required' }); return;
  }
  const numericPrice = Number(price);
  if (isNaN(numericPrice) || numericPrice < 0) {
    res.status(400).json({ error: 'price must be a non-negative number' }); return;
  }
  const item: MenuItem = { id: uuidv4(), name, description, price: numericPrice, imageUrl };
  restaurant.menu.push(item);
  res.status(201).json(item);
});

// PUT /restaurants/menu/:itemId – update menu item
router.put('/menu/:itemId', authenticate, requireRole('restaurant'), (req: AuthRequest, res: Response): void => {
  const { restaurantId } = req.user!;
  if (!restaurantId) { res.status(403).json({ error: 'No restaurant linked' }); return; }
  const restaurant = restaurants.find((r) => r.id === restaurantId);
  if (!restaurant) { res.status(404).json({ error: 'Restaurant not found' }); return; }
  const item = restaurant.menu.find((m) => m.id === req.params.itemId);
  if (!item) { res.status(404).json({ error: 'Menu item not found' }); return; }
  const { name, description, price, imageUrl } = req.body as Partial<MenuItem>;
  if (name !== undefined) item.name = name;
  if (description !== undefined) item.description = description;
  if (price !== undefined) {
    const numericPrice = Number(price);
    if (isNaN(numericPrice) || numericPrice < 0) {
      res.status(400).json({ error: 'price must be a non-negative number' }); return;
    }
    item.price = numericPrice;
  }
  if (imageUrl !== undefined) item.imageUrl = imageUrl;
  res.json(item);
});

// DELETE /restaurants/menu/:itemId – delete menu item
router.delete('/menu/:itemId', authenticate, requireRole('restaurant'), (req: AuthRequest, res: Response): void => {
  const { restaurantId } = req.user!;
  if (!restaurantId) { res.status(403).json({ error: 'No restaurant linked' }); return; }
  const restaurant = restaurants.find((r) => r.id === restaurantId);
  if (!restaurant) { res.status(404).json({ error: 'Restaurant not found' }); return; }
  const idx = restaurant.menu.findIndex((m) => m.id === req.params.itemId);
  if (idx === -1) { res.status(404).json({ error: 'Menu item not found' }); return; }
  restaurant.menu.splice(idx, 1);
  res.json({ success: true });
});

// GET /restaurants/revenue – restaurant revenue stats
router.get('/revenue', authenticate, requireRole('restaurant'), (req: AuthRequest, res: Response): void => {
  const { restaurantId } = req.user!;
  if (!restaurantId) { res.status(403).json({ error: 'No restaurant linked' }); return; }
  const { start, end } = req.query as { start?: string; end?: string };

  const delivered = orders.filter((o) => {
    if (o.restaurantId !== restaurantId || o.status !== 'delivered') return false;
    if (start) {
      const startMs = new Date(start).getTime();
      if (!isNaN(startMs) && new Date(o.createdAt).getTime() < startMs) return false;
    }
    if (end) {
      const endDate = new Date(end);
      if (!isNaN(endDate.getTime())) {
        endDate.setUTCHours(23, 59, 59, 999);
        if (new Date(o.createdAt).getTime() > endDate.getTime()) return false;
      }
    }
    return true;
  });

  const totalRevenue = delivered.reduce((sum, o) => sum + o.total, 0);
  const totalOrders = delivered.length;

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const monthlyRevenue = delivered
    .filter((o) => o.createdAt >= monthStart)
    .reduce((sum, o) => sum + o.total, 0);

  res.json({ totalRevenue, monthlyRevenue, totalOrders, orders: delivered });
});

// GET /restaurants/settings  (restaurant owner)
router.get('/settings', authenticate, requireRole('restaurant'), (req: AuthRequest, res: Response): void => {
  const { restaurantId } = req.user!;
  if (!restaurantId) {
    res.status(403).json({ error: 'No restaurant linked to this account' });
    return;
  }
  const restaurant = restaurants.find((r) => r.id === restaurantId);
  if (!restaurant) {
    res.status(404).json({ error: 'Restaurant not found' });
    return;
  }
  res.json({ autoAccept: restaurant.autoAccept ?? false });
});

// PUT /restaurants/settings  (restaurant owner)
router.put('/settings', authenticate, requireRole('restaurant'), (req: AuthRequest, res: Response): void => {
  const { restaurantId } = req.user!;
  if (!restaurantId) {
    res.status(403).json({ error: 'No restaurant linked to this account' });
    return;
  }
  const restaurant = restaurants.find((r) => r.id === restaurantId);
  if (!restaurant) {
    res.status(404).json({ error: 'Restaurant not found' });
    return;
  }
  const { autoAccept } = req.body as { autoAccept: boolean };
  if (typeof autoAccept !== 'boolean') {
    res.status(400).json({ error: 'autoAccept must be a boolean' });
    return;
  }
  restaurant.autoAccept = autoAccept;
  res.json({ autoAccept: restaurant.autoAccept });
});

// GET /restaurants/:id/menu
router.get('/:id/menu', authenticate, (req: AuthRequest, res: Response): void => {
  const restaurant = restaurants.find((r) => r.id === req.params.id);
  if (!restaurant) {
    res.status(404).json({ error: 'Restaurant not found' });
    return;
  }
  res.json(restaurant);
});

export default router;

