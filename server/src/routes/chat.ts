import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { chatMessages, orders, users } from '../data/store';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authenticate);

const CHAT_RETENTION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

function isChatExpired(deliveredAt: string): boolean {
  return Date.now() - new Date(deliveredAt).getTime() > CHAT_RETENTION_MS;
}

// GET /chat/:orderId – get all messages for an order
router.get('/:orderId', (req: AuthRequest, res: Response): void => {
  const { orderId } = req.params;
  const order = orders.find((o) => o.id === orderId);
  if (!order) { res.status(404).json({ error: 'Order not found' }); return; }

  if (order.status === 'delivered' && req.user?.role !== 'admin' && isChatExpired(order.updatedAt)) {
    res.status(410).json({ error: 'Chat history is no longer available (expired after 30 days)' }); return;
  }

  const messages = chatMessages.filter((m) => m.orderId === orderId);
  res.json(messages);
});

// POST /chat/:orderId – send a message
router.post('/:orderId', (req: AuthRequest, res: Response): void => {
  const { orderId } = req.params;
  const order = orders.find((o) => o.id === orderId);
  if (!order) { res.status(404).json({ error: 'Order not found' }); return; }

  if (order.status === 'delivered' || order.status === 'cancelled') {
    res.status(409).json({ error: 'Cannot send messages for a delivered or cancelled order' }); return;
  }

  const { message } = req.body as { message: string };
  if (!message?.trim()) { res.status(400).json({ error: 'message is required' }); return; }
  if (message.trim().length > 500) { res.status(400).json({ error: 'message must be 500 characters or fewer' }); return; }

  const { userId, role } = req.user!;
  const sender = users.find((u) => u.id === userId);

  const chatMsg = {
    id: uuidv4(),
    orderId,
    senderId: userId,
    senderName: sender?.name ?? 'Unknown',
    senderRole: role,
    message: message.trim(),
    createdAt: new Date().toISOString(),
  };
  chatMessages.push(chatMsg);
  res.status(201).json(chatMsg);
});

export default router;
