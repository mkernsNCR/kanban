import React, { useState, useEffect, useCallback } from 'react';
import { ChevronDown, ChevronUp, Check, AlertTriangle, Clock, Bot } from 'lucide-react';
import { COLORS } from '../utils/constants';
import type { Card, CardStatus, CardTier } from '../types/kanban';

const TIER_COLORS: Record<CardTier, string> = {
  alpha: '#FF6B35',
  bravo: '#06A77D',
  charlie: '#8338EC',
  delta: '#F77F00',
  echo: '#004643',
};

type AgentLane = Partial<Record<CardStatus, Card[]>>;
type BoardState = Record<string, AgentLane>;

const STATUS_COLUMNS: CardStatus[] = ['queued', 'in_progress', 'done', 'error'];

const formatElapsedTime = (createdAt?: string, updatedAt?: string) => {
  if (!createdAt) return '--';
  const end = updatedAt ? new Date(updatedAt).getTime() : Date.now();
  const elapsed = Math.floor((end - new Date(createdAt).getTime()) / 1000);
  
  if (elapsed < 60) return `${elapsed}s`;
  if (elapsed < 3600) return `${Math.floor(elapsed / 60)}m ${elapsed % 60}s`;
  const hours = Math.floor(elapsed / 3600);
  const mins = Math.floor((elapsed % 3600) / 60);
  return `${hours}h ${mins}m`;
};

const getResponseErrorMessage = async (response: Response) => {
  const statusMessage = `${response.status} ${response.statusText}`;
  const contentType = response.headers.get('content-type') || '';

  try {
    if (contentType.includes('application/json')) {
      const data = await response.json();
      const details =
        data?.error ||
        data?.message ||
        (Object.keys(data || {}).length > 0 ? JSON.stringify(data) : '');

      return details ? `${statusMessage} - ${details}` : statusMessage;
    }

    const text = (await response.text()).trim();
    return text ? `${statusMessage} - ${text}` : statusMessage;
  } catch {
    return statusMessage;
  }
};

type TaskCardProps = {
  task: Card;
  isError: boolean;
  onToggleExpand: (cardId: string) => void;
  isExpanded: boolean;
  onAcknowledge: (cardId: string) => void | Promise<void>;
};

