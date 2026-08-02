import { Question, CompetitionRound, Participant, ParsedQuestion } from '../types';
import logoSvg from '../assets/logo.svg';
import bannerPng from '../assets/banner.png';
import banner2Png from '../assets/banner_2.png';

export const ASSET_IMAGES = {
  logo: logoSvg,
  competitionBanner: bannerPng,
  landingBanner: banner2Png,
  cylinderSphere: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAFahvhCGyxgugBkn6v5JolJhEcOkaXjMuI7trdK-EiytLJGEV1PBMO7IU-h0btYvDPKHuSz8kFLbEWImsm7Qh750buvkkafPofGI3jMO7GRIwGjKtxnZZqhkX1gS2LixcdatkeWnDcxDzLUPcHi6mnhD8rGZrhKdEyC-mLV8Evzsw9O0DwymeQAq1c7y-2qUJ6dr9fCjFdBpV271gjzeNu0UPVUGMzVpKJowklYRqj_T31ePTf8GfhrQ',
  warningHand: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAqPBsz9Ysss1Ga2A6bFsL4WFd8h9kQ4ysfU2dHk5hiw5qYq8YyBKhKueCcND8dPsPRywwMJF2SP_6cGp7o5cESFeps57xRrwa5S1t7ExyAbeL8NNfIZRCnWLgEAb4s1P0LIXKH8_nrhByCxHUuq7YCFN5lRNmjNqedwAzXmVR3AZmWMjsOImF9Jf9E032paq3FjMhHnL1Z8PwoTe3PUrZrVCIhgCBpU44qGdsrDlR0qU4qvuh0-rK5FA',
  bearMascot: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBHrEd3rmRmGnh4yvsqFQ2EpJIkgz2RwysaBZBsvBfTVHSwLH998B6YOvFv2YlKV0_M5jNr74jQQJAylzKSsh_NRKJEap4XG2ibPQn4ZpCbBuxzby4dd8s7eyQepGu2l5cvQP8YYV-RoZweOIF-uuqjUDWL6_GxuAgxW7FEtuEx3reMSs-TfQhUlxadBf3yt78XowI92AODy38KCXyHfR5LFbzb9htQxUi_bcBUloAGr6Tpj8K2dIsqKQ',
  documentIcon: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC5gdNyqTXILLKSdQoiFuBf8bWvTosaR2w9RP0ldL3tLVLYZpC7MKvcTvRhL0-D-z2bJAs6kWS2LDYEL7uvWKwqW3sUO64RTT8RXn8VqpiLG7t2PMhKo-nmnwU-aCp6cnmp_NFlk1zYVzMYrvT5bDjBBZJpUUSFFDTAGCoI9p2EpTQkeNFD4sWlrj7JGGZdRMFX5heSJq4gGIdjiPDx1JxYwVDIXhiZLYOlwSlMYSfU9w4ExL8hx-RlZg',
  avatarAndi: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD0yZv1fzDAEC7-JJZ9ZN_ut8QTW6ewGuMorfYzM4PPUAw5w96lSb2oi3BfyJlFgKVus05ZNMYZd5nNHf50j9eRVPw0j3W63d33PpdHbPolrb-rGlYvFoHZRejVygsh5iEv8nVd6NsMtsCxoH4lcyLPGp4pe8wz7B6BrNOnhhKZda1vfIwZfdFpqznIh1p1jTcZZ4DvxHalxQrA_bxRsZVBGb2gAXmuuxm4xqrSeTWZF9638SsZP9mriA',
  starPeek: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBNCotMvGcfJqghCnYzBDTFESzLzrrEgQjJiFy0pd_UAhVOFGCpb6pUtPjjnv9MGkxwp-Q2JtymRGzVqNxdv2E8COPkFK1nJdemd_EH2gBXs1ErYhlCiF1TYd-tV3iw5MY5a_cFN6jYKFn2PJ2Zr_BBHnoV3vWsLGjSkbcyYLCOv3v2z6slrKJM3cXodLteT6e9UhB3rqNaK0zqQYdh10DJy1Zy7U_RI_0Miwh0CBTUYi_8R3CU_j4M7A',
  trophy: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBwA5nDcNT-dPdznKiLRGQ-slAJf8KE4kbTJ8OGFCB_tGXuJH41dTgq6d9PuetOJAMWK5OdMh8i0GvROYLOHG69XcnNiD7sdlMePTSFSqOh2kzaDGu5-QHdFGd38fwZi0Ku5hbX5awEGNR6PDeW5x7oTSt9Kcn3PWZNK81ZCTb2u3UPljMi9n719MUuEPXJ5YbNCl6EKMw7Qy68P0uoN0rUhpPUJK01L9SPn471u8pk_TnPLaxtalU0JA',
  blueBlob: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDCTyqidp6U2PWyh9ky726fzQ-gSUpdpxRzjJY0JC_NpKxqTF7ryXu4gVXZ1PS-Aqyl4gM3JslEGwkQ-IAXEulW2Vd-DsCh5_WQ5EmjGbHlTZurraYdZInuaXw0rsznRqpKU_QERpCv--Ju710dZ-KKtAHX2yHYuzyroSt63rEwWL9mVb_9flb8hZ6rwChqQY9YGscHcESDyOXaU_Y6WCWqgsnsRs1RRaI1r8E3UzqA5gyc_ZHzeBSejg'
};

