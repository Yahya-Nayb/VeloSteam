'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Youtube, Music2, Search, ArrowRight, Instagram, Loader2, Zap, PlayCircle, Download, RefreshCw, Sparkles, ShieldCheck } from 'lucide-react';

gsap.registerPlugin(useGSAP);

type Platform = 'youtube' | 'tiktok' | 'instagram' | 'none';

interface Metadata {
  title: string;
  thumbnail: string;
  duration?: number;
}

// Fallback Image Constant
const FALLBACK_THUMBNAIL = '/images/vd.jpeg';

export default function Home() {
  const [url, setUrl] = useState('');
  const [platform, setPlatform] = useState<Platform>('none');
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<Metadata | null>(null);
  const [step, setStep] = useState<'input' | 'result'>('input');

  const containerRef = useRef<HTMLDivElement>(null);
  const resultCardRef = useRef<HTMLDivElement>(null);
  const downloadBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) setPlatform('youtube');
    else if (lowerUrl.includes('tiktok.com')) setPlatform('tiktok');
    else if (lowerUrl.includes('instagram.com')) setPlatform('instagram');
    else setPlatform('none');
  }, [url]);

  useGSAP(
    () => {
      if (step === 'result' && metadata && resultCardRef.current) {
        gsap.fromTo(resultCardRef.current, { scale: 0.95, opacity: 0, y: 20 }, { scale: 1, opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' });
      }
    },
    { scope: containerRef, dependencies: [step, metadata] },
  );

  const handleAnalyze = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!url) return;

    setIsLoading(true);
    setError(null);
    setMetadata(null);

    try {
      const response = await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, mode: 'analyze' }),
      });

      const data = await response.json();
      if (!response.ok || data.type === 'error') throw new Error(data.message || 'Analysis failed.');

      setMetadata(data.data);
      setStep('result');
    } catch (err: any) {
      setError(err.message || 'Analysis failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!metadata) return;
    setIsDownloading(true);

    if (downloadBtnRef.current) {
      gsap.to(downloadBtnRef.current, {
        scale: 1.02,
        repeat: -1,
        yoyo: true,
        duration: 0.5,
        ease: 'sine.inOut',
      });
    }

    const downloadUrl = `/api/download?url=${encodeURIComponent(url)}&quality=best&title=${encodeURIComponent(metadata.title)}`;

    setTimeout(() => {
      window.location.href = downloadUrl;
      setTimeout(() => {
        setIsDownloading(false);
        gsap.killTweensOf(downloadBtnRef.current);
        gsap.to(downloadBtnRef.current, { scale: 1, duration: 0.3 });
      }, 3000);
    }, 1200);
  };

  const reset = () => {
    setStep('input');
    setMetadata(null);
    setUrl('');
    setError(null);
  };

  return (
    <main ref={containerRef} className="relative flex mt-32 md:mt-14 flex-col items-center justify-center bg-zinc-950 px-4 sm:px-0 text-white selection:bg-emerald-500/30">
      {/* Background Accents */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] h-[40%] w-[40%] rounded-full bg-emerald-500/[0.03] blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[40%] w-[40%] rounded-full bg-blue-500/[0.02] blur-[120px]" />
      </div>

      <div className="z-10 w-full max-w-[440px] md:max-w-[640px] space-y-8 sm:space-y-12">
        <AnimatePresence mode="wait">
          {step === 'input' ? (
            <motion.div key="input-step" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="space-y-10 text-center">
              <div className="space-y-4">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-900 border border-zinc-800 shadow-xl">
                  <Sparkles className="text-emerald-500" size={24} />
                </div>
                <h1 className="text-4xl font-black tracking-tight bg-gradient-to-b from-white to-zinc-500 bg-clip-text text-transparent">VeloStream</h1>
                <p className="text-zinc-300 text-xs font-medium tracking-wide">Enter a URL to begin extraction</p>
              </div>

              <form onSubmit={handleAnalyze} className="relative group px-2 sm:px-0">
                <div
                  className={`relative flex items-center rounded-3xl border transition-all duration-500 bg-zinc-900/50 backdrop-blur-xl ${isFocused ? 'border-emerald-500/30 ring-4 ring-emerald-500/5' : 'border-zinc-800'}`}>
                  <div className="flex h-16 w-16 items-center justify-center">
                    {isLoading ? (
                      <Loader2 className="animate-spin text-emerald-500" size={20} />
                    ) : platform === 'youtube' ? (
                      <Youtube className="text-red-500" size={20} />
                    ) : platform === 'tiktok' ? (
                      <Music2 className="text-[#00f2ea]" size={20} />
                    ) : platform === 'instagram' ? (
                      <Instagram className="text-pink-500" size={20} />
                    ) : (
                      <Search className="text-zinc-600" size={20} />
                    )}
                  </div>
                  <input
                    type="text"
                    placeholder="Paste link here..."
                    className="h-16 w-full bg-transparent px-2 text-[15px] outline-none placeholder:text-zinc-700 font-medium"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    disabled={isLoading}
                  />
                  <button
                    type="submit"
                    disabled={!url || isLoading}
                    className="h-12 w-12 mr-2 flex items-center cursor-pointer justify-center rounded-2xl bg-white text-black hover:bg-emerald-400 disabled:opacity-5 transition-all">
                    <ArrowRight size={20} />
                  </button>
                </div>
                {error && <div className="mt-4 text-red-400 text-[10px] uppercase tracking-widest font-bold">{error}</div>}
              </form>

              <div className="flex justify-center items-center gap-6 text-[9px] font-bold tracking-[0.2em] text-zinc-300 uppercase">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={12} /> Secure
                </div>
                <div className="flex items-center gap-2">
                  <Zap size={12} /> Fast
                </div>
              </div>
            </motion.div>
          ) : (
            <div key="result-step" ref={resultCardRef} className="space-y-6 px-2 sm:px-0">
              <div className="flex flex-col rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl overflow-hidden max-h-[85vh] sm:max-h-none">
                {/* Fixed Landscape Aspect Ratio for Thumbnail */}
                <div className="relative aspect-video w-full overflow-hidden bg-black">
                  <img
                    src={metadata?.thumbnail || FALLBACK_THUMBNAIL}
                    alt=""
                    className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.src = FALLBACK_THUMBNAIL;
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-16 w-16 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white/40">
                    <PlayCircle size={32} />
                  </div>
                </div>

                <div className="p-6 sm:p-8 space-y-6">
                  <div className="space-y-2">
                    <div className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Ultra HD Stream Detected
                    </div>
                    <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white line-clamp-2 leading-tight">{metadata?.title}</h2>
                  </div>

                  <div className="space-y-3">
                    <button
                      ref={downloadBtnRef}
                      onClick={handleDownload}
                      disabled={isDownloading}
                      className="w-full py-4 sm:py-5 cursor-pointer rounded-xl bg-emerald-600 text-white font-black text-xs uppercase tracking-[0,1em] md:tracking-[0.2em] flex items-center justify-center gap-2 md:gap-3 hover:bg-emerald-500 active:scale-95 transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] disabled:bg-zinc-800 disabled:text-zinc-600">
                      {isDownloading ? (
                        <>
                          <Loader2 className="animate-spin" size={16} />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Download size={16} />
                          Download Highest Quality
                        </>
                      )}
                    </button>

                    <button
                      onClick={reset}
                      className="w-full flex items-center cursor-pointer justify-center gap-2 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 hover:text-white transition-colors">
                      <RefreshCw size={12} />
                      New Extraction
                    </button>
                  </div>
                </div>
              </div>

              <p className="text-center text-[11px] pt-4.5 leading-relaxed text-zinc-300 font-medium px-4">VeloStream automatically detects and merges the highest resolution available.</p>
            </div>
          )}
        </AnimatePresence>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[10px] font-black tracking-[0.4em] text-zinc-400 uppercase">VeloStream © 2026</div>
    </main>
  );
}
