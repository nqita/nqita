const ERAL_API = process.env.NEXT_PUBLIC_ERAL_API_URL ?? 'https://eral.wokspec.org/api';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatResponse {
  data: {
    response: string;
    sessionId: string;
    model: { provider: string; model: string };
  };
  error: null | string;
}

export interface SessionsResponse {
  data: { sessions: string[] };
  error: null | string;
}

export interface SessionResponse {
  data: { sessionId: string; messages: ChatMessage[] };
  error: null | string;
}

export interface GenerateParams {
  type: 'post' | 'caption' | 'code' | 'prompt' | 'docs' | 'email' | 'summary';
  topic: string;
  tone?: string;
  length?: string;
}

export interface AnalyzeParams {
  type: 'summarize' | 'explain' | 'review' | 'extract' | 'sentiment';
  content: string;
}

function headers(): HeadersInit {
  return { 'Content-Type': 'application/json' };
}

function fetchOptions(method: string, body?: unknown): RequestInit {
  return {
    method,
    credentials: 'include',
    headers: headers(),
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  };
}

export async function sendChat(
  message: string,
  sessionId?: string,
  product?: string,
): Promise<ChatResponse> {
  const res = await fetch(`${ERAL_API}/v1/chat`, fetchOptions('POST', { message, sessionId, product }));
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json() as Promise<ChatResponse>;
}

export async function getSessions(): Promise<SessionsResponse> {
  const res = await fetch(`${ERAL_API}/v1/chat/sessions`, fetchOptions('GET'));
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<SessionsResponse>;
}

export async function getSession(sessionId: string): Promise<SessionResponse> {
  const res = await fetch(`${ERAL_API}/v1/chat/${encodeURIComponent(sessionId)}`, fetchOptions('GET'));
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<SessionResponse>;
}

export async function deleteSession(sessionId: string): Promise<void> {
  const res = await fetch(`${ERAL_API}/v1/chat/${encodeURIComponent(sessionId)}`, fetchOptions('DELETE'));
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
}

export async function generate(params: GenerateParams): Promise<{ data: { result: string }; error: null | string }> {
  const res = await fetch(`${ERAL_API}/v1/generate`, fetchOptions('POST', params));
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function analyze(params: AnalyzeParams): Promise<{ data: { result: string }; error: null | string }> {
  const res = await fetch(`${ERAL_API}/v1/analyze`, fetchOptions('POST', params));
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function getStatus(): Promise<unknown> {
  const res = await fetch(`${ERAL_API}/v1/status`, fetchOptions('GET'));
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
