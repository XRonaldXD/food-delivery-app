import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { orders, restaurants } from '../data/store';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';
import { OrderItem, OrderStatus } from '../types';

const router = Router();
router.use(authenticate);

// POST /orders  (customer)
router.post('/', requireRole('customer'), (req: AuthRequest, res: Response): void => {
  const {
    restaurantId,
    items,
    deliveryAddress,
  } = req.body as {
    restaurantId: string;
    items: Array<{ menuItemId: string; quantity: number }>;
    deliveryAddress: string;
  };

  if (!restaurantId || !items || !items.length || !deliveryAddress) {
    res.status(400).json({ error: 'restaurantId, items, and deliveryAddress are required' });
    return;
  }

  const restaurant = restaurants.find((r) => r.id === restaurantId);
  if (!restaurant) {
    res.status(404).json({ error: 'Restaurant not found' });
    return;
  }

  const orderItems: OrderItem[] = [];
  for (const item of items) {
    const menuItem = restaurant.menu.find((m) => m.id === item.menuItemId);
    if (!menuItem) {
      res.status(400).json({ error: `Menu item ${item.menuItemId} not found` });
      return;
    }
    orderItems.push({
      menuItemId: menuItem.id,
      name: menuItem.name,
      price: menuItem.price,
      quantity: item.quantity,
    });
  }

  const total = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const now = new Date().toISOString();
  const order = {
    id: uuidv4(),
    customerId: req.user!.userId,
    restaurantId,
    restaurantName: restaurant.name,
    items: orderItems,
    total,
    status: 'placed' as OrderStatus,
    deliveryAddress,
    createdAt: now,
    updatedAt: now,
  };
  orders.push(order);
  res.status(201).json(order);
});

// GET /orders/available  (driver)
router.get('/available', requireRole('driver'), (_req: AuthRequest, res: Response): void => {
  const available = orders.filter((o) => o.status === 'placed' && !o.driverId);
  res.json(available);
});

// GET /orders/mine
router.get('/mine', (req: AuthRequest, res: Response): void => {
  const { userId, role } = req.user!;
  if (role === 'customer') {
    res.json(orders.filter((o) => o.customerId === userId));
  } else {
    res.json(orders.filter((o) => o.driverId === userId));
  }
});

// GET /orders/:id
router.get('/:id', (req: AuthRequest, res: Response): void => {
  const order = orders.find((o) => o.id === req.params.id);
  if (!order) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }
  res.json(order);
});

// POST /orders/:id/accept  (driver)
router.post('/:id/accept', requireRole('driver'), (req: AuthRequest, res: Response): void => {
  const order = orders.find((o) => o.id === req.params.id);
  if (!order) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }
  if (order.status !== 'placed' || order.driverId) {
    res.status(409).json({ error: 'Order is not available to accept' });
    return;
  }
  order.driverId = req.user!.userId;
  order.status = 'accepted';
  order.updatedAt = new Date().toISOString();
  res.json(order);
});

// POST /orders/:id/status
router.post('/:id/status', (req: AuthRequest, res: Response): void => {
  const { status } = req.body as { status: OrderStatus };
  const order = orders.find((o) => o.id === req.params.id);
  if (!order) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }

  const { userId, role } = req.user!;

  if (role === 'driver') {
    if (order.driverId !== userId) {
      res.status(403).json({ error: 'Not your order' });
      return;
    }
    if (!['picked_up', 'delivered'].includes(status)) {
      res.status(400).json({ error: 'Driver can only set picked_up or delivered' });
      return;
    }
  } else if (role === 'customer') {
    if (order.customerId !== userId) {
      res.status(403).json({ error: 'Not your order' });
      return;
    }
    if (status !== 'cancelled') {
      res.status(400).json({ error: 'Customer can only cancel an order' });
      return;
    }
    if (!['placed', 'accepted'].includes(order.status)) {
      res.status(409).json({ error: 'Order cannot be cancelled at this stage' });
      return;
    }
  } else {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }

  order.status = status;
  order.updatedAt = new Date().toISOString();
  res.json(order);
});

export default router;
