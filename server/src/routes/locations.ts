 import { Router, Response } from 'express';
import { driverLocations, orders } from '../data/store';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authenticate);

// POST /locations/driver – driver updates their location
router.post('/driver', requireRole('driver'), (req: AuthRequest, res: Response): void => {
  const { userId } = req.user!;
  const { orderId, latitude, longitude } = req.body as {
    orderId: string; latitude: number; longitude: number;
  };
  if (!orderId || latitude === undefined || longitude === undefined) {
    res.status(400).json({ error: 'orderId, latitude, and longitude are required' }); return;
  }
  const order = orders.find((o) => o.id === orderId);
  if (!order) { res.status(404).json({ error: 'Order not found' }); return; }

  if (order.status === 'delivered' || order.status === 'cancelled') {
    res.status(409).json({ error: 'Cannot update location for a delivered or cancelled order' }); return;
  }

  const existing = driverLocations.find((l) => l.orderId === orderId);
  if (existing) {
    existing.latitude = latitude;
    existing.longitude = longitude;
    existing.updatedAt = new Date().toISOString();
    res.json(existing);
  } else {
    const loc = { driverId: userId, orderId, latitude, longitude, updatedAt: new Date().toISOString() };
    driverLocations.push(loc);
    res.status(201).json(loc);
  }
});

// GET /locations/order/:orderId – get driver location for an order
router.get('/order/:orderId', (req: AuthRequest, res: Response): void => {
  const loc = driverLocations.find((l) => l.orderId === req.params.orderId);
  if (!loc) { res.status(404).json({ error: 'Location not found' }); return; }
  res.json(loc);
});

export default router;
