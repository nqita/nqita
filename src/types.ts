// ============================================================
// Eral — WokSpec AI
// Cloudflare Worker bindings & shared type definitions
// ============================================================

export interface Env {
  // KV Namespaces
  KV_SESSIONS: KVNamespace;          // Shared with WokAPI — session verification
  KV_RATE_LIMITS: KVNamespace | undefined;
  KV_MEMORY: KVNamespace | undefined; // Conversation memory store

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
  | 'post'        // Social media post
  | 'caption'     // Image/video caption
  | 'code'        // Code snippet
  | 'prompt'      // AI image prompt
  | 'docs'        // Documentation / README section
  | 'email'       // Email draft
  | 'summary';    // Summary of provided content

export type AnalyzeType =
  | 'summarize'   // Concise summary
  | 'explain'     // Plain-language explanation
  | 'review'      // Code / content review with feedback
  | 'extract'     // Extract key points as a list
  | 'sentiment';  // Sentiment analysis

export interface ModelInfo {
  provider: 'openai' | 'cloudflare';
  model: string;
  fallback: boolean;
}
