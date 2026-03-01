import type { EralUser } from '../types';

/**
 * Build an enriched context string that gives Eral knowledge about the
 * current user and any page/product context provided by the client.
 */
export function buildContext(options: {
  user: EralUser;
  pageContext?: string;
  product?: 'woksite' | 'wokgen' | 'wokpost' | 'chopsticks' | 'extension';
}): string {
  const lines: string[] = [
    `Current user: ${options.user.displayName} (${options.user.email})`,
  ];

  if (options.product) {
    const descriptions: Record<NonNullable<typeof options.product>, string> = {
      woksite:    'WokSite — the WokSpec main hub (bookings, SSO, community)',
      wokgen:     'WokGen — AI pixel art and asset generation tool',
      wokpost:    'WokPost — workflow-focused social media for builders',
      chopsticks: 'Chopsticks — the WokSpec Discord bot dashboard',
      extension:  'WokSpec browser extension',
    };
    lines.push(`Product context: ${descriptions[options.product]}`);
  }

  if (options.pageContext) {
    lines.push(`\nPage content provided by user:\n${options.pageContext}`);
  }

  return lines.join('\n');
}

/** Product-specific system prompt extras by source product. */
export function productPromptExtras(
  product?: 'woksite' | 'wokgen' | 'wokpost' | 'chopsticks' | 'extension'
): string {
  switch (product) {
    case 'wokgen':
      return 'When discussing asset generation, you can suggest pixel art styles, color palettes, and ComfyUI workflow tips.';
    case 'wokpost':
      return 'When helping with posts, optimize for developer and builder audiences. Suggest relevant hashtags and formatting.';
    case 'chopsticks':
      return 'You have knowledge of Discord bot commands, economy systems, and community management within WokSpec.';
    case 'extension':
      return 'You are running in the WokSpec browser extension. Help users understand and interact with the current web page.';
    default:
      return '';
  }
}
