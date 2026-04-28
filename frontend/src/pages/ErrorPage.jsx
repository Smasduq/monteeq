import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

/**
 * Generic Error Page — rendered programmatically when a known HTTP error
 * (401, 403, 500, etc.) is caught by a page or the API layer.
 *
 * Props:
 *   code    {number}  HTTP status code
 *   message {string}  Optional override message
 *   onRetry {fn}      Optional retry callback (shown as a third button)
 */

const ERROR_CONFIG = {
  401: {
    emoji: '🔒',
    title: 'Session Expired',
    body: 'You need to be signed in to access this page. Please log in and try again.',
    cta: { label: 'Log In', to: '/login' },
    color: '#FF9F0A',
  },
  403: {
    emoji: '🚫',
    title: "You Don't Have Access",
    body: "You don't have permission to view this content. If you believe this is an error, contact support.",
    cta: { label: 'Go Home', to: '/' },
    color: '#FF3B30',
  },
  404: {
    emoji: '🔍',
    title: 'Content Not Found',
    body: 'The content you requested could not be found. It may have been removed or the link is incorrect.',
    cta: { label: 'Go Home', to: '/' },
    color: '#636366',
  },
  429: {
    emoji: '⏳',
    title: 'Too Many Requests',
    body: "You're moving too fast. Please wait a moment and try again.",
    cta: null,
    color: '#FF9F0A',
  },
  500: {
    emoji: '⚡',
    title: 'Something Went Wrong',
    body: "An unexpected error occurred on our end. Our team has been notified and we're working on it.",
    cta: { label: 'Go Home', to: '/' },
    color: '#FF3B30',
  },
  503: {
    emoji: '🛠️',
    title: 'Service Unavailable',
    body: 'Monteeq is temporarily down for maintenance. Please check back shortly.',
    cta: null,
    color: '#FF9F0A',
  },
};

const DEFAULT_CONFIG = {
  emoji: '❌',
  title: 'An Error Occurred',
  body: 'Something unexpected happened. Please try again or return home.',
  cta: { label: 'Go Home', to: '/' },
  color: '#FF3B30',
};

export default function ErrorPage({ code = 500, message, onRetry }) {
  const navigate = useNavigate();
  const config = ERROR_CONFIG[code] || DEFAULT_CONFIG;
  const accentColor = config.color;

  return (
    <div className="ep-overlay">
      <div className="ep-glow" style={{ background: `radial-gradient(ellipse, ${accentColor}22 0%, transparent 70%)` }} />

      <div className="ep-card">
        <div className="ep-emoji" style={{ borderColor: `${accentColor}44`, background: `${accentColor}11` }}>
          <span>{config.emoji}</span>
        </div>

        <div className="ep-code-badge" style={{ color: accentColor, borderColor: `${accentColor}33` }}>
          Error {code}
        </div>

        <h1 className="ep-title">{config.title}</h1>
        <p className="ep-body">{message || config.body}</p>

        <div className="ep-actions">
          {config.cta && (
            <Link
              to={config.cta.to}
              id={`ep-cta-${code}`}
              className="ep-btn-primary"
              style={{ background: accentColor }}
            >
              {config.cta.label}
            </Link>
          )}

          <button
            id="ep-go-back"
            className="ep-btn-ghost"
            onClick={() => navigate(-1)}
          >
            ← Go back
          </button>

          {onRetry && (
            <button
              id="ep-retry"
              className="ep-btn-ghost"
              onClick={onRetry}
            >
              Try again
            </button>
          )}
        </div>
      </div>

      <style>{`
        .ep-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background: var(--bg-deep, #000);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          overflow: hidden;
          font-family: 'Outfit', 'Inter', sans-serif;
        }

        .ep-glow {
          position: absolute;
          inset: 0;
          pointer-events: none;
          animation: ep-breathe 5s ease-in-out infinite;
        }

        .ep-card {
          position: relative;
          z-index: 10;
          background: rgba(255,255,255,0.03);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 24px;
          padding: 3rem 2.5rem;
          max-width: 500px;
          width: 100%;
          text-align: center;
          box-shadow: 0 24px 60px rgba(0,0,0,0.8);
        }

        .ep-emoji {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          border: 1px solid;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          margin: 0 auto 1rem;
          animation: ep-float 4s ease-in-out infinite;
        }

        .ep-code-badge {
          display: inline-block;
          font-size: 0.75rem;
          font-weight: 800;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          border: 1px solid;
          border-radius: 6px;
          padding: 3px 10px;
          margin-bottom: 1rem;
        }

        .ep-title {
          font-size: clamp(1.5rem, 4vw, 2rem);
          font-weight: 800;
          color: #fff;
          margin-bottom: 0.75rem;
          letter-spacing: -0.3px;
        }

        .ep-body {
          font-size: 0.95rem;
          color: var(--text-muted, #8e8e93);
          line-height: 1.7;
          margin-bottom: 2rem;
        }

        .ep-actions {
          display: flex;
          gap: 0.75rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .ep-btn-primary {
          color: #fff;
          border: none;
          border-radius: 50px;
          padding: 0.75rem 1.75rem;
          font-weight: 700;
          font-size: 0.9rem;
          cursor: pointer;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          transition: opacity 0.2s ease, transform 0.15s ease;
          font-family: inherit;
        }

        .ep-btn-primary:hover {
          opacity: 0.85;
          transform: translateY(-2px);
        }

        .ep-btn-ghost {
          background: rgba(255,255,255,0.06);
          color: var(--text-muted, #8e8e93);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 50px;
          padding: 0.75rem 1.5rem;
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          transition: background 0.2s ease;
          font-family: inherit;
        }

        .ep-btn-ghost:hover {
          background: rgba(255,255,255,0.1);
          color: #fff;
        }

        @keyframes ep-breathe {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.6; }
        }

        @keyframes ep-float {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}
