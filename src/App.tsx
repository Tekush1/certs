/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Participant, CertificateType } from './types';
import {
  searchParticipants,
  registerParticipant,
  getParticipantCount,
  getGrandFinaleCount,
  getTeamCount,
} from './data/participants';
import CertificateRenderer from './components/CertificateRenderer';
import ShareSocial from './components/ShareSocial';
import VerifyCredentials from './components/VerifyCredentials';
import {
  Search, UserCheck, Award, UserPlus,
  Sparkles, Terminal, Cpu, Lock, ChevronRight,
  BookmarkCheck, Trophy,
} from 'lucide-react';

type MainTab = 'claim' | 'verify';
type ClaimSection = 'participant' | 'grandfinale';

export default function App() {
  const [activeTab, setActiveTab]                     = useState<MainTab>('claim');
  const [claimSection, setClaimSection]               = useState<ClaimSection>('participant');

  const [searchQuery, setSearchQuery]                 = useState('');
  const [searchResults, setSearchResults]             = useState<Participant[]>([]);
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const [certificateImage, setCertificateImage]       = useState('');

  const [regName, setRegName]     = useState('');
  const [regEmail, setRegEmail]   = useState('');
  const [regTeam, setRegTeam]     = useState('');
  const [showRegForm, setShowRegForm]         = useState(false);
  const [regSuccessMessage, setRegSuccessMessage] = useState('');

  const [isSearching, setIsSearching]     = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [statsLoading, setStatsLoading]   = useState(true);

  const [stats, setStats] = useState({ participants: 0, grandfinale: 0, challenges: 48, teams: 0 });
  const [initialVerifyCode, setInitialVerifyCode] = useState('');

  const loadStats = async () => {
    setStatsLoading(true);
    const [participants, grandfinale, teams] = await Promise.all([
      getParticipantCount(),
      getGrandFinaleCount(),
      getTeamCount(),
    ]);
    setStats({ participants, grandfinale, challenges: 48, teams });
    setStatsLoading(false);
  };

  useEffect(() => {
    loadStats();
    const params = new URLSearchParams(window.location.search);
    const vc = params.get('verify');
    if (vc) { setInitialVerifyCode(vc); setActiveTab('verify'); }
  }, []);

  // Reset search state when switching sections
  const switchSection = (section: ClaimSection) => {
    setClaimSection(section);
    setSearchQuery('');
    setSearchResults([]);
    setSelectedParticipant(null);
    setCertificateImage('');
    setShowRegForm(false);
    setRegName(''); setRegEmail(''); setRegTeam('');
  };

  const currentType: CertificateType = claimSection === 'grandfinale' ? 'grandfinale' : 'participant';

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setSearchResults(await searchParticipants(searchQuery, currentType));
    setIsSearching(false);
  };

  const selectParticipant = (p: Participant) => {
    setSelectedParticipant(p);
    setCertificateImage('');
    setSearchResults([]);
    setSearchQuery('');
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim() || !regTeam.trim()) {
      alert('Please fill in all fields.');
      return;
    }
    setIsRegistering(true);
    try {
      const p = await registerParticipant(regName.trim(), regEmail.trim(), regTeam.trim(), currentType);
      await loadStats();
      setSelectedParticipant(p);
      setRegSuccessMessage(`Certificate issued for ${p.name}.`);
      setRegName(''); setRegEmail(''); setRegTeam('');
      setShowRegForm(false);
      setTimeout(() => setRegSuccessMessage(''), 5000);
    } catch (err: any) {
      alert(err?.message ?? 'Registration failed. Please try again.');
    } finally {
      setIsRegistering(false);
    }
  };

  const statVal = (v: number | string) =>
    statsLoading
      ? <span className="animate-pulse text-zinc-500 text-sm">—</span>
      : <>{v}</>;

  return (
    <div className="min-h-screen pb-16 flex flex-col relative overflow-hidden bg-cyber-bg text-cyber-text font-sans">
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-cyber-cyan/3 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-cyber-purple/3 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="border-b border-cyber-border bg-cyber-bg/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
         <div className="flex items-center gap-3">
  <img
    src="/cyberhxlogo.png"
    alt="cyberhx"
    className="h-16 w-auto object-contain"
  />
</div>
          </div>
          <div className="flex bg-cyber-card/85 p-1 rounded-lg border border-cyber-border/80 gap-1">
            <button
              onClick={() => {
                setActiveTab('claim');
                if (window.history.pushState) {
                  const u = `${window.location.protocol}//${window.location.host}${window.location.pathname}`;
                  window.history.pushState({ path: u }, '', u);
                }
              }}
              className={`px-5 py-2 rounded-md text-xs font-semibold font-mono flex items-center gap-2 transition-all duration-300 ${activeTab === 'claim' ? 'bg-[#10b981] text-black shadow-lg shadow-[#10b981]/20' : 'text-zinc-400 hover:text-white hover:bg-cyber-light'}`}
            >
              <Award className="h-3.5 w-3.5" /><span>Claim Certificate</span>
            </button>
            <button
              onClick={() => setActiveTab('verify')}
              className={`px-5 py-2 rounded-md text-xs font-semibold font-mono flex items-center gap-2 transition-all duration-300 ${activeTab === 'verify' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'text-zinc-400 hover:text-white hover:bg-cyber-light'}`}
            >
              <UserCheck className="h-3.5 w-3.5" /><span>Verify Credentials</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 w-full space-y-8">

        {regSuccessMessage && (
          <div className="p-4 bg-cyber-teal/10 border border-cyber-teal/30 rounded-xl flex items-center gap-3 font-mono text-xs text-cyber-teal">
            <BookmarkCheck className="h-5 w-5 shrink-0" />
            <span>{regSuccessMessage}</span>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: <Cpu className="h-5 w-5 text-cyber-cyan" />,    bg: 'bg-cyber-cyan/15 border-cyber-cyan/25',     label: 'Participants',        val: `${stats.participants} Validated` },
            { icon: <Trophy className="h-5 w-5 text-yellow-400" />, bg: 'bg-yellow-400/15 border-yellow-400/25',     label: 'Grand Finale',        val: `${stats.grandfinale} Finalists` },
            { icon: <Terminal className="h-5 w-5 text-cyber-purple" />, bg: 'bg-cyber-purple/15 border-cyber-purple/25', label: 'All over the world',   val: `${stats.challenges}+ Countries` },
            { icon: <Lock className="h-5 w-5 text-cyber-teal" />,   bg: 'bg-cyber-teal/15 border-cyber-teal/25',    label: 'Participating Teams', val: `${stats.teams} Teams` },
          ].map((s, i) => (
            <div key={i} className={`p-4 border border-cyber-border/80 rounded-xl bg-cyber-card/45 flex items-center gap-4 ${i >= 2 ? 'hidden md:flex' : ''}`}>
              <div className={`p-2.5 border rounded-lg shrink-0 ${s.bg}`}>{s.icon}</div>
              <div className="text-left font-mono">
                <div className="text-xs text-zinc-400">{s.label}</div>
                <div className="text-md font-bold text-white tracking-wide">{statVal(s.val)}</div>
              </div>
            </div>
          ))}
        </div>

        {activeTab === 'claim' ? (
          <div className="space-y-6">

            {/* Section Toggle — Participants vs Grand Finale */}
            <div className="flex gap-3 p-1 bg-cyber-card/60 border border-cyber-border rounded-xl w-fit">
              <button
                onClick={() => switchSection('participant')}
                className={`px-6 py-2.5 rounded-lg text-xs font-mono font-bold flex items-center gap-2 transition-all duration-300 ${claimSection === 'participant' ? 'bg-[#10b981] text-black shadow-lg shadow-[#10b981]/25' : 'text-zinc-400 hover:text-white'}`}
              >
                <Award className="h-3.5 w-3.5" />
                Participants Certificate
              </button>
              <button
                onClick={() => switchSection('grandfinale')}
                className={`px-6 py-2.5 rounded-lg text-xs font-mono font-bold flex items-center gap-2 transition-all duration-300 ${claimSection === 'grandfinale' ? 'bg-yellow-400 text-black shadow-lg shadow-yellow-400/25' : 'text-zinc-400 hover:text-white'}`}
              >
                <Trophy className="h-3.5 w-3.5" />
                Grand Finale Certificate
              </button>
            </div>

            {/* Section Label */}
            <div className={`px-4 py-2 rounded-lg border font-mono text-xs w-fit ${claimSection === 'grandfinale' ? 'bg-yellow-400/10 border-yellow-400/30 text-yellow-400' : 'bg-cyber-cyan/10 border-cyber-cyan/30 text-cyber-cyan'}`}>
              {claimSection === 'grandfinale'
                ? '🏆 Grand Finale Certificate — ZDH-GF-XXXX verification IDs'
                : '🎖️ Participant Certificate — ZDH-2026-XXXX verification IDs'}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

              {/* Left panel */}
              <div className="lg:col-span-4 space-y-6">

                {/* Search */}
                <div className="border border-cyber-border rounded-xl bg-cyber-card p-6 space-y-6 shadow-lg">
                  <div className="space-y-1">
                    <h3 className="text-md font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <Search className="h-4 w-4 text-cyber-cyan" />Find Certificate
                    </h3>
                    <p className="text-xs text-zinc-400 font-mono leading-relaxed">
                      Search using your registered <strong className="text-cyber-cyan font-semibold">Email ID</strong> or <strong className="text-cyber-cyan font-semibold">Team Name</strong>.
                    </p>
                  </div>
                  <form onSubmit={handleSearch} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-mono text-zinc-400 uppercase">Email or Team Name:</label>
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value.slice(0, 120))}
                        placeholder="Enter your email or team name"
                        className="w-full py-2.5 px-3 bg-cyber-bg border border-cyber-border rounded-lg text-white font-mono text-xs focus:border-cyber-cyan focus:outline-none transition-all placeholder-zinc-600"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isSearching}
                      className="w-full py-2.5 bg-red-500 hover:bg-red-600 text-white font-mono font-bold text-xs rounded-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-red-500/20"
                    >
                      <span>{isSearching ? 'Searching...' : 'Fetch Certificate'}</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </form>
                </div>

                {/* Registration */}
                <div className="border border-cyber-border rounded-xl bg-cyber-card p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <UserPlus className="h-4 w-4 text-cyber-purple" />Contestant Registry
                    </h4>
                    <button
                      onClick={() => setShowRegForm(!showRegForm)}
                      className="px-2.5 py-1 border border-cyber-border hover:bg-cyber-light rounded text-[10px] font-mono text-cyber-cyan transition-colors"
                    >
                      {showRegForm ? 'Minimize' : 'Open'}
                    </button>
                  </div>
                  <p className="text-xs text-zinc-400 font-mono leading-relaxed">
                    Not on the registered list? Enter your details to generate your unique verification hash and download your certificate.
                  </p>
                  {showRegForm && (
                    <form onSubmit={handleRegister} className="pt-2 border-t border-cyber-border space-y-3 font-mono text-xs">
                      {[
                        { label: 'Participant Name', value: regName,  setter: setRegName,  placeholder: 'Full name',        type: 'text',  maxLen: 80  },
                        { label: 'Email ID',         value: regEmail, setter: setRegEmail, placeholder: 'email@domain.com', type: 'email', maxLen: 120 },
                        { label: 'Team Name',        value: regTeam,  setter: setRegTeam,  placeholder: 'Team name',        type: 'text',  maxLen: 60  },
                      ].map(f => (
                        <div key={f.label} className="space-y-1.5">
                          <label className="text-zinc-500 uppercase tracking-wider block">{f.label}:</label>
                          <input
                            type={f.type}
                            value={f.value}
                            onChange={e => f.setter(e.target.value)}
                            placeholder={f.placeholder}
                            maxLength={f.maxLen}
                            className="w-full py-2 px-2.5 bg-cyber-bg border border-cyber-border rounded text-white focus:border-cyber-purple focus:outline-none"
                            required
                          />
                        </div>
                      ))}
                      <button
                        type="submit"
                        disabled={isRegistering}
                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20 font-mono"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>{isRegistering ? 'Registering...' : 'Issue Certificate'}</span>
                      </button>
                    </form>
                  )}
                </div>

                {/* Search results */}
                {searchResults.length > 0 && (
                  <div className="border border-cyber-border rounded-xl bg-cyber-card p-4 space-y-3 max-h-[300px] overflow-y-auto">
                    <h4 className="text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-wider">
                      Results ({searchResults.length}):
                    </h4>
                    <div className="divide-y divide-cyber-border">
                      {searchResults.map(item => (
                        <button
                          key={item.id}
                          onClick={() => selectParticipant(item)}
                          className="w-full py-3 text-left hover:bg-cyber-light transition-colors block font-mono text-xs space-y-1 group"
                        >
                          <div className="flex justify-between items-center">
                            <span className="text-white font-bold group-hover:text-cyber-cyan transition-colors">{item.name}</span>
                            <span className="text-[10px] text-cyber-cyan">{item.id}</span>
                          </div>
                          <div className="flex justify-between text-[11px] text-zinc-400">
                            <span>Team: {item.team}</span>
                            <span>{item.email}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {!isSearching && searchQuery !== '' && searchResults.length === 0 && (
                  <div className="border border-cyber-border/50 rounded-xl bg-cyber-card/30 p-4 text-center font-mono text-xs text-zinc-500">
                    No participant found for "<span className="text-white">{searchQuery}</span>"
                  </div>
                )}
              </div>

              {/* Right — Certificate */}
              <div className="lg:col-span-8 space-y-8">
                {selectedParticipant ? (
                  <div className="space-y-8">
                    <div className="space-y-2 text-left">
                      <h3 className="text-md font-mono font-bold text-white uppercase tracking-widest flex items-center gap-2">
                        {selectedParticipant.certificateType === 'grandfinale'
                          ? <><Trophy className="h-5 w-5 text-yellow-400" />Grand Finale Achievement Certificate</>
                          : <><Award className="h-5 w-5 text-cyber-cyan" />Digital Achievement Certificate</>
                        }
                      </h3>
                      <p className="text-xs text-zinc-400 font-mono">
                        Authentic tournament credentials. Download or share using the panel below.
                      </p>
                    </div>
                    <CertificateRenderer participant={selectedParticipant} onImageGenerated={setCertificateImage} />
                    <ShareSocial participant={selectedParticipant} certificateImage={certificateImage} />
                  </div>
                ) : (
                  <div className="border border-cyber-border rounded-xl bg-cyber-card/45 p-16 text-center space-y-5 flex flex-col justify-center items-center h-full">
                    <img src="/zdh-badge.png" alt="ZeroDayHeist Badge" className="h-16 w-auto object-contain" />
                    <div className="space-y-1">
                      <h3 className="text-lg font-mono font-bold text-white uppercase tracking-wider">
                        {claimSection === 'grandfinale' ? 'Claim Grand Finale Certificate' : 'Claim Your Certificate'}
                      </h3>
                      <p className="text-xs text-zinc-400 max-w-sm mx-auto font-mono leading-relaxed">
                        Enter your Email ID or Team Name on the left to fetch your certificate.
                      </p>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto">
            <VerifyCredentials initialCode={initialVerifyCode} />
          </div>
        )}
      </main>

      <footer className="border-t border-cyber-border mt-auto pt-6 text-center text-[11px] font-mono text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 pb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <img src="/cyberhxlogo.png" alt="cyberhx" className="h-5 w-auto object-contain opacity-60" />
            <span>© 2026 ZERODAYHEIST CTF — ALL RIGHTS RESERVED</span>
          </div>
          <div className="flex gap-4">
            <span className="text-cyber-cyan">#cyberhx</span>
            <span className="text-zinc-600">|</span>
            <span className="text-cyber-purple">SECURE CHECKPOINT ACTIVE</span>
          </div>
        </div>
      </footer>
    </div>
  );
}