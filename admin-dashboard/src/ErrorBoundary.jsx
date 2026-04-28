import React from 'react';

/**
 * Admin ErrorBoundary — catches render-time JS errors in the admin dashboard.
 * Uses admin CSS variables (light/dark theming via [data-theme]).
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[Admin ErrorBoundary]', error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/dashboard';
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="admin-eb-overlay">
        <div className="admin-eb-card">
          <div className="admin-eb-icon-wrap">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>

          <h2 className="admin-eb-title">Application Error</h2>
          <p className="admin-eb-body">
            An unexpected error occurred in the admin panel. The issue has been logged.
          </p>

          {this.state.error && (
            <details className="admin-eb-details">
              <summary>Show details</summary>
              <pre className="admin-eb-pre">{this.state.error.toString()}</pre>
            </details>
          )}

          <div className="admin-eb-actions">
            <button id="admin-eb-dashboard" onClick={this.handleReset} className="btn btn-primary">
              Back to Dashboard
            </button>
            <button id="admin-eb-reload" onClick={() => window.location.reload()} className="btn btn-ghost">
              Reload
            </button>
          </div>
        </div>

        <style>{`
          .admin-eb-overlay {
            position: fixed;
            inset: 0;
            z-index: 9999;
            background: var(--bg-app, #f8fafc);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem;
            font-family: 'Inter', sans-serif;
          }

          .admin-eb-card {
            background: var(--bg-surface, #fff);
            border: 1px solid var(--border-subtle, #e2e8f0);
            border-radius: 1rem;
            padding: 2.5rem 2rem;
            max-width: 460px;
            width: 100%;
            text-align: center;
            box-shadow: var(--shadow-lg);
          }
          .admin-eb-icon-wrap {
            width: 64px; height: 64px;
            background: rgba(239,68,68,0.1);
            border: 1px solid rgba(239,68,68,0.25);
            border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            margin: 0 auto 1.25rem;
            color: var(--danger, #ef4444);
          }
          .admin-eb-title {
            font-size: 1.4rem; font-weight: 700;
            color: var(--text-primary, #0f172a);
            margin-bottom: 0.5rem;
          }
          .admin-eb-body {
            font-size: 0.9rem;
            color: var(--text-secondary, #475569);
            line-height: 1.65;
            margin-bottom: 1.25rem;
          }
          .admin-eb-details {
            text-align: left;
            background: var(--bg-raised, #f1f5f9);
            border: 1px solid var(--border-subtle);
            border-radius: 8px;
            padding: 0.75rem 1rem;
            margin-bottom: 1.5rem;
            font-size: 0.8rem;
            color: var(--text-secondary);
            cursor: pointer;
          }
          .admin-eb-pre {
            margin-top: 0.5rem;
            font-family: monospace;
            font-size: 0.75rem;
            color: var(--danger, #ef4444);
            white-space: pre-wrap;
            word-break: break-word;
          }
          .admin-eb-actions {
            display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap;
          }
        `}</style>
      </div>
    );
  }
}
