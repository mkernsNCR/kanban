import { Router } from 'express';
import { nanoid } from 'nanoid';
import type { Card, CardStatus, CardTier, CardError } from '../types/kanban.js';

const router = Router();

// In-memory storage
const cards = new Map<string, Card>();

// SSE clients
const clients = new Set<ReadableStreamDefaultController>();

// Broadcast to all SSE clients
function broadcast(event: string, data: Card) {
  const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  clients.forEach(client => {
    try {
      client.enqueue(new TextEncoder().encode(message));
    } catch {
      clients.delete(client);
    }
  });
}

// Create card
router.post('/cards', (req, res) => {
  const { agentId, taskId, title, payload, tier } = req.body;
  
  if (!agentId || !taskId || !title || !tier) {
    return res.status(400).json({ error: 'Missing required fields: agentId, taskId, title, tier' });
  }

  const now = new Date().toISOString();
  const card: Card = {
    id: nanoid(),
    agentId,
    taskId,
    title,
    payload,
    tier: tier as CardTier,
    status: 'queued',
    errors: [],
    createdAt: now,
    updatedAt: now
  };

  cards.set(card.id, card);
  broadcast('card-created', card);
  
  res.status(201).json(card);
});

// Update card status
router.patch('/cards/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status || !['queued', 'in_progress', 'done', 'error'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  const card = cards.get(id);
  if (!card) {
    return res.status(404).json({ error: 'Card not found' });
  }

  card.status = status as CardStatus;
  card.updatedAt = new Date().toISOString();
  cards.set(id, card);
  
  broadcast('card-updated', card);
  
  res.json(card);
});

// Add error to card
router.post('/cards/:id/error', (req, res) => {
  const { id } = req.params;
  const { message, stack, retryCount = 0 } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Error message required' });
  }

  const card = cards.get(id);
  if (!card) {
    return res.status(404).json({ error: 'Card not found' });
  }

  const error: CardError = {
    message,
    stack,
    timestamp: new Date().toISOString(),
    retryCount
  };

  card.errors.push(error);
  card.updatedAt = new Date().toISOString();
  cards.set(id, card);
  
  broadcast('card-error', card);
  
  res.json(card);
});

// Get board - all cards grouped by agentId and status
router.get('/board', (_req, res) => {
  const board: Record<string, Record<string, Card[]>> = {};
  
  cards.forEach(card => {
    if (!board[card.agentId]) {
      board[card.agentId] = {};
    }
    if (!board[card.agentId][card.status]) {
      board[card.agentId][card.status] = [];
    }
    board[card.agentId][card.status].push(card);
  });
  
  res.json(board);
});

// SSE endpoint for real-time updates
router.get('/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const controller = res.write;
  clients.add(controller as unknown as ReadableStreamDefaultController);

  // Send initial connection event
  res.write(`event: connected\ndata: ${JSON.stringify({ timestamp: new Date().toISOString() })}\n\n`);

  req.on('close', () => {
    clients.delete(controller as unknown as ReadableStreamDefaultController);
  });
});

export default router;
