import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Admin 404 Not Found page.
 * Respects light/dark theme via CSS custom properties.
 */
export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="admin-nf-overlay">
      <div className="admin-nf-card">
        {/* Decorative number */}
        <div className="admin-nf-number" aria-hidden="true">404</div>

        <div className="admin-nf-icon-wrap">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
            <line x1="11" y1="8" x2="11" y2="12" />
            <line x1="11" y1="16" x2="11.01" y2="16" />
          </svg>
        </div>

        <h1 className="admin-nf-title">Page Not Found</h1>
        <p className="admin-nf-body">
          The admin page you&apos;re looking for doesn&apos;t exist or you don&apos;t have
          access to it.
        </p>

        <div className="admin-nf-actions">
          <button
            id="admin-nf-dashboard"
            className="btn btn-primary"
            onClick={() => navigate('/dashboard')}
          >
            ← Back to Dashboard
          </button>
          <button
            id="admin-nf-back"
            className="btn btn-ghost"
            onClick={() => navigate(-1)}
          >
            Go back
          </button>
        </div>
      </div>

      <style>{`
        .admin-nf-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background: var(--bg-app, #f8fafc);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          font-family: 'Inter', sans-serif;
          overflow: hidden;
        }

        .admin-nf-card {
          background: var(--bg-surface, #fff);
          border: 1px solid var(--border-subtle, #e2e8f0);
          border-radius: 1.25rem;
          padding: 3rem 2.5rem;
          max-width: 460px;
          width: 100%;
          text-align: center;
          box-shadow: var(--shadow-lg);
          position: relative;
          z-index: 10;
        }

        .admin-nf-number {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: clamp(5rem, 15vw, 8rem);
          font-weight: 800;
          line-height: 1;
          color: transparent;
          background: linear-gradient(135deg, var(--accent, #6366f1) 0%, transparent 100%);
          -webkit-background-clip: text;
          background-clip: text;
          margin-bottom: 1rem;
          opacity: 0.2;
          user-select: none;
          pointer-events: none;
        }

        .admin-nf-icon-wrap {
          width: 64px; height: 64px;
          background: var(--accent-soft, rgba(99,102,241,0.1));
          border: 1px solid var(--border-medium, #cbd5e1);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 1.25rem;
          color: var(--accent, #6366f1);
          animation: admin-nf-float 3s ease-in-out infinite;
        }

        .admin-nf-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary, #0f172a);
          margin-bottom: 0.6rem;
        }

        .admin-nf-body {
          font-size: 0.9rem;
          color: var(--text-secondary, #475569);
          line-height: 1.65;
          margin-bottom: 2rem;
        }

        .admin-nf-actions {
          display: flex;
          gap: 0.75rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        @keyframes admin-nf-float {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}
