export const COLORS = {
  primary: '#FF6B35',
  secondary: '#004643',
  accent: '#FAF0CA',
  danger: '#D62828',
  warning: '#F77F00',
  success: '#06A77D',
  dark: '#1A1A1A',
  light: '#FCFCFC',
};

export const PRIORITY_STYLES = {
  critical: {
    bg: '#D62828',
    text: '#FCFCFC',
    border: '#8B1A1A',
    shadow: '0 8px 0 #8B1A1A',
  },
  high: {
    bg: '#F77F00',
    text: '#1A1A1A',
    border: '#B85F00',
    shadow: '0 6px 0 #B85F00',
  },
  medium: {
    bg: '#FCBF49',
    text: '#1A1A1A',
    border: '#D4A017',
    shadow: '0 4px 0 #D4A017',
  },
  low: {
    bg: '#EAE2B7',
    text: '#1A1A1A',
    border: '#C4B576',
    shadow: '0 3px 0 #C4B576',
  },
};

export const DEFAULT_LABEL_COLORS = {
  bug: '#D62828',
  feature: '#06A77D',
  chore: '#F77F00',
  design: '#8338EC',
  urgent: '#FF006E',
  backend: '#004643',
  frontend: '#FF6B35',
  testing: '#7209B7',
};

export const DEFAULT_COLUMNS = [
  { id: 'backlog', title: 'BACKLOG', cardIds: [] },
  { id: 'todo', title: 'TO DO', cardIds: [] },
  { id: 'progress', title: 'IN PROGRESS', cardIds: [] },
  { id: 'review', title: 'IN REVIEW', cardIds: [] },
  { id: 'done', title: 'DONE', cardIds: [] },
];

export const STORAGE_KEY = 'kanban-board';
