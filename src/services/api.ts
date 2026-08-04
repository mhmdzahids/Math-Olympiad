/**
 * API Service for interacting with FastAPI PostgreSQL Backend
 */

const API_BASE_URL = '/api';

export interface RegisterPayload {
  email: string;
  password: string;
  full_name: string;
  school_name: string;
  category: 'sd' | 'smp' | 'sma';
  grade?: string;
  phone?: string;
}

export interface ParticipantOut {
  id: string;
  full_name: string;
  school_name: string;
  category: 'sd' | 'smp' | 'sma';
  grade?: string;
}

export interface UserOut {
  id: string;
  email: string;
  role: 'participant' | 'admin';
  created_at: string;
  participant?: ParticipantOut;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface RoundData {
  id: string;
  name: string;
  category: 'sd' | 'smp' | 'sma';
  mode: 'online' | 'offline';
  status: 'draft' | 'aktif' | 'selesai' | 'belum_dibuka';
  duration_minutes: number;
  question_count?: number;
  tab_switch_limit: number;
  order_index: number;
  is_offline_started: boolean;
  start_date?: string;
  start_time?: string;
  end_date?: string;
  end_time?: string;
  created_at?: string;
}

export interface QuestionData {
  id: string;
  round_id: string;
  question_text: string;
  options: { key: string; text: string }[];
  correct_key: string;
  image_url?: string;
  points: number;
}

class ApiService {
  private token: string | null = localStorage.getItem('access_token');

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('access_token', token);
    } else {
      localStorage.removeItem('access_token');
    }
  }

  getToken(): string | null {
    return this.token || localStorage.getItem('access_token');
  }

  private getAuthHeaders(): HeadersInit {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
  }

  async checkHealth(): Promise<{ status: string }> {
    const res = await fetch(`${API_BASE_URL}/health`);
    if (!res.ok) throw new Error('Backend health check failed');
    return res.json();
  }

  async login(email: string, password: string): Promise<TokenResponse> {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Login gagal. Periksa kembali email dan password Anda.');
    }

    const data: TokenResponse = await res.json();
    this.setToken(data.access_token);
    return data;
  }

  async register(payload: RegisterPayload): Promise<UserOut> {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Registrasi gagal.');
    }

    return res.json();
  }

  async getMe(): Promise<UserOut> {
    const token = this.getToken();
    if (!token) throw new Error('Not authenticated');

    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      this.setToken(null);
      throw new Error('Sesi telah habis, silakan login kembali.');
    }

    return res.json();
  }

  logout() {
    this.setToken(null);
  }

  // ---------- Rounds API ----------

  async getRounds(category?: string): Promise<RoundData[]> {
    const url = category ? `${API_BASE_URL}/rounds?category=${category}` : `${API_BASE_URL}/rounds`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Gagal mengambil data babak dari database.');
    return res.json();
  }

  async createRound(payload: {
    name: string;
    category: 'sd' | 'smp' | 'sma';
    mode?: 'online' | 'offline';
    duration_minutes?: number;
    tab_switch_limit?: number;
    start_date?: string;
    start_time?: string;
    end_date?: string;
    end_time?: string;
  }): Promise<RoundData> {
    const res = await fetch(`${API_BASE_URL}/rounds`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Gagal membuat babak baru.');
    }
    return res.json();
  }

  async updateRound(id: string, payload: Partial<RoundData>): Promise<RoundData> {
    const res = await fetch(`${API_BASE_URL}/rounds/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Gagal memperbarui babak.');
    }
    return res.json();
  }

  async deleteRound(id: string): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/rounds/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Gagal menghapus babak.');
    }
  }

  async getLeaderboard(category?: string, roundId?: string): Promise<any[]> {
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (roundId) params.set('round_id', roundId);
    const qs = params.toString();
    const url = `${API_BASE_URL}/rounds/leaderboard/all${qs ? '?' + qs : ''}`;
    const res = await fetch(url, {
      headers: this.getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Gagal mengambil data klasemen dari database.');
    return res.json();
  }

  async updateQualification(
    participantId: string,
    status: 'qualified' | 'disqualified' | 'pending',
    category?: string
  ): Promise<{ message: string; status: string }> {
    const res = await fetch(`${API_BASE_URL}/rounds/qualification/update`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({
        participant_id: participantId,
        status,
        category,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Gagal menyimpan status kualifikasi ke database.');
    }

    return res.json();
  }

  // ---------- Questions API ----------

  async getRoundQuestions(roundId: string): Promise<QuestionData[]> {
    const res = await fetch(`${API_BASE_URL}/rounds/${roundId}/questions`);
    if (!res.ok) throw new Error('Gagal mengambil bank soal babak.');
    return res.json();
  }

  async importQuestions(
    roundId: string,
    questions: any[],
    filename?: string,
    mode: 'replace' | 'append' = 'replace'
  ): Promise<{ message: string; count: number }> {
    const payload = {
      questions: questions.map((q) => ({
        question_text: q.questionText || q.question_text,
        options: q.options || [],
        correct_key: q.key || q.correct_key || 'A',
        image_url: q.imageUrl || q.image_url || null,
        points: 10,
      })),
      filename,
      mode,
    };

    const res = await fetch(`${API_BASE_URL}/rounds/${roundId}/questions/import`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Gagal menyinkronkan soal ke database.');
    }

    return res.json();
  }

  // ---------- Anti-Cheat Student Quiz Session API ----------

  async getMyQuizSessions(): Promise<Array<{
    id: string;
    round_id: string;
    status: string;
    started_at: string;
    ends_at: string;
    remaining_seconds: number;
    tab_switch_count: number;
    submitted_at?: string;
    score?: number;
  }>> {
    const res = await fetch(`${API_BASE_URL}/rounds/sessions/me`, {
      headers: this.getAuthHeaders(),
    });
    if (!res.ok) return [];
    return res.json();
  }

  async getStudentQuestions(roundId: string): Promise<QuestionData[]> {
    const res = await fetch(`${API_BASE_URL}/rounds/${roundId}/questions/student`);
    if (!res.ok) throw new Error('Gagal mengambil daftar soal kuis.');
    return res.json();
  }

  async startQuizSession(roundId: string): Promise<{
    session_id: string;
    round_id: string;
    duration_minutes: number;
    tab_switch_limit: number;
    remaining_seconds: number;
    tab_switch_count: number;
    is_submitted: boolean;
  }> {
    const res = await fetch(`${API_BASE_URL}/rounds/${roundId}/quiz/start`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Gagal memulai sesi kuis.');
    }
    return res.json();
  }

  async logQuizViolation(roundId: string): Promise<{
    session_id: string;
    tab_switch_count: number;
    max_switches: number;
    is_submitted: boolean;
  }> {
    const res = await fetch(`${API_BASE_URL}/rounds/${roundId}/quiz/log-violation`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Gagal mencatat pelanggaran kuis.');
    }
    return res.json();
  }

  async submitQuizAnswers(roundId: string, answers: Record<string, string>): Promise<{
    message: string;
    score: number;
    total_possible: number;
    status: string;
    tab_switch_count: number;
  }> {
    const res = await fetch(`${API_BASE_URL}/rounds/${roundId}/quiz/submit`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ answers }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Gagal mengumpulkan kuis ke server.');
    }
    return res.json();
  }
}

export const apiService = new ApiService();
