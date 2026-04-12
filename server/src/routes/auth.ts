import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { users } from '../data/store';
import { JWT_SECRET, authenticate, AuthRequest } from '../middleware/auth';
import { Role } from '../types';

const router = Router();

router.post('/register', async (req: Request, res: Response): Promise<void> => {
  const { email, password, role, name, restaurantId } = req.body as {
    email: string;
    password: string;
    role: Role;
    name?: string;
    restaurantId?: string;
  };

  if (!email || !password || !role) {
    res.status(400).json({ error: 'email, password, and role are required' });
    return;
  }
  if (!['customer', 'driver', 'restaurant', 'admin'].includes(role)) {
    res.status(400).json({ error: 'role must be customer, driver, restaurant, or admin' });
    return;
  }
  if (users.find((u) => u.email === email)) {
    res.status(409).json({ error: 'Email already registered' });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = {
    id: uuidv4(),
    email,
    passwordHash,
    role,
    name: name ?? email.split('@')[0],
    restaurantId: role === 'restaurant' ? restaurantId : undefined,
  };
  users.push(user);

  const token = jwt.sign(
    { userId: user.id, role: user.role, restaurantId: user.restaurantId },
    JWT_SECRET,
    { expiresIn: '7d' },
  );

  res.status(201).json({
    token,
    user: { id: user.id, email: user.email, role: user.role, name: user.name, restaurantId: user.restaurantId },
  });
});

router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body as { email: string; password: string };
  if (!email || !password) {
    res.status(400).json({ error: 'email and password are required' });
    return;
  }

  const user = users.find((u) => u.email === email);
  if (!user) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  const token = jwt.sign(
    { userId: user.id, role: user.role, restaurantId: user.restaurantId },
    JWT_SECRET,
    { expiresIn: '7d' },
  );

  res.json({
    token,
    user: { id: user.id, email: user.email, role: user.role, name: user.name, restaurantId: user.restaurantId },
  });
});

router.put('/profile', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const user = users.find((u) => u.id === userId);
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  const { name, phone, email, currentPassword, newPassword } = req.body as {
    name?: string;
    phone?: string;
    email?: string;
    currentPassword?: string;
    newPassword?: string;
  };

  if (email && email !== user.email) {
    if (users.find((u) => u.email === email && u.id !== userId)) {
      res.status(409).json({ error: 'Email already in use' });
      return;
    }
    user.email = email;
  }
  if (name !== undefined) user.name = name;
  if (phone !== undefined) user.phone = phone;

  if (newPassword) {
    if (!currentPassword) {
      res.status(400).json({ error: 'currentPassword is required to change password' });
      return;
    }
    const match = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!match) {
      res.status(401).json({ error: 'Current password is incorrect' });
      return;
    }
    user.passwordHash = await bcrypt.hash(newPassword, 10);
  }

  res.json({ id: user.id, email: user.email, role: user.role, name: user.name, phone: user.phone, restaurantId: user.restaurantId });
});

export default router;
