'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Youtube, Music2, Search, ArrowRight, Instagram, CheckCircle2, AlertCircle, Loader2, Zap, PlayCircle, Music, Monitor, Smartphone, Download, RefreshCw, HardDriveDownload } from 'lucide-react';

type Platform = 'youtube' | 'tiktok' | 'instagram' | 'none';

interface Metadata {
  title: string;
  thumbnail: string;
}

export default function Home() {
  const [url, setUrl] = useState('');
  const [platform, setPlatform] = useState<Platform>('none');
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [engineStatus, setEngineStatus] = useState<string | null>(null);
  
  const [metadata, setMetadata] = useState<Metadata | null>(null);
  const [step, setStep] = useState<'input' | 'quality'>('input');

  useEffect(() => {
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) {
      setPlatform('youtube');
    } else if (lowerUrl.includes('tiktok.com')) {
      setPlatform('tiktok');
    } else if (lowerUrl.includes('instagram.com')) {
      setPlatform('instagram');
    } else {
      setPlatform('none');
    }
  }, [url]);

  const handleAnalyze = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!url) return;

    setIsLoading(true);
    setError(null);
    setMetadata(null);
    setEngineStatus('Analyzing Metadata...');

    try {
      const response = await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, mode: 'analyze' }),
      });

      const data = await response.json();

      if (!response.ok || data.type === 'error') {
        throw new Error(data.message || 'Analysis failed.');
      }

      setMetadata(data.data);
      setStep('quality');
      setEngineStatus(null);
    } catch (err: any) {
      setError(err.message || 'Analysis failed.');
      setEngineStatus(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = (quality: string) => {
    if (!metadata) return;
    
    // Direct Browser Download via Stream
    // We use window.location.href to trigger the file download response from the server
    const downloadUrl = `/api/download?url=${encodeURIComponent(url)}&quality=${quality}&title=${encodeURIComponent(metadata.title)}`;
    
    window.location.href = downloadUrl;
  };

  const reset = () => {
    setStep('input');
    setMetadata(null);
    setUrl('');
    setEngineStatus(null);
    setError(null);
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-[#050505] px-6 text-white selection:bg-white/20">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/[0.02] blur-[120px]" />
      </div>

      <div className="z-10 w-full max-w-2xl space-y-12 text-center">
        <AnimatePresence mode="wait">
          {step === 'input' ? (
            <motion.div
              key="input-step"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12"
            >
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/5 bg-white/[0.02] px-3 py-1 text-[10px] font-bold tracking-widest text-emerald-500 uppercase">
                  <Zap size={10} className="text-emerald-500" />
                  HD Extraction Engine
                </div>
                <h1 className="mb-2 text-5xl font-bold tracking-tighter sm:text-7xl glow-text">
                  VeloStream
                </h1>
              </div>

              <div className="space-y-6">
                <form onSubmit={handleAnalyze} className="relative group">
                  <motion.div
                    animate={isLoading ? { opacity: [0.3, 0.6, 0.3] } : { opacity: 0.2 }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="absolute -inset-[1px] rounded-2xl bg-white/20 blur-sm pointer-events-none"
                  />
                  <div className={`relative flex items-center rounded-2xl border bg-black/40 backdrop-blur-xl transition-all duration-500 ${isFocused ? 'border-white/40 shadow-[0_0_40px_-10px_rgba(255,255,255,0.2)]' : 'border-white/10'}`}>
                    <div className="flex h-16 w-16 items-center justify-center">
                      <AnimatePresence mode="wait">
                        {platform === 'youtube' ? <Youtube className="text-red-600" size={28} /> : 
                         platform === 'tiktok' ? <Music2 className="text-[#00f2ea]" size={28} /> : 
                         platform === 'instagram' ? <Instagram className="text-pink-500" size={28} /> : 
                         <Search className="text-white/20" size={24} />}
                      </AnimatePresence>
                    </div>
                    <input
                      type="text"
                      placeholder="Paste link here..."
                      className="h-16 w-full bg-transparent px-2 text-lg outline-none placeholder:text-white/20"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      onFocus={() => setIsFocused(true)}
                      onBlur={() => setIsFocused(false)}
                      disabled={isLoading}
                    />
                    <button type="submit" disabled={isLoading || !url} className="h-16 w-16 flex items-center justify-center text-white/40 hover:text-white disabled:opacity-20 transition-colors">
                      {isLoading ? <Loader2 className="animate-spin" size={24} /> : <ArrowRight size={24} />}
                    </button>
                  </div>
                </form>
                {error && <div className="text-red-400 text-[10px] uppercase tracking-widest">{error}</div>}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="quality-step"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-8"
            >
              <div className="flex flex-col items-center gap-6">
                <div className="relative h-44 w-80 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] shadow-2xl">
                  <img src={metadata?.thumbnail} alt="" className="h-full w-full object-cover opacity-60" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent" />
                  <PlayCircle className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/40" size={48} />
                </div>
                <div className="space-y-3">
                  <h2 className="max-w-md truncate text-lg font-bold tracking-tight text-white/90">{metadata?.title}</h2>
                  <button onClick={reset} className="flex items-center gap-2 mx-auto text-[10px] font-bold uppercase tracking-[0.2em] text-white/20 hover:text-white/40 transition-colors">
                    <RefreshCw size={10} />
                    New Extraction
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { id: 'best', label: '1080p Ultra', icon: Monitor, sub: 'Lossless' },
                  { id: '720p', label: '720p HD', icon: PlayCircle, sub: 'Standard' },
                  { id: '480p', label: '480p SD', icon: Smartphone, sub: 'Mobile' },
                  { id: 'mp3', label: 'Audio Only', icon: Music, sub: '320kbps MP3' },
                ].map((q) => (
                  <button
                    key={q.id}
                    onClick={() => handleDownload(q.id)}
                    className="group relative flex items-center gap-4 rounded-xl border border-white/5 bg-white/[0.01] p-4 text-left transition-all hover:bg-white/[0.04]"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 text-white/40 group-hover:text-white transition-colors">
                      <q.icon size={20} />
                    </div>
                    <div>
                      <div className="text-xs font-bold tracking-wider text-white/80">{q.label}</div>
                      <div className="text-[9px] font-medium tracking-widest text-white/20 uppercase">{q.sub}</div>
                    </div>
                  </button>
                ))}
              </div>
              
              <div className="h-4">
                <AnimatePresence>
                  {engineStatus && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-emerald-500/80"
                    >
                      <HardDriveDownload size={12} className="animate-bounce" />
                      {engineStatus}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 1 }}
          className="flex justify-center gap-8 text-[10px] font-bold tracking-[0.2em] text-white/20 uppercase"
        >
          <span>Fast Stream</span>
          <span>•</span>
          <span>HD 1080P</span>
          <span>•</span>
          <span>No Limits</span>
        </motion.div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[10px] tracking-widest text-white/10 uppercase">
        VeloStream © 2026
      </div>
    </main>
  );
}
