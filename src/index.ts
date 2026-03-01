import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { Env } from './types';
import { securityHeaders, requestId } from './middleware';
import { chatRouter } from './routes/chat';
import { generateRouter } from './routes/generate';
import { analyzeRouter } from './routes/analyze';
import { wokgenRouter } from './routes/wokgen';
import { statusRouter } from './routes/status';

const app = new Hono<{ Bindings: Env }>();

// ===== MIDDLEWARE =====
app.use('*', requestId());
app.use('*', securityHeaders());
app.use('*', cors({
  origin: (origin, c) => {
    const allowed = [
      'https://wokspec.org',
      'https://www.wokspec.org',
      'https://wokgen.wokspec.org',
      'https://wokpost.wokspec.org',
      'https://chopsticks.wokspec.org',
      'https://eral.wokspec.org',
    ];
    if (c.env.ENVIRONMENT !== 'production' && origin?.includes('localhost')) return origin;
    if (origin?.startsWith('chrome-extension://') || origin?.startsWith('moz-extension://')) return origin;
    return allowed.includes(origin ?? '') ? origin : null;
  },
  allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// ===== INFO =====
app.get('/', (c) => c.json({
  service: 'Eral',
  description: 'WokSpec AI — intelligent assistant across all WokSpec products',
  version: '0.1.0',
  docs: 'https://eral.wokspec.org/docs',
  endpoints: {
    chat:     'POST /v1/chat',
    generate: 'POST /v1/generate',
    analyze:  'POST /v1/analyze',
    wokgen:   'POST /v1/wokgen/prompt',
    status:   'GET  /v1/status',
  },
}));

app.get('/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }));

// ===== ROUTES =====
app.route('/v1/chat', chatRouter);
app.route('/v1/generate', generateRouter);
app.route('/v1/analyze', analyzeRouter);
app.route('/v1/wokgen', wokgenRouter);
app.route('/v1/status', statusRouter);

// ===== ERROR HANDLERS =====
app.notFound((c) =>
  c.json({ data: null, error: { code: 'NOT_FOUND', message: 'Route not found', status: 404 } }, 404)
);

app.onError((err, c) => {
  console.error('[Eral Error]', err);
  return c.json(
    { data: null, error: { code: 'INTERNAL_ERROR', message: 'Internal server error', status: 500 } },
    500
  );
});

export default app;
