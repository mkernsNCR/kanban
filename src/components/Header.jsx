import React, { useRef, useState } from 'react';
import { Search, Download, Upload, Plus } from 'lucide-react';
import { COLORS, PRIORITY_STYLES } from '../utils/constants';
import Dialog from './Dialog';

const Header = ({
  searchQuery,
  onSearchChange,
  selectedPriority,
  onPriorityChange,
  selectedLabel,
  onLabelChange,
  labelColors,
  onExport,
  onImport,
  onAddColumn,
}) => {
  const fileInputRef = useRef(null);
  const [showAddColumn, setShowAddColumn] = useState(false);
  const [showImportError, setShowImportError] = useState(false);

  const handleFileImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const success = onImport(event.target.result);
      if (!success) setShowImportError(true);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div
      style={{
        background: COLORS.primary,
        border: `4px solid ${COLORS.dark}`,
        boxShadow: `8px 8px 0 ${COLORS.dark}`,
        transform: 'rotate(-0.5deg)',
      }}
      className="p-5 mb-8"
    >
      {/* Top row: title + actions */}
      <div className="flex justify-between items-center flex-wrap gap-5">
        <h1
          className="text-4xl md:text-5xl font-black m-0 tracking-tighter"
          style={{
            color: COLORS.light,
            textShadow: `3px 3px 0 ${COLORS.dark}`,
          }}
        >
          KANBAN BOARD
        </h1>

        <div className="flex gap-3 items-center flex-wrap">
          {/* Search */}
          <div
            className="relative"
            style={{
              background: COLORS.light,
              border: `3px solid ${COLORS.dark}`,
              boxShadow: `4px 4px 0 ${COLORS.dark}`,
            }}
          >
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: COLORS.dark }}
            />
            <input
              type="text"
              placeholder="Search tickets…"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 pr-4 py-2.5 text-sm font-semibold w-52 md:w-64"
              style={{
                border: 'none',
                background: 'transparent',
                outline: 'none',
                color: COLORS.dark,
              }}
              aria-label="Search tickets"
            />
          </div>

          {/* Import / Export */}
          <div className="flex gap-2">
            <button
              onClick={onExport}
              className="p-2.5 cursor-pointer flex items-center"
              style={{
                border: `3px solid ${COLORS.dark}`,
                background: COLORS.accent,
                boxShadow: `4px 4px 0 ${COLORS.dark}`,
              }}
              aria-label="Export board as JSON"
              title="Export JSON"
            >
              <Download size={16} />
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2.5 cursor-pointer flex items-center"
              style={{
                border: `3px solid ${COLORS.dark}`,
                background: COLORS.accent,
                boxShadow: `4px 4px 0 ${COLORS.dark}`,
              }}
              aria-label="Import board from JSON"
              title="Import JSON"
            >
              <Upload size={16} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileImport}
              className="hidden"
            />
            <button
              onClick={() => setShowAddColumn(true)}
              className="p-2.5 cursor-pointer flex items-center gap-1 text-xs font-bold"
              style={{
                border: `3px solid ${COLORS.dark}`,
                background: COLORS.accent,
                boxShadow: `4px 4px 0 ${COLORS.dark}`,
                color: COLORS.dark,
              }}
              aria-label="Add new column"
              title="Add column"
            >
              <Plus size={16} /> COL
            </button>
          </div>
        </div>
      </div>

      {/* Filter row */}
      <div className="flex items-center gap-3 mt-4 flex-wrap">
        <span
          className="text-[11px] font-black uppercase tracking-wider"
          style={{ color: COLORS.light, opacity: 0.7 }}
        >
          Filter:
        </span>

        {/* Priority filters */}
        {Object.keys(PRIORITY_STYLES).map((priority) => {
          const ps = PRIORITY_STYLES[priority];
          const active = selectedPriority === priority;
          return (
            <button
              key={priority}
              onClick={() =>
                onPriorityChange(active ? null : priority)
              }
              className="px-3 py-1.5 text-[11px] font-black uppercase cursor-pointer transition-all"
              style={{
                border: `3px solid ${COLORS.dark}`,
                background: active ? ps.bg : COLORS.light,
                color: active ? ps.text : COLORS.dark,
                boxShadow: active ? ps.shadow : `3px 3px 0 ${COLORS.dark}`,
                transform: active ? 'translateY(-2px)' : 'none',
              }}
            >
              {priority}
            </button>
          );
        })}

        <span
          className="mx-1"
          style={{ color: COLORS.light, opacity: 0.3 }}
        >
          │
        </span>

        {/* Label filters */}
        {Object.keys(labelColors).map((label) => {
          const active = selectedLabel === label;
          return (
            <button
              key={label}
              onClick={() => onLabelChange(active ? null : label)}
              className="px-2.5 py-1 text-[10px] font-bold uppercase cursor-pointer transition-all"
              style={{
                border: `2px solid ${COLORS.dark}`,
                background: active ? labelColors[label] : `${COLORS.light}80`,
                color: active ? COLORS.light : COLORS.dark,
                transform: active ? 'translateY(-1px)' : 'none',
              }}
            >
              {label}
            </button>
          );
        })}

        {/* Clear filters */}
        {(selectedPriority || selectedLabel || searchQuery) && (
          <button
            onClick={() => {
              onPriorityChange(null);
              onLabelChange(null);
              onSearchChange('');
            }}
            className="px-3 py-1.5 text-[11px] font-black uppercase cursor-pointer ml-1"
            style={{
              border: `2px solid ${COLORS.light}`,
              background: 'transparent',
              color: COLORS.light,
            }}
          >
            ✕ Clear
          </button>
        )}
      </div>
      {showAddColumn && (
        <Dialog
          title="New Column"
          message="Enter a name for the new column."
          confirmLabel="CREATE"
          inputMode
          inputPlaceholder="Column name…"
          onConfirm={(name) => {
            setShowAddColumn(false);
            onAddColumn(name);
          }}
          onCancel={() => setShowAddColumn(false)}
        />
      )}

      {showImportError && (
        <Dialog
          title="Import Failed"
          message="The selected file is not valid JSON. Please choose a file exported from this board."
          confirmLabel="OK"
          cancelLabel="DISMISS"
          onConfirm={() => setShowImportError(false)}
          onCancel={() => setShowImportError(false)}
        />
      )}
    </div>
  );
};

export default React.memo(Header);
