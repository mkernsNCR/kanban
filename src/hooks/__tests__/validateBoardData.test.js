import { describe, it, expect } from 'vitest';
import { validateBoardData } from '../useBoardState';
import { validBoard } from './fixtures';

describe('validateBoardData', () => {
  it('returns null for a valid board', () => {
    expect(validateBoardData(validBoard)).toBeNull();
  });

  it('returns null for a valid board with empty columns and cards', () => {
    expect(
      validateBoardData({
        columns: [],
        cards: {},
        nextTicketNumber: 1,
        labelColors: {},
      }),
    ).toBeNull();
  });

  // --- Top-level shape ---

  it('rejects null', () => {
    expect(validateBoardData(null)).toBe('Import is not a valid object.');
  });

  it('rejects undefined', () => {
    expect(validateBoardData(undefined)).toBe('Import is not a valid object.');
  });

  it('rejects a string', () => {
    expect(validateBoardData('hello')).toBe('Import is not a valid object.');
  });

  it('rejects a number', () => {
    expect(validateBoardData(42)).toBe('Import is not a valid object.');
  });

  // --- columns ---

  it('rejects missing columns', () => {
    const data = { ...validBoard };
    delete data.columns;
    expect(validateBoardData(data)).toBe('Missing or invalid "columns" array.');
  });

  it('rejects columns as a string', () => {
    expect(validateBoardData({ ...validBoard, columns: 'nope' })).toBe(
      'Missing or invalid "columns" array.',
    );
  });

  it('rejects a column that is null', () => {
    expect(
      validateBoardData({ ...validBoard, columns: [null] }),
    ).toBe('Each column must be an object.');
  });

  it('rejects a column with missing id', () => {
    expect(
      validateBoardData({
        ...validBoard,
        columns: [{ title: 'NO ID', cardIds: [] }],
      }),
    ).toBe('Column is missing a valid "id".');
  });

  it('rejects a column with empty string id', () => {
    expect(
      validateBoardData({
        ...validBoard,
        columns: [{ id: '', title: 'EMPTY', cardIds: [] }],
      }),
    ).toBe('Column is missing a valid "id".');
  });

  it('rejects a column with missing title', () => {
    expect(
      validateBoardData({
        ...validBoard,
        columns: [{ id: 'col-1', cardIds: [] }],
      }),
    ).toBe('Column "col-1" is missing a "title".');
  });

  it('rejects a column with non-string title', () => {
    expect(
      validateBoardData({
        ...validBoard,
        columns: [{ id: 'col-1', title: 123, cardIds: [] }],
      }),
    ).toBe('Column "col-1" is missing a "title".');
  });

  it('rejects a column with missing cardIds', () => {
    expect(
      validateBoardData({
        ...validBoard,
        columns: [{ id: 'col-1', title: 'COL' }],
      }),
    ).toBe('Column "col-1" is missing a "cardIds" array.');
  });

  // --- cards ---

  it('rejects missing cards', () => {
    const data = { ...validBoard };
    delete data.cards;
    expect(validateBoardData(data)).toBe('Missing or invalid "cards" object.');
  });

  it('rejects cards as an array', () => {
    expect(validateBoardData({ ...validBoard, cards: [] })).toBe(
      'Missing or invalid "cards" object.',
    );
  });

  it('rejects a card that is not an object', () => {
    expect(
      validateBoardData({ ...validBoard, cards: { 'TKT-001': 'bad' } }),
    ).toBe('Card "TKT-001" is not a valid object.');
  });

  it('rejects a card with missing id', () => {
    expect(
      validateBoardData({
        ...validBoard,
        cards: { 'TKT-001': { title: 'No ID' } },
      }),
    ).toBe('Card "TKT-001" is missing an "id".');
  });

  it('rejects a card with missing title', () => {
    expect(
      validateBoardData({
        ...validBoard,
        cards: { 'TKT-001': { id: 'TKT-001' } },
      }),
    ).toBe('Card "TKT-001" is missing a "title".');
  });

  // --- nextTicketNumber ---

  it('rejects missing nextTicketNumber', () => {
    const data = { ...validBoard };
    delete data.nextTicketNumber;
    expect(validateBoardData(data)).toBe(
      'Missing or invalid "nextTicketNumber" (must be a positive number).',
    );
  });

  it('rejects nextTicketNumber of 0', () => {
    expect(
      validateBoardData({ ...validBoard, nextTicketNumber: 0 }),
    ).toBe('Missing or invalid "nextTicketNumber" (must be a positive number).');
  });

  it('rejects nextTicketNumber as a string', () => {
    expect(
      validateBoardData({ ...validBoard, nextTicketNumber: '5' }),
    ).toBe('Missing or invalid "nextTicketNumber" (must be a positive number).');
  });

  it('rejects negative nextTicketNumber', () => {
    expect(
      validateBoardData({ ...validBoard, nextTicketNumber: -1 }),
    ).toBe('Missing or invalid "nextTicketNumber" (must be a positive number).');
  });

  it('rejects NaN nextTicketNumber', () => {
    expect(
      validateBoardData({ ...validBoard, nextTicketNumber: NaN }),
    ).toBe('Missing or invalid "nextTicketNumber" (must be a positive number).');
  });

  it('rejects Infinity nextTicketNumber', () => {
    expect(
      validateBoardData({ ...validBoard, nextTicketNumber: Infinity }),
    ).toBe('Missing or invalid "nextTicketNumber" (must be a positive number).');
  });

  // --- labelColors ---

  it('rejects missing labelColors', () => {
    const data = { ...validBoard };
    delete data.labelColors;
    expect(validateBoardData(data)).toBe(
      'Missing or invalid "labelColors" object.',
    );
  });

  it('rejects labelColors as an array', () => {
    expect(
      validateBoardData({ ...validBoard, labelColors: ['red'] }),
    ).toBe('Missing or invalid "labelColors" object.');
  });

  it('rejects labelColors as null', () => {
    expect(
      validateBoardData({ ...validBoard, labelColors: null }),
    ).toBe('Missing or invalid "labelColors" object.');
  });
});
