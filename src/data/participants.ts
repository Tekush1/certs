/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Participant, CertificateType } from '../types';
import { supabase } from '../lib/supabase';

// Map DB table name from type
const TABLE = (type: CertificateType) =>
  type === 'grandfinale' ? 'grandfinale' : 'participants';

function fromRow(row: Record<string, unknown>, type: CertificateType): Participant {
  return {
    id:              row.id        as string,
    name:            row.name      as string,
    email:           row.email     as string,
    team:            row.team      as string,
    rank:            row.rank      as number | undefined,
    score:           row.score     as number | undefined,
    issuedAt:        row.issued_at as string,
    certificateType: type,
  };
}

// ─── Counts ────────────────────────────────────────────────────────────────

export async function getParticipantCount(): Promise<number> {
  const { count, error } = await supabase
    .from('participants')
    .select('*', { count: 'exact', head: true });
  if (error) { console.error('getParticipantCount:', error.message); return 0; }
  return count ?? 0;
}

export async function getGrandFinaleCount(): Promise<number> {
  const { count, error } = await supabase
    .from('grandfinale')
    .select('*', { count: 'exact', head: true });
  if (error) { console.error('getGrandFinaleCount:', error.message); return 0; }
  return count ?? 0;
}

export async function getTeamCount(): Promise<number> {
  // Unique teams across both tables
  const [r1, r2] = await Promise.all([
    supabase.from('participants').select('team'),
    supabase.from('grandfinale').select('team'),
  ]);
  const all = [
    ...((r1.data ?? []).map((r: any) => r.team as string)),
    ...((r2.data ?? []).map((r: any) => r.team as string)),
  ];
  return new Set(all.map(t => t.toLowerCase())).size;
}

// ─── Search ────────────────────────────────────────────────────────────────

export async function searchParticipants(
  query: string,
  type: CertificateType
): Promise<Participant[]> {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  const { data, error } = await supabase
    .from(TABLE(type))
    .select('*')
    .or(`email.ilike.%${q}%,team.ilike.%${q}%`);
  if (error) { console.error('searchParticipants:', error.message); return []; }
  return (data ?? []).map((r: any) => fromRow(r, type));
}

// ─── Input validation ──────────────────────────────────────────────────────

const MAX_NAME_LEN  = 80;
const MAX_EMAIL_LEN = 120;
const MAX_TEAM_LEN  = 60;
const EMAIL_RE      = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SAFE_TEXT_RE  = /^[\p{L}\p{N}\s'\-.,()]+$/u; // letters, digits, safe punctuation

function sanitizeText(raw: string, maxLen: number): string {
  return raw.trim().slice(0, maxLen).replace(/\s+/g, ' ');
}

function validateInputs(name: string, email: string, team: string): void {
  if (!name || name.length > MAX_NAME_LEN)
    throw new Error(`Name must be 1–${MAX_NAME_LEN} characters.`);
  if (!SAFE_TEXT_RE.test(name))
    throw new Error('Name contains invalid characters.');
  if (!email || email.length > MAX_EMAIL_LEN || !EMAIL_RE.test(email))
    throw new Error('Invalid email address.');
  if (!team || team.length > MAX_TEAM_LEN)
    throw new Error(`Team name must be 1–${MAX_TEAM_LEN} characters.`);
  if (!SAFE_TEXT_RE.test(team))
    throw new Error('Team name contains invalid characters.');
}

/** Cryptographically-secure 6-digit hex (16,777,216 unique values) */
function secureHex6(): string {
  const buf = new Uint8Array(3);
  crypto.getRandomValues(buf);
  return Array.from(buf, b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
}

// ─── Register ──────────────────────────────────────────────────────────────

export async function registerParticipant(
  name: string,
  email: string,
  team: string,
  type: CertificateType
): Promise<Participant> {
  const cleanName  = sanitizeText(name,  MAX_NAME_LEN);
  const cleanEmail = sanitizeText(email, MAX_EMAIL_LEN).toLowerCase();
  const cleanTeam  = sanitizeText(team,  MAX_TEAM_LEN);
  validateInputs(cleanName, cleanEmail, cleanTeam);

  const lowerEmail = cleanEmail;
  const table = TABLE(type);

  const { data: existing } = await supabase
    .from(table)
    .select('*')
    .ilike('email', lowerEmail)
    .maybeSingle();
  if (existing) return fromRow(existing, type);

  const prefix = type === 'grandfinale' ? 'ZDH-GF-' : 'ZDH-2026-';
  const id = `${prefix}${secureHex6()}`;

  const newRow = {
    id,
    name:      cleanName,
    email:     lowerEmail,
    team:      cleanTeam,
    issued_at: new Date().toISOString().split('T')[0],
  };

  const { data, error } = await supabase
    .from(table)
    .insert(newRow)
    .select()
    .single();

  if (error) {
    console.error('registerParticipant:', error.message);
    return { id, name: cleanName, email: lowerEmail, team: cleanTeam, issuedAt: newRow.issued_at, certificateType: type };
  }
  return fromRow(data, type);
}

// ─── Verify ────────────────────────────────────────────────────────────────

/** Check both tables — returns participant with correct certificateType set */
export async function verifyCredential(idOrName: string): Promise<Participant | null> {
  const trimmed = idOrName.trim();
  if (!trimmed) return null;

  for (const type of ['participant', 'grandfinale'] as CertificateType[]) {
    const table = TABLE(type);

    const { data: byId } = await supabase
      .from(table)
      .select('*')
      .ilike('id', trimmed)
      .maybeSingle();
    if (byId) return fromRow(byId, type);

    const { data: byName } = await supabase
      .from(table)
      .select('*')
      .ilike('name', trimmed)
      .maybeSingle();
    if (byName) return fromRow(byName, type);
  }

  return null;
}
