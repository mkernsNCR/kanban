import { useState, useCallback } from 'react';

export const useDragAndDrop = (moveCard) => {
  const [draggedCardId, setDraggedCardId] = useState(null);
  const [dragOverColumnId, setDragOverColumnId] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  const handleDragStart = useCallback((e, cardId) => {
    setDraggedCardId(cardId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', cardId);

    // Make the drag image slightly transparent
    if (e.target) {
      requestAnimationFrame(() => {
        e.target.style.opacity = '0.4';
      });
    }
  }, []);

  const handleDragEnd = useCallback((e) => {
    setDraggedCardId(null);
    setDragOverColumnId(null);
    setDragOverIndex(null);
    if (e.target) {
      e.target.style.opacity = '1';
    }
  }, []);

  const handleDragOverColumn = useCallback((e, columnId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumnId(columnId);
  }, []);

  const handleDragOverCard = useCallback((e, columnId, cardIndex) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumnId(columnId);
    setDragOverIndex(cardIndex);
  }, []);

  const handleDrop = useCallback(
    (e, targetColumnId) => {
      e.preventDefault();
      if (!draggedCardId) return;
      moveCard(draggedCardId, targetColumnId, dragOverIndex ?? undefined);
      setDraggedCardId(null);
      setDragOverColumnId(null);
      setDragOverIndex(null);
    },
    [draggedCardId, dragOverIndex, moveCard],
  );

  return {
    draggedCardId,
    dragOverColumnId,
    dragOverIndex,
    handleDragStart,
    handleDragEnd,
    handleDragOverColumn,
    handleDragOverCard,
    handleDrop,
  };
};
