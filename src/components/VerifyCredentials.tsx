/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Participant } from '../types';
import { verifyCredential } from '../data/participants';
import { ShieldX, Search, ArrowRight } from 'lucide-react';

function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!domain || local.length < 2) return email;
  const visible = local.slice(0, 2);
  const masked  = '*'.repeat(Math.max(local.length - 2, 3));
  return `${visible}${masked}@${domain}`;
}

interface VerifyCredentialsProps {
  initialCode?: string;
}

export default function VerifyCredentials({ initialCode = '' }: VerifyCredentialsProps) {
  const [query, setQuery]             = useState<string>(initialCode);
  const [result, setResult]           = useState<Participant | null>(null);
  const [searched, setSearched]       = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  useEffect(() => {
    if (!initialCode) return;
    setQuery(initialCode);
    const run = async () => {
      setIsVerifying(true);
      setResult(await verifyCredential(initialCode));
      setSearched(true);
      setIsVerifying(false);
    };
    run();
  }, [initialCode]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setIsVerifying(true);
    setResult(await verifyCredential(query));
    setSearched(true);
    setIsVerifying(false);
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="p-5 border border-red-900/40 rounded-xl bg-black">
        <h3 className="text-md font-mono font-bold text-white mb-2 uppercase tracking-wide">
          CTF Credentials Verification Authority
        </h3>
        <p className="text-xs text-zinc-400 font-mono leading-relaxed">
          Verify the authenticity of a ZeroDayHeist certificate. Enter the{' '}
          <strong className="text-red-400 font-bold">Verification Hash (e.g. ZDH-2026-XXXX)</strong>{' '}
          or the <strong className="text-red-400 font-bold">exact full name</strong> printed on the credential.
        </p>
      </div>

      {/* Input */}
      <form onSubmit={handleVerify} className="flex gap-2">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-zinc-500" />
          </div>
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value.slice(0, 120))}
            placeholder="Verification Hash or Participant Name..."
            className="w-full pl-10 pr-4 py-3 bg-cyber-bg border border-cyber-border rounded-lg text-white font-mono text-sm placeholder-zinc-600 focus:border-red-500 focus:outline-none transition-colors"
          />
        </div>
        <button
          type="submit"
          disabled={isVerifying}
          className="px-6 py-3 bg-cyber-cyan text-black hover:bg-cyber-cyan/85 font-mono text-sm font-bold rounded-lg flex items-center gap-2 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <span>{isVerifying ? 'Verifying...' : 'Verify'}</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </form>

      {/* Result */}
      {searched && !isVerifying && (
        result ? (
          <div className={`border rounded-xl p-6 space-y-6 relative overflow-hidden shadow-lg ${result.certificateType === 'grandfinale' ? 'border-yellow-400/30 bg-yellow-400/5' : 'border-red-900/40 bg-red-900/5'}`}>

            {/* Badge icon */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
              <div className="shrink-0">
                <img
                  src={result.certificateType === 'grandfinale' ? '/zdh-finale.png' : '/zdh-badge.png'}
                  alt="Badge"
                  className="h-16 w-auto object-contain drop-shadow-lg"
                />
              </div>
              <div className="text-center sm:text-left space-y-1">
                <div className={`font-mono font-bold text-lg uppercase tracking-widest ${result.certificateType === 'grandfinale' ? 'text-yellow-400' : 'text-red-400'}`}>
                  {result.certificateType === 'grandfinale' ? '🏆 Grand Finale Credential Verified' : 'Credential Verified'}
                </div>
                <div className="text-xs font-mono text-zinc-400">
                  {result.certificateType === 'grandfinale'
                    ? 'ZERODAYHEIST 2026 — GRAND FINALE FINALIST CONFIRMED'
                    : 'ZERODAYHEIST 2026 — SECURITY STAMP APPROVED'}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-cyber-border/50 pt-4">
              <div className="space-y-3 font-mono text-xs">
                {[
                  { label: 'Recipient Name', val: result.name,  color: 'text-white font-bold' },
                  { label: 'Team',           val: result.team,  color: 'text-cyber-purple font-bold' },
                  { label: 'Email ID',       val: maskEmail(result.email), color: 'text-white' },
                ].map(r => (
                  <div key={r.label} className="flex justify-between border-b border-cyber-border/30 pb-2">
                    <span className="text-zinc-500">{r.label}:</span>
                    <span className={r.color}>{r.val}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-3 font-mono text-xs">
                {result.rank != null && (
                  <div className="flex justify-between border-b border-cyber-border/30 pb-2">
                    <span className="text-zinc-500">CTF Rank:</span>
                    <span className="text-red-400 font-bold">#{result.rank}</span>
                  </div>
                )}
                {result.score != null && (
                  <div className="flex justify-between border-b border-cyber-border/30 pb-2">
                    <span className="text-zinc-500">Score:</span>
                    <span className="text-red-400 font-bold">{result.score} PTS</span>
                  </div>
                )}
                <div className="flex justify-between border-b border-cyber-border/30 pb-2">
                  <span className="text-zinc-500">Verification ID:</span>
                  <span className="text-yellow-400 font-semibold">{result.id}</span>
                </div>
                <div className="flex justify-between border-b border-cyber-border/30 pb-2">
                  <span className="text-zinc-500">Issued:</span>
                  <span className="text-white">{result.issuedAt}</span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-cyber-bg/50 border border-red-900/20 rounded-lg text-[11px] font-mono text-zinc-500">
              ⚡ This credential is database-verified and corresponds to an authorized ZeroDayHeist CTF 2026 participant.
            </div>
          </div>
        ) : (
          <div className="border border-red-900/30 rounded-xl bg-red-900/5 p-6 text-center space-y-4">
            <div className="p-3 bg-red-900/10 rounded-full border border-red-900/30 inline-block">
              <ShieldX className="h-8 w-8 text-red-500 animate-pulse" />
            </div>
            <div className="space-y-1">
              <h4 className="text-red-400 font-mono font-bold text-md uppercase tracking-wider">
                Verification Failed
              </h4>
              <p className="text-xs font-mono text-zinc-400 max-w-md mx-auto">
                No credential matching <strong className="text-white">"{query}"</strong> was found in the database.
                Please check the verification hash or name and try again.
              </p>
            </div>
          </div>
        )
      )}
    </div>
  );
}