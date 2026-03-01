import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import type { Env, EralUser, GenerateType } from '../types';
import { requireAuth, rateLimit } from '../middleware';
import { run, eralSystemPrompt } from '../lib/openai';

const generate = new Hono<{ Bindings: Env; Variables: { user: EralUser } }>();
generate.use('*', requireAuth());

const GENERATE_INSTRUCTIONS: Record<GenerateType, string> = {
  post:    'Write a compelling social media post for a developer/builder audience. Be authentic, concise, and engaging. Include relevant hashtags at the end.',
  caption: 'Write a short, punchy caption suitable for an image or video. Keep it under 150 characters if possible.',
  code:    'Write clean, well-commented code. Follow best practices for the language or framework mentioned. Include a brief explanation after the code block.',
  prompt:  'Write a detailed AI image generation prompt. Be descriptive about style, lighting, composition, colors, and mood. Format as a single flowing description.',
  docs:    'Write clear, developer-friendly documentation. Use markdown formatting with headers, code blocks, and examples where appropriate.',
  email:   'Write a professional but friendly email. Keep it concise and action-oriented.',
  summary: 'Write a concise summary that captures the key points. Use bullet points for clarity.',
};

// POST /v1/generate
generate.post(
  '/',
  rateLimit('generate'),
  zValidator('json', z.object({
    type:    z.enum(['post', 'caption', 'code', 'prompt', 'docs', 'email', 'summary']),
    topic:   z.string().min(1).max(2000).describe('What to generate content about'),
    context: z.string().max(8000).optional().describe('Additional context or existing content'),
    tone:    z.enum(['professional', 'casual', 'technical', 'playful']).default('casual'),
    length:  z.enum(['short', 'medium', 'long']).default('medium'),
    product: z.enum(['woksite', 'wokgen', 'wokpost', 'chopsticks']).optional(),
  })),
  async (c) => {
    const user = c.get('user');
    const { type, topic, context, tone, length, product } = c.req.valid('json');

    const lengthGuidance: Record<string, string> = {
      short:  'Keep it brief — under 100 words.',
      medium: 'Aim for 100–300 words.',
      long:   'Be comprehensive — 300+ words, with examples where helpful.',
    };

    const toneGuidance: Record<string, string> = {
      professional: 'Use a professional, polished tone.',
      casual:       'Use a casual, conversational tone — like a builder talking to fellow builders.',
      technical:    'Use precise technical language. Assume an experienced developer audience.',
      playful:      'Use a fun, energetic tone with personality.',
    };

    const systemPrompt = eralSystemPrompt(
      `You are generating ${type} content for ${user.displayName}, a WokSpec user.`
    );

    const userMessage = [
      `Generate a ${type} about: ${topic}`,
      context ? `\nContext/Reference:\n${context}` : '',
      toneGuidance[tone],
      lengthGuidance[length],
      GENERATE_INSTRUCTIONS[type as GenerateType],
      product ? `This is for use in WokSpec's ${product} product.` : '',
    ].filter(Boolean).join('\n');

    try {
      const result = await run(
        {
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage },
          ],
          maxTokens: length === 'long' ? 2048 : length === 'medium' ? 1024 : 512,
          temperature: tone === 'playful' ? 0.9 : 0.7,
        },
        { openaiApiKey: c.env.OPENAI_API_KEY, cfAI: c.env.AI }
      );

      return c.json({
        data: {
          type,
          content: result.content,
          model: result.model,
        },
        error: null,
      });
    } catch (err) {
      console.error('[Eral/generate] Error:', err);
      return c.json(
        { data: null, error: { code: 'AI_ERROR', message: 'Generation failed', status: 500 } },
        500
      );
    }
  }
);

export { generate as generateRouter };
