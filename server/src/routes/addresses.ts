import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { addresses } from '../data/store';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authenticate, requireRole('customer'));

// GET /addresses – list customer's saved addresses
router.get('/', (req: AuthRequest, res: Response): void => {
  const { userId } = req.user!;
  res.json(addresses.filter((a) => a.customerId === userId));
});

// POST /addresses – add a new address
router.post('/', (req: AuthRequest, res: Response): void => {
  const { userId } = req.user!;
  const { label, address } = req.body as { label?: string; address?: string };
  if (!address || !address.trim()) {
    res.status(400).json({ error: 'address is required' });
    return;
  }
  const entry = {
    id: uuidv4(),
    customerId: userId,
    label: label?.trim() || 'Home',
    address: address.trim(),
    createdAt: new Date().toISOString(),
  };
  addresses.push(entry);
  res.status(201).json(entry);
});

// PUT /addresses/:id – update a saved address
router.put('/:id', (req: AuthRequest, res: Response): void => {
  const { userId } = req.user!;
  const entry = addresses.find((a) => a.id === req.params.id && a.customerId === userId);
  if (!entry) {
    res.status(404).json({ error: 'Address not found' });
    return;
  }
  const { label, address } = req.body as { label?: string; address?: string };
  if (label !== undefined) entry.label = label.trim();
  if (address !== undefined) {
    if (!address.trim()) {
      res.status(400).json({ error: 'address cannot be empty' });
      return;
    }
    entry.address = address.trim();
  }
  res.json(entry);
});

// DELETE /addresses/:id – delete a saved address
router.delete('/:id', (req: AuthRequest, res: Response): void => {
  const { userId } = req.user!;
  const idx = addresses.findIndex((a) => a.id === req.params.id && a.customerId === userId);
  if (idx === -1) {
    res.status(404).json({ error: 'Address not found' });
    return;
  }
  addresses.splice(idx, 1);
  res.json({ success: true });
});

export default router;
