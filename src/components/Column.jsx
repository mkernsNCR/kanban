import React, { useState } from 'react';
import { Trash2, Edit3, Check, X } from 'lucide-react';
import { COLORS } from '../utils/constants';
import Card from './Card';
import Dialog from './Dialog';

const Column = ({
  column,
  colIndex,
  cards,
  labelColors,
  expandedCards,
  draggedCardId,
  dragOverColumnId,
  onAddCard,
  onCardClick,
  onToggleExpand,
  onRenameColumn,
  onDeleteColumn,
  onDragStart,
  onDragEnd,
  onDragOverColumn,
  onDragOverCard,
  onDrop,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(column.title);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const isDropTarget = dragOverColumnId === column.id && draggedCardId;

  const handleRename = () => {
    if (editTitle.trim()) {
      onRenameColumn(column.id, editTitle.trim().toUpperCase());
    }
    setIsEditing(false);
  };

  return (
    <div
      onDragOver={(e) => onDragOverColumn(e, column.id)}
      onDrop={(e) => onDrop(e, column.id)}
      className="kanban-column"
      style={{
        flex: '0 0 320px',
        background: colIndex % 2 === 0 ? '#2D2D2D' : '#242424',
        border: `4px solid ${COLORS.dark}`,
        boxShadow: isDropTarget
          ? `6px 6px 0 ${COLORS.dark}, inset 0 0 0 3px ${COLORS.primary}`
          : `6px 6px 0 ${COLORS.dark}`,
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        maxHeight: '80vh',
        transition: 'box-shadow 0.15s',
        animationDelay: `${colIndex * 0.1}s`,
      }}
    >
      {/* Column Header */}
      <div
        className="flex justify-between items-center mb-5 pb-4"
        style={{ borderBottom: `3px solid ${COLORS.dark}` }}
      >
        {isEditing ? (
          <div className="flex items-center gap-2 flex-1">
            <input
              autoFocus
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRename();
                if (e.key === 'Escape') setIsEditing(false);
              }}
              className="flex-1 px-2 py-1 text-sm font-black uppercase"
              style={{
                background: COLORS.light,
                border: `2px solid ${COLORS.dark}`,
                outline: 'none',
                color: COLORS.dark,
              }}
            />
            <button
              onClick={handleRename}
              className="p-1 cursor-pointer"
              style={{ background: COLORS.success, border: `2px solid ${COLORS.dark}`, color: COLORS.light }}
              aria-label="Confirm rename"
            >
              <Check size={14} />
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="p-1 cursor-pointer"
              style={{ background: COLORS.danger, border: `2px solid ${COLORS.dark}`, color: COLORS.light }}
              aria-label="Cancel rename"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <h2
            className="text-lg font-black tracking-wide m-0 cursor-pointer"
            style={{ color: COLORS.light }}
            onDoubleClick={() => {
              setEditTitle(column.title);
              setIsEditing(true);
            }}
            title="Double-click to rename"
          >
            {column.title}
          </h2>
        )}

        <div className="flex items-center gap-2 ml-2">
          <span
            className="text-sm font-black px-2.5 py-0.5"
            style={{
              background: COLORS.primary,
              color: COLORS.light,
              border: `2px solid ${COLORS.dark}`,
            }}
          >
            {cards.length}
          </span>

          <button
            onClick={() => {
              setEditTitle(column.title);
              setIsEditing(true);
            }}
            className="w-7 h-7 flex items-center justify-center cursor-pointer"
            style={{
              border: `2px solid ${COLORS.dark}`,
              background: '#3A3A3A',
              color: COLORS.light,
            }}
            aria-label={`Rename ${column.title}`}
          >
            <Edit3 size={12} />
          </button>

          <button
            onClick={() => setShowDeleteDialog(true)}
            className="w-7 h-7 flex items-center justify-center cursor-pointer"
            style={{
              border: `2px solid ${COLORS.dark}`,
              background: '#3A3A3A',
              color: COLORS.danger,
            }}
            aria-label={`Delete ${column.title}`}
          >
            <Trash2 size={12} />
          </button>

          <button
            onClick={() => onAddCard(column.id)}
            className="w-8 h-8 flex items-center justify-center cursor-pointer text-xl font-black"
            style={{
              border: `3px solid ${COLORS.dark}`,
              background: COLORS.primary,
              color: COLORS.light,
              boxShadow: `3px 3px 0 ${COLORS.dark}`,
            }}
            aria-label={`Add card to ${column.title}`}
          >
            +
          </button>
        </div>
      </div>

      {/* Cards list */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-4 pr-1">
        {cards.map((card, cardIndex) => (
          <Card
            key={card.id}
            card={card}
            cardIndex={cardIndex}
            labelColors={labelColors}
            isExpanded={expandedCards.has(card.id)}
            isDragged={draggedCardId === card.id}
            onToggleExpand={onToggleExpand}
            onClick={onCardClick}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onDragOver={(e) => onDragOverCard(e, column.id, cardIndex)}
          />
        ))}

        {/* Empty drop zone */}
        {cards.length === 0 && (
          <div
            className="flex items-center justify-center text-sm font-bold py-10 opacity-40"
            style={{
              border: `3px dashed ${COLORS.light}30`,
              color: COLORS.light,
            }}
          >
            Drop here
          </div>
        )}
      </div>

      {showDeleteDialog && (
        <Dialog
          title="Delete Column"
          message={`Delete "${column.title}" and all its cards? This cannot be undone.`}
          confirmLabel="DELETE"
          variant="danger"
          onConfirm={() => {
            setShowDeleteDialog(false);
            onDeleteColumn(column.id);
          }}
          onCancel={() => setShowDeleteDialog(false)}
        />
      )}
    </div>
  );
};

export default React.memo(Column);
