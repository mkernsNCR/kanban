import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useBoardState } from '../useBoardState';
import { STORAGE_KEY } from '../../utils/constants';
import { validBoard } from './fixtures';

describe('useBoardState', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  // --- Initialization & localStorage ------------------------------------

  describe('initialization', () => {
    it('loads seed data when localStorage is empty', () => {
      const { result } = renderHook(() => useBoardState());
      const { boardState } = result.current;
      expect(boardState.columns.length).toBeGreaterThan(0);
      expect(Object.keys(boardState.cards).length).toBeGreaterThan(0);
    });

    it('loads from localStorage when data exists', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(validBoard));
      const { result } = renderHook(() => useBoardState());
      expect(result.current.boardState.columns).toHaveLength(2);
      expect(result.current.boardState.cards['TKT-001'].title).toBe('Test card');
    });

    it('falls back to seed data when localStorage has invalid JSON', () => {
      localStorage.setItem(STORAGE_KEY, 'not-json!!!');
      const { result } = renderHook(() => useBoardState());
      expect(result.current.boardState.columns.length).toBeGreaterThan(0);
    });

    it('persists state changes to localStorage', () => {
      const { result } = renderHook(() => useBoardState());
      act(() => {
        result.current.addColumn('PERSIST TEST');
      });
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
      const col = stored.columns.find((c) => c.title === 'PERSIST TEST');
      expect(col).toBeDefined();
    });
  });

  // --- Card CRUD ---------------------------------------------------------

  describe('addCard', () => {
    it('adds a card to the specified column', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(validBoard));
      const { result } = renderHook(() => useBoardState());

      act(() => {
        result.current.addCard('backlog');
      });

      const backlog = result.current.boardState.columns.find((c) => c.id === 'backlog');
      expect(backlog.cardIds).toHaveLength(2);
    });

    it('increments nextTicketNumber', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(validBoard));
      const { result } = renderHook(() => useBoardState());

      act(() => {
        result.current.addCard('backlog');
      });

      expect(result.current.boardState.nextTicketNumber).toBe(3);
    });

    it('returns a getter that provides the new card', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(validBoard));
      const { result } = renderHook(() => useBoardState());

      let getter;
      act(() => {
        getter = result.current.addCard('backlog');
      });

      const card = getter();
      expect(card).not.toBeNull();
      expect(card.id).toBe('TKT-002');
      expect(card.title).toBe('New Ticket');
    });

    it('creates the card with correct default fields', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(validBoard));
      const { result } = renderHook(() => useBoardState());

      let getter;
      act(() => {
        getter = result.current.addCard('done');
      });

      const card = getter();
      expect(card.description).toBe('');
      expect(card.priority).toBe('medium');
      expect(card.labels).toEqual([]);
      expect(card.dueDate).toBeNull();
      expect(card.createdAt).toBeDefined();
    });
  });

  describe('updateCard', () => {
    it('updates fields on an existing card', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(validBoard));
      const { result } = renderHook(() => useBoardState());

      act(() => {
        result.current.updateCard('TKT-001', { title: 'Updated Title', priority: 'critical' });
      });

      const card = result.current.boardState.cards['TKT-001'];
      expect(card.title).toBe('Updated Title');
      expect(card.priority).toBe('critical');
      expect(card.description).toBe('A valid card');
    });
  });

  describe('deleteCard', () => {
    it('removes the card from cards and from its column', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(validBoard));
      const { result } = renderHook(() => useBoardState());

      act(() => {
        result.current.deleteCard('TKT-001');
      });

      expect(result.current.boardState.cards['TKT-001']).toBeUndefined();
      const backlog = result.current.boardState.columns.find((c) => c.id === 'backlog');
      expect(backlog.cardIds).not.toContain('TKT-001');
    });
  });

  // --- Column operations -------------------------------------------------

  describe('addColumn', () => {
    it('adds a new column with the given title', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(validBoard));
      const { result } = renderHook(() => useBoardState());

      act(() => {
        result.current.addColumn('IN PROGRESS');
      });

      const cols = result.current.boardState.columns;
      expect(cols).toHaveLength(3);
      expect(cols[2].title).toBe('IN PROGRESS');
      expect(cols[2].cardIds).toEqual([]);
    });

    it('defaults to NEW COLUMN when no title is given', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(validBoard));
      const { result } = renderHook(() => useBoardState());

      act(() => {
        result.current.addColumn('');
      });

      const cols = result.current.boardState.columns;
      expect(cols[cols.length - 1].title).toBe('NEW COLUMN');
    });
  });

  describe('renameColumn', () => {
    it('renames an existing column', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(validBoard));
      const { result } = renderHook(() => useBoardState());

      act(() => {
        result.current.renameColumn('backlog', 'ICEBOX');
      });

      const col = result.current.boardState.columns.find((c) => c.id === 'backlog');
      expect(col.title).toBe('ICEBOX');
    });
  });

  describe('deleteColumn', () => {
    it('removes the column and its cards', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(validBoard));
      const { result } = renderHook(() => useBoardState());

      act(() => {
        result.current.deleteColumn('backlog');
      });

      expect(result.current.boardState.columns.find((c) => c.id === 'backlog')).toBeUndefined();
      expect(result.current.boardState.cards['TKT-001']).toBeUndefined();
    });

    it('does nothing when column id does not exist', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(validBoard));
      const { result } = renderHook(() => useBoardState());

      act(() => {
        result.current.deleteColumn('nonexistent');
      });

      expect(result.current.boardState.columns).toHaveLength(2);
    });
  });

  // --- moveCard ----------------------------------------------------------

  describe('moveCard', () => {
    it('moves a card from one column to another', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(validBoard));
      const { result } = renderHook(() => useBoardState());

      act(() => {
        result.current.moveCard('TKT-001', 'done');
      });

      const backlog = result.current.boardState.columns.find((c) => c.id === 'backlog');
      const done = result.current.boardState.columns.find((c) => c.id === 'done');
      expect(backlog.cardIds).not.toContain('TKT-001');
      expect(done.cardIds).toContain('TKT-001');
    });

    it('inserts at a specific index when provided', () => {
      const board = {
        ...validBoard,
        columns: [
          { id: 'backlog', title: 'BACKLOG', cardIds: ['TKT-001'] },
          { id: 'done', title: 'DONE', cardIds: ['TKT-002', 'TKT-003'] },
        ],
        cards: {
          ...validBoard.cards,
          'TKT-002': { id: 'TKT-002', title: 'Card 2' },
          'TKT-003': { id: 'TKT-003', title: 'Card 3' },
        },
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(board));
      const { result } = renderHook(() => useBoardState());

      act(() => {
        result.current.moveCard('TKT-001', 'done', 1);
      });

      const done = result.current.boardState.columns.find((c) => c.id === 'done');
      expect(done.cardIds).toEqual(['TKT-002', 'TKT-001', 'TKT-003']);
    });

    it('appends to end when no index is provided', () => {
      const board = {
        ...validBoard,
        columns: [
          { id: 'backlog', title: 'BACKLOG', cardIds: ['TKT-001'] },
          { id: 'done', title: 'DONE', cardIds: ['TKT-002'] },
        ],
        cards: {
          ...validBoard.cards,
          'TKT-002': { id: 'TKT-002', title: 'Card 2' },
        },
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(board));
      const { result } = renderHook(() => useBoardState());

      act(() => {
        result.current.moveCard('TKT-001', 'done');
      });

      const done = result.current.boardState.columns.find((c) => c.id === 'done');
      expect(done.cardIds).toEqual(['TKT-002', 'TKT-001']);
    });
  });

  // --- importData --------------------------------------------------------

  describe('importData', () => {
    it('returns true and replaces state for valid JSON', () => {
      const { result } = renderHook(() => useBoardState());

      let importResult;
      act(() => {
        importResult = result.current.importData(JSON.stringify(validBoard));
      });

      expect(importResult).toBe(true);
      expect(result.current.boardState.columns).toHaveLength(2);
      expect(result.current.boardState.cards['TKT-001'].title).toBe('Test card');
    });

    it('returns an error string for invalid JSON', () => {
      const { result } = renderHook(() => useBoardState());

      let importResult;
      act(() => {
        importResult = result.current.importData('{not json}');
      });

      expect(importResult).toBe('The selected file is not valid JSON.');
    });

    it('returns a validation error for valid JSON with bad shape', () => {
      const { result } = renderHook(() => useBoardState());

      let importResult;
      act(() => {
        importResult = result.current.importData(JSON.stringify({ foo: 'bar' }));
      });

      expect(typeof importResult).toBe('string');
      expect(importResult).toContain('columns');
    });
  });

  // --- exportData --------------------------------------------------------

  describe('exportData', () => {
    it('creates a download link and clicks it', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(validBoard));
      const { result } = renderHook(() => useBoardState());

      const clickSpy = vi.fn();
      const setAttributeSpy = vi.fn();
      const originalCreateElement = document.createElement.bind(document);
      const createElementSpy = vi.spyOn(document, 'createElement').mockImplementation((tag, ...args) =>
        tag === 'a'
          ? { setAttribute: setAttributeSpy, click: clickSpy }
          : originalCreateElement(tag, ...args),
      );

      act(() => {
        result.current.exportData();
      });

      expect(createElementSpy).toHaveBeenCalledWith('a');

      // Verify href was set to a data URI containing the board JSON
      const hrefCall = setAttributeSpy.mock.calls.find((c) => c[0] === 'href');
      expect(hrefCall).toBeDefined();
      const decodedUri = decodeURIComponent(hrefCall[1]);
      expect(decodedUri).toContain('data:application/json');
      expect(decodedUri).toContain(JSON.stringify(validBoard, null, 2));

      // Verify download filename
      const downloadCall = setAttributeSpy.mock.calls.find((c) => c[0] === 'download');
      expect(downloadCall).toBeDefined();
      expect(downloadCall[1]).toBe('kanban-board.json');

      expect(clickSpy).toHaveBeenCalled();
      createElementSpy.mockRestore();
    });
  });
});
