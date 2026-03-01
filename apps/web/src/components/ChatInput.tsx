'use client';

import { useRef, useEffect } from 'react';

interface Props {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleResize = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    const lineHeight = 24;
    const maxLines = 6;
    el.style.height = `${Math.min(el.scrollHeight, lineHeight * maxLines + 20)}px`;
  };

  useEffect(() => {
    textareaRef.current?.focus();
  }, [disabled]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const submit = () => {
    const el = textareaRef.current;
    if (!el || disabled) return;
    const value = el.value.trim();
    if (!value) return;
    onSend(value);
    el.value = '';
    el.style.height = 'auto';
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: '0.75rem',
        padding: '1rem 1.25rem',
        borderTop: '1px solid var(--border)',
        background: 'var(--background)',
        flexShrink: 0,
      }}
    >
      <textarea
        ref={textareaRef}
        rows={1}
        placeholder="Message Eral…"
        disabled={disabled}
        onInput={handleResize}
        onKeyDown={handleKeyDown}
        style={{
          flex: 1,
          resize: 'none',
          background: 'var(--card)',
          color: 'var(--foreground)',
          border: '1px solid var(--border)',
          borderRadius: '0.875rem',
          padding: '0.625rem 0.875rem',
          fontFamily: 'var(--font-body), ui-sans-serif, sans-serif',
          fontSize: '0.9375rem',
          lineHeight: '1.5',
          outline: 'none',
          overflowY: 'auto',
          transition: 'border-color 0.15s',
          opacity: disabled ? 0.5 : 1,
        }}
        onFocus={(e) => { e.target.style.borderColor = 'var(--accent)'; }}
        onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; }}
      />
      <button
        onClick={submit}
        disabled={disabled}
        aria-label="Send message"
        style={{
          flexShrink: 0,
          width: '2.5rem',
          height: '2.5rem',
          borderRadius: '0.75rem',
          background: disabled ? 'var(--border)' : 'var(--accent)',
          border: 'none',
          color: '#fff',
          cursor: disabled ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background 0.15s',
        }}
        onMouseEnter={(e) => { if (!disabled) e.currentTarget.style.background = 'var(--accent-hover)'; }}
        onMouseLeave={(e) => { if (!disabled) e.currentTarget.style.background = 'var(--accent)'; }}
      >
        <SendIcon />
      </button>
    </div>
  );
}

function SendIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}
