export type ScreenView = 
  | 'landing' 
  | 'register'
  | 'student-dashboard' 
  | 'quiz' 
  | 'admin-rounds' 
  | 'admin-leaderboard';

export interface Question {
  id: number;
  code: string; // e.g. "GEOMETRY • HARD"
  text: string;
  note?: string;
  diagramUrl?: string;
  figLabel?: string;
  options: {
    id: 'A' | 'B' | 'C' | 'D';
    text: string;
  }[];
  correctOption: 'A' | 'B' | 'C' | 'D';
}

export interface CompetitionRound {
  id: string;
  title: string;
  category: string;
  questionCount: number;
  durationMinutes: number;
  tabSwitchLimit: number;
  status: 'submitted' | 'active' | 'locked' | 'draft' | 'upcoming' | 'completed';
  isFinal?: boolean;
  isRandomized?: boolean;
  executionMode?: 'online' | 'offline';
  startDate?: string;
  startTime?: string;
  endDate?: string;
  endTime?: string;
  isOfflineStarted?: boolean;
}

export interface Participant {
  id: string;
  rank: number;
  name: string;
  school: string;
  score: number;
  tabSwitches: number;
  status: 'qualified' | 'disqualified' | 'pending';
  category: 'SD-SMP' | 'SMA';
  has_session?: boolean;
  round_name?: string | null;
  round_id?: string | null;
}

export interface ParsedQuestion {
  id: string;
  questionText: string;
  options: { key: string; text: string }[];
  key: string;
  isError?: boolean;
  errorMessage?: string;
  imageUrl?: string;
}
