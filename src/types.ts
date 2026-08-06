export type ScreenView = 
  | 'landing' 
  | 'register'
  | 'student-dashboard' 
  | 'quiz' 
  | 'admin-rounds' 
  | 'admin-leaderboard'
  | 'admin-participant-detail';

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

export interface QuestionSubmissionBreakdown {
  number: number;
  question_id: string;
  question_text: string;
  image_url?: string;
  options: Record<string, string> | { key: string; text: string }[];
  submitted_answer: string | null;
  correct_answer: string;
  is_correct: boolean;
  status: 'correct' | 'incorrect' | 'unanswered';
}

export interface RoundSessionSummary {
  round_id: string;
  round_name: string;
  order_index: number;
  mode: 'online' | 'offline';
  qualification_status: 'qualified' | 'disqualified' | 'pending';
  has_session: boolean;
  score: number;
  tab_switches: number;
  tab_switch_limit: number;
  is_safe: boolean;
  session_status: string;
  started_at?: string | null;
  submitted_at?: string | null;
}

export interface ParticipantDetailData {
  participant: {
    id: string;
    full_name: string;
    school_name: string;
    grade: string;
    category: string;
    email: string;
    phone: string;
  };
  selected_round_id: string | null;
  rounds_summary: RoundSessionSummary[];
  submission_breakdown: QuestionSubmissionBreakdown[];
}
