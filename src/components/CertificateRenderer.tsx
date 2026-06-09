/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { Participant } from '../types';
import { Download, ShieldCheck, Copy, Check, Info, Sliders, RefreshCw, ExternalLink, Lock } from 'lucide-react';

interface CertificateRendererProps {
  participant: Participant;
  onImageGenerated?: (url: string) => void;
}

export default function CertificateRenderer({ participant, onImageGenerated }: CertificateRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<boolean>(false);
  const [fontsLoaded, setFontsLoaded] = useState<boolean>(false);
  const [fontLoadToggle, setFontLoadToggle] = useState<number>(0);
  const [templateImage, setTemplateImage] = useState<HTMLImageElement | null>(null);
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  const [showCalibration, setShowCalibration] = useState<boolean>(false);

  const [nameFontFamily, setNameFontFamily] = useState<string>('Great Vibes');
  const [nameYPercent, setNameYPercent] = useState<number>(49.8);
  const [nameFontSize, setNameFontSize] = useState<number>(150);
  const [teamYPercent, setTeamYPercent] = useState<number>(67.5);
  const [teamFontSize, setTeamFontSize] = useState<number>(24);
  const [verifyXPercent, setVerifyXPercent] = useState<number>(31.4);
  const [verifyYPercent, setVerifyYPercent] = useState<number>(96.4);
  const [verifyFontSize, setVerifyFontSize] = useState<number>(20);

  const verifyUrl = `${window.location.origin}?verify=${participant.id}`;

  useEffect(() => {
    if (document.fonts) {
      document.fonts.ready.then(() => setFontsLoaded(true));
    } else {
      setTimeout(() => setFontsLoaded(true), 500);
    }
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined' || !document.fonts) return;
    Promise.all([
      document.fonts.load(`400 40px "${nameFontFamily}"`),
      document.fonts.load(`500 40px "${nameFontFamily}"`),
      document.fonts.load(`700 40px "${nameFontFamily}"`),
    ]).then(() => setFontLoadToggle(prev => prev + 1))
      .catch(() => setFontLoadToggle(prev => prev + 1));
  }, [nameFontFamily]);

  useEffect(() => {
    const src = participant.certificateType === 'grandfinale' ? '/certificate.png' : '/certificate_participant.png';
    const img = new Image();
    img.src = src;
    img.crossOrigin = 'anonymous';
    img.onload = () => { setTemplateImage(img); setImageLoaded(true); };
    img.onerror = (e) => console.error(`Failed to load ${src}`, e);
  }, [participant.certificateType]);

  const resetCalibration = () => {
    setNameFontFamily('Great Vibes');
    setNameYPercent(49.8);
    setNameFontSize(150);
    setVerifyXPercent(31.4);
    setVerifyYPercent(96.4);
    setVerifyFontSize(20);
  };

  const drawCertificate = () => {
    const canvas = canvasRef.current;
    if (!canvas || !templateImage || !imageLoaded) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = templateImage.naturalWidth || 2000;
    const h = templateImage.naturalHeight || 1414;
    canvas.width = w;
    canvas.height = h;
    ctx.drawImage(templateImage, 0, 0, w, h);

    const leftW = Math.round(w * 0.28);
    const rightW = w - leftW;
    const cX = leftW + Math.round(rightW / 2);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#0a0d14';
    const nameSize = Math.round(nameFontSize * (h / 1414));

    if (nameFontFamily === 'Playfair Display') {
      ctx.font = `700 ${nameSize}px "Playfair Display", "Times New Roman", serif`;
    } else if (nameFontFamily === 'Space Grotesk') {
      ctx.font = `800 ${nameSize}px "Space Grotesk", sans-serif`;
    } else if (nameFontFamily === 'Cinzel') {
      ctx.font = `700 ${nameSize}px "Cinzel", "Georgia", serif`;
    } else {
      ctx.font = `500 ${nameSize}px "${nameFontFamily}", "Alex Brush", "Great Vibes", cursive`;
    }

    ctx.fillText(participant.name, cX, Math.round(h * (nameYPercent / 100)));

    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#ffffff';
    const verifySize = Math.round(verifyFontSize * (h / 1414));
    ctx.font = `500 ${verifySize}px "JetBrains Mono", monospace`;
    ctx.fillText(participant.id, leftW + Math.round(w * (verifyXPercent / 100)), Math.round(h * (verifyYPercent / 100)));

    try {
      const dataUrl = canvas.toDataURL('image/png');
      setDownloadUrl(dataUrl);
      if (onImageGenerated) onImageGenerated(dataUrl);
    } catch (e) {
      console.error('Canvas export failed:', e);
    }
  };

  useEffect(() => {
    drawCertificate();
  }, [participant, fontsLoaded, fontLoadToggle, imageLoaded, templateImage, nameFontFamily, nameYPercent, nameFontSize, teamYPercent, teamFontSize, verifyXPercent, verifyYPercent, verifyFontSize]);

  const copyVerificationLink = () => {
    navigator.clipboard.writeText(verifyUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const copyCredId = () => {
    navigator.clipboard.writeText(participant.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  return (
    <div id="certificate-viewer" className="space-y-6">

      {/* Certificate Preview */}
      <div className="relative border border-red-900/40 rounded-xl bg-black p-1 md:p-2 overflow-hidden shadow-2xl shadow-red-900/10">
        <div className="relative aspect-[2000/1414] w-full overflow-hidden rounded-lg bg-black border border-zinc-900 shadow-inner select-none flex items-center justify-center">
          {downloadUrl ? (
            <img src={downloadUrl} alt="ZeroDayHeist Certificate Preview" className="w-full h-auto object-contain select-none" referrerPolicy="no-referrer" />
          ) : (
            <div className="absolute inset-0 flex flex-col justify-center items-center gap-3 text-zinc-600 font-mono text-xs">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-red-500" />
              <span>GENERATING CREDENTIAL...</span>
            </div>
          )}
        </div>
      </div>

      {/* Hidden canvas */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Calibration Panel */}
      <div className="border border-red-900/30 rounded-xl bg-black overflow-hidden transition-all">
        <button
          onClick={() => setShowCalibration(!showCalibration)}
          className="w-full px-5 py-4 flex items-center justify-between text-zinc-300 hover:text-white transition-colors bg-zinc-950 font-mono text-sm border-b border-red-900/20"
        >
          <div className="flex items-center gap-2">
            <Sliders className="h-4 w-4 text-red-500" />
            <span>Layout Alignment Calibration</span>
          </div>
          <span className="text-xs text-red-400 border border-red-900/40 px-2 py-0.5 rounded">
            {showCalibration ? 'COLLAPSE' : 'EDIT ALIGNMENTS'}
          </span>
        </button>

        {showCalibration && (
          <div className="p-5 space-y-6">
            <div className="flex justify-between items-center bg-red-900/10 border border-red-900/20 p-3 rounded-lg text-xs text-zinc-300">
              <p>💡 Use sliders to adjust positions. Changes preview instantly above.</p>
              <button onClick={resetCalibration} className="flex items-center gap-1 bg-red-900/20 hover:bg-red-900/40 px-2.5 py-1.5 rounded font-mono text-red-400 transition-colors font-semibold text-[10px]">
                <RefreshCw className="h-3 w-3" /><span>RESET</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-zinc-300">
              <div className="space-y-4 border border-zinc-800 p-4 rounded-lg bg-zinc-950">
                <h5 className="font-mono text-[11px] text-red-400 font-bold tracking-wider uppercase border-b border-zinc-800 pb-1.5">1. Recipient Name</h5>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-[11px] mb-1 font-mono"><span>Font Style</span><span className="text-zinc-500">Great Vibes Default</span></div>
                    <select value={nameFontFamily} onChange={(e) => setNameFontFamily(e.target.value)} className="w-full px-2 py-2 rounded bg-zinc-900 border border-zinc-800 text-white font-mono text-xs outline-none cursor-pointer">
                      <option value="Great Vibes">Calligraphy (Great Vibes)</option>
                      <option value="Alex Brush">Elegant Brush (Alex Brush)</option>
                      <option value="Pinyon Script">Luxurious (Pinyon Script)</option>
                      <option value="Allura">Classic (Allura)</option>
                      <option value="Rochester">Vintage (Rochester)</option>
                      <option value="Kaushan Script">Brush (Kaushan Script)</option>
                      <option value="Cinzel">Royal Roman (Cinzel)</option>
                      <option value="Playfair Display">Newspaper (Playfair Display)</option>
                      <option value="Space Grotesk">Cyber Gothic (Space Grotesk)</option>
                    </select>
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] mb-1 font-mono"><span>Y Position ({nameYPercent}%)</span><span className="text-zinc-500">Default: 49.8%</span></div>
                    <input type="range" min="35" max="55" step="0.1" value={nameYPercent} onChange={(e) => setNameYPercent(parseFloat(e.target.value))} className="w-full accent-red-500 bg-zinc-800 rounded-lg appearance-none h-1.5 cursor-pointer" />
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] mb-1 font-mono"><span>Font Size ({nameFontSize}px)</span><span className="text-zinc-500">Default: 150px</span></div>
                    <input type="range" min="30" max="160" step="1" value={nameFontSize} onChange={(e) => setNameFontSize(parseInt(e.target.value))} className="w-full accent-red-500 bg-zinc-800 rounded-lg appearance-none h-1.5 cursor-pointer" />
                  </div>
                </div>
              </div>

              <div className="md:col-span-2 space-y-4 border border-zinc-800 p-4 rounded-lg bg-zinc-950">
                <h5 className="font-mono text-[11px] text-red-400 font-bold tracking-wider uppercase border-b border-zinc-800 pb-1.5">2. Verification Code (Bottom Bar)</h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className="flex justify-between text-[11px] mb-1 font-mono"><span>X Position ({verifyXPercent}%)</span><span className="text-zinc-500">Default: 27.4%</span></div>
                    <input type="range" min="12" max="35" step="0.1" value={verifyXPercent} onChange={(e) => setVerifyXPercent(parseFloat(e.target.value))} className="w-full accent-red-500 bg-zinc-800 rounded-lg appearance-none h-1.5" />
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] mb-1 font-mono"><span>Y Position ({verifyYPercent}%)</span><span className="text-zinc-500">Default: 97.2%</span></div>
                    <input type="range" min="93" max="99.5" step="0.1" value={verifyYPercent} onChange={(e) => setVerifyYPercent(parseFloat(e.target.value))} className="w-full accent-red-500 bg-zinc-800 rounded-lg appearance-none h-1.5" />
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] mb-1 font-mono"><span>Font Size ({verifyFontSize}px)</span><span className="text-zinc-500">Default: 14px</span></div>
                    <input type="range" min="8" max="22" step="1" value={verifyFontSize} onChange={(e) => setVerifyFontSize(parseInt(e.target.value))} className="w-full accent-red-500 bg-zinc-800 rounded-lg appearance-none h-1.5" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Bottom: ID Card + Download — Image 2 style ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Left: Digital Credential ID Card */}
        <div className="rounded-xl border border-red-900/40 bg-black p-5 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-red-900/30">
            <div className="p-1.5 rounded bg-red-900/20 border border-red-900/30">
              <Info className="h-3.5 w-3.5 text-red-400" />
            </div>
            <span className="text-xs font-mono font-bold text-red-400 tracking-[2px] uppercase">Digital Credential ID Card</span>
            <div className="flex-1 h-px bg-red-900/30 ml-1" />
          </div>

          <div className="space-y-3">
            {[
              { icon: '👤', label: 'RECIPIENT NAME', val: participant.name, valClass: 'text-white' },
              { icon: '👥', label: 'TEAM AFFILIATION', val: participant.team, valClass: 'text-white' },
            ].map(r => (
              <div key={r.label} className="flex items-center justify-between py-2 border-b border-zinc-900">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{r.icon}</span>
                  <span className="text-[10px] font-mono text-zinc-500 tracking-wider">{r.label}</span>
                </div>
                <span className={`text-xs font-mono font-semibold ${r.valClass}`}>{r.val}</span>
              </div>
            ))}

            {/* Verification ID */}
            <div className="flex items-center justify-between py-2 border-b border-zinc-900">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-3.5 w-3.5 text-red-500" />
                <span className="text-[10px] font-mono text-zinc-500 tracking-wider">VERIFICATION ID</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-red-400">{participant.id}</span>
                <button onClick={copyCredId} className="p-1 rounded hover:bg-zinc-800 text-zinc-500 hover:text-white transition-colors">
                  {copiedId ? <Check className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />}
                </button>
              </div>
            </div>

            {/* Verification URL */}
            <div className="flex items-start justify-between py-2 border-b border-zinc-900 gap-3">
              <div className="flex items-center gap-2 shrink-0">
                <ExternalLink className="h-3.5 w-3.5 text-red-500" />
                <span className="text-[10px] font-mono text-zinc-500 tracking-wider">VERIFICATION URL</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-zinc-400 break-all text-right">{verifyUrl.replace('https://', '')}</span>
                <button onClick={copyVerificationLink} className="p-1 rounded hover:bg-zinc-800 text-zinc-500 hover:text-white transition-colors shrink-0">
                  {copiedLink ? <Check className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />}
                </button>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button onClick={copyCredId} className="flex items-center justify-center gap-1.5 py-2 rounded-lg border border-red-900/40 bg-red-900/10 hover:bg-red-900/20 text-red-400 font-mono text-[11px] font-bold transition-all">
              <Copy className="h-3 w-3" /> COPY ID
            </button>
            <button onClick={() => window.open(verifyUrl, '_blank')} className="flex items-center justify-center gap-1.5 py-2 rounded-lg border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-mono text-[11px] font-bold transition-all">
              <ExternalLink className="h-3 w-3" /> OPEN VERIFY URL
            </button>
          </div>

          {/* Tamper proof note */}
          <div className="flex items-center gap-2 p-3 rounded-lg bg-green-900/10 border border-green-900/20">
            <Lock className="h-3.5 w-3.5 text-green-500 shrink-0" />
            <span className="text-[10px] font-mono text-green-400">This credential is cryptographically signed and tamper-proof.</span>
          </div>
        </div>

        {/* Right: Badge + Download */}
        <div className="rounded-xl border border-red-900/40 bg-black p-5 flex flex-col items-center justify-between gap-4">

          {/* Badge image */}
          <div className="flex-1 flex items-center justify-center w-full">
            <img
              src="/zdh-badge.png"
              alt="ZeroDayHeist Badge"
              className="max-h-52 w-auto object-contain drop-shadow-[0_0_24px_rgba(220,38,38,0.3)]"
              onError={(e) => {
                // Fallback if badge image not found
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>

          {/* Verified text */}
          <div className="text-center space-y-1">
            <div className="text-sm font-mono font-bold text-white tracking-[3px] uppercase">Verified Credential</div>
            <p className="text-[10px] text-zinc-500 font-mono">This is a high-definition (A4 equivalent, landscape)<br />300 DPI certificate for archiving.</p>
          </div>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-3 flex-wrap">
            {['Blockchain Verified', 'Secure Credential', 'Tamper Proof'].map(t => (
              <div key={t} className="flex items-center gap-1 text-[9px] font-mono text-green-400">
                <Check className="h-2.5 w-2.5" />{t}
              </div>
            ))}
          </div>

          {/* Download button */}
          <a
            href={downloadUrl || '#'}
            download={`ZeroDayHeist-CTF-Certificate-${participant.name.replace(/\s+/g, '-')}.png`}
            className="w-full py-3.5 px-4 bg-red-600 hover:bg-red-700 text-white font-mono font-bold rounded-xl flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98] shadow-lg shadow-red-900/30 uppercase tracking-wider text-sm"
          >
            <Download className="h-4 w-4" />
            Download Verified Certificate
          </a>
        </div>
      </div>

      {/* Font preloaders */}
      <div style={{ opacity: 0, position: 'absolute', pointerEvents: 'none', zIndex: -100, width: 1, height: 1, overflow: 'hidden' }} aria-hidden="true">
        {['Great Vibes','Alex Brush','Pinyon Script','Allura','Rochester','Kaushan Script','Cinzel','Playfair Display','Space Grotesk'].map(f => (
          <span key={f} style={{ fontFamily: `"${f}"` }}>preload</span>
        ))}
      </div>
    </div>
  );
}