# Eral — Architecture

## Overview

Eral is a Cloudflare Worker built with Hono that acts as WokSpec's shared AI service. It is fronted by WokAPI at `/v1/ai/*` for most products, but can also be called directly by those that deploy Eral's widget or extension.

Eral's design priorities:
1. **Free first** — default to Cloudflare Workers AI (billed against Cloudflare account, not per-call)
2. **Memory** — every conversation is stored in KV keyed by `session:<id>`, giving Eral consistent context across pages and sessions
3. **Context-aware** — integration metadata from the calling product shapes prompt construction without hardcoding product logic in Eral

---

## Component Map

```
Eral Worker (Cloudflare Workers)
  ├── apps/api/               Hono application
  │   ├── routes/chat.ts      Stateful conversation + KV memory
  │   ├── routes/generate.ts  One-shot generation + transforms
  │   ├── routes/analyze.ts   Summarize / review / extract
  │   └── middleware/
  │       ├── auth.ts         JWT verification (shared JWT_SECRET)
  │       └── rateLimit.ts    KV-based rate limiting per user
  │
  ├── apps/extension/         Plasmo browser extension
  │   ├── sidepanel/          Side-panel Eral UI
  │   ├── content/            Content scripts (page context, text clip)
  │   └── background/         Service worker (session management)
  │
  └── widget/                 Embeddable widget (Shadow DOM)
      ├── widget.ts           Entry point — reads data-eral-* attributes
      └── EralPanel.tsx       Chat panel React component
```

---

## AI Provider Routing

Eral selects the AI provider based on a spend policy and optional caller-specified `quality` parameter:

```
Request arrives with quality: "fast" | "balanced" | "best"

Spend policy: free-only (default)
  → always use CF Workers AI regardless of quality

Spend policy: paid-fallback
  → fast / balanced → CF Workers AI
  → best → OpenAI GPT-4o (if OPENAI_API_KEY set)

Spend policy: paid-primary
  → fast → CF Workers AI
  → balanced → Groq Llama 3.3 70B
  → best → OpenAI GPT-4o
```

Each route can also override model via environment variables:
- `CF_AI_CHAT_MODEL` (default: `@cf/meta/llama-3.3-70b-instruct-fp8-fast`)
- `CF_AI_GENERATE_MODEL`
- `CF_AI_ANALYZE_MODEL`
- `CF_AI_WOKGEN_MODEL`
- Matching `OPENAI_*` variants

---

## Session Memory (KV)

Every `/v1/chat` request with a `sessionId` reads and writes to `KV_MEMORY:<sessionId>`:

```
KV_MEMORY:sess_abc123  →
{
  "sessionId": "sess_abc123",
  "userId": "01J...",
  "messages": [
    { "role": "user", "content": "...", "ts": 1710000000 },
    { "role": "assistant", "content": "...", "ts": 1710000001 }
  ],
  "integration": { "name": "WokGen", "product": "wokgen" }
}
```

Messages are trimmed to the last N tokens before being sent to the AI provider to stay within context windows. KV TTL is 30 days; inactive sessions expire automatically.

---

## Prompt Construction

Eral builds a system prompt dynamically:

```
Base persona: "You are Eral, WokSpec's AI assistant..."
+ Integration instructions (from request.integration.instructions)
+ Product context (name, URL, capabilities)
+ User memory summary (if enabled)
```

This means the same Eral instance behaves as a pixel art advisor in WokGen, a brand consultant in Vecto, and a general assistant on wokspec.org — without any branching logic in the Worker.

---

## Widget Architecture

The widget runs entirely in a Shadow DOM to prevent style leakage:

```html
<div id="eral-widget-root">
  #shadow-root
    <link rel="stylesheet" href="...">  ← scoped styles
    <EralPanel />                        ← React app
</div>
```

It reads configuration from `data-eral-*` attributes on the `<script>` tag and exposes:
- `window.EralWidget` — primary API
- `window.Eral` — compatibility alias

The widget authenticates by exchanging the `data-eral-key` for a short-lived session token on first load.

---

## Key Design Decisions

**Why KV for memory and not D1?**  
Chat history is a blob of JSON that grows over time. KV is ideal for large opaque values read/written as a unit. D1 row-per-message would require expensive aggregation queries on every chat request.

**Why run in free-only mode by default?**  
Eral is embedded across many pages — some of which are public-facing with no user auth. Defaulting to the free Workers AI path ensures there's no unintended spend from unauthenticated widget loads.

**Why Shadow DOM for the widget?**  
Eral is designed to drop into any third-party page. Without Shadow DOM, the host page's CSS would bleed into the widget panel, making it impossible to guarantee consistent rendering.
