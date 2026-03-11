const deepFreeze = (obj) => {
  Object.freeze(obj);
  Object.values(obj).forEach((v) => {
    if (v && typeof v === 'object' && !Object.isFrozen(v)) deepFreeze(v);
  });
  return obj;
};

export const validBoard = deepFreeze({
  columns: [
    { id: 'backlog', title: 'BACKLOG', cardIds: ['TKT-001'] },
    { id: 'done', title: 'DONE', cardIds: [] },
  ],
  cards: {
    'TKT-001': {
      id: 'TKT-001',
      title: 'Test card',
      description: 'A valid card',
      priority: 'medium',
      labels: ['feature'],
      dueDate: null,
      createdAt: '2026-02-06T00:00:00.000Z',
    },
  },
  nextTicketNumber: 2,
  labelColors: { bug: '#D62828', feature: '#06A77D' },
});
