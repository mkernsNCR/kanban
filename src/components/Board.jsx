import React, { useState, useCallback, useMemo } from 'react';
import Header from './Header';
import Column from './Column';
import CardModal from './CardModal';
import { useBoardState } from '../hooks/useBoardState';
import { useDragAndDrop } from '../hooks/useDragAndDrop';

const Board = () => {
  const {
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
  } = useBoardState();

  const {
    draggedCardId,
    dragOverColumnId,
    dragOverIndex,
    handleDragStart,
    handleDragEnd,
    handleDragOverColumn,
    handleDragOverCard,
    handleDrop,
  } = useDragAndDrop(moveCard);

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriority, setSelectedPriority] = useState(null);
  const [selectedLabel, setSelectedLabel] = useState(null);

  // Modal state
  const [editingCard, setEditingCard] = useState(null);

  // Expanded card descriptions
  const [expandedCards, setExpandedCards] = useState(new Set());

  const toggleExpand = useCallback((cardId) => {
    setExpandedCards((prev) => {
      const next = new Set(prev);
      if (next.has(cardId)) next.delete(cardId);
      else next.add(cardId);
      return next;
    });
  }, []);

  // Filter logic
  const filterCard = useCallback(
    (card) => {
      if (!card) return false;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        card.title.toLowerCase().includes(q) ||
        card.description.toLowerCase().includes(q) ||
        card.labels.some((l) => l.toLowerCase().includes(q));

      const matchesPriority =
        !selectedPriority || card.priority === selectedPriority;
      const matchesLabel =
        !selectedLabel || card.labels.includes(selectedLabel);

      return matchesSearch && matchesPriority && matchesLabel;
    },
    [searchQuery, selectedPriority, selectedLabel],
  );

  // Build filtered card arrays per column (memoised)
  const filteredColumnCards = useMemo(() => {
    const map = {};
    boardState.columns.forEach((col) => {
      map[col.id] = col.cardIds
        .map((id) => boardState.cards[id])
        .filter(filterCard);
    });
    return map;
  }, [boardState.columns, boardState.cards, filterCard]);

  // Card click -> open modal
  const handleCardClick = useCallback((card) => {
    setEditingCard({ ...card });
  }, []);

  // Add card -> also open modal for immediate editing
  const handleAddCard = useCallback(
    (columnId) => {
      const getCard = addCard(columnId);
      // Small delay so state settles, then open modal
      setTimeout(() => {
        const card = getCard();
        if (card) setEditingCard({ ...card });
      }, 50);
    },
    [addCard],
  );

  return (
    <>
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedPriority={selectedPriority}
        onPriorityChange={setSelectedPriority}
        selectedLabel={selectedLabel}
        onLabelChange={setSelectedLabel}
        labelColors={boardState.labelColors}
        onExport={exportData}
        onImport={importData}
        onAddColumn={addColumn}
      />

      {/* Columns */}
      <div className="flex gap-5 overflow-x-auto pb-5" style={{ minHeight: '600px' }}>
        {boardState.columns.map((column, colIndex) => (
          <Column
            key={column.id}
            column={column}
            colIndex={colIndex}
            cards={filteredColumnCards[column.id] || []}
            labelColors={boardState.labelColors}
            expandedCards={expandedCards}
            draggedCardId={draggedCardId}
            dragOverColumnId={dragOverColumnId}
            onAddCard={handleAddCard}
            onCardClick={handleCardClick}
            onToggleExpand={toggleExpand}
            onRenameColumn={renameColumn}
            onDeleteColumn={deleteColumn}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragOverColumn={handleDragOverColumn}
            onDragOverCard={handleDragOverCard}
            onDrop={handleDrop}
          />
        ))}
      </div>

      {/* Edit Modal */}
      {editingCard && (
        <CardModal
          card={editingCard}
          labelColors={boardState.labelColors}
          onSave={updateCard}
          onDelete={deleteCard}
          onClose={() => setEditingCard(null)}
        />
      )}
    </>
  );
};

export default Board;
