'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { MessageBubble, TypingIndicator, type Message } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { sendChat, getSessions, getSession, deleteSession } from '@/lib/eral';

let msgCounter = 0;
function uid() {
  return `msg-${++msgCounter}-${Date.now()}`;
}

export function ChatInterface() {
  const [sessions, setSessions] = useState<string[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | undefined>(undefined);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Expose session state to Sidebar via custom event
  const emitSessionsUpdate = useCallback((sess: string[], activeId?: string) => {
    window.dispatchEvent(
      new CustomEvent('eral:sessions', { detail: { sessions: sess, activeSessionId: activeId } }),
    );
  }, []);

  const loadSessions = useCallback(async () => {
    try {
      const res = await getSessions();
      const sess = res.data?.sessions ?? [];
      setSessions(sess);
      emitSessionsUpdate(sess, activeSessionId);
    } catch {
      // silently fail — user may not have sessions yet
    }
  }, [activeSessionId, emitSessionsUpdate]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  // Listen for sidebar events
  useEffect(() => {
    const onNewChat = () => {
      setActiveSessionId(undefined);
      setMessages([]);
      setError(null);
    };
    const onSelectSession = async (e: Event) => {
      const id = (e as CustomEvent<string>).detail;
      setActiveSessionId(id);
      setError(null);
      setIsLoading(true);
      try {
        const res = await getSession(id);
        const msgs: Message[] = (res.data?.messages ?? []).map((m) => ({
          id: uid(),
          role: m.role as 'user' | 'assistant',
          content: m.content,
        }));
        setMessages(msgs);
      } catch (err) {
        setError('Failed to load session.');
      } finally {
        setIsLoading(false);
      }
    };
    const onDeleteSession = async (e: Event) => {
      const id = (e as CustomEvent<string>).detail;
      try {
        await deleteSession(id);
        const next = sessions.filter((s) => s !== id);
        setSessions(next);
        emitSessionsUpdate(next, activeSessionId === id ? undefined : activeSessionId);
        if (activeSessionId === id) {
          setActiveSessionId(undefined);
          setMessages([]);
        }
      } catch {
        setError('Failed to delete session.');
      }
    };

    window.addEventListener('eral:new-chat', onNewChat);
    window.addEventListener('eral:select-session', onSelectSession as EventListener);
    window.addEventListener('eral:delete-session', onDeleteSession as EventListener);
    return () => {
      window.removeEventListener('eral:new-chat', onNewChat);
      window.removeEventListener('eral:select-session', onSelectSession as EventListener);
      window.removeEventListener('eral:delete-session', onDeleteSession as EventListener);
    };
  }, [sessions, activeSessionId, emitSessionsUpdate]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (text: string) => {
    if (isLoading) return;
    setError(null);

    const userMsg: Message = { id: uid(), role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const res = await sendChat(text, activeSessionId);
      const newSessionId = res.data?.sessionId;
      const assistantMsg: Message = {
        id: uid(),
        role: 'assistant',
        content: res.data?.response ?? '(no response)',
      };
      setMessages((prev) => [...prev, assistantMsg]);

      if (newSessionId && newSessionId !== activeSessionId) {
        setActiveSessionId(newSessionId);
        const next = sessions.includes(newSessionId) ? sessions : [newSessionId, ...sessions];
        setSessions(next);
        emitSessionsUpdate(next, newSessionId);
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Something went wrong.';
      setError(errMsg);
      setMessages((prev) => [
        ...prev,
        { id: uid(), role: 'assistant', content: `⚠️ ${errMsg}` },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1.25rem 1.25rem 0.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
        }}
      >
        {messages.length === 0 && !isLoading && (
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--muted)',
              textAlign: 'center',
              padding: '3rem 1rem',
            }}
          >
            <div
              style={{
                width: '3.5rem',
                height: '3.5rem',
                borderRadius: '1rem',
                background: 'rgba(124,58,237,0.15)',
                border: '1px solid rgba(124,58,237,0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--font-heading)',
                fontWeight: 700,
                fontSize: '1.5rem',
                color: 'var(--accent)',
                marginBottom: '1rem',
              }}
            >
              E
            </div>
            <p style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--foreground)', marginBottom: '0.375rem' }}>
              How can I help you today?
            </p>
            <p style={{ fontSize: '0.875rem' }}>Ask me anything — I&apos;m Eral, your WokSpec AI.</p>
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {isLoading && <TypingIndicator />}

        <div ref={bottomRef} />
      </div>

      {error && (
        <div
          style={{
            margin: '0 1.25rem',
            padding: '0.625rem 0.875rem',
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: '0.5rem',
            fontSize: '0.8125rem',
            color: '#f87171',
          }}
        >
          {error}
        </div>
      )}

      <ChatInput onSend={handleSend} disabled={isLoading} />
    </div>
  );
}
