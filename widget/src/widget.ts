// ============================================================
// Eral Widget — embeddable AI chat for any website
//
// Usage:
//   <script src="https://eral.wokspec.org/api/widget.js"
//           data-eral-key="eral_your_api_key"
//           data-eral-name="Eral"
//           data-eral-color="#7c3aed"
//           data-eral-position="bottom-right"
//           data-eral-greeting="Hi! How can I help?"
//   ></script>
//
// Or imperatively:
//   window.Eral.init({ apiKey: 'eral_...', name: 'Eral' })
//   window.Eral.open()
//   window.Eral.close()
//   window.Eral.destroy()
// ============================================================

const ERAL_API = 'https://eral.wokspec.org/api';

interface EralConfig {
  apiKey: string;
  name?: string;
  color?: string;
  position?: 'bottom-right' | 'bottom-left';
  greeting?: string;
  placeholder?: string;
  apiUrl?: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  id: string;
}

// ── Styles ────────────────────────────────────────────────────────────────────

function injectStyles(color: string): void {
  if (document.getElementById('__eral_styles__')) return;
  const style = document.createElement('style');
  style.id = '__eral_styles__';
  style.textContent = `
    #__eral_root__ * { box-sizing: border-box; font-family: system-ui, -apple-system, sans-serif; }
    #__eral_root__ { position: fixed; z-index: 2147483647; }
    .eral-btn {
      width: 52px; height: 52px; border-radius: 50%;
      background: ${color}; border: none; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 4px 24px rgba(0,0,0,0.28);
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .eral-btn:hover { transform: scale(1.08); box-shadow: 0 6px 32px rgba(0,0,0,0.38); }
    .eral-panel {
      width: 360px; height: 520px; border-radius: 16px;
      background: #111; border: 1px solid #2a2a2a;
      display: flex; flex-direction: column;
      box-shadow: 0 8px 48px rgba(0,0,0,0.48);
      overflow: hidden; transition: opacity 0.2s, transform 0.2s;
    }
    .eral-panel.eral-hidden { opacity: 0; pointer-events: none; transform: translateY(12px) scale(0.97); }
    .eral-header {
      padding: 14px 16px; background: #141414; border-bottom: 1px solid #222;
      display: flex; align-items: center; justify-content: space-between;
    }
    .eral-header-title { display: flex; align-items: center; gap: 10px; }
    .eral-avatar {
      width: 30px; height: 30px; border-radius: 50%;
      background: ${color}; display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 13px; color: #fff;
    }
    .eral-name { font-weight: 600; font-size: 14px; color: #f5f5f5; }
    .eral-badge { font-size: 10px; color: #888; margin-top: 1px; }
    .eral-close {
      background: none; border: none; cursor: pointer;
      color: #666; font-size: 18px; padding: 4px; border-radius: 6px;
      transition: color 0.15s;
    }
    .eral-close:hover { color: #f5f5f5; }
    .eral-messages {
      flex: 1; overflow-y: auto; padding: 16px 14px;
      display: flex; flex-direction: column; gap: 12px;
    }
    .eral-messages::-webkit-scrollbar { width: 4px; }
    .eral-messages::-webkit-scrollbar-track { background: transparent; }
    .eral-messages::-webkit-scrollbar-thumb { background: #333; border-radius: 4px; }
    .eral-msg { display: flex; gap: 8px; max-width: 100%; }
    .eral-msg.eral-user { flex-direction: row-reverse; }
    .eral-bubble {
      padding: 10px 13px; border-radius: 14px; font-size: 13.5px; line-height: 1.5;
      max-width: 82%; white-space: pre-wrap; word-break: break-word;
    }
    .eral-user .eral-bubble { background: ${color}; color: #fff; border-bottom-right-radius: 4px; }
    .eral-assistant .eral-bubble { background: #1e1e1e; color: #e8e8e8; border-bottom-left-radius: 4px; border: 1px solid #2a2a2a; }
    .eral-typing span {
      display: inline-block; width: 6px; height: 6px; margin: 0 2px;
      background: #666; border-radius: 50%; animation: eral-bounce 1.2s infinite;
    }
    .eral-typing span:nth-child(2) { animation-delay: 0.2s; }
    .eral-typing span:nth-child(3) { animation-delay: 0.4s; }
    @keyframes eral-bounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-6px)} }
    .eral-input-row {
      padding: 12px 14px; border-top: 1px solid #222; background: #141414;
      display: flex; gap: 8px; align-items: flex-end;
    }
    .eral-textarea {
      flex: 1; background: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 10px;
      color: #f0f0f0; font-size: 13.5px; padding: 9px 12px;
      resize: none; min-height: 40px; max-height: 100px; outline: none;
      transition: border-color 0.15s; line-height: 1.4;
    }
    .eral-textarea:focus { border-color: ${color}; }
    .eral-textarea::placeholder { color: #555; }
    .eral-send {
      width: 36px; height: 36px; flex-shrink: 0; border-radius: 8px;
      background: ${color}; border: none; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: opacity 0.15s;
    }
    .eral-send:disabled { opacity: 0.4; cursor: not-allowed; }
    .eral-send svg { width: 16px; height: 16px; fill: #fff; }
    .eral-powered { text-align: center; padding: 6px; font-size: 10px; color: #444; }
    .eral-powered a { color: #555; text-decoration: none; }
    .eral-powered a:hover { color: #888; }
    @media (max-width: 480px) {
      .eral-panel { width: calc(100vw - 20px); height: 70vh; border-radius: 12px; }
    }
  `;
  document.head.appendChild(style);
}

