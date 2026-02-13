import { useState, useEffect, useCallback, useRef } from 'react';
import { DEFAULT_COLUMNS, DEFAULT_LABEL_COLORS, STORAGE_KEY } from '../utils/constants';
import { SEED_DATA } from '../utils/seedData';

export const validateBoardData = (data) => {
  if (!data || typeof data !== 'object') return 'Import is not a valid object.';

  if (!Array.isArray(data.columns)) return 'Missing or invalid "columns" array.';
  for (const col of data.columns) {
    if (!col || typeof col !== 'object') return 'Each column must be an object.';
    if (typeof col.id !== 'string' || !col.id) return `Column is missing a valid "id".`;
    if (typeof col.title !== 'string') return `Column "${col.id}" is missing a "title".`;
    if (!Array.isArray(col.cardIds)) return `Column "${col.id}" is missing a "cardIds" array.`;
  }

  if (!data.cards || typeof data.cards !== 'object' || Array.isArray(data.cards))
    return 'Missing or invalid "cards" object.';
  for (const [id, card] of Object.entries(data.cards)) {
    if (!card || typeof card !== 'object') return `Card "${id}" is not a valid object.`;
    if (typeof card.id !== 'string') return `Card "${id}" is missing an "id".`;
    if (typeof card.title !== 'string') return `Card "${id}" is missing a "title".`;
  }

  if (typeof data.nextTicketNumber !== 'number' || data.nextTicketNumber < 1)
    return 'Missing or invalid "nextTicketNumber" (must be a positive number).';

  if (!data.labelColors || typeof data.labelColors !== 'object' || Array.isArray(data.labelColors))
    return 'Missing or invalid "labelColors" object.';

  return null;
};

const createInitialState = () => ({
  columns: DEFAULT_COLUMNS,
  cards: {},
  nextTicketNumber: 1,
  labelColors: DEFAULT_LABEL_COLORS,
});

export const useBoardState = () => {
  const [boardState, setBoardState] = useState(createInitialState);
  const initialLoadDone = useRef(false);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setBoardState(JSON.parse(saved));
      } catch {
        setBoardState((prev) => ({ ...prev, ...SEED_DATA }));
      }
    } else {
      setBoardState((prev) => ({ ...prev, ...SEED_DATA }));
    }
    initialLoadDone.current = true;
  }, []);

  // Persist to localStorage on every change (skip the very first default render)
  useEffect(() => {
    if (initialLoadDone.current) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(boardState));
    }
  }, [boardState]);

  // --- Card CRUD -----------------------------------------------------------

  const addCard = useCallback((columnId) => {
    let newCard = null;

    setBoardState((prev) => {
      const id = `TKT-${String(prev.nextTicketNumber).padStart(3, '0')}`;
      newCard = {
        id,
        title: 'New Ticket',
        description: '',
        priority: 'medium',
        labels: [],
        dueDate: null,
        createdAt: new Date().toISOString(),
      };

      return {
        ...prev,
        nextTicketNumber: prev.nextTicketNumber + 1,
        cards: { ...prev.cards, [newCard.id]: newCard },
        columns: prev.columns.map((col) =>
          col.id === columnId
            ? { ...col, cardIds: [...col.cardIds, newCard.id] }
            : col,
        ),
      };
    });

    // Return a getter so callers can access the card after state settles
    return () => newCard;
  }, []);

  const updateCard = useCallback((cardId, updates) => {
    setBoardState((prev) => ({
      ...prev,
      cards: {
        ...prev.cards,
        [cardId]: { ...prev.cards[cardId], ...updates },
      },
    }));
  }, []);

  const deleteCard = useCallback((cardId) => {
    setBoardState((prev) => {
      const newCards = { ...prev.cards };
      delete newCards[cardId];

      return {
        ...prev,
        cards: newCards,
        columns: prev.columns.map((col) => ({
          ...col,
          cardIds: col.cardIds.filter((id) => id !== cardId),
        })),
      };
    });
  }, []);

  // --- Column operations ----------------------------------------------------

  const addColumn = useCallback((title) => {
    setBoardState((prev) => ({
      ...prev,
      columns: [
        ...prev.columns,
        {
          id: `col-${Date.now()}`,
          title: title || 'NEW COLUMN',
          cardIds: [],
        },
      ],
    }));
  }, []);

  const renameColumn = useCallback((columnId, newTitle) => {
    setBoardState((prev) => ({
      ...prev,
      columns: prev.columns.map((col) =>
        col.id === columnId ? { ...col, title: newTitle } : col,
      ),
    }));
  }, []);

  const deleteColumn = useCallback((columnId) => {
    setBoardState((prev) => {
      const column = prev.columns.find((c) => c.id === columnId);
      if (!column) return prev;

      const newCards = { ...prev.cards };
      column.cardIds.forEach((id) => delete newCards[id]);

      return {
        ...prev,
        cards: newCards,
        columns: prev.columns.filter((c) => c.id !== columnId),
      };
    });
  }, []);

  // --- Drag & Drop ----------------------------------------------------------

  const moveCard = useCallback((cardId, targetColumnId, targetIndex) => {
    setBoardState((prev) => {
      // Remove card from its current column
      let newColumns = prev.columns.map((col) => {
        if (col.cardIds.includes(cardId)) {
          return { ...col, cardIds: col.cardIds.filter((id) => id !== cardId) };
        }
        return col;
      });

      // Insert card into target column at the specified index
      newColumns = newColumns.map((col) => {
        if (col.id === targetColumnId) {
          const newCardIds = [...col.cardIds];
          const insertAt = targetIndex !== undefined ? targetIndex : newCardIds.length;
          newCardIds.splice(insertAt, 0, cardId);
          return { ...col, cardIds: newCardIds };
        }
        return col;
      });

      return { ...prev, columns: newColumns };
    });
  }, []);

  // --- Import / Export ------------------------------------------------------

  const exportData = useCallback(() => {
    const dataStr = JSON.stringify(boardState, null, 2);
    const dataUri =
      'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const link = document.createElement('a');
    link.setAttribute('href', dataUri);
    link.setAttribute('download', 'kanban-board.json');
    link.click();
  }, [boardState]);

  const importData = useCallback((jsonString) => {
    let imported;
    try {
      imported = JSON.parse(jsonString);
    } catch {
      return 'The selected file is not valid JSON.';
    }

    const error = validateBoardData(imported);
    if (error) return error;

    setBoardState(imported);
    return true;
  }, []);

  return {
    boardState,
    addCard,
    updateCard,
    deleteCard,
    addColumn,
    renameColumn,
    deleteColumn,
    moveCard,
    exportData,
    importData,
  };
};