export const INITIAL_ROUNDS: CompetitionRound[] = [
  {
    id: 'round-sd-1',
    title: 'Penyisihan 1 SD-SMP - Dasar Logika & Aritmatika',
    category: 'SD-SMP',
    questionCount: 30,
    durationMinutes: 60,
    tabSwitchLimit: 3,
    status: 'active',
    executionMode: 'online',
    startDate: '2026-08-01',
    startTime: '08:00',
    endDate: '2026-08-10',
    endTime: '18:00'
  },
  {
    id: 'round-sd-2',
    title: 'Final SD-SMP - Master Olimpiade',
    category: 'SD-SMP',
    questionCount: 35,
    durationMinutes: 90,
    tabSwitchLimit: 1,
    status: 'locked',
    isFinal: true,
    executionMode: 'offline',
    startDate: '2026-08-15',
    startTime: '09:00',
    endDate: '2026-08-15',
    endTime: '14:00',
    isOfflineStarted: false
  },
  {
    id: 'round-1',
    title: 'Penyisihan 1 SMA - Logic & Theory',
    category: 'SMA',
    questionCount: 45,
    durationMinutes: 90,
    tabSwitchLimit: 3,
    status: 'submitted',
    executionMode: 'online',
    startDate: '2026-08-01',
    startTime: '08:00',
    endDate: '2026-08-01',
    endTime: '12:00'
  },
  {
    id: 'round-2',
    title: 'Penyisihan 2 SMA - High Level',
    category: 'SMA',
    questionCount: 30,
    durationMinutes: 120,
    tabSwitchLimit: 3,
    status: 'active',
    executionMode: 'online',
    startDate: '2026-08-01',
    startTime: '08:00',
    endDate: '2026-08-10',
    endTime: '18:00'
  },
  {
    id: 'round-3',
    title: 'Final Championship SMA',
    category: 'SMA',
    questionCount: 50,
    durationMinutes: 150,
    tabSwitchLimit: 1,
    status: 'locked',
    isFinal: true,
    executionMode: 'offline',
    startDate: '2026-08-15',
    startTime: '09:00',
    endDate: '2026-08-15',
    endTime: '15:00',
    isOfflineStarted: false
  }
];

