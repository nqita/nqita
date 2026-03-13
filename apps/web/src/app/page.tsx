'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const key = localStorage.getItem('eral_token');
    if (key) router.replace('/chat');
  }, [router]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-accent/20">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-5 md:px-12 bg-background/80 backdrop-blur-xl sticky top-0 z-50 border-b border-white/[0.03]">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="w-9 h-9 bg-accent rounded-xl flex items-center justify-center font-bold text-[11px] text-white shadow-2xl shadow-accent/40 transition-transform group-hover:scale-105 active:scale-95">
            ER
          </div>
          <span className="font-semibold text-lg tracking-tight text-white">Eral</span>
        </div>
        <div className="flex items-center gap-10">
          <a href="/docs" className="text-muted hover:text-white transition-colors text-sm font-medium hidden md:block">Documentation</a>
          <a href="/login" className="text-white hover:text-accent transition-colors text-sm font-semibold">Sign In</a>
          <a href="/login" className="bg-white text-black hover:bg-white/90 px-6 py-2.5 rounded-full font-bold text-sm transition-all shadow-lg active:scale-95">
            Get Started
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center px-6 pt-24 pb-32 md:pt-40 text-center relative">
        {/* Architectural Background */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[50%] -translate-x-1/2 w-[1000px] h-[600px] bg-accent/10 rounded-full blur-[160px] opacity-40" />
          <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
        </div>

        <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-10 animate-in">
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          <span className="text-[11px] font-bold text-muted uppercase tracking-[0.2em]">Supercharged by Groq LPU</span>
        </div>

        <h1 className="text-6xl md:text-8xl font-bold tracking-tight leading-[1.05] mb-10 max-w-5xl text-white text-balance animate-in" style={{ animationDelay: '0.1s' }}>
          Intelligence built for <br className="hidden md:block" />
          the <span className="text-accent">WokSpec</span> ecosystem.
        </h1>

        <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl leading-relaxed mb-14 animate-in" style={{ animationDelay: '0.2s' }}>
          Context-aware AI that understands every layer of your workflow. 
          Analyze code, generate assets, and build faster with Eral.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 mb-28 animate-in" style={{ animationDelay: '0.3s' }}>
          <a href="/login" className="bg-accent hover:bg-accent-hover text-white px-10 py-5 rounded-2xl font-bold text-lg transition-all shadow-2xl shadow-accent/30 active:scale-95 flex items-center gap-3">
            Start Chatting
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </a>
          <a href="https://wokspec.org" className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-10 py-5 rounded-2xl font-bold text-lg transition-all active:scale-95 backdrop-blur-sm">
            Ecosystem
          </a>
        </div>

        {/* Dynamic Features Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 max-w-7xl w-full px-4 animate-in" style={{ animationDelay: '0.4s' }}>
          {/* Main Feature */}
          <div className="md:col-span-7 bg-card border border-border p-10 rounded-[32px] text-left hover:border-accent/20 transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-[80px] -mr-32 -mt-32 transition-colors group-hover:bg-accent/10" />
            <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mb-8 group-hover:scale-105 transition-transform">
              <svg className="w-7 h-7 text-accent" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
            </div>
            <h3 className="text-2xl font-bold mb-4 text-white">Full-Stack Context</h3>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-md">
              Eral understands WokSite, WokGen, Vecto, and the entire WokSpec suite. 
              Get answers that aren&apos;t just smart, but contextually perfect for where you are building.
            </p>
          </div>

          {/* Side Features Stack */}
          <div className="md:col-span-5 flex flex-col gap-6">
            <div className="bg-card border border-border p-8 rounded-[32px] text-left hover:border-accent/20 transition-all flex flex-col items-start group">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-6">
                 <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
              </div>
              <h4 className="text-xl font-bold mb-2 text-white">Developer First</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Direct, technical, and emoji-free responses optimized for professional workflows.
              </p>
            </div>
            <div className="bg-card border border-border p-8 rounded-[32px] text-left hover:border-accent/20 transition-all flex flex-col items-start group">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
              </div>
              <h4 className="text-xl font-bold mb-2 text-white">Deploy Anywhere</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Universal widget and extension support. Bring Eral to your own apps in seconds.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 pt-24 pb-16 px-6 md:px-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-accent/20 rounded-lg flex items-center justify-center font-bold text-[10px] text-accent">
                ER
              </div>
              <span className="text-lg font-bold tracking-tight text-white">Eral Intelligence</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
              Advancing the WokSpec ecosystem through context-aware artificial intelligence.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-16 md:gap-24">
            <div className="flex flex-col gap-5">
              <span className="text-[11px] font-bold text-white uppercase tracking-[0.2em]">Product</span>
              <a href="/chat" className="text-sm text-muted-foreground hover:text-white transition-colors">Chat</a>
              <a href="/docs" className="text-sm text-muted-foreground hover:text-white transition-colors">API Docs</a>
              <a href="/keys" className="text-sm text-muted-foreground hover:text-white transition-colors">API Keys</a>
            </div>
            <div className="flex flex-col gap-5">
              <span className="text-[11px] font-bold text-white uppercase tracking-[0.2em]">Company</span>
              <a href="https://wokspec.org" className="text-sm text-muted-foreground hover:text-white transition-colors">WokSpec</a>
              <a href="#" className="text-sm text-muted-foreground hover:text-white transition-colors">About</a>
              <a href="#" className="text-sm text-muted-foreground hover:text-white transition-colors">Legal</a>
            </div>
            <div className="flex flex-col gap-5">
              <span className="text-[11px] font-bold text-white uppercase tracking-[0.2em]">Ecosystem</span>
              <a href="https://wokpost.wokspec.org" className="text-sm text-muted-foreground hover:text-white transition-colors">WokPost</a>
              <a href="https://wokgen.wokspec.org" className="text-sm text-muted-foreground hover:text-white transition-colors">WokGen</a>
              <a href="https://woktool.wokspec.org" className="text-sm text-muted-foreground hover:text-white transition-colors">WokTool</a>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-24 flex justify-between items-center border-t border-white/5 pt-8">
          <p className="text-[11px] text-muted font-medium uppercase tracking-[0.1em]">
            © 2026 WOKSPEC. DESIGNED FOR BUILDERS.
          </p>
          <div className="flex gap-6">
             <div className="w-2 h-2 rounded-full bg-green-500/20 flex items-center justify-center">
               <div className="w-1 h-1 rounded-full bg-green-500" />
             </div>
             <span className="text-[10px] font-bold text-muted uppercase tracking-widest">Systems Nominal</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
