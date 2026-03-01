import type { Context, Next, MiddlewareHandler } from 'hono';
import type { Env } from '../types';
import { verifyToken } from '../lib/jwt';
import { checkRateLimit } from '../lib/rate-limit';

export const securityHeaders = (): MiddlewareHandler<{ Bindings: Env }> => {
  return async (c, next) => {
    await next();
    c.header('X-Content-Type-Options', 'nosniff');
    c.header('X-Frame-Options', 'DENY');
    c.header('Referrer-Policy', 'strict-origin-when-cross-origin');
    c.header('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    c.header(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self'; object-src 'none'; frame-ancestors 'none';"
    );
    if (c.env.ENVIRONMENT === 'production') {
      c.header('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
    }
  };
};

export const requestId = (): MiddlewareHandler => {
  return async (c, next) => {
    const id = c.req.header('cf-ray') ?? crypto.randomUUID();
    c.set('requestId' as never, id);
    await next();
    c.header('X-Request-ID', id);
  };
};

export const rateLimit = (
  type: 'default' | 'chat' | 'generate' | 'analyze' | 'wokgen' = 'default'
): MiddlewareHandler<{ Bindings: Env }> => {
  return async (c, next) => {
    const ip = c.req.header('cf-connecting-ip') ?? c.req.header('x-forwarded-for') ?? 'unknown';
    const result = await checkRateLimit(c.env.KV_RATE_LIMITS, ip, type);
    if (!result.ok) {
      c.header('Retry-After', String(result.resetIn));
      return c.json(
        { data: null, error: { code: 'RATE_LIMITED', message: 'Too many requests', status: 429 } },
        429
      );
    }
    c.header('X-RateLimit-Remaining', String(result.remaining));
    await next();
  };
};

export const requireAuth = (): MiddlewareHandler<{
  Bindings: Env;
  Variables: { user: import('../types').EralUser };
}> => {
  return async (c, next) => {
    const authHeader = c.req.header('Authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) {
      return c.json(
        { data: null, error: { code: 'UNAUTHORIZED', message: 'Authentication required', status: 401 } },
        401
      );
    }
    const user = await verifyToken(token, c.env.JWT_SECRET);
    if (!user) {
      return c.json(
        { data: null, error: { code: 'INVALID_TOKEN', message: 'Invalid or expired token', status: 401 } },
        401
      );
    }
    c.set('user', user);
    await next();
  };
};

export const optionalAuth = (): MiddlewareHandler<{
  Bindings: Env;
  Variables: { user: import('../types').EralUser | null };
}> => {
  return async (c, next) => {
    c.set('user', null);
    const authHeader = c.req.header('Authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (token) {
      const user = await verifyToken(token, c.env.JWT_SECRET);
      c.set('user', user);
    }
    await next();
  };
};
