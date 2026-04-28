import React, { createContext, useContext, useCallback, useReducer } from 'react';

/**
 * ToastContext — Admin dashboard notification system.
 * ====================================================
 * Stacked, auto-dismissing toasts in the top-right corner.
 * Respects light/dark theme via CSS custom properties.
 *
 * Usage:
 *   const { showSuccess, showError, showWarning, showInfo } = useToast();
 *   showSuccess('Video approved!');
 *   showError('API request failed.');
 */

const ToastContext = createContext(null);

const TOAST_CONFIG = {
  success: { label: 'Success', color: 'var(--success, #10b981)', bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.25)', icon: '✓' },
  error:   { label: 'Error',   color: 'var(--danger, #ef4444)',  bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.25)',  icon: '✕' },
  warning: { label: 'Warning', color: 'var(--warning, #f59e0b)', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.25)', icon: '!' },
  info:    { label: 'Info',    color: 'var(--accent, #6366f1)',  bg: 'rgba(99,102,241,0.1)',  border: 'rgba(99,102,241,0.25)', icon: 'i' },
};

let _id = 0;

function reducer(state, action) {
  switch (action.type) {
    case 'ADD':    return [action.item, ...state].slice(0, 6);
    case 'REMOVE': return state.filter(t => t.id !== action.id);
    default:       return state;
  }
}

export function ToastProvider({ children }) {
  const [toasts, dispatch] = useReducer(reducer, []);

  const show = useCallback((message, type = 'info', duration = 4500) => {
    const id = ++_id;
    dispatch({ type: 'ADD', item: { id, message, type } });
    if (duration > 0) setTimeout(() => dispatch({ type: 'REMOVE', id }), duration);
    return id;
  }, []);

  const dismiss = useCallback((id) => dispatch({ type: 'REMOVE', id }), []);

  const showSuccess = useCallback((msg, d) => show(msg, 'success', d), [show]);
  const showError   = useCallback((msg, d) => show(msg, 'error',   d), [show]);
  const showWarning = useCallback((msg, d) => show(msg, 'warning', d), [show]);
  const showInfo    = useCallback((msg, d) => show(msg, 'info',    d), [show]);

  return (
    <ToastContext.Provider value={{ show, dismiss, showSuccess, showError, showWarning, showInfo }}>
      {children}
      <div
        style={{
          position: 'fixed',
          top: '1rem',
          right: '1rem',
          zIndex: 99999,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          maxWidth: 380,
          width: '90vw',
          pointerEvents: 'none',
        }}
        aria-live="polite"
      >
        {toasts.map(t => (
          <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onDismiss }) {
  const cfg = TOAST_CONFIG[toast.type] || TOAST_CONFIG.info;

  return (
    <div
      role="alert"
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.7rem',
        padding: '0.875rem 1rem',
        borderRadius: '0.625rem',
        background: `var(--bg-surface, #fff)`,
        border: `1px solid ${cfg.border}`,
        boxShadow: 'var(--shadow-md)',
        animation: 'admin-toast-in 0.25s cubic-bezier(0.34,1.56,0.64,1) both',
        pointerEvents: 'all',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Icon dot */}
      <div
        style={{
          width: 22,
          height: 22,
          borderRadius: '50%',
          background: cfg.bg,
          border: `1px solid ${cfg.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.65rem',
          fontWeight: 800,
          color: cfg.color,
          flexShrink: 0,
          marginTop: 1,
        }}
      >
        {cfg.icon}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: cfg.color, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 2 }}>
          {cfg.label}
        </div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-primary, #0f172a)', lineHeight: 1.45 }}>
          {toast.message}
        </div>
      </div>

      <button
        id={`admin-toast-dismiss-${toast.id}`}
        onClick={() => onDismiss(toast.id)}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--text-muted, #94a3b8)',
          fontSize: '1rem',
          lineHeight: 1,
          padding: '0 2px',
          flexShrink: 0,
        }}
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}

// Inject animation once
if (typeof document !== 'undefined' && !document.getElementById('admin-toast-style')) {
  const s = document.createElement('style');
  s.id = 'admin-toast-style';
  s.textContent = `@keyframes admin-toast-in { from { opacity:0; transform:translateX(32px) scale(0.95); } to { opacity:1; transform:translateX(0) scale(1); } }`;
  document.head.appendChild(s);
}
