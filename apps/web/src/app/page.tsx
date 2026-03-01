'use client';

import Link from 'next/link';
import { useAuth } from '@wokspec/auth/client';

export default function HomePage() {
  const { isAuthenticated, isLoading, signIn } = useAuth();

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--background)',
        color: 'var(--foreground)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Nav */}
      <nav
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.25rem 2rem',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.25rem',
            fontWeight: 700,
            color: 'var(--accent)',
            letterSpacing: '-0.02em',
          }}
        >
          Eral
        </span>
        {!isLoading && (
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            {isAuthenticated ? (
              <Link
                href="/chat"
                style={{
                  background: 'var(--accent)',
                  color: '#fff',
                  padding: '0.5rem 1.25rem',
                  borderRadius: '0.5rem',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  textDecoration: 'none',
                  transition: 'background 0.15s',
                }}
              >
                Open Chat
              </Link>
            ) : (
              <button
                onClick={() => signIn('github', '/chat')}
                style={{
                  background: 'transparent',
                  color: 'var(--foreground)',
                  border: '1px solid var(--border)',
                  padding: '0.5rem 1.25rem',
                  borderRadius: '0.5rem',
                  fontWeight: 500,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                }}
              >
                Sign in
              </button>
            )}
          </div>
        )}
      </nav>

      {/* Hero */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '4rem 2rem',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(124, 58, 237, 0.12)',
            border: '1px solid rgba(124, 58, 237, 0.3)',
            color: '#a78bfa',
            padding: '0.25rem 0.875rem',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: 500,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            marginBottom: '2rem',
          }}
        >
          <span>✦</span>
          <span>WokSpec AI</span>
        </div>

        <h1
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(3.5rem, 10vw, 7rem)',
            fontWeight: 700,
            letterSpacing: '-0.04em',
            lineHeight: 1,
            marginBottom: '1.5rem',
            background: 'linear-gradient(135deg, #f5f5f5 0%, #888 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Eral
        </h1>

        <p
          style={{
            fontSize: 'clamp(1rem, 2.5vw, 1.375rem)',
            color: 'var(--muted)',
            maxWidth: '28rem',
            lineHeight: 1.6,
            marginBottom: '3rem',
          }}
        >
          Your AI. Built into WokSpec.
        </p>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          {isAuthenticated ? (
            <Link
              href="/chat"
              style={{
                background: 'var(--accent)',
                color: '#fff',
                padding: '0.875rem 2rem',
                borderRadius: '0.75rem',
                fontWeight: 600,
                fontSize: '1rem',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              Start chatting →
            </Link>
          ) : (
            <>
              <Link
                href="/chat"
                style={{
                  background: 'var(--accent)',
                  color: '#fff',
                  padding: '0.875rem 2rem',
                  borderRadius: '0.75rem',
                  fontWeight: 600,
                  fontSize: '1rem',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                Start chatting →
              </Link>
              <button
                onClick={() => signIn('github', '/chat')}
                style={{
                  background: 'var(--card)',
                  color: 'var(--foreground)',
                  border: '1px solid var(--border)',
                  padding: '0.875rem 2rem',
                  borderRadius: '0.75rem',
                  fontWeight: 500,
                  fontSize: '1rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <GithubIcon />
                Sign in with WokSpec
              </button>
            </>
          )}
        </div>

        {/* Capability cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem',
            maxWidth: '48rem',
            width: '100%',
            marginTop: '5rem',
          }}
        >
          {CAPABILITIES.map((cap) => (
            <div
              key={cap.title}
              style={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: '1rem',
                padding: '1.5rem',
                textAlign: 'left',
              }}
            >
              <div
                style={{
                  fontSize: '1.5rem',
                  marginBottom: '0.75rem',
                }}
              >
                {cap.icon}
              </div>
              <h3
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 600,
                  fontSize: '1rem',
                  marginBottom: '0.375rem',
                  color: 'var(--foreground)',
                }}
              >
                {cap.title}
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--muted)', lineHeight: 1.5 }}>
                {cap.description}
              </p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid var(--border)',
          padding: '1.5rem 2rem',
          display: 'flex',
          justifyContent: 'center',
          fontSize: '0.8125rem',
          color: 'var(--muted)',
        }}
      >
        <span>© 2025 WokSpec · Eral AI</span>
      </footer>
    </div>
  );
}

const CAPABILITIES = [
  {
    icon: '💬',
    title: 'Chat',
    description: 'Have natural conversations with Eral. Ask questions, brainstorm ideas, and get instant answers.',
  },
  {
    icon: '✍️',
    title: 'Generate',
    description: 'Create posts, captions, code, prompts, docs, emails, and summaries with one click.',
  },
  {
    icon: '🔍',
    title: 'Analyze',
    description: 'Summarize, explain, review, extract data, or detect sentiment from any content.',
  },
];

function GithubIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}
