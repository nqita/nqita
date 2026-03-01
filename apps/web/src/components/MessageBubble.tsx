'use client';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface Props {
  message: Message;
}

export function MessageBubble({ message }: Props) {
  const isUser = message.role === 'user';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: isUser ? 'row-reverse' : 'row',
        gap: '0.625rem',
        alignItems: 'flex-start',
        padding: '0.25rem 0',
      }}
    >
      {/* Avatar */}
      {!isUser && (
        <div
          style={{
            flexShrink: 0,
            width: '1.875rem',
            height: '1.875rem',
            borderRadius: '50%',
            background: 'var(--accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--font-heading)',
            fontWeight: 700,
            fontSize: '0.75rem',
            color: '#fff',
            marginTop: '0.125rem',
          }}
          aria-hidden="true"
        >
          E
        </div>
      )}

      {/* Bubble */}
      <div
        style={{
          maxWidth: 'min(80%, 680px)',
          background: isUser ? 'var(--accent)' : 'var(--card)',
          color: isUser ? '#fff' : 'var(--foreground)',
          border: isUser ? 'none' : '1px solid var(--border)',
          borderRadius: isUser ? '1.25rem 1.25rem 0.25rem 1.25rem' : '0.25rem 1.25rem 1.25rem 1.25rem',
          padding: '0.625rem 0.9375rem',
          fontSize: '0.9375rem',
          lineHeight: 1.6,
          wordBreak: 'break-word',
        }}
      >
        <FormattedContent content={message.content} isUser={isUser} />
      </div>
    </div>
  );
}

function FormattedContent({ content, isUser }: { content: string; isUser: boolean }) {
  // Split into segments: code blocks vs regular text
  const parts = content.split(/(```[\s\S]*?```|`[^`]+`)/g);

  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          const inner = part.slice(3, -3);
          const newlineIdx = inner.indexOf('\n');
          const lang = newlineIdx > 0 ? inner.slice(0, newlineIdx).trim() : '';
          const code = newlineIdx > 0 ? inner.slice(newlineIdx + 1) : inner;
          return (
            <pre
              key={i}
              style={{
                background: 'rgba(0,0,0,0.35)',
                border: '1px solid var(--border)',
                borderRadius: '0.5rem',
                padding: '0.75rem 1rem',
                overflowX: 'auto',
                fontSize: '0.8125rem',
                lineHeight: 1.6,
                margin: '0.5rem 0',
                fontFamily: 'ui-monospace, Menlo, monospace',
                whiteSpace: 'pre',
                color: isUser ? 'rgba(255,255,255,0.9)' : 'var(--foreground)',
              }}
            >
              {lang && (
                <span style={{ fontSize: '0.6875rem', color: 'var(--muted)', display: 'block', marginBottom: '0.375rem' }}>
                  {lang}
                </span>
              )}
              {code}
            </pre>
          );
        }
        if (part.startsWith('`') && part.endsWith('`')) {
          return (
            <code
              key={i}
              style={{
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid var(--border)',
                borderRadius: '0.25rem',
                padding: '0.1em 0.4em',
                fontSize: '0.875em',
                fontFamily: 'ui-monospace, Menlo, monospace',
              }}
            >
              {part.slice(1, -1)}
            </code>
          );
        }
        // Render plain text with line breaks preserved
        return (
          <span key={i} style={{ whiteSpace: 'pre-wrap' }}>
            {part}
          </span>
        );
      })}
    </>
  );
}

export function TypingIndicator() {
  return (
    <div
      style={{
        display: 'flex',
        gap: '0.625rem',
        alignItems: 'flex-start',
        padding: '0.25rem 0',
      }}
    >
      <div
        style={{
          flexShrink: 0,
          width: '1.875rem',
          height: '1.875rem',
          borderRadius: '50%',
          background: 'var(--accent)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'var(--font-heading)',
          fontWeight: 700,
          fontSize: '0.75rem',
          color: '#fff',
          marginTop: '0.125rem',
        }}
        aria-hidden="true"
      >
        E
      </div>
      <div
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: '0.25rem 1.25rem 1.25rem 1.25rem',
          padding: '0.625rem 1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.3rem',
        }}
        aria-label="Eral is typing"
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: 'var(--muted)',
              display: 'inline-block',
              animation: `typing-bounce 1.2s ease-in-out ${i * 0.15}s infinite`,
            }}
          />
        ))}
        <style>{`
          @keyframes typing-bounce {
            0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
            30% { transform: translateY(-4px); opacity: 1; }
          }
        `}</style>
      </div>
    </div>
  );
}
