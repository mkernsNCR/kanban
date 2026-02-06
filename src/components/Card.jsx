import React from 'react';
import { Calendar, ChevronDown, ChevronUp, GripVertical } from 'lucide-react';
import { COLORS, PRIORITY_STYLES } from '../utils/constants';
import { isOverdue, isDueSoon, formatDate, formatCreatedDate } from '../utils/dateUtils';

const Card = ({
  card,
  cardIndex,
  labelColors,
  isExpanded,
  isDragged,
  onToggleExpand,
  onClick,
  onDragStart,
  onDragEnd,
  onDragOver,
}) => {
  const pStyle = PRIORITY_STYLES[card.priority] || PRIORITY_STYLES.medium;

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, card.id)}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onClick={() => onClick(card)}
      className="kanban-card"
      style={{
        background: COLORS.light,
        border: `3px solid ${pStyle.border}`,
        boxShadow: pStyle.shadow,
        padding: '15px',
        cursor: 'grab',
        transition: 'transform 0.2s, box-shadow 0.2s, opacity 0.2s',
        position: 'relative',
        opacity: isDragged ? 0.4 : 1,
        animationDelay: `${cardIndex * 0.05}s`,
      }}
      onMouseEnter={(e) => {
        if (!isDragged) {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = pStyle.shadow.replace(
            /(\d+)px/,
            (_, n) => `${parseInt(n) + 4}px`,
          );
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = '';
        e.currentTarget.style.boxShadow = pStyle.shadow;
      }}
    >
      {/* Priority top bar */}
      <div
        style={{
          position: 'absolute',
          top: '-3px',
          left: '-3px',
          right: '-3px',
          height: '6px',
          background: pStyle.bg,
          borderTop: `3px solid ${pStyle.border}`,
        }}
      />

      {/* Header row */}
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1 min-w-0">
          <span
            className="block font-mono text-[11px] font-bold mb-1"
            style={{ color: COLORS.dark, opacity: 0.5 }}
          >
            {card.id}
          </span>
          <h3
            className="text-[15px] font-bold leading-tight m-0 truncate"
            style={{ color: COLORS.dark }}
          >
            {card.title}
          </h3>
        </div>
        <GripVertical
          size={14}
          className="flex-shrink-0 ml-2 mt-1"
          style={{ color: COLORS.dark, opacity: 0.3 }}
        />
      </div>

      {/* Description */}
      {card.description && (
        <div
          className="text-[13px] mb-3 leading-relaxed"
          style={{ color: COLORS.dark, opacity: 0.75 }}
        >
          {isExpanded || card.description.length <= 80
            ? card.description
            : card.description.substring(0, 80) + '…'}
          {card.description.length > 80 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleExpand(card.id);
              }}
              className="inline-flex items-center ml-1"
              style={{
                background: 'none',
                border: 'none',
                color: COLORS.primary,
                fontWeight: 600,
                cursor: 'pointer',
                padding: 0,
              }}
            >
              {isExpanded ? (
                <ChevronUp size={13} />
              ) : (
                <ChevronDown size={13} />
              )}
            </button>
          )}
        </div>
      )}

      {/* Labels */}
      {card.labels.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {card.labels.map((label) => (
            <span
              key={label}
              className="text-[10px] font-bold uppercase px-2 py-0.5"
              style={{
                background: labelColors[label] || COLORS.secondary,
                color: COLORS.light,
                border: `2px solid ${COLORS.dark}`,
              }}
            >
              {label}
            </span>
          ))}
        </div>
      )}

      {/* Footer: due date + created */}
      <div className="flex items-center justify-between gap-2 mt-1">
        {card.dueDate ? (
          <div
            className="flex items-center gap-1 text-[11px] font-semibold"
            style={{
              color: isOverdue(card.dueDate)
                ? COLORS.danger
                : isDueSoon(card.dueDate)
                  ? COLORS.warning
                  : COLORS.dark,
              opacity: isOverdue(card.dueDate) || isDueSoon(card.dueDate) ? 1 : 0.6,
            }}
          >
            <Calendar size={11} />
            {formatDate(card.dueDate)}
            {isOverdue(card.dueDate) && (
              <span className="font-black ml-1">OVERDUE</span>
            )}
            {isDueSoon(card.dueDate) && !isOverdue(card.dueDate) && (
              <span className="font-black ml-1">SOON</span>
            )}
          </div>
        ) : (
          <span />
        )}
        <span
          className="text-[10px] font-medium"
          style={{ color: COLORS.dark, opacity: 0.35 }}
        >
          {formatCreatedDate(card.createdAt)}
        </span>
      </div>
    </div>
  );
};

export default React.memo(Card);
