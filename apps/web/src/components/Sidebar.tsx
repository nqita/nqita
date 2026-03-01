'use client';

import { useState, useEffect } from 'react';
import type { AuthUser } from '@wokspec/auth';

interface Props {
  user: AuthUser | null;
}

export function Sidebar({ user }: Props) {
  const [sessions, setSessions] = useState<string[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | undefined>(undefined);
  const [hoveredSession, setHoveredSession] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false); // mobile toggle

  useEffect(() => {
    const onSessionsUpdate = (e: Event) => {
      const { sessions: sess, activeSessionId: active } = (e as CustomEvent).detail;
      setSessions(sess);
      setActiveSessionId(active);
    };
    window.addEventListener('eral:sessions', onSessionsUpdate);
    return () => window.removeEventListener('eral:sessions', onSessionsUpdate);
  }, []);

  const handleNewChat = () => {
    setActiveSessionId(undefined);
    window.dispatchEvent(new CustomEvent('eral:new-chat'));
    setIsOpen(false);
  };

  const handleSelect = (id: string) => {
    setActiveSessionId(id);
    window.dispatchEvent(new CustomEvent('eral:select-session', { detail: id }));
    setIsOpen(false);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    window.dispatchEvent(new CustomEvent('eral:delete-session', { detail: id }));
  };

  const formatSession = (id: string, idx: number) => {
    // Try to show a friendly name; fall back to "Chat N"
    if (id.length > 16) return `Chat ${idx + 1}`;
    return id;
  };

  const sidebarContent = (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: '0.875rem 0.75rem',
        gap: '0.25rem',
      }}
    >
      {/* New chat button */}
      <button
        onClick={handleNewChat}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'rgba(124,58,237,0.1)',
          border: '1px solid rgba(124,58,237,0.25)',
          borderRadius: '0.625rem',
          color: '#a78bfa',
          padding: '0.6rem 0.875rem',
          fontWeight: 600,
          fontSize: '0.875rem',
          cursor: 'pointer',
          width: '100%',
          marginBottom: '0.5rem',
          transition: 'background 0.15s',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(124,58,237,0.18)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(124,58,237,0.1)'; }}
      >
        <PlusIcon />
        New chat
      </button>

      {/* Session list */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {sessions.length === 0 && (
          <p style={{ fontSize: '0.8125rem', color: 'var(--muted)', padding: '0.5rem 0.375rem' }}>
            No conversations yet.
          </p>
        )}
        {sessions.map((id, idx) => (
          <div
            key={id}
            onClick={() => handleSelect(id)}
            onMouseEnter={() => setHoveredSession(id)}
            onMouseLeave={() => setHoveredSession(null)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.5rem 0.75rem',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              background: activeSessionId === id ? 'rgba(124,58,237,0.12)' : 'transparent',
              color: activeSessionId === id ? '#a78bfa' : 'var(--foreground)',
              fontSize: '0.875rem',
              transition: 'background 0.1s',
              gap: '0.375rem',
            }}
            onMouseOver={(e) => {
              if (activeSessionId !== id) e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
            }}
            onMouseOut={(e) => {
              if (activeSessionId !== id) e.currentTarget.style.background = 'transparent';
            }}
          >
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
              {formatSession(id, idx)}
            </span>
            {hoveredSession === id && (
              <button
                onClick={(e) => handleDelete(e, id)}
                aria-label="Delete session"
                style={{
                  flexShrink: 0,
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--muted)',
                  cursor: 'pointer',
                  padding: '0.125rem',
                  borderRadius: '0.25rem',
                  display: 'flex',
                  alignItems: 'center',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#f87171'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--muted)'; }}
              >
                <TrashIcon />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* User info */}
      {user && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.625rem',
            padding: '0.625rem 0.5rem',
            borderTop: '1px solid var(--border)',
            marginTop: '0.5rem',
          }}
        >
          {user.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.avatarUrl}
              alt={user.displayName ?? user.email}
              width={28}
              height={28}
              style={{ borderRadius: '50%', flexShrink: 0 }}
            />
          ) : (
            <div
              style={{
                width: '1.75rem',
                height: '1.75rem',
                borderRadius: '50%',
                background: 'var(--accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.75rem',
                color: '#fff',
                flexShrink: 0,
              }}
            >
              {(user.displayName ?? user.email ?? '?')[0]?.toUpperCase()}
            </div>
          )}
          <span
            style={{
              fontSize: '0.8125rem',
              fontWeight: 500,
              color: 'var(--foreground)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {user.displayName ?? user.email}
          </span>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        aria-label="Toggle sidebar"
        style={{
          display: 'none',
          position: 'fixed',
          top: '0.875rem',
          left: '1rem',
          zIndex: 50,
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: '0.5rem',
          width: '2.25rem',
          height: '2.25rem',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: 'var(--foreground)',
        }}
        className="mobile-sidebar-toggle"
      >
        <HamburgerIcon />
      </button>

      {/* Sidebar desktop */}
      <aside
        style={{
          width: '14rem',
          flexShrink: 0,
          borderRight: '1px solid var(--border)',
          background: 'var(--background)',
          overflowY: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {sidebarContent}
      </aside>

      {/* Mobile drawer */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 40,
            display: 'flex',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0,0,0,0.6)',
            }}
            onClick={() => setIsOpen(false)}
          />
          <aside
            style={{
              position: 'relative',
              width: '14rem',
              background: 'var(--card)',
              borderRight: '1px solid var(--border)',
              zIndex: 1,
              overflowY: 'auto',
            }}
          >
            {sidebarContent}
          </aside>
        </div>
      )}

      <style>{`
        @media (max-width: 640px) {
          .mobile-sidebar-toggle { display: flex !important; }
        }
      `}</style>
    </>
  );
}

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4h6v2" />
    </svg>
  );
}

function HamburgerIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}
