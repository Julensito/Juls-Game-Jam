/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Vote {
  id: string;
  voterName: string;
  gameplay: number; // 1 to 10
  design: number;   // 1 to 10
  graphics: number; // 1 to 10
  audio: number;    // 1 to 10
  innovation: number; // 1 to 10
  theme: number;     // 1 to 10
  comment: string;
  votedAt: string;
}

export interface Project {
  id: string;
  teamName: string;
  teamMembers: string[];
  gameTitle: string;
  description: string;
  itchUrl: string;
  youtubeUrl: string;
  gddUrl: string;
  submittedAt: string;
  votes: Vote[];
  genre?: string;
  platform?: string;
}

export interface GameJamInfo {
  title: string;
  tagline: string;
  description: string;
  startDate: string;
  endDate: string;
  theme: string;
  rules: string[];
  criteria: Array<{
    name: string;
    key: keyof Omit<Vote, 'id' | 'voterName' | 'comment' | 'votedAt'>;
    description: string;
  }>;
}