const TaskCard = ({ task, isError, onToggleExpand, isExpanded, onAcknowledge }: TaskCardProps) => {
  const tierColor = TIER_COLORS[task.tier] || COLORS.primary;
  const taskCardStyle: React.CSSProperties & {
    '--task-card-border-color': string;
    '--task-card-shadow-color': string;
  } = {
    '--task-card-border-color': isError ? COLORS.danger : COLORS.dark,
    '--task-card-shadow-color': isError ? COLORS.danger : COLORS.dark,
    background: COLORS.light,
    border: '3px solid var(--task-card-border-color)',
    boxShadow: '4px 4px 0 var(--task-card-shadow-color)',
    padding: '12px',
  };
  
  return (
    <div
      className={`task-card mb-3${isError ? ' task-card--error' : ''}`}
      style={taskCardStyle}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1 min-w-0">
          <span 
            className="block font-mono text-[10px] font-bold mb-1" 
            style={{ color: COLORS.dark, opacity: 0.5 }}
          >
            {task.id}
          </span>
          <h4 
            className="text-[13px] font-bold leading-tight m-0 truncate" 
            style={{ color: COLORS.dark }}
          >
            {task.title}
          </h4>
        </div>
      </div>

      {/* Tier badge and elapsed time */}
      <div className="flex items-center justify-between gap-2">
        <span
          className="text-[10px] font-bold uppercase px-2 py-0.5"
          style={{
            background: tierColor,
            color: COLORS.light,
            border: `2px solid ${COLORS.dark}`,
          }}
        >
          {task.tier}
        </span>
        
        <div 
          className="flex items-center gap-1 text-[11px] font-semibold"
          style={{ color: COLORS.dark, opacity: 0.7 }}
        >
          <Clock size={11} />
          {formatElapsedTime(task.createdAt, task.updatedAt)}
        </div>
      </div>

      {/* Error details - expandable */}
      {isError && task.errors && task.errors.length > 0 && (
        <>
          <button
            type="button"
            aria-expanded={isExpanded}
            onClick={() => onToggleExpand(task.id)}
            className="flex items-center gap-1 mt-2 text-[11px] font-bold"
            style={{
              background: 'none',
              border: 'none',
              color: COLORS.danger,
              cursor: 'pointer',
              padding: '4px 0',
            }}
          >
            {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            {isExpanded ? 'Hide' : 'Show'} error
          </button>

          {isExpanded && task.errors.map((err, idx) => (
            <div 
              key={idx}
              className="mt-2 p-2 text-[10px] font-mono overflow-x-auto"
              style={{
                background: '#1A1A1A',
                color: COLORS.danger,
                border: `2px solid ${COLORS.danger}`,
              }}
            >
              <pre className="whitespace-pre-wrap break-all">{err.message}</pre>
              {err.stack && (
                <pre className="whitespace-pre-wrap break-all mt-2 opacity-70">{err.stack}</pre>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={() => onAcknowledge(task.id)}
            className="flex items-center gap-1 mt-2 px-3 py-1.5 text-[11px] font-bold"
            style={{
              background: COLORS.warning,
              color: COLORS.light,
              border: `2px solid ${COLORS.dark}`,
              cursor: 'pointer',
            }}
          >
            <Check size={12} />
            Acknowledge
          </button>
        </>
      )}
    </div>
  );
};

const AgentBoard = () => {
  const [boardState, setBoardState] = useState<BoardState>({});
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [acknowledgeError, setAcknowledgeError] = useState('');

  // Fetch initial board state
  useEffect(() => {
    const fetchBoard = async () => {
      try {
        const res = await fetch('/api/kanban/board');
        if (!res.ok) {
          throw new Error(`Failed to fetch board: ${await getResponseErrorMessage(res)}`);
        }

        const data = (await res.json()) as BoardState;
        setBoardState(data);
      } catch (err) {
        console.error('Failed to fetch board:', err);
      }
    };
    fetchBoard();
  }, []);

  // SSE connection
  useEffect(() => {
    const eventSource = new EventSource('/api/kanban/stream');

    // Helper to update a card in board state
    const updateCard = (card: Card) => {
      setBoardState((prev) => {
        const next = { ...prev };
        // Create new agent lane if it doesn't exist
        const oldAgent = next[card.agentId];
        const agent = oldAgent ? { ...oldAgent } : {};

        for (const status of Object.keys(agent) as CardStatus[]) {
          agent[status] = [...(agent[status] || [])];
        }
        
        // Remove card from any existing status column
        for (const status of Object.keys(agent) as CardStatus[]) {
          const statusCards = agent[status] || [];
          agent[status] = statusCards.filter((c) => c.id !== card.id);
        }
        // Add to new status column
        agent[card.status] = [...(agent[card.status] || []), card];
        
        return { ...next, [card.agentId]: agent };
      });
    };

    // Handle card created/updated events
    const handleCardEvent = (event: MessageEvent) => {
      try {
        const card = JSON.parse(event.data) as Card;
        updateCard(card);
      } catch (err) {
        console.error('SSE parse error:', err);
      }
    };

    eventSource.addEventListener('card-created', handleCardEvent);
    eventSource.addEventListener('card-updated', handleCardEvent);
    eventSource.addEventListener('card-error', handleCardEvent);
    eventSource.addEventListener('connected', (event) => {
      console.log('SSE connected:', event.data);
    });

    eventSource.onerror = (err) => {
      console.error('SSE error:', err);
      // Don't close - EventSource auto-reconnects on transient failures
    };

    return () => eventSource.close();
  }, []);

  const toggleExpand = useCallback((cardId: string) => {
    setExpandedTasks((prev) => {
      const next = new Set(prev);
      if (next.has(cardId)) next.delete(cardId);
      else next.add(cardId);
      return next;
    });
  }, []);

  const handleAcknowledge = async (cardId: string) => {
    try {
      setAcknowledgeError('');

      const response = await fetch(`/api/kanban/cards/${cardId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'done' }),
      });

      if (!response.ok) {
        throw new Error(`Failed to acknowledge task: ${await getResponseErrorMessage(response)}`);
      }
    } catch (err) {
      setAcknowledgeError(err instanceof Error ? err.message : 'Failed to acknowledge task');
      console.error('Failed to acknowledge task:', err);
    }
  };

  const getTasksByStatus = (agentId: string, status: CardStatus) => {
    const agent = boardState[agentId];
    if (!agent) return [];
    return agent[status] || [];
  };

  const agentIds = Object.keys(boardState);

  return (
    <div className="agent-board">
      {acknowledgeError && (
        <div
          className="mb-4 px-4 py-3 text-sm font-bold"
          style={{
            background: COLORS.danger,
            color: COLORS.light,
            border: `3px solid ${COLORS.dark}`,
            boxShadow: `4px 4px 0 ${COLORS.dark}`,
          }}
        >
          {acknowledgeError}
        </div>
      )}
      {agentIds.length === 0 ? (
            <div 
              className="flex items-center justify-center py-20 text-lg font-bold"
              style={{ color: COLORS.light, opacity: 0.5 }}
            >
              No active agents
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {agentIds.map((agentId) => (
                <div 
                  key={agentId} 
                  className="agent-swimlane"
                  style={{
                    background: '#2D2D2D',
                    border: `4px solid ${COLORS.dark}`,
                    boxShadow: `6px 6px 0 ${COLORS.dark}`,
                    padding: '16px',
                  }}
                >
                  {/* Agent header */}
                  <div 
                    className="flex items-center gap-3 mb-4 pb-3"
                    style={{ borderBottom: `3px solid ${COLORS.dark}` }}
                  >
                    <Bot
                      size={20}
                      style={{ color: agentId in TIER_COLORS ? TIER_COLORS[agentId as CardTier] : COLORS.primary }}
                    />
                    <h3 
                      className="text-lg font-black m-0 uppercase"
                      style={{ color: COLORS.light }}
                    >
                      {agentId}
                    </h3>
                    <span 
                      className="text-xs font-bold px-2 py-0.5 ml-auto"
                      style={{
                        background: COLORS.secondary,
                        color: COLORS.light,
                        border: `2px solid ${COLORS.dark}`,
                      }}
                    >
                      {getTasksByStatus(agentId, 'in_progress').length} active
                    </span>
                  </div>

                  {/* 4 columns */}
                  <div className="flex gap-4 overflow-x-auto">
                    {STATUS_COLUMNS.map((status) => {
                      const tasks = getTasksByStatus(agentId, status);
                      const isErrorCol = status === 'error';
                      const colTitle = {
                        queued: 'QUEUED',
                        in_progress: 'IN PROGRESS',
                        done: 'DONE',
                        error: 'ERROR',
                      }[status];

                      return (
                        <div
                          key={status}
                          className="flex-shrink-0"
                          style={{
                            width: '280px',
                            background: isErrorCol ? '#2D2D2D' : '#242424',
                            border: `3px solid ${isErrorCol ? COLORS.danger : COLORS.dark}`,
                            padding: '12px',
                          }}
                        >
                          {/* Column header */}
                          <div className="flex items-center justify-between mb-3 pb-2">
                            <h4 
                              className="text-sm font-black m-0"
                              style={{ 
                                color: isErrorCol ? COLORS.danger : COLORS.light 
                              }}
                            >
                              {isErrorCol && <AlertTriangle size={14} className="inline mr-1" />}
                              {colTitle}
                            </h4>
                            <span 
                              className="text-xs font-bold px-2 py-0.5"
                              style={{
                                background: isErrorCol ? COLORS.danger : COLORS.primary,
                                color: COLORS.light,
                                border: `2px solid ${COLORS.dark}`,
                              }}
                            >
                              {tasks.length}
                            </span>
                          </div>

                          {/* Tasks */}
                          <div className="min-h-[100px]">
                            {tasks.length === 0 ? (
                              <div 
                                className="text-xs font-bold text-center py-6 opacity-30"
                                style={{ 
                                  border: `2px dashed ${COLORS.light}`,
                                  color: COLORS.light,
                                }}
                              >
                                Empty
                              </div>
                            ) : (
                              tasks.map((task) => (
                                <TaskCard
                                  key={task.id}
                                  task={task}
                                  isError={isErrorCol}
                                  isExpanded={expandedTasks.has(task.id)}
                                  onToggleExpand={toggleExpand}
                                  onAcknowledge={handleAcknowledge}
                                />
                              ))
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
    </div>
  );
};

export default AgentBoard;
