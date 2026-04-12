import { Router, Response } from 'express';
import { restaurants } from '../data/store';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';

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

// GET /restaurants/:id/menu
router.get('/:id/menu', authenticate, (req: AuthRequest, res: Response): void => {
  const restaurant = restaurants.find((r) => r.id === req.params.id);
  if (!restaurant) {
    res.status(404).json({ error: 'Restaurant not found' });
    return;
  }
  res.json(restaurant);
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

export default router;