export const MOCK_QUESTIONS: Question[] = Array.from({ length: 40 }).map((_, idx) => {
  const num = idx + 1;
  if (num === 12) {
    return {
      id: 12,
      code: 'GEOMETRI • SULIT',
      text: 'Sebuah tabung tanah liat pejal memiliki jari-jari 4 cm dan tinggi 10 cm. Jika tabung ini dibentuk ulang menjadi sebuah bola sempurna, berapakah volume bola tersebut?',
      note: 'Catatan: Asumsikan tidak ada volume yang hilang selama proses pembentukan ulang. Gunakan π ≈ 3.14.',
      diagramUrl: ASSET_IMAGES.cylinderSphere,
      figLabel: 'GAMBAR 12A',
      options: [
        { id: 'A', text: '160π cm³' },
        { id: 'B', text: '140π cm³' },
        { id: 'C', text: '180π cm³' },
        { id: 'D', text: '200π cm³' }
      ],
      correctOption: 'B'
    };
  }
  return {
    id: num,
    code: num % 2 === 0 ? 'ALJABAR • SEDANG' : 'TEORI BILANGAN • MUDAH',
    text: `Soal ${num}: Hitunglah nilai dari ekspresi polinomial P(x) = x^${(num % 5) + 2} + ${num}x - ${(num * 3) % 17} ketika x = 3.`,
    note: 'Pilih jawaban yang menyatakan nilai tepat.',
    options: [
      { id: 'A', text: `${num * 12 + 5}` },
      { id: 'B', text: `${num * 14 - 2}` },
      { id: 'C', text: `${num * 10 + 15}` },
      { id: 'D', text: `${num * 16 - 8}` }
    ],
    correctOption: 'A'
  };
});

export const INITIAL_PARTICIPANTS: Participant[] = [
  {
    id: 'p1',
    rank: 1,
    name: 'Ahmad Firdaus',
    school: 'SMPN 1 Jakarta',
    score: 98,
    tabSwitches: 0,
    status: 'qualified',
    category: 'SD-SMP'
  },
  {
    id: 'p2',
    rank: 2,
    name: 'Siti Aminah',
    school: 'SMP Lab School',
    score: 95,
    tabSwitches: 1,
    status: 'qualified',
    category: 'SD-SMP'
  },
  {
    id: 'p3',
    rank: 3,
    name: 'Andi Pratama',
    school: 'SMA Negeri 8 Jakarta',
    score: 94,
    tabSwitches: 0,
    status: 'qualified',
    category: 'SMA'
  },
  {
    id: 'p4',
    rank: 4,
    name: 'Clarissa Maharani',
    school: 'SMA Kristen 1 Penabur',
    score: 92,
    tabSwitches: 0,
    status: 'qualified',
    category: 'SMA'
  },
  {
    id: 'p21',
    rank: 21,
    name: 'Budi Santoso',
    school: 'SMP Al-Azhar',
    score: 82,
    tabSwitches: 2,
    status: 'disqualified',
    category: 'SD-SMP'
  },
  {
    id: 'p99',
    rank: 99,
    name: 'Peserta Tidak Dikenal',
    school: 'SMP Negeri 04',
    score: 10,
    tabSwitches: 14,
    status: 'disqualified',
    category: 'SD-SMP'
  }
];

export const INITIAL_PARSED_QUESTIONS: ParsedQuestion[] = [
  {
    id: 'Q01',
    questionText: 'Jika x^2 + 5x + 6 = 0, berapakah nilai akar-akar penyelesaian yang memungkinkan?',
    options: [
      { key: 'A', text: '-2, -3' },
      { key: 'B', text: '2, 3' },
      { key: 'C', text: '1, 6' }
    ],
    key: 'A',
    isError: false
  },
  {
    id: 'Q02',
    questionText: 'Format tidak dikenali: Blok pertanyaan terdeteksi tetapi tag penutup tidak ditemukan.',
    options: [],
    key: '?',
    isError: true,
    errorMessage: 'Gagal memproses berkas...'
  },
  {
    id: 'Q03',
    questionText: 'Berapakah jumlah sudut dalam pada bangun segi delapan beraturan (lihat diagram gambar)?',
    options: [
      { key: 'A', text: '1080°' },
      { key: 'B', text: '1440°' },
      { key: 'C', text: '720°' }
    ],
    key: 'A',
    isError: false,
    imageUrl: ASSET_IMAGES.cylinderSphere
  }
];
