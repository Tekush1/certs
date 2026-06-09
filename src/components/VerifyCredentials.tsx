/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Participant } from '../types';
import { verifyCredential } from '../data/participants';
import { ShieldCheck, CheckCircle2, ShieldX, Search, ArrowRight } from 'lucide-react';

interface VerifyCredentialsProps {
  initialCode?: string;
}

export default function VerifyCredentials({ initialCode = '' }: VerifyCredentialsProps) {
  const [query, setQuery]           = useState<string>(initialCode);
  const [result, setResult]         = useState<Participant | null>(null);
  const [searched, setSearched]     = useState<boolean>(false);
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
      <div className="p-5 border border-cyber-border rounded-xl bg-cyber-card/60">
        <h3 className="text-md font-mono font-bold text-white mb-2 uppercase tracking-wide">
          CTF Credentials Verification Authority
        </h3>
        <p className="text-xs text-zinc-400 font-mono leading-relaxed">
          Verify the authenticity of a ZeroDayHeist certificate. Enter the{' '}
          <strong className="text-cyber-cyan font-bold">Verification Hash (e.g. ZDH-2026-XXXX)</strong>{' '}
          or the <strong className="text-cyber-cyan font-bold">exact full name</strong> printed on the credential.
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
            className="w-full pl-10 pr-4 py-3 bg-cyber-bg border border-cyber-border rounded-lg text-white font-mono text-sm placeholder-zinc-600 focus:border-cyber-cyan focus:outline-none transition-colors"
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
          <div className={`border rounded-xl p-6 space-y-6 relative overflow-hidden shadow-lg ${result.certificateType === 'grandfinale' ? 'border-yellow-400/30 bg-yellow-400/5' : 'border-cyber-teal/30 bg-cyber-teal/5'}`}>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none">
              <ShieldCheck className={`h-48 w-48 ${result.certificateType === 'grandfinale' ? 'text-yellow-400' : 'text-cyber-teal'}`} />
            </div>
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
              <div className={`p-3 rounded-full border shrink-0 ${result.certificateType === 'grandfinale' ? 'bg-yellow-400/10 border-yellow-400/30' : 'bg-cyber-teal/10 border-cyber-teal/30'}`}>
                <CheckCircle2 className={`h-8 w-8 ${result.certificateType === 'grandfinale' ? 'text-yellow-400' : 'text-cyber-teal'}`} />
              </div>
              <div className="text-center sm:text-left space-y-1">
                <div className={`font-mono font-bold text-lg uppercase tracking-widest ${result.certificateType === 'grandfinale' ? 'text-yellow-400' : 'text-cyber-teal'}`}>
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
                  { label: 'Recipient Name',    val: result.name,  color: 'text-white font-bold' },
                  { label: 'Team',              val: result.team,  color: 'text-cyber-purple font-bold' },
                  { label: 'Email ID',          val: result.email, color: 'text-white' },
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
                    <span className="text-cyber-teal font-bold">#{result.rank}</span>
                  </div>
                )}
                {result.score != null && (
                  <div className="flex justify-between border-b border-cyber-border/30 pb-2">
                    <span className="text-zinc-500">Score:</span>
                    <span className="text-cyber-cyan font-bold">{result.score} PTS</span>
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

            <div className="p-3 bg-cyber-bg/50 border border-cyber-border rounded-lg text-[11px] font-mono text-zinc-500">
              ⚡ This credential is database-verified and corresponds to an authorized ZeroDayHeist CTF 2026 participant.
            </div>
          </div>
        ) : (
          <div className="border border-cyber-magenta/30 rounded-xl bg-cyber-magenta/5 p-6 text-center space-y-4">
            <div className="p-3 bg-cyber-magenta/10 rounded-full border border-cyber-magenta/30 inline-block">
              <ShieldX className="h-8 w-8 text-cyber-magenta animate-pulse" />
            </div>
            <div className="space-y-1">
              <h4 className="text-cyber-magenta font-mono font-bold text-md uppercase tracking-wider">
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
