import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Trash2, Calendar } from 'lucide-react';
import { COLORS, PRIORITY_STYLES } from '../utils/constants';
import { formatCreatedDate } from '../utils/dateUtils';
import Dialog from './Dialog';

const CardModal = ({ card, labelColors, onSave, onDelete, onClose }) => {
  const [form, setForm] = useState({ ...card });
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const titleRef = useRef(null);

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  // Close on Escape (only when no nested dialog is open)
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape' && !showDeleteDialog) onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, showDeleteDialog]);

  const handleSave = () => {
    if (!form.title.trim()) return;
    onSave(form.id, form);
    onClose();
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const toggleLabel = (label) => {
    setForm((prev) => ({
      ...prev,
      labels: prev.labels.includes(label)
        ? prev.labels.filter((l) => l !== label)
        : [...prev.labels, label],
    }));
  };

  return createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center z-[1000] p-5"
      style={{ background: 'rgba(0, 0, 0, 0.8)' }}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label={`Edit ticket ${card.id}`}
    >
      <div
        className="kanban-modal w-full max-w-[600px] max-h-[90vh] overflow-y-auto"
        style={{
          background: COLORS.light,
          border: `5px solid ${COLORS.dark}`,
          boxShadow: `10px 10px 0 ${COLORS.dark}`,
          padding: '30px',
        }}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <span
              className="block font-mono text-xs font-bold mb-1"
              style={{ color: COLORS.dark, opacity: 0.5 }}
            >
              {card.id} · created {formatCreatedDate(card.createdAt)}
            </span>
            <h2
              className="text-2xl font-black m-0"
              style={{ color: COLORS.dark }}
            >
              Edit Ticket
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center text-2xl font-black cursor-pointer"
            style={{
              border: `3px solid ${COLORS.dark}`,
              background: COLORS.danger,
              color: COLORS.light,
            }}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        <div className="flex flex-col gap-5">
          {/* Title */}
          <div>
            <label
              className="block text-xs font-black mb-2 uppercase tracking-wider"
              style={{ color: COLORS.dark }}
            >
              Title
            </label>
            <input
              ref={titleRef}
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave();
              }}
              className="w-full p-3 text-base font-semibold"
              style={{
                border: `3px solid ${COLORS.dark}`,
                background: COLORS.light,
                outline: 'none',
              }}
            />
          </div>

          {/* Description */}
          <div>
            <label
              className="block text-xs font-black mb-2 uppercase tracking-wider"
              style={{ color: COLORS.dark }}
            >
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              rows={4}
              className="w-full p-3 text-sm font-medium resize-y"
              style={{
                border: `3px solid ${COLORS.dark}`,
                background: COLORS.light,
                outline: 'none',
              }}
            />
          </div>

          {/* Priority */}
          <div>
            <label
              className="block text-xs font-black mb-2 uppercase tracking-wider"
              style={{ color: COLORS.dark }}
            >
              Priority
            </label>
            <div className="flex gap-2.5">
              {Object.keys(PRIORITY_STYLES).map((p) => {
                const ps = PRIORITY_STYLES[p];
                const active = form.priority === p;
                return (
                  <button
                    key={p}
                    onClick={() => setForm({ ...form, priority: p })}
                    className="flex-1 py-2.5 text-[13px] font-black uppercase cursor-pointer transition-transform"
                    style={{
                      border: `3px solid ${COLORS.dark}`,
                      background: active ? ps.bg : COLORS.light,
                      color: active ? ps.text : COLORS.dark,
                      boxShadow: active ? ps.shadow : `3px 3px 0 ${COLORS.dark}`,
                      transform: active ? 'translateY(-2px)' : 'none',
                    }}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Labels */}
          <div>
            <label
              className="block text-xs font-black mb-2 uppercase tracking-wider"
              style={{ color: COLORS.dark }}
            >
              Labels
            </label>
            <div className="flex flex-wrap gap-2">
              {Object.keys(labelColors).map((label) => {
                const active = form.labels.includes(label);
                return (
                  <button
                    key={label}
                    onClick={() => toggleLabel(label)}
                    className="px-3 py-1.5 text-[11px] font-bold uppercase cursor-pointer transition-transform"
                    style={{
                      border: `2px solid ${COLORS.dark}`,
                      background: active ? labelColors[label] : COLORS.light,
                      color: active ? COLORS.light : COLORS.dark,
                      transform: active ? 'translateY(-1px)' : 'none',
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label
              className="block text-xs font-black mb-2 uppercase tracking-wider"
              style={{ color: COLORS.dark }}
            >
              Due Date
            </label>
            <div className="flex gap-2">
              <input
                type="date"
                value={form.dueDate || ''}
                onChange={(e) =>
                  setForm({ ...form, dueDate: e.target.value || null })
                }
                className="flex-1 p-3 text-base font-semibold"
                style={{
                  border: `3px solid ${COLORS.dark}`,
                  background: COLORS.light,
                  outline: 'none',
                }}
              />
              {form.dueDate && (
                <button
                  onClick={() => setForm({ ...form, dueDate: null })}
                  className="px-4 font-bold text-sm cursor-pointer"
                  style={{
                    border: `3px solid ${COLORS.dark}`,
                    background: '#3A3A3A',
                    color: COLORS.light,
                  }}
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 mt-2">
            <button
              onClick={handleSave}
              className="flex-1 py-4 text-base font-black cursor-pointer"
              style={{
                border: `3px solid ${COLORS.dark}`,
                background: COLORS.success,
                color: COLORS.light,
                boxShadow: `4px 4px 0 ${COLORS.dark}`,
              }}
            >
              SAVE CHANGES
            </button>
            <button
              onClick={() => setShowDeleteDialog(true)}
              className="flex items-center gap-2 px-5 py-4 text-base font-black cursor-pointer"
              style={{
                border: `3px solid ${COLORS.dark}`,
                background: COLORS.danger,
                color: COLORS.light,
                boxShadow: `4px 4px 0 ${COLORS.dark}`,
              }}
            >
              <Trash2 size={18} />
              DELETE
            </button>
          </div>
        </div>
      </div>
      {showDeleteDialog && (
        <Dialog
          title="Delete Ticket"
          message={`Permanently delete ${card.id} — "${card.title}"?`}
          confirmLabel="DELETE"
          variant="danger"
          onConfirm={() => {
            setShowDeleteDialog(false);
            onDelete(card.id);
            onClose();
          }}
          onCancel={() => setShowDeleteDialog(false)}
        />
      )}
    </div>,
    document.body,
  );
};

export default CardModal;
