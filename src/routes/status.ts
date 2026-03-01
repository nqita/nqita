import { Hono } from 'hono';
import type { Env } from '../types';

const status = new Hono<{ Bindings: Env }>();

// GET /v1/status
status.get('/', async (c) => {
  const hasOpenAI = Boolean(c.env.OPENAI_API_KEY);
  const hasCFAI = Boolean(c.env.AI);
  const hasMemory = Boolean(c.env.KV_MEMORY);

  return c.json({
    data: {
      service: 'Eral',
      version: '0.1.0',
      status: 'operational',
      timestamp: new Date().toISOString(),
      capabilities: {
        chat: true,
        generate: true,
        analyze: true,
        wokgen: true,
      },
      ai: {
        provider: hasOpenAI ? 'openai' : hasCFAI ? 'cloudflare' : 'none',
        model: hasOpenAI ? 'gpt-4o' : hasCFAI ? 'llama-3.1-8b-instruct' : null,
        fallback_available: hasCFAI,
      },
      memory: {
        enabled: hasMemory,
      },
    },
    error: null,
  });
});

export { status as statusRouter };
