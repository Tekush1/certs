/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type CertificateType = 'participant' | 'grandfinale';

export interface Participant {
  id: string;          // e.g. ZDH-2026-XXXX
  name: string;
  email: string;
  team: string;
  rank?: number;
  score?: number;
  issuedAt: string;
  certificateType: CertificateType;
}

export interface ShareState {
  photoUrl: string;
  caption: string;
}
