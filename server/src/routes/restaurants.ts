import { Router, Response } from 'express';
import { restaurants } from '../data/store';
import { authenticate, AuthRequest } from '../middleware/auth';

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

export default router;
