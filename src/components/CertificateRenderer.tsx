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
  const [toast, setToast] = useState<string>('');

  const [nameFontFamily, setNameFontFamily] = useState<string>('Great Vibes');
  const [nameYPercent, setNameYPercent] = useState<number>(49.8);
  const [nameFontSize, setNameFontSize] = useState<number>(150);
  const [teamYPercent, setTeamYPercent] = useState<number>(67.5);
  const [teamFontSize, setTeamFontSize] = useState<number>(24);
  const [verifyXPercent, setVerifyXPercent] = useState<number>(31.4);
  const [verifyYPercent, setVerifyYPercent] = useState<number>(96.4);
  const [verifyFontSize, setVerifyFontSize] = useState<number>(20);

  const verifyUrl = `${window.location.origin}?verify=${participant.id}`;
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 4000);
  };

  const captionText =
    `🏆 ZeroDayHeist CTF 2026 — Certificate of Achievement\n\n` +
    `Proud to share that I participated in ZeroDayHeist, a 6-Hour International Capture The Flag Competition organised by cyberhx.\n\n` +
    `👤 Participant: ${participant.name}\n` +
    `👥 Team: ${participant.team}\n` +
    `🛡️ Event: ZeroDayHeist CTF 2026\n` +
    `🆔 Credential ID: ${participant.id}\n` +
    `🔗 Verify: ${verifyUrl}\n\n` +
    `#cyberhx #ixedgeforge #zerodayheist #ctf #cybersecurity #ethicalhacking`;

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
    const baseFontSize = participant.name.length > 19
      ? nameFontSize * (19 / participant.name.length) * 0.92
      : nameFontSize;
    const nameSize = Math.round(baseFontSize * (h / 1414));

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

  const handleDownload = () => {
    if (!downloadUrl) return;
    if (isIOS) {
      const win = window.open('', '_blank');
      if (win) {
        win.document.write(`
          <html>
            <head>
              <title>Save Certificate</title>
              <meta name="viewport" content="width=device-width, initial-scale=1">
              <style>
                body { margin:0; background:#000; display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:100vh; }
                img { max-width:100%; height:auto; }
                p { color:#fff; font-family:monospace; font-size:14px; margin-top:16px; text-align:center; padding:0 16px; }
              </style>
            </head>
            <body>
              <img src="${downloadUrl}" />
              <p>📸 Long press on image → "Save to Photos"</p>
            </body>
          </html>
        `);
        win.document.close();
      }
      showToast('📸 New tab mein khula — long press → Save to Photos');
      return;
    }
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `ZeroDayHeist-CTF-Certificate-${participant.name.replace(/\s+/g, '-')}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const addToLinkedIn = () => {
    const issueDate = new Date(participant.issuedAt);
    const params = new URLSearchParams({
      startTask: 'CERTIFICATION_NAME',
      name: 'ZeroDayHeist CTF 2026 Certificate of Achievement',
      organizationName: 'CyberHx',
      organizationId: '107736778',
      issueYear: String(issueDate.getFullYear() || 2026),
      issueMonth: String((issueDate.getMonth() + 1) || 6),
      certUrl: verifyUrl,
      certId: participant.id,
    });
    window.open(`https://www.linkedin.com/profile/add?${params.toString()}`, '_blank', 'noopener,noreferrer');
    showToast('✅ LinkedIn Certifications form khul raha hai — Save karo!');
  };

  const shareToInstagram = () => {
    navigator.clipboard.writeText(captionText).catch(() => {});
    if (isIOS) {
      if (downloadUrl) window.open(downloadUrl, '_blank');
      showToast('📋 Caption copied! Save the image → open Instagram → paste caption');
      setTimeout(() => {
        window.location.href = 'instagram://app';
      }, 1200);
      return;
    }
    if (downloadUrl) handleDownload();
    showToast('📋 Caption copied! Open Instagram and paste the caption');
  };

  return (
    <div id="certificate-viewer" className="space-y-6">

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-xl text-xs font-mono text-white shadow-2xl max-w-sm text-center">
          {toast}
        </div>
      )}

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
                    <div className="flex justify-between text-[11px] mb-1 font-mono"><span>X Position ({verifyXPercent}%)</span><span className="text-zinc-500">Default: 31.4%</span></div>
                    <input type="range" min="12" max="35" step="0.1" value={verifyXPercent} onChange={(e) => setVerifyXPercent(parseFloat(e.target.value))} className="w-full accent-red-500 bg-zinc-800 rounded-lg appearance-none h-1.5" />
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] mb-1 font-mono"><span>Y Position ({verifyYPercent}%)</span><span className="text-zinc-500">Default: 96.4%</span></div>
                    <input type="range" min="93" max="99.5" step="0.1" value={verifyYPercent} onChange={(e) => setVerifyYPercent(parseFloat(e.target.value))} className="w-full accent-red-500 bg-zinc-800 rounded-lg appearance-none h-1.5" />
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] mb-1 font-mono"><span>Font Size ({verifyFontSize}px)</span><span className="text-zinc-500">Default: 20px</span></div>
                    <input type="range" min="8" max="22" step="1" value={verifyFontSize} onChange={(e) => setVerifyFontSize(parseInt(e.target.value))} className="w-full accent-red-500 bg-zinc-800 rounded-lg appearance-none h-1.5" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom: ID Card + Download */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Left: ID Card */}
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

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button onClick={copyCredId} className="flex items-center justify-center gap-1.5 py-2 rounded-lg border border-red-900/40 bg-red-900/10 hover:bg-red-900/20 text-red-400 font-mono text-[11px] font-bold transition-all">
              <Copy className="h-3 w-3" /> COPY ID
            </button>
            <button onClick={() => window.open(verifyUrl, '_blank')} className="flex items-center justify-center gap-1.5 py-2 rounded-lg border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-mono text-[11px] font-bold transition-all">
              <ExternalLink className="h-3 w-3" /> OPEN VERIFY URL
            </button>
          </div>

          <div className="flex items-center gap-2 p-3 rounded-lg bg-green-900/10 border border-green-900/20">
            <Lock className="h-3.5 w-3.5 text-green-500 shrink-0" />
            <span className="text-[10px] font-mono text-green-400">This credential is cryptographically signed and tamper-proof.</span>
          </div>
        </div>

        {/* Right: Badge + Actions */}
        <div className="rounded-xl border border-red-900/40 bg-black p-5 flex flex-col items-center justify-between gap-4">

          <div className="flex-1 flex items-center justify-center w-full">
            <img
              src={participant.certificateType === 'grandfinale' ? '/zdh-finale.png' : '/zdh-badge.png'}
              alt="ZeroDayHeist Badge"
              className="max-h-52 w-auto object-contain drop-shadow-[0_0_24px_rgba(220,38,38,0.3)]"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          </div>

          <div className="text-center space-y-1">
            <div className="text-sm font-mono font-bold text-white tracking-[3px] uppercase">Verified Credential</div>
            <p className="text-[10px] text-zinc-500 font-mono">High-definition 300 DPI certificate for archiving.</p>
          </div>

          <div className="flex items-center justify-center gap-3 flex-wrap">
            {['Blockchain Verified', 'Secure Credential', 'Tamper Proof'].map(t => (
              <div key={t} className="flex items-center gap-1 text-[9px] font-mono text-green-400">
                <Check className="h-2.5 w-2.5" />{t}
              </div>
            ))}
          </div>

          {/* Download */}
          <button
            onClick={handleDownload}
            disabled={!downloadUrl}
            className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-mono font-bold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-40 uppercase tracking-wider text-sm"
          >
            <Download className="h-4 w-4" />
            {isIOS ? 'Open Certificate → Long Press to Save' : 'Download Verified Certificate'}
          </button>

          {/* Share buttons */}
          <div className="grid grid-cols-1 gap-2 w-full">
            <button
              onClick={addToLinkedIn}
              className="py-3 px-3 rounded-xl font-mono text-xs font-bold flex items-center justify-center gap-2 bg-[#0a66c2] hover:bg-[#0957a8] text-white transition-all active:scale-[0.98] ring-2 ring-[#0a66c2]/40 shadow-lg shadow-[#0a66c2]/20"
            >
              <svg className="h-3.5 w-3.5 shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              Add to LinkedIn Profile
            </button>
            <button
              onClick={shareToInstagram}
              className="py-2.5 px-3 rounded-xl font-mono text-xs font-bold flex items-center justify-center gap-2 bg-gradient-to-r from-[#f09433] via-[#dc2743] to-[#bc1888] text-white transition-all active:scale-[0.98]"
            >
              <svg className="h-3.5 w-3.5 shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              Instagram
            </button>
          </div>

          {/* iOS instruction */}
          {isIOS && (
            <div className="w-full p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-zinc-400 space-y-1">
              <div>📥 <span className="text-white">Download:</span> Image tab mein khulegi → long press → Save to Photos</div>
              <div>💼 <span className="text-white">LinkedIn:</span> Image save karo → LinkedIn app mein post karo → caption paste karo</div>
              <div>📸 <span className="text-white">Instagram:</span> Image save karo → Instagram app mein post karo → caption paste karo</div>
            </div>
          )}
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