/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Participant } from '../types';
import {
  Linkedin, Instagram, ClipboardCheck, ClipboardCopy,
  Share2, Download, AlertCircle, CheckCircle2, ExternalLink,
} from 'lucide-react';

interface ShareSocialProps {
  participant: Participant;
  certificateImage?: string;
}

export default function ShareSocial({ participant, certificateImage }: ShareSocialProps) {
  const [copied, setCopied] = useState(false);
  const [activePlatform, setActivePlatform] = useState<'linkedin' | 'instagram'>('linkedin');
  const [igToast, setIgToast] = useState('');

  const captionText =
    `🏆 ZeroDayHeist CTF 2026 — Certificate of Achievement\n\n` +
    `Proud to share that I participated in ZeroDayHeist, a 6-Hour International Capture The Flag Competition organised by cyberhx.\n\n` +
    `👤 Participant: ${participant.name}\n` +
    `👥 Team: ${participant.team}\n` +
    `🛡️ Event: ZeroDayHeist CTF 2026\n` +
    `🆔 Credential ID: ${participant.id}\n` +
    `🔗 Verify: https://certs.cyberhx.com/?verify=${participant.id}\n\n` +
    `#cyberhx #zerodayheist #ctf #cybersecurity #ethicalhacking`;

  const copyCaption = () => {
    navigator.clipboard.writeText(captionText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const blobFromDataUrl = async (dataUrl: string): Promise<Blob | null> => {
    if (!dataUrl.startsWith('data:image/')) return null;
    try { return await (await fetch(dataUrl)).blob(); } catch { return null; }
  };

  const downloadCertificate = () => {
    if (!certificateImage) return;
    const a = document.createElement('a');
    a.href = certificateImage;
    a.download = `ZeroDayHeist-${participant.name.replace(/\s+/g, '-')}-${participant.id}.png`;
    a.click();
  };

  const shareToLinkedIn = async () => {
    copyCaption();
    let shared = false;
    if (certificateImage) {
      try {
        if (navigator.share && navigator.canShare) {
          const blob = await blobFromDataUrl(certificateImage);
          if (!blob) throw new Error('bad image');
          const file = new File([blob], `ZeroDayHeist-${participant.name.replace(/\s+/g, '-')}.png`, { type: 'image/png' });
          const sd = { files: [file], title: 'ZeroDayHeist CTF 2026 Certificate', text: captionText };
          if (navigator.canShare(sd)) { await navigator.share(sd); shared = true; }
        }
      } catch { /* fallback */ }
    }
    if (!shared) {
      const shareUrl = `https://certs.cyberhx.com/?verify=${participant.id}`;
      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank', 'noopener,noreferrer');
    }
  };

  const shareToInstagram = async () => {
    copyCaption();
    let shared = false;
    if (certificateImage) {
      try {
        if (navigator.share && navigator.canShare) {
          const blob = await blobFromDataUrl(certificateImage);
          if (!blob) throw new Error('bad image');
          const file = new File([blob], `ZeroDayHeist-${participant.name.replace(/\s+/g, '-')}.png`, { type: 'image/png' });
          const sd = { files: [file], title: 'ZeroDayHeist CTF 2026 Certificate', text: captionText };
          if (navigator.canShare(sd)) { await navigator.share(sd); shared = true; }
        }
      } catch { /* fallback */ }
    }
    if (!shared) {
      if (certificateImage) {
        downloadCertificate();
        setIgToast('Certificate downloaded! Open Instagram → New Post → select the image, then paste the caption.');
      } else {
        setIgToast('Certificate is still rendering — wait a moment and try again.');
      }
      setTimeout(() => setIgToast(''), 7000);
    }
  };

  const initials = participant.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const igHandle = participant.name.replace(/\s+/g, '_').toLowerCase();

  return (
    <div className="rounded-2xl border border-cyber-border bg-cyber-card overflow-hidden shadow-2xl shadow-black/40">

      {/* ── Header bar ── */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-cyber-border bg-cyber-bg/60">
        <div className="flex items-center gap-2.5">
          <Share2 className="h-4 w-4 text-cyber-cyan" />
          <span className="text-xs font-mono font-bold text-white tracking-[2px] uppercase">Social Media Publisher</span>
        </div>
        <div className="flex items-center gap-1 bg-cyber-card border border-cyber-border rounded-lg p-1">
          <button
            onClick={() => setActivePlatform('linkedin')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold font-mono transition-all duration-200 ${
              activePlatform === 'linkedin'
                ? 'bg-[#0a66c2] text-white shadow-md shadow-[#0a66c2]/30'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Linkedin className="h-3 w-3" />
            LinkedIn Feed
          </button>
          <button
            onClick={() => setActivePlatform('instagram')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold font-mono transition-all duration-200 ${
              activePlatform === 'instagram'
                ? 'bg-gradient-to-r from-[#f09433] via-[#e6683c] via-[#dc2743] via-[#cc2366] to-[#bc1888] text-white shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Instagram className="h-3 w-3" />
            Instagram Post
          </button>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-cyber-border">

        {/* ── Left: Actions ── */}
        <div className="lg:col-span-5 p-6 space-y-5">

          {/* Caption block */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-cyber-cyan animate-pulse" />
              <span className="text-[10px] font-mono font-bold text-cyber-cyan tracking-[2px] uppercase">Caption Generated Automatically</span>
            </div>
            <div className="rounded-xl bg-cyber-bg border border-cyber-border p-4 text-[11px] font-mono text-zinc-300 leading-relaxed whitespace-pre-wrap select-all max-h-44 overflow-y-auto scrollbar-thin">
              {captionText}
            </div>
            <button
              onClick={copyCaption}
              className={`w-full py-2.5 rounded-lg flex items-center justify-center gap-2 text-xs font-mono font-bold transition-all duration-200 border ${
                copied
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                  : 'bg-cyber-light border-cyber-border text-zinc-300 hover:text-white hover:border-zinc-500'
              }`}
            >
              {copied
                ? <><ClipboardCheck className="h-3.5 w-3.5" /><span>Copied to Clipboard!</span></>
                : <><ClipboardCopy className="h-3.5 w-3.5" /><span>Copy Caption to Clipboard</span></>
              }
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-cyber-border" />
            <span className="text-[9px] font-mono text-zinc-600 tracking-[2px] uppercase">Publish to Feed</span>
            <div className="flex-1 h-px bg-cyber-border" />
          </div>

          {/* Publish buttons */}
          <div className="space-y-2.5">
            <button
              onClick={shareToLinkedIn}
              className="w-full py-3 px-5 rounded-xl font-mono text-sm font-bold flex items-center justify-center gap-3 transition-all duration-200 bg-[#0a66c2] hover:bg-[#0957a8] text-white shadow-lg shadow-[#0a66c2]/25 active:scale-[0.98]"
            >
              <Linkedin className="h-4 w-4" />
              Post directly to LinkedIn
              <ExternalLink className="h-3 w-3 ml-auto opacity-60" />
            </button>

            <button
              onClick={shareToInstagram}
              className="w-full py-3 px-5 rounded-xl font-mono text-sm font-bold flex items-center justify-center gap-3 transition-all duration-200 bg-gradient-to-r from-[#f09433] via-[#dc2743] to-[#bc1888] hover:opacity-90 text-white shadow-lg shadow-pink-500/20 active:scale-[0.98]"
            >
              <Instagram className="h-4 w-4" />
              Post to Instagram
              <ExternalLink className="h-3 w-3 ml-auto opacity-60" />
            </button>

            <button
              onClick={downloadCertificate}
              disabled={!certificateImage}
              className="w-full py-2.5 px-5 rounded-xl font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all duration-200 bg-cyber-bg border border-cyber-border text-zinc-400 hover:text-white hover:border-zinc-500 disabled:opacity-30 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              <Download className="h-3.5 w-3.5" />
              Download Certificate PNG
            </button>
          </div>

          {/* Instagram toast */}
          {igToast && (
            <div className="flex gap-2.5 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-xs font-mono text-amber-300 leading-relaxed">
              <AlertCircle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
              <span>{igToast}</span>
            </div>
          )}

          {/* Info note */}
          <div className="flex gap-2.5 p-3.5 rounded-xl bg-cyber-bg border border-cyber-border/60">
            <CheckCircle2 className="h-4 w-4 text-cyber-cyan shrink-0 mt-0.5" />
            <p className="text-[10px] font-mono text-zinc-500 leading-relaxed">
              <span className="text-zinc-300 font-semibold">How to post: </span>
              Clicking a button auto-copies the caption and tries to share the image. On desktop, download the certificate first, then paste the caption in the opened tab.
            </p>
          </div>
        </div>

        {/* ── Right: Live Preview ── */}
        <div className="lg:col-span-7 p-6 bg-cyber-bg/30">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[9px] font-mono text-zinc-600 tracking-[3px] uppercase">Live Feed Preview</span>
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[9px] font-mono text-emerald-400 tracking-wider">LIVE</span>
            </div>
          </div>

          {activePlatform === 'linkedin' ? (
            /* ─── LinkedIn Mock ─── */
            <div className="rounded-xl border border-[#ffffff12] bg-[#1b1f23] overflow-hidden max-w-md mx-auto shadow-2xl">
              {/* Post header */}
              <div className="flex items-start gap-3 p-4">
                <div className="h-11 w-11 rounded-full bg-gradient-to-br from-cyber-purple to-cyber-cyan flex items-center justify-center font-bold text-white text-sm font-mono shrink-0">
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-white text-sm leading-tight">{participant.name}</div>
                  <div className="text-[11px] text-[#aaaaaa] leading-snug mt-0.5">Participant at ZeroDayHeist CTF 2026</div>
                  <div className="text-[10px] text-[#777] flex items-center gap-1 mt-0.5">1m · 🌐</div>
                </div>
                <div className="text-[#aaa] font-bold text-lg cursor-pointer select-none">···</div>
              </div>

              {/* Caption */}
              <div className="px-4 pb-3 text-[11px] text-[#cccccc] font-sans leading-relaxed whitespace-pre-wrap line-clamp-6">
                {captionText}
              </div>

              {/* Certificate card */}
              <div className="border-t border-[#ffffff10] overflow-hidden">
                <div className="bg-[#0f1923] px-4 py-5 flex flex-col items-center justify-center text-center border-b border-[#ffffff10]">
                  <div className="text-[9px] font-mono text-cyber-cyan tracking-[3px] mb-1">ZERODAYHEIST CTF 2026</div>
                  <div className="text-sm font-bold text-white font-sans">{participant.name}</div>
                  <div className="text-[10px] font-mono text-zinc-500 mt-0.5">Team: {participant.team}</div>
                  <div className="mt-2 px-2.5 py-1 rounded-full bg-cyber-cyan/10 border border-cyber-cyan/25 text-[9px] font-mono text-cyber-cyan tracking-wider">
                    VERIFIED · {participant.id}
                  </div>
                </div>
                <div className="p-3 bg-[#141a22] flex items-center justify-between">
                  <div>
                    <div className="text-[11px] font-semibold text-white font-sans">ZeroDayHeist CTF — Verified Credential</div>
                    <div className="text-[10px] text-[#777] font-mono">certs.cyberhx.com</div>
                  </div>
                  <div className="px-3 py-1 rounded bg-[#0a66c2] text-white text-[10px] font-semibold font-sans">Verify</div>
                </div>
              </div>

              {/* Reactions */}
              <div className="flex items-center justify-between px-4 py-2.5 border-t border-[#ffffff08] text-[11px] text-[#777]">
                <div className="flex items-center gap-1">👍❤️💡 <span className="ml-1">You and 42 others</span></div>
                <div>3 comments · 7 reposts</div>
              </div>
            </div>

          ) : (
            /* ─── Instagram Mock ─── */
            <div className="rounded-xl border border-[#ffffff15] bg-black overflow-hidden max-w-xs mx-auto shadow-2xl">
              {/* IG Header */}
              <div className="flex items-center justify-between px-3 py-2.5 border-b border-[#ffffff10]">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-full p-[1.5px] bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888]">
                    <div className="h-full w-full rounded-full bg-black flex items-center justify-center font-bold text-white text-[11px]">
                      {participant.name[0]}
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold text-white text-xs">{igHandle}</div>
                    <div className="text-[9px] text-[#aaa]">ZeroDayHeist CTF 2026</div>
                  </div>
                </div>
                <div className="text-white font-bold cursor-pointer select-none">···</div>
              </div>

              {/* IG Image */}
              <div className="aspect-square bg-[#0a0e14] flex flex-col items-center justify-center p-6 text-center relative">
                <div className="absolute inset-0 bg-gradient-to-br from-cyber-purple/10 to-cyber-cyan/5" />
                <div className="relative border border-cyber-cyan/20 rounded-xl p-5 bg-[#0f172a]/80 backdrop-blur-sm w-full max-w-[200px] shadow-xl">
                  <div className="text-[8px] font-mono text-cyber-cyan tracking-[3px] mb-2 uppercase">ZeroDayHeist CTF</div>
                  <div className="text-sm font-bold text-white font-sans mb-1 truncate">{participant.name}</div>
                  <div className="text-[9px] font-mono text-cyber-purple">Team: {participant.team}</div>
                  <div className="mt-3 text-[8px] font-mono text-zinc-500">ID: {participant.id}</div>
                  <div className="mt-1 text-[8px] font-mono text-cyber-cyan/60">#cyberhx</div>
                </div>
              </div>

              {/* IG Actions */}
              <div className="px-3 pt-2.5 pb-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex gap-3.5 text-base">❤️ 💬 ✈️</div>
                  <div className="text-base">🔖</div>
                </div>
                <div className="text-white text-xs font-semibold font-sans mb-1">152 likes</div>
                <div className="text-[10px] font-sans leading-snug">
                  <span className="font-bold text-white mr-1">{igHandle}</span>
                  <span className="text-[#aaa] line-clamp-3">{captionText.slice(0, 120)}…</span>
                </div>
                <div className="text-[9px] text-[#666] uppercase mt-1.5 tracking-wider font-sans">1 minute ago</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
