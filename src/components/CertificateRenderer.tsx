/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { Participant } from '../types';
import { Download, ShieldCheck, Copy, Check, Info, Sliders, RefreshCw } from 'lucide-react';

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

  // Calibration Positions (Tuned specifically for /public/certificate.png)
  const [nameFontFamily, setNameFontFamily] = useState<string>('Great Vibes');
  const [nameYPercent, setNameYPercent] = useState<number>(49.8);      // Beautifully centered in the blank space (calibrated by user to 49.8%)
  const [nameFontSize, setNameFontSize] = useState<number>(150);       // Elegant default sizing for luxury certificate calligraphy (calibrated to 150px)
  const [teamYPercent, setTeamYPercent] = useState<number>(67.5);      // Percentage height: 67.5%
  const [teamFontSize, setTeamFontSize] = useState<number>(24);        // Target font size in px at w=2000
  const [verifyXPercent, setVerifyXPercent] = useState<number>(31.6);
const [verifyYPercent, setVerifyYPercent] = useState<number>(96.9);
const [verifyFontSize, setVerifyFontSize] = useState<number>(20);
  // Generate verification URL
  const verifyUrl = `${window.location.origin}?verify=${participant.id}`;

  // Check and wait for fonts to load before drawing
  useEffect(() => {
    if (document.fonts) {
      document.fonts.ready.then(() => {
        setFontsLoaded(true);
      });
    } else {
      setTimeout(() => setFontsLoaded(true), 500);
    }
  }, []);

  // Guarantee that the selected font is fully loaded and cached by the browser before painting on the canvas
  useEffect(() => {
    if (typeof document === 'undefined' || !document.fonts) return;
    
    // We try to load multiple styles/weights for the selected font family
    const fontStr400 = `400 40px "${nameFontFamily}"`;
    const fontStr500 = `500 40px "${nameFontFamily}"`;
    const fontStr700 = `700 40px "${nameFontFamily}"`;
    
    Promise.all([
      document.fonts.load(fontStr400),
      document.fonts.load(fontStr500),
      document.fonts.load(fontStr700),
    ]).then(() => {
      setFontLoadToggle(prev => prev + 1);
    }).catch((err) => {
      console.warn("Failed to load chosen font family:", err);
      // Still trigger counter increment as fallback to ensure repaint is called
      setFontLoadToggle(prev => prev + 1);
    });
  }, [nameFontFamily]);

  // Pre-load the background template image — based on certificate type
  useEffect(() => {
    const src = participant.certificateType === 'grandfinale'
      ? '/certificate.png'
      : '/certificate_participant.png';
    const img = new Image();
    img.src = src;
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setTemplateImage(img);
      setImageLoaded(true);
    };
    img.onerror = (e) => {
      console.error(`Failed to load ${src}`, e);
    };
  }, [participant.certificateType]);

  // Reset calibration to optimal screenshot defaults
  const resetCalibration = () => {
    setNameFontFamily('Great Vibes');
    setNameYPercent(49.8);
    setNameFontSize(150);
    setVerifyXPercent(27.4);
    setVerifyYPercent(97.2);
    setVerifyFontSize(14);
  };

  // Draw certificate to hidden high-def canvas for downloading
  const drawCertificate = () => {
    const canvas = canvasRef.current;
    if (!canvas || !templateImage || !imageLoaded) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Use full natural dimensions of the uploaded theme so it is strictly lossless and sharp
    const w = templateImage.naturalWidth || 2000;
    const h = templateImage.naturalHeight || 1414;
    canvas.width = w;
    canvas.height = h;

    // 1. Paint the uploaded template background
    ctx.drawImage(templateImage, 0, 0, w, h);

    // 2. Identify layout values relative to scaled aspect ratio
    const leftW = Math.round(w * 0.28);
    const rightW = w - leftW;
    const cX = leftW + Math.round(rightW / 2); // Center of the name/title column list (around 1280 for w=2000)

    // 3. Draw Dynamic Participant Name on top of the blank name space
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#0a0d14'; // Elegant deep black matching newspaper headlines
    
    // Calculate dynamic size based on user calibration settings
    const nameSize = Math.round(nameFontSize * (h / 1414));
    
    // Set font family based on user choice (Cursive, signature, or Times of India style serif)
    if (nameFontFamily === 'Playfair Display') {
      ctx.font = `700 ${nameSize}px "Playfair Display", "Times New Roman", serif`;
    } else if (nameFontFamily === 'Space Grotesk') {
      ctx.font = `800 ${nameSize}px "Space Grotesk", sans-serif`;
    } else if (nameFontFamily === 'Cinzel') {
      ctx.font = `700 ${nameSize}px "Cinzel", "Georgia", serif`;
    } else {
      ctx.font = `500 ${nameSize}px "${nameFontFamily}", "Alex Brush", "Great Vibes", cursive`;
    }
    
    // Draw the name centered precisely according to calibration
    const nameYVal = Math.round(h * (nameYPercent / 100));
    ctx.fillText(participant.name, cX, nameYVal);

    // 4. Draw Dynamic Team Name block omitted as requested ("team name hata dena")

    // 5. Draw Dynamic Verification ID and URL in the bottom black band
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#ffffff'; // White mono characters
    
    const verifySize = Math.round(verifyFontSize * (h / 1414));
    ctx.font = `500 ${verifySize}px "JetBrains Mono", monospace`;
    
    const verifyXVal = leftW + Math.round(w * (verifyXPercent / 100)); 
    const verifyYVal = Math.round(h * (verifyYPercent / 100));
    
    ctx.fillText(participant.id, verifyXVal, verifyYVal);

    // Convert canvas back to image URL for super sharp offline download
    try {
      const dataUrl = canvas.toDataURL('image/png');
      setDownloadUrl(dataUrl);
      if (onImageGenerated) {
        onImageGenerated(dataUrl);
      }
    } catch (e) {
      console.error("Canvas export failed:", e);
    }
  };

  // Re-render when participant details or coordinates change
  useEffect(() => {
    drawCertificate();
  }, [
    participant, 
    fontsLoaded,
    fontLoadToggle, 
    imageLoaded, 
    templateImage,
    nameFontFamily,
    nameYPercent, 
    nameFontSize, 
    teamYPercent, 
    teamFontSize, 
    verifyXPercent, 
    verifyYPercent, 
    verifyFontSize
  ]);

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
      {/* Visual Web Preview of the certificate matching the real physical model */}
      <div className="relative border border-cyber-border rounded-xl bg-[#090b11] p-1 md:p-2 overflow-hidden shadow-2xl shadow-cyber-cyan/5">
        
        {/* Certificate Mockup Frame using the pixel-perfect generated image */}
        <div className="relative aspect-[2000/1414] w-full overflow-hidden rounded-lg bg-zinc-950 border border-zinc-800 shadow-inner select-none flex items-center justify-center">
          {downloadUrl ? (
            <img 
              src={downloadUrl} 
              alt="ZeroDayHeist Certificate Preview" 
              className="w-full h-auto object-contain select-none"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col justify-center items-center gap-3 text-zinc-500 font-mono text-xs">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-red-500" />
              <span>GENERATING CREDENTIAL TEMPLATE GRAPHICS...</span>
            </div>
          )}
        </div>
      </div>

      {/* Hidden high-res canvas ready for conversion */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Live Calibration Controls (Collapsible widget for perfecting coordinates) */}
      <div className="border border-cyber-border rounded-xl bg-cyber-card/45 overflow-hidden transition-all">
        <button
          onClick={() => setShowCalibration(!showCalibration)}
          className="w-full px-5 py-4 flex items-center justify-between text-zinc-300 hover:text-white transition-colors bg-cyber-bg/20 font-mono text-sm border-b border-cyber-border/40"
          id="btn-toggle-calibration"
        >
          <div className="flex items-center gap-2">
            <Sliders className="h-4 w-4 text-cyber-cyan" />
            <span>Layout Alignment Calibration Dashboard</span>
          </div>
          <span className="text-xs text-cyber-cyan border border-cyber-cyan/30 px-2 py-0.5 rounded">
            {showCalibration ? 'COLLAPSE' : 'EDIT ALIGNMENTS'}
          </span>
        </button>

        {showCalibration && (
          <div className="p-5 space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center bg-cyber-cyan/5 border border-cyber-cyan/20 p-3 rounded-lg text-xs leading-relaxed text-zinc-300">
              <p>
                💡 Use these sliders to adjust coordinates to pixel-perfect positions. Changes are previewed instantly above and are fully reflected inside the final downloaded certificate file.
              </p>
              <button
                onClick={resetCalibration}
                className="flex items-center gap-1 bg-cyber-cyan/10 hover:bg-cyber-cyan/20 px-2.5 py-1.5 rounded font-mono text-cyber-cyan transition-colors font-semibold select-none text-[10px]"
                id="btn-reset-calibration"
              >
                <RefreshCw className="h-3 w-3" />
                <span>RESET DEFAULT</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-zinc-300">
              
              {/* Recipient Name Controls */}
              <div className="space-y-4 border border-zinc-800 p-4 rounded-lg bg-zinc-950/40">
                <h5 className="font-mono text-[11px] text-cyber-cyan font-bold tracking-wider uppercase border-b border-zinc-800 pb-1.5">
                  1. Recipient Name Alignment
                </h5>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-[11px] mb-1 font-mono">
                      <span>Font Style Theme</span>
                      <span className="text-zinc-500">Great Vibes Default</span>
                    </div>
                    <select
                      value={nameFontFamily}
                      onChange={(e) => setNameFontFamily(e.target.value)}
                      className="w-full px-2 py-2 rounded bg-zinc-900 border border-zinc-800 text-white font-mono text-xs focus:ring-1 focus:ring-cyber-cyan focus:border-cyber-cyan outline-none cursor-pointer"
                      id="select-font-family"
                    >
                      <option value="Great Vibes">Calligraphy (Great Vibes - Best for Certificate!)</option>
                      <option value="Alex Brush">Elegant Brush (Alex Brush)</option>
                      <option value="Pinyon Script">Luxurious Slanted (Pinyon Script - Ultra Premium)</option>
                      <option value="Allura">Classic Smooth (Allura Signature)</option>
                      <option value="Rochester">Vintage Gilded (Rochester Script)</option>
                      <option value="Kaushan Script">Brush Script (Playlist Alternative)</option>
                      <option value="Cinzel">Royal Roman (Cinzel Display Serif)</option>
                      <option value="Playfair Display">Newspaper Headline (Playfair Display)</option>
                      <option value="Space Grotesk">Cyber Gothic (Space Grotesk)</option>
                    </select>
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] mb-1 font-mono">
                      <span>Vertical Y Position ({nameYPercent}%)</span>
                      <span className="text-zinc-500">Default: 49.8%</span>
                    </div>
                    <input 
                      type="range" 
                      min="35" 
                      max="55" 
                      step="0.1"
                      value={nameYPercent}
                      onChange={(e) => setNameYPercent(parseFloat(e.target.value))}
                      className="w-full accent-cyber-cyan bg-zinc-800 rounded-lg appearance-none h-1.5 cursor-pointer"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] mb-1 font-mono">
                      <span>Font Size ({nameFontSize}px)</span>
                      <span className="text-zinc-500">Default: 150px</span>
                    </div>
                    <input 
                      type="range" 
                      min="30" 
                      max="160" 
                      step="1"
                      value={nameFontSize}
                      onChange={(e) => setNameFontSize(parseInt(e.target.value))}
                      className="w-full accent-cyber-cyan bg-zinc-800 rounded-lg appearance-none h-1.5 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Bottom Verification Text Controls */}
              <div className="md:col-span-2 space-y-4 border border-zinc-800 p-4 rounded-lg bg-zinc-950/40">
                <h5 className="font-mono text-[11px] text-cyber-teal font-bold tracking-wider uppercase border-b border-zinc-800 pb-1.5">
                  2. Verification Code & URL Alignment (Bottom Bar)
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className="flex justify-between text-[11px] mb-1 font-mono">
                      <span>Horizontal X Position ({verifyXPercent}%)</span>
                      <span className="text-zinc-500">Default: 27.4%</span>
                    </div>
                    <input 
                      type="range" 
                      min="12" 
                      max="35" 
                      step="0.1"
                      value={verifyXPercent}
                      onChange={(e) => setVerifyXPercent(parseFloat(e.target.value))}
                      className="w-full accent-cyber-teal bg-zinc-800 rounded-lg appearance-none h-1.5"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] mb-1 font-mono">
                      <span>Vertical Y Position ({verifyYPercent}%)</span>
                      <span className="text-zinc-500">Default: 97.2%</span>
                    </div>
                    <input 
                      type="range" 
                      min="93" 
                      max="99.5" 
                      step="0.1"
                      value={verifyYPercent}
                      onChange={(e) => setVerifyYPercent(parseFloat(e.target.value))}
                      className="w-full accent-cyber-teal bg-zinc-800 rounded-lg appearance-none h-1.5"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] mb-1 font-mono">
                      <span>Font Size ({verifyFontSize}px)</span>
                      <span className="text-zinc-500">Default: 14px</span>
                    </div>
                    <input 
                      type="range" 
                      min="8" 
                      max="22" 
                      step="1"
                      value={verifyFontSize}
                      onChange={(e) => setVerifyFontSize(parseInt(e.target.value))}
                      className="w-full accent-cyber-teal bg-zinc-800 rounded-lg appearance-none h-1.5"
                    />
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>

      {/* Quick Action Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Certificate Metadata Controls */}
        <div className="p-5 border border-cyber-border rounded-xl bg-cyber-card/65 space-y-4">
          <div className="flex items-center gap-2 font-mono text-sm text-zinc-300 border-b border-cyber-border pb-2">
            <Info className="h-4 w-4 text-cyber-cyan" />
            <span>Digital Credential ID Card</span>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-zinc-400">Recipient Name:</span>
              <span className="text-white font-semibold">{participant.name}</span>
            </div>
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-zinc-400">Team Affiliation:</span>
              <span className="text-white font-semibold">{participant.team}</span>
            </div>
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-zinc-400">Verification ID:</span>
              <div className="flex items-center gap-2">
                <span className="text-cyber-cyan font-semibold">{participant.id}</span>
                <button 
                  onClick={copyCredId}
                  className="p-1 hover:bg-cyber-light rounded text-zinc-400 hover:text-white transition-colors"
                  title="Copy verification hash"
                  id={`btn-copy-id-${participant.id}`}
                >
                  {copiedId ? <Check className="h-3 w-3 text-cyber-teal" /> : <Copy className="h-3 w-3" />}
                </button>
              </div>
            </div>
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-zinc-400">Verification URL:</span>
              <div className="flex items-center gap-2">
                <span className="text-zinc-400 truncate max-w-[140px] md:max-w-xs">{verifyUrl}</span>
                <button 
                  onClick={copyVerificationLink}
                  className="p-1 hover:bg-cyber-light rounded text-zinc-400 hover:text-white transition-colors"
                  title="Copy Verification Link"
                  id={`btn-copy-link-${participant.id}`}
                >
                  {copiedLink ? <Check className="h-3 w-3 text-cyber-teal" /> : <Copy className="h-3 w-3" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Big download action */}
        <div className="flex flex-col justify-center items-center p-6 border-2 border-dashed border-cyber-cyan/20 rounded-xl bg-cyber-bg/50">
          <div className="p-4 bg-cyber-cyan/10 rounded-full mb-3 border border-cyber-cyan/20">
            <ShieldCheck className="h-10 w-10 text-cyber-cyan" />
          </div>
          <h4 className="text-md text-white font-bold mb-1">Verify and Download PNG</h4>
          <p className="text-xs text-zinc-400 text-center max-w-xs mb-4">
            Get your high-definition (A4 equivalent, landscape) 300 DPI cryptocurrency-grade certificate for archiving.
          </p>
          <a
            href={downloadUrl}
            download={`ZeroDayHeist-CTF-Certificate-${participant.name.replace(/\s+/g, '-')}.png`}
            className="w-full py-3 px-4 bg-gradient-to-r from-cyber-cyan to-cyber-purple hover:from-cyber-cyan/85 hover:to-cyber-purple/85 text-black hover:text-white font-bold rounded-lg flex items-center justify-center gap-2 transition-all duration-300 transform active:scale-95 shadow-md shadow-cyber-cyan/20"
            id={`btn-download-cert-${participant.id}`}
          >
            <Download className="h-5 w-5" />
            <span>Download Official Certificate</span>
          </a>
        </div>
      </div>

      {/* Hidden DOM elements to force the browser to initiate font file downloads */}
      <div style={{ opacity: 0, position: 'absolute', pointerEvents: 'none', zIndex: -100, width: 1, height: 1, overflow: 'hidden' }} aria-hidden="true">
        <span style={{ fontFamily: '"Great Vibes"' }}>preload</span>
        <span style={{ fontFamily: '"Alex Brush"' }}>preload</span>
        <span style={{ fontFamily: '"Pinyon Script"' }}>preload</span>
        <span style={{ fontFamily: '"Allura"' }}>preload</span>
        <span style={{ fontFamily: '"Rochester"' }}>preload</span>
        <span style={{ fontFamily: '"Kaushan Script"' }}>preload</span>
        <span style={{ fontFamily: '"Cinzel"' }}>preload</span>
        <span style={{ fontFamily: '"Playfair Display"' }}>preload</span>
        <span style={{ fontFamily: '"Space Grotesk"' }}>preload</span>
      </div>
    </div>
  );
}
