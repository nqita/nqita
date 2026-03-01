import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import type { Env, EralUser } from '../types';
import { requireAuth, rateLimit } from '../middleware';
import { run, eralSystemPrompt } from '../lib/openai';
import { getMemory, appendMemory, clearMemory, listSessions } from '../lib/memory';
import { buildContext, productPromptExtras } from '../lib/context';

const chat = new Hono<{ Bindings: Env; Variables: { user: EralUser } }>();
chat.use('*', requireAuth());

const MessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1).max(4000),
});

const ProductSchema = z.enum(['woksite', 'wokgen', 'wokpost', 'chopsticks', 'extension']).optional();

// POST /v1/chat
// Main conversational endpoint with persistent memory per session.
chat.post(
  '/',
  rateLimit('chat'),
  zValidator('json', z.object({
    message:    z.string().min(1).max(4000),
    sessionId:  z.string().max(128).default('default'),
    product:    ProductSchema,
    pageContext: z.string().max(12000).optional(),
    history:    z.array(MessageSchema).max(10).optional(), // override — ignores stored memory
  })),
  async (c) => {
    const user = c.get('user');
    const { message, sessionId, product, pageContext, history } = c.req.valid('json');

    // Build context extras
    const userContext = buildContext({ user, product, pageContext });
    const productExtras = productPromptExtras(product);

    const systemPrompt = eralSystemPrompt(
      [productExtras, `\nUser context:\n${userContext}`].filter(Boolean).join('\n')
    );

    // Use provided history override, or retrieve stored memory
    const pastMessages = history
      ? history.map((m) => ({ role: m.role, content: m.content }))
      : await getMemory(c.env.KV_MEMORY, user.id, sessionId);

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      ...pastMessages,
      { role: 'user' as const, content: message },
    ];

    try {
      const result = await run(
        { messages, maxTokens: 1024 },
        { openaiApiKey: c.env.OPENAI_API_KEY, cfAI: c.env.AI }
      );

      // Persist this exchange to memory (fire-and-forget)
      appendMemory(c.env.KV_MEMORY, user.id, sessionId, [
        { role: 'user', content: message },
        { role: 'assistant', content: result.content },
      ]).catch(() => { /* non-fatal */ });

      return c.json({
        data: {
          response: result.content,
          sessionId,
          model: result.model,
        },
        error: null,
      });
    } catch (err) {
      console.error('[Eral/chat] Error:', err);
      return c.json(
        { data: null, error: { code: 'AI_ERROR', message: 'AI request failed', status: 500 } },
        500
      );
    }
  }
);

// DELETE /v1/chat/:sessionId — clear a session's memory
chat.delete(
  '/:sessionId',
  async (c) => {
    const user = c.get('user');
    const sessionId = c.req.param('sessionId');
    await clearMemory(c.env.KV_MEMORY, user.id, sessionId);
    return c.json({ data: { ok: true }, error: null });
  }
);

// GET /v1/chat/sessions — list all active sessions for the user
chat.get('/sessions', async (c) => {
  const user = c.get('user');
  const sessions = await listSessions(c.env.KV_MEMORY, user.id);
  return c.json({ data: { sessions }, error: null });
});

// GET /v1/chat/:sessionId — retrieve memory for a session
chat.get(
  '/:sessionId',
  async (c) => {
    const user = c.get('user');
    const sessionId = c.req.param('sessionId');
    const messages = await getMemory(c.env.KV_MEMORY, user.id, sessionId);
    return c.json({ data: { sessionId, messages }, error: null });
  }
);

export { chat as chatRouter };