// ── Widget class ──────────────────────────────────────────────────────────────

class EralWidgetInstance {
  private config: Required<EralConfig>;
  private root!: HTMLElement;
  private panel!: HTMLElement;
  private messagesEl!: HTMLElement;
  private textarea!: HTMLTextAreaElement;
  private sendBtn!: HTMLButtonElement;
  private messages: Message[] = [];
  private sessionId = crypto.randomUUID();
  private loading = false;
  private open = false;

  constructor(config: EralConfig) {
    this.config = {
      name: 'Eral',
      color: '#7c3aed',
      position: 'bottom-right',
      greeting: 'Hi! I\'m Eral, your AI assistant. How can I help?',
      placeholder: 'Ask me anything...',
      apiUrl: ERAL_API,
      ...config,
    };
  }

  init(): void {
    if (document.getElementById('__eral_root__')) return;
    injectStyles(this.config.color);
    this.buildDOM();
    this.addGreeting();
  }

  private buildDOM(): void {
    this.root = document.createElement('div');
    this.root.id = '__eral_root__';
    this.root.style.cssText = this.config.position === 'bottom-right'
      ? 'bottom:20px;right:20px;'
      : 'bottom:20px;left:20px;';

    // Panel
    this.panel = document.createElement('div');
    this.panel.className = 'eral-panel eral-hidden';
    this.panel.style.marginBottom = '12px';

    this.panel.innerHTML = `
      <div class="eral-header">
        <div class="eral-header-title">
          <div class="eral-avatar">${this.config.name[0]}</div>
          <div>
            <div class="eral-name">${this.config.name}</div>
            <div class="eral-badge">AI · WokSpec</div>
          </div>
        </div>
        <button class="eral-close" aria-label="Close">✕</button>
      </div>
      <div class="eral-messages"></div>
      <div class="eral-input-row">
        <textarea class="eral-textarea" rows="1" placeholder="${this.config.placeholder}"></textarea>
        <button class="eral-send" aria-label="Send">
          <svg viewBox="0 0 24 24"><path d="M2 21l21-9L2 3v7l15 2-15 2v7z"/></svg>
        </button>
      </div>
      <div class="eral-powered">Powered by <a href="https://eral.wokspec.org" target="_blank">Eral</a></div>
    `;

    this.messagesEl = this.panel.querySelector('.eral-messages')!;
    this.textarea = this.panel.querySelector('.eral-textarea')!;
    this.sendBtn = this.panel.querySelector('.eral-send')!;

    // Toggle button
    const btn = document.createElement('button');
    btn.className = 'eral-btn';
    btn.setAttribute('aria-label', 'Open Eral AI');
    btn.innerHTML = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>`;

    this.root.appendChild(this.panel);
    this.root.appendChild(btn);
    document.body.appendChild(this.root);

    // Events
    btn.addEventListener('click', () => this.toggle());
    this.panel.querySelector('.eral-close')!.addEventListener('click', () => this.close());
    this.sendBtn.addEventListener('click', () => this.send());
    this.textarea.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); this.send(); }
    });
    this.textarea.addEventListener('input', () => {
      this.textarea.style.height = 'auto';
      this.textarea.style.height = Math.min(this.textarea.scrollHeight, 100) + 'px';
    });
  }

  private addGreeting(): void {
    this.pushMessage({ role: 'assistant', content: this.config.greeting, id: 'greeting' });
  }

  private pushMessage(msg: Message): void {
    this.messages.push(msg);
    const el = document.createElement('div');
    el.className = `eral-msg eral-${msg.role}`;
    el.dataset.id = msg.id;
    el.innerHTML = `<div class="eral-bubble">${msg.content.replace(/</g, '&lt;')}</div>`;
    this.messagesEl.appendChild(el);
    this.messagesEl.scrollTop = this.messagesEl.scrollHeight;
  }

  private showTyping(): HTMLElement {
    const el = document.createElement('div');
    el.className = 'eral-msg eral-assistant';
    el.id = '__eral_typing__';
    el.innerHTML = `<div class="eral-bubble eral-typing"><span></span><span></span><span></span></div>`;
    this.messagesEl.appendChild(el);
    this.messagesEl.scrollTop = this.messagesEl.scrollHeight;
    return el;
  }

  private async send(): Promise<void> {
    const text = this.textarea.value.trim();
    if (!text || this.loading) return;

    this.textarea.value = '';
    this.textarea.style.height = 'auto';
    this.loading = true;
    this.sendBtn.disabled = true;

    this.pushMessage({ role: 'user', content: text, id: crypto.randomUUID() });
    const typing = this.showTyping();

    try {
      const res = await fetch(`${this.config.apiUrl}/v1/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
          'X-Eral-Source': 'widget',
        },
        body: JSON.stringify({ message: text, sessionId: this.sessionId }),
      });

      typing.remove();

      if (!res.ok) {
        const err = await res.json() as { error?: { message?: string } };
        this.pushMessage({ role: 'assistant', content: err.error?.message ?? 'Something went wrong.', id: crypto.randomUUID() });
        return;
      }

      const data = await res.json() as { data: { response: string } };
      this.pushMessage({ role: 'assistant', content: data.data.response, id: crypto.randomUUID() });
    } catch {
      typing.remove();
      this.pushMessage({ role: 'assistant', content: 'Connection error. Please try again.', id: crypto.randomUUID() });
    } finally {
      this.loading = false;
      this.sendBtn.disabled = false;
      this.textarea.focus();
    }
  }

  toggle(): void { this.open ? this.close() : this.openPanel(); }

  openPanel(): void {
    this.open = true;
    this.panel.classList.remove('eral-hidden');
    this.textarea.focus();
  }

  close(): void {
    this.open = false;
    this.panel.classList.add('eral-hidden');
  }

  destroy(): void {
    this.root.remove();
    document.getElementById('__eral_styles__')?.remove();
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

let _instance: EralWidgetInstance | null = null;

const Eral = {
  init(config: EralConfig): void {
    if (_instance) _instance.destroy();
    _instance = new EralWidgetInstance(config);
    _instance.init();
  },
  open(): void { _instance?.openPanel(); },
  close(): void { _instance?.close(); },
  destroy(): void { _instance?.destroy(); _instance = null; },
};

// Auto-init from data attributes on the script tag
function autoInit(): void {
  const script =
    document.currentScript as HTMLScriptElement | null
    ?? document.querySelector<HTMLScriptElement>('script[data-eral-key]');

  if (!script) return;

  const apiKey = script.dataset.eralKey;
  if (!apiKey) return;

  Eral.init({
    apiKey,
    name:      script.dataset.eralName,
    color:     script.dataset.eralColor,
    position:  (script.dataset.eralPosition as EralConfig['position']) ?? 'bottom-right',
    greeting:  script.dataset.eralGreeting,
    placeholder: script.dataset.eralPlaceholder,
    apiUrl:    script.dataset.eralApiUrl,
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', autoInit);
} else {
  autoInit();
}

// Expose on window
declare global { interface Window { Eral: typeof Eral } }
window.Eral = Eral;
