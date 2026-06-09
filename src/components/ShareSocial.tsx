/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Participant } from '../types';
import {
  Linkedin, Instagram, ClipboardCheck, ClipboardCopy,
  Share2, Download, AlertCircle, CheckCircle2,
} from 'lucide-react';

interface ShareSocialProps {
  participant: Participant;
  certificateImage?: string;
}

export default function ShareSocial({ participant, certificateImage }: ShareSocialProps) {
  const [copied, setCopied] = useState(false);
  const [igToast, setIgToast] = useState('');

  const verifyUrl = `${window.location.origin}/?verify=${participant.id}`;

  const captionText =
    `🏆 ZeroDayHeist CTF 2026 — Certificate of Achievement\n\n` +
    `Proud to share that I participated in ZeroDayHeist, a 6-Hour International Capture The Flag Competition organised by cyberhx.\n\n` +
    `👤 Participant: ${participant.name}\n` +
    `👥 Team: ${participant.team}\n` +
    `🛡️ Event: ZeroDayHeist CTF 2026\n` +
    `🆔 Credential ID: ${participant.id}\n` +
    `🔗 Verify: ${verifyUrl}\n\n` +
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
      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(verifyUrl)}`, '_blank', 'noopener,noreferrer');
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

  return (
    <div className="rounded-2xl border border-cyber-border bg-cyber-card overflow-hidden shadow-2xl shadow-black/40">

      {/* ── Header ── */}
      <div className="flex items-center gap-2.5 px-6 py-4 border-b border-cyber-border bg-cyber-bg/60">
        <Share2 className="h-4 w-4 text-cyber-cyan" />
        <span className="text-xs font-mono font-bold text-white tracking-[2px] uppercase">Social Media Publisher</span>
        <span className="text-[10px] font-mono text-zinc-500 ml-1">Generate · Verify · Share</span>
      </div>

      <div className="p-6 space-y-5">

        {/* ── Certificate Preview ── */}
        <div className="rounded-xl overflow-hidden border border-cyber-border bg-black">
          {certificateImage ? (
            <img
              src={certificateImage}
              alt="Certificate"
              className="w-full object-contain"
            />
          ) : (
            <div className="flex items-center justify-center h-48 text-zinc-600 font-mono text-xs animate-pulse">
              Rendering certificate...
            </div>
          )}
        </div>

        {/* ── Generated Caption ── */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-cyber-cyan tracking-[2px] uppercase">Generated Caption</span>
            <button
              onClick={copyCaption}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-mono font-bold border transition-all duration-200 ${
                copied
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                  : 'bg-cyber-bg border-cyber-border text-zinc-400 hover:text-white'
              }`}
            >
              {copied
                ? <><ClipboardCheck className="h-3 w-3" /> Copied!</>
                : <><ClipboardCopy className="h-3 w-3" /> Copy</>
              }
            </button>
          </div>

          {/* Caption lines */}
          <div className="rounded-xl bg-cyber-bg border border-cyber-border p-4 font-mono text-[11px] text-zinc-300 leading-relaxed space-y-0.5">
            <div><span className="text-zinc-500">Team:</span> <span className="text-white">{participant.team}</span></div>
            <div><span className="text-zinc-500">Event:</span> <span className="text-white">ZeroDayHeist CTF 2026</span></div>
            <div><span className="text-zinc-500">Credential ID:</span> <span className="text-cyber-cyan">{participant.id}</span></div>
            <div><span className="text-zinc-500">Verify:</span> <span className="text-cyber-purple break-all">{verifyUrl}</span></div>
            <div className="pt-1 text-cyber-cyan/70">#cyberhx #zerodayheist #ctf #cybersecurity #ethicalhacking</div>
          </div>
        </div>

        {/* ── Instagram toast ── */}
        {igToast && (
          <div className="flex gap-2.5 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-xs font-mono text-amber-300 leading-relaxed">
            <AlertCircle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
            <span>{igToast}</span>
          </div>
        )}

        {/* ── Buttons ── */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={shareToLinkedIn}
            className="py-3 px-4 rounded-xl font-mono text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200 bg-[#0a66c2] hover:bg-[#0957a8] text-white shadow-lg shadow-[#0a66c2]/25 active:scale-[0.98]"
          >
            <Linkedin className="h-4 w-4" />
            Post to LinkedIn
          </button>

          <button
            onClick={shareToInstagram}
            className="py-3 px-4 rounded-xl font-mono text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200 bg-gradient-to-r from-[#f09433] via-[#dc2743] to-[#bc1888] hover:opacity-90 text-white shadow-lg shadow-pink-500/20 active:scale-[0.98]"
          >
            <Instagram className="h-4 w-4" />
            Post to Instagram
          </button>
        </div>

        {/* ── Download + Info ── */}
        <div className="flex items-center gap-3">
          <button
            onClick={downloadCertificate}
            disabled={!certificateImage}
            className="flex-1 py-2.5 px-4 rounded-xl font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all duration-200 bg-cyber-bg border border-cyber-border text-zinc-400 hover:text-white hover:border-zinc-500 disabled:opacity-30 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            <Download className="h-3.5 w-3.5" />
            Download Certificate PNG
          </button>
        </div>

        <div className="flex gap-2.5 p-3.5 rounded-xl bg-cyber-bg border border-cyber-border/60">
          <CheckCircle2 className="h-4 w-4 text-cyber-cyan shrink-0 mt-0.5" />
          <p className="text-[10px] font-mono text-zinc-500 leading-relaxed">
            <span className="text-zinc-300 font-semibold">How to post: </span>
            Clicking a button auto-copies the caption and tries to share the image. On desktop, download the certificate first, then paste the caption in the opened tab.
          </p>
        </div>

      </div>
    </div>
  );
}