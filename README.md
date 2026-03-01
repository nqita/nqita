# Eral — WokSpec AI

Eral is the intelligent AI layer of WokSpec. It integrates across every WokSpec product — WokSite, WokAPI, WokGen, WokPost, Chopsticks, and the browser extension — providing conversational AI, content generation, and content analysis.

## Architecture

Eral is a **Cloudflare Worker** built with [Hono](https://hono.dev), following the same patterns as WokAPI.  
It shares the WokSpec JWT secret for auth, KV namespaces for rate limiting and sessions, and uses:

- **Primary AI provider:** OpenAI GPT-4o (set `OPENAI_API_KEY`)
- **Fallback:** Cloudflare Workers AI (Llama 3.1 8B — free, edge-native)
- **Future:** Eral's own fine-tuned model (swap in `src/lib/openai.ts`)

## Endpoints

All endpoints require a valid WokSpec JWT (`Authorization: Bearer <token>`).

| Method | Path | Description |
|--------|------|-------------|
| `GET`  | `/` | Service info |
| `GET`  | `/health` | Health check |
| `GET`  | `/v1/status` | AI provider info + capabilities |
| `POST` | `/v1/chat` | Conversational AI with persistent memory |
| `GET`  | `/v1/chat/sessions` | List active sessions |
| `GET`  | `/v1/chat/:sessionId` | Retrieve session history |
| `DELETE` | `/v1/chat/:sessionId` | Clear session memory |
| `POST` | `/v1/generate` | Content generation (posts, code, docs, prompts, etc.) |
| `POST` | `/v1/analyze` | Content analysis (summarize, review, extract, etc.) |
| `POST` | `/v1/wokgen/prompt` | Generate optimized WokGen asset prompts |

## Development

```bash
# Install dependencies
npm install

# Start local dev server (port 8788)
npm run dev

# Type check
npm run type-check

# Deploy to Cloudflare
npm run deploy
```

## Configuration

Copy `.env.example` and set secrets via:

```bash
wrangler secret put JWT_SECRET      # Required — must match WokAPI
wrangler secret put OPENAI_API_KEY  # Optional — GPT-4o (best quality)
```

Create a new KV namespace for memory and update `wrangler.toml`:

```bash
wrangler kv namespace create KV_MEMORY
```

## Integration

Eral is accessible from all WokSpec products via `https://eral.wokspec.org`.  
Internal calls use the shared JWT for authentication.

WokAPI also exposes AI endpoints at `/v1/ai/*` (ask, generate, analyze) which use the same Eral model selection logic for clients that already call WokAPI.
