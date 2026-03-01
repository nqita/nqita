import type { Message, ModelInfo } from '../types';

// ── Provider interface ────────────────────────────────────────────────────────

export interface RunOptions {
  messages: Message[];
  maxTokens?: number;
  temperature?: number;
  stream?: false; // streaming handled separately
}

export interface RunResult {
  content: string;
  model: ModelInfo;
}

// ── OpenAI GPT-4o ─────────────────────────────────────────────────────────────

async function runOpenAI(
  apiKey: string,
  options: RunOptions
): Promise<RunResult> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: options.messages,
      max_tokens: options.maxTokens ?? 1024,
      temperature: options.temperature ?? 0.7,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI error ${res.status}: ${err}`);
  }

  const data = await res.json<{
    choices: Array<{ message: { content: string } }>;
  }>();

  return {
    content: data.choices[0]?.message?.content ?? '',
    model: { provider: 'openai', model: 'gpt-4o', fallback: false },
  };
}

// ── Cloudflare Workers AI (fallback) ──────────────────────────────────────────

async function runCloudflareAI(
  ai: Ai,
  options: RunOptions
): Promise<RunResult> {
  const result = await ai.run(
    '@cf/meta/llama-3.1-8b-instruct' as Parameters<Ai['run']>[0],
    {
      messages: options.messages.map((m) => ({
        role: m.role as 'system' | 'user' | 'assistant',
        content: m.content,
      })),
      max_tokens: options.maxTokens ?? 1024,
    }
  ) as { response?: string };

  return {
    content: result.response ?? '',
    model: { provider: 'cloudflare', model: 'llama-3.1-8b-instruct', fallback: true },
  };
}

// ── Unified run function ──────────────────────────────────────────────────────

/**
 * Run an inference request.
 * Uses OpenAI GPT-4o when an API key is available; falls back to Cloudflare
 * Workers AI. This abstraction lets us swap to Eral's own model in the future
 * by replacing the logic here without touching any route code.
 */
export async function run(
  options: RunOptions,
  providers: { openaiApiKey?: string; cfAI?: Ai }
): Promise<RunResult> {
  if (providers.openaiApiKey) {
    return runOpenAI(providers.openaiApiKey, options);
  }
  if (providers.cfAI) {
    return runCloudflareAI(providers.cfAI, options);
  }
  throw new Error('No AI provider configured. Set OPENAI_API_KEY or enable the AI binding.');
}

/** Build the shared Eral system prompt. */
export function eralSystemPrompt(extras?: string): string {
  return [
    'You are Eral, the intelligent AI assistant built into WokSpec — a suite of tools for indie developers, creators, and builders.',
    'You have deep knowledge of all WokSpec products:',
    '  • WokSite   — main hub, SSO, bookings, community (wokspec.org)',
    '  • WokAPI    — unified API layer with authentication for all products',
    '  • WokGen    — AI-powered asset generation: pixel art, images, media',
    '  • WokPost   — workflow-focused social media platform for builders',
    '  • Chopsticks — Discord bot for builder communities',
    '  • Eral      — that\'s you! The AI layer powering intelligence across WokSpec',
    '',
    'Be concise, helpful, and direct. You understand developer workflows, content creation, and building products.',
    'When referencing WokSpec products, you can suggest relevant features.',
    extras ?? '',
  ].filter(Boolean).join('\n');
}
