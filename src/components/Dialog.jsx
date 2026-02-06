import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { COLORS } from '../utils/constants';

/**
 * Reusable Neo-Brutalist dialog.
 *
 * Props:
 *  - title        (string)  Heading text
 *  - message      (string)  Body / description text
 *  - confirmLabel (string)  Label for the confirm button (default "CONFIRM")
 *  - cancelLabel  (string)  Label for the cancel button  (default "CANCEL")
 *  - variant      ('danger' | 'default')  Controls confirm-button color
 *  - inputMode    (bool)    If true, renders a text input and passes its value to onConfirm
 *  - inputDefault (string)  Default value for the text input
 *  - inputPlaceholder (string)
 *  - onConfirm    (fn)      Called with no args (confirm) or with the input string (inputMode)
 *  - onCancel     (fn)      Called when the dialog is dismissed
 */
const Dialog = ({
  title = 'Are you sure?',
  message = '',
  confirmLabel = 'CONFIRM',
  cancelLabel = 'CANCEL',
  variant = 'default',
  inputMode = false,
  inputDefault = '',
  inputPlaceholder = '',
  onConfirm,
  onCancel,
}) => {
  const [value, setValue] = useState(inputDefault);
  const inputRef = useRef(null);
  const confirmRef = useRef(null);

  // Auto-focus the input or the confirm button
  useEffect(() => {
    if (inputMode) {
      inputRef.current?.focus();
      inputRef.current?.select();
    } else {
      confirmRef.current?.focus();
    }
  }, [inputMode]);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onCancel]);

  const handleConfirm = () => {
    if (inputMode) {
      if (!value.trim()) return;
      onConfirm(value.trim());
    } else {
      onConfirm();
    }
  };

  const confirmBg = variant === 'danger' ? COLORS.danger : COLORS.success;

  return createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center z-[1100] p-5"
      style={{ background: 'rgba(0, 0, 0, 0.75)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
      role="alertdialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="kanban-dialog w-full max-w-[420px]"
        style={{
          background: COLORS.light,
          border: `5px solid ${COLORS.dark}`,
          boxShadow: `8px 8px 0 ${COLORS.dark}`,
          padding: '32px',
        }}
      >
        {/* Title */}
        <h2
          className="text-xl font-black m-0 mb-3"
          style={{ color: COLORS.dark }}
        >
          {title}
        </h2>

        {/* Message */}
        {message && (
          <p
            className="text-sm font-medium m-0 mb-6 leading-relaxed"
            style={{ color: COLORS.dark, opacity: 0.75 }}
          >
            {message}
          </p>
        )}

        {/* Optional text input */}
        {inputMode && (
          <input
            ref={inputRef}
            type="text"
            value={value}
            placeholder={inputPlaceholder}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleConfirm();
            }}
            className="w-full p-3 text-base font-semibold mb-6"
            style={{
              border: `3px solid ${COLORS.dark}`,
              background: COLORS.light,
              outline: 'none',
              color: COLORS.dark,
            }}
          />
        )}

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 text-sm font-black cursor-pointer uppercase"
            style={{
              border: `3px solid ${COLORS.dark}`,
              background: '#3A3A3A',
              color: COLORS.light,
              boxShadow: `3px 3px 0 ${COLORS.dark}`,
            }}
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            onClick={handleConfirm}
            className="flex-1 py-3 text-sm font-black cursor-pointer uppercase"
            style={{
              border: `3px solid ${COLORS.dark}`,
              background: confirmBg,
              color: COLORS.light,
              boxShadow: `3px 3px 0 ${COLORS.dark}`,
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default Dialog;
