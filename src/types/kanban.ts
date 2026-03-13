export type CardStatus = 'queued' | 'in_progress' | 'done' | 'error';
export type CardTier = 'alpha' | 'bravo' | 'charlie' | 'delta' | 'echo';

export interface CardError {
  message: string;
  stack?: string;
  timestamp: string;
  retryCount: number;
}

export interface Card {
  id: string;
  agentId: string;
  taskId: string;
  title: string;
  payload?: unknown;
  tier: CardTier;
  status: CardStatus;
  errors: CardError[];
  createdAt: string;
  updatedAt: string;
}
