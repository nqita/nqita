// ============================================================
// Eral — WokSpec AI
// Cloudflare Worker bindings & shared type definitions
// ============================================================

export interface Env {
  // KV Namespaces
  KV_SESSIONS: KVNamespace;
  KV_RATE_LIMITS: KVNamespace | undefined;
  KV_MEMORY: KVNamespace | undefined;
  KV_API_KEYS: KVNamespace | undefined; // API keys for external site integration

  // Cloudflare Workers AI (fallback when OpenAI key absent)
  AI: Ai | undefined;

  // Secrets
  JWT_SECRET: string;
  OPENAI_API_KEY: string | undefined;
  SENTRY_DSN: string | undefined;

  ENVIRONMENT: string;
}

// ── Auth ─────────────────────────────────────────────────────────────────────

export interface EralUser {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
}

/** Auth context — populated by either JWT or API key */
export interface EralAuth {
  user: EralUser | null;
  /** API key record when authenticated via key (external sites / bots) */
  apiKey: ApiKeyRecord | null;
  /** How this request was authenticated */
  method: 'jwt' | 'apikey' | 'none';
}

export interface ApiKeyRecord {
  id: string;           // key id (prefix of the key, safe to store)
  name: string;         // human label e.g. "My Site" or "Discord Bot"
  ownerId: string;      // WokSpec user id who created it
  scopes: ApiKeyScope[];
  createdAt: string;
  lastUsedAt: string | null;
}

export type ApiKeyScope = 'chat' | 'generate' | 'analyze' | 'wokgen' | '*';

// ── API Responses ─────────────────────────────────────────────────────────────

export interface ApiSuccessResponse<T> {
  data: T;
  error: null;
}

export interface ApiErrorResponse {
  data: null;
  error: {
    code: string;
    message: string;
    status: number;
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// ── AI ────────────────────────────────────────────────────────────────────────

export type MessageRole = 'system' | 'user' | 'assistant';

export interface Message {
  role: MessageRole;
  content: string;
}

export type GenerateType =
  | 'post'
  | 'caption'
  | 'code'
  | 'prompt'
  | 'docs'
  | 'email'
  | 'summary';

export type AnalyzeType =
  | 'summarize'
  | 'explain'
  | 'review'
  | 'extract'
  | 'sentiment';

export interface ModelInfo {
  provider: 'openai' | 'cloudflare';
  model: string;
  fallback: boolean;
}
