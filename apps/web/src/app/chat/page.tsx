'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChatInterface } from '@/components/ChatInterface';
import { Sidebar } from '@/components/Sidebar';

export default function ChatPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    const key = localStorage.getItem('eral_token') ?? '';
    if (!key) {
      router.replace('/login');
    } else {
      setApiKey(key);
      setReady(true);
    }
  }, [router]);

  if (!ready) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: 'var(--background)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <LoadingDots />
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        background: 'var(--background)',
        color: 'var(--foreground)',
        overflow: 'hidden',
      }}
    >
      <Sidebar apiKey={apiKey} onSignOut={() => {
        localStorage.removeItem('eral_token');
        router.replace('/login');
      }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <header
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.875rem 1.25rem',
            borderBottom: '1px solid var(--border)',
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              fontSize: '1.125rem',
              color: 'var(--accent)',
              letterSpacing: '-0.02em',
            }}
          >
            Eral
          </span>
          <span
            style={{
              background: 'rgba(124, 58, 237, 0.12)',
              border: '1px solid rgba(124, 58, 237, 0.25)',
              color: '#a78bfa',
              padding: '0.125rem 0.625rem',
              borderRadius: '9999px',
              fontSize: '0.6875rem',
              fontWeight: 500,
            }}
          >
            Powered by Eral
          </span>
          <div style={{ flex: 1 }} />
          <a href="/keys" style={{ fontSize: '0.8rem', color: 'var(--muted)', textDecoration: 'none', padding: '0.25rem 0.625rem', border: '1px solid var(--border)', borderRadius: '0.5rem' }}>
            API Keys
          </a>
        </header>
        <ChatInterface />
      </div>
    </div>
  );
}

function LoadingDots() {
  return (
    <div style={{ display: 'flex', gap: '0.375rem' }}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: 'var(--accent)',
            animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
          }}
        />
      ))}
      <style>{`@keyframes pulse { 0%,80%,100% { opacity: 0.2; transform: scale(0.8); } 40% { opacity: 1; transform: scale(1); } }`}</style>
    </div>
  );
}
