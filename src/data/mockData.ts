import { Question, CompetitionRound, Participant, ParsedQuestion } from '../types';
import logoPng from '../assets/logo_optima.png';
import bannerPng from '../assets/banner.png';
import banner2Png from '../assets/banner_2.png';

export const ASSET_IMAGES = {
  logo: logoPng,
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

export const COMPETITION_INFO = {
  title: 'OPTIMA (Olimpiade Prestasi Matematika)',
  subTitle: 'Se-Pulau Jawa Tingkat SD/MI, SMP/MTs, dan SMA/SMK/MA Sederajat',
  theme: 'Mathematics and Talent Rising Through Innovation and Excellence (MATRIX)',
  organizer: 'HIMATIKA Jurusan Matematika - UIN Siber Syekh Nurjati Cirebon',
  eventSeries: 'Dies Natalis 2026 Jurusan Matematika',
  
  timeline: {
    earlyBird: '05 Agustus – 15 Agustus 2026',
    reguler: '24 Agustus – 05 September 2026',
    technicalMeeting: 'Sabtu, 12 September 2026 (09.00 - 12.00 WIB via Zoom)',
    openingCeremony: 'Senin, 14 September 2026 (08.00 - 10.00 WIB di Auditorium Pascasarjana Lt. 3)',
    penyisihan: 'Senin, 14 September 2026 (13.00 - 14.30 WIB via Zoom)',
    final: 'Rabu, 16 September 2026 (09.00 WIB di Kampus UIN Siber Syekh Nurjati Cirebon)',
    closingCeremony: 'Kamis, 17 September 2026 (08.00 - 12.10 WIB di Auditorium Pascasarjana Lt. 3)'
  },

  fees: {
    sd: { earlyBird: 'Rp 35.000', reguler: 'Rp 45.000' },
    smp: { earlyBird: 'Rp 50.000', reguler: 'Rp 65.000' },
    sma: { earlyBird: 'Rp 75.000', reguler: 'Rp 90.000' }
  },

  paymentMethods: [
    { bank: 'Allobank', accountNo: '082127650600', accountName: 'Shofania Lestari Ahmad' },
    { bank: 'Gopay', accountNo: '081290066116', accountName: 'Suryana Meilanti' }
  ],

  contacts: [
    { category: 'Olimpiade SD/MI', name: 'Ade Lia Rahmaningrum', phone: '0895-4009-05511' },
    { category: 'Olimpiade SMP/MTs', name: 'Alifah Nur Mutmainah', phone: '0896-7130-9905' },
    { category: 'Olimpiade SMA/SMK/MA', name: 'Naillatul Fitriah', phone: '0858-7258-3579' }
  ],

  socials: {
    instagram: '@dinalis.matematikauinssc',
    tiktok: '@himatika.uinssc',
    email: 'himatikauinssc@gmail.com'
  }
};

export const INITIAL_ROUNDS: CompetitionRound[] = [
  {
    id: 'round-sd-1',
    title: 'Tahap Penyisihan SD/MI - Daring (25 Soal PG)',
    category: 'SD-SMP',
    questionCount: 25,
    durationMinutes: 60,
    tabSwitchLimit: 3,
    status: 'active',
    executionMode: 'online',
    startDate: '2026-09-14',
    startTime: '13:00',
    endDate: '2026-09-14',
    endTime: '14:00'
  },
  {
    id: 'round-sd-2',
    title: 'Tahap Final SD/MI - Offline Kampus UIN SSC (10 Soal Esai)',
    category: 'SD-SMP',
    questionCount: 10,
    durationMinutes: 90,
    tabSwitchLimit: 1,
    status: 'locked',
    isFinal: true,
    executionMode: 'offline',
    startDate: '2026-09-16',
    startTime: '09:00',
    endDate: '2026-09-16',
    endTime: '10:30',
    isOfflineStarted: false
  },
  {
    id: 'round-smp-1',
    title: 'Tahap Penyisihan SMP/MTs - Daring (25 Soal PG)',
    category: 'SD-SMP',
    questionCount: 25,
    durationMinutes: 60,
    tabSwitchLimit: 3,
    status: 'active',
    executionMode: 'online',
    startDate: '2026-09-14',
    startTime: '13:00',
    endDate: '2026-09-14',
    endTime: '14:00'
  },
  {
    id: 'round-smp-2',
    title: 'Tahap Final SMP/MTs - Offline Kampus UIN SSC (10 Soal Esai)',
    category: 'SD-SMP',
    questionCount: 10,
    durationMinutes: 90,
    tabSwitchLimit: 1,
    status: 'locked',
    isFinal: true,
    executionMode: 'offline',
    startDate: '2026-09-16',
    startTime: '09:00',
    endDate: '2026-09-16',
    endTime: '10:30',
    isOfflineStarted: false
  },
  {
    id: 'round-sma-1',
    title: 'Tahap Penyisihan SMA/SMK/MA - Daring (30 Soal PG & Isian)',
    category: 'SMA',
    questionCount: 30,
    durationMinutes: 90,
    tabSwitchLimit: 3,
    status: 'active',
    executionMode: 'online',
    startDate: '2026-09-14',
    startTime: '13:00',
    endDate: '2026-09-14',
    endTime: '14:30'
  },
  {
    id: 'round-sma-2',
    title: 'Tahap Final SMA/SMK/MA - Offline Kampus (3 Esai & Presentasi)',
    category: 'SMA',
    questionCount: 3,
    durationMinutes: 105,
    tabSwitchLimit: 1,
    status: 'locked',
    isFinal: true,
    executionMode: 'offline',
    startDate: '2026-09-16',
    startTime: '09:00',
    endDate: '2026-09-16',
    endTime: '13:30',
    isOfflineStarted: false
  }
];

export const MOCK_QUESTIONS: Question[] = Array.from({ length: 30 }).map((_, idx) => {
  const num = idx + 1;
  if (num === 1) {
    return {
      id: 1,
      code: 'TEORI BILANGAN • MATRIX',
      text: 'Hitunglah nilai dari ekspresi polinomial $P(x) = x^3 + 1x - 3$ ketika $x = 3$.',
      note: 'Pilih jawaban yang menyatakan nilai tepat.',
      options: [
        { id: 'A', text: '$27$' },
        { id: 'B', text: '$12$' },
        { id: 'C', text: '$25$' },
        { id: 'D', text: '$8$' }
      ],
      correctOption: 'A'
    };
  }
  if (num === 2) {
    return {
      id: 2,
      code: 'ALJABAR • OPTIMA 2026',
      text: 'Jika $a + b = 10$ dan $a^2 + b^2 = 52$, berapakah nilai dari $a \\times b$?',
      note: 'Gunakan identitas $(a+b)^2 = a^2 + 2ab + b^2$.',
      options: [
        { id: 'A', text: '$24$' },
        { id: 'B', text: '$26$' },
        { id: 'C', text: '$30$' },
        { id: 'D', text: '$32$' }
      ],
      correctOption: 'A'
    };
  }
  if (num === 3) {
    return {
      id: 3,
      code: 'KALKULUS • MATRIX OPTIMA',
      text: 'Tentukan nilai dari limit trigonometri: $\\lim_{x \\to 0} \\frac{\\sin(4x)}{2x}$.',
      note: 'Pilih jawaban yang paling sederhana.',
      options: [
        { id: 'A', text: '$1$' },
        { id: 'B', text: '$2$' },
        { id: 'C', text: '$4$' },
        { id: 'D', text: '$\\frac{1}{2}$' }
      ],
      correctOption: 'B'
    };
  }
  if (num === 12) {
    return {
      id: 12,
      code: 'GEOMETRI • MATRIX OPTIMA',
      text: 'Sebuah tabung pejal memiliki jari-jari $r = 4\\text{ cm}$ dan tinggi $h = 10\\text{ cm}$. Jika tabung ini dibentuk ulang menjadi sebuah bola sempurna, berapakah volume bola tersebut?',
      note: 'Catatan: Asumsikan tidak ada volume yang hilang. Gunakan $\\pi \\approx 3.14$.',
      diagramUrl: ASSET_IMAGES.cylinderSphere,
      figLabel: 'GAMBAR 12A',
      options: [
        { id: 'A', text: '$160\\pi\\text{ cm}^3$' },
        { id: 'B', text: '$140\\pi\\text{ cm}^3$' },
        { id: 'C', text: '$180\\pi\\text{ cm}^3$' },
        { id: 'D', text: '$200\\pi\\text{ cm}^3$' }
      ],
      correctOption: 'B'
    };
  }
  return {
    id: num,
    code: num % 2 === 0 ? 'ALJABAR • OPTIMA 2026' : 'TEORI BILANGAN • MATRIX',
    text: `Soal ${num}: Hitunglah nilai dari ekspresi polinomial $P(x) = x^${(num % 5) + 2} + ${num}x - ${(num * 3) % 17}$ ketika $x = 3$.`,
    note: 'Pilih jawaban yang menyatakan nilai tepat.',
    options: [
      { id: 'A', text: `$${num * 12 + 5}$` },
      { id: 'B', text: `$${num * 14 - 2}$` },
      { id: 'C', text: `$${num * 10 + 15}$` },
      { id: 'D', text: `$${num * 16 - 8}$` }
    ],
    correctOption: 'A'
  };
});

export const INITIAL_PARTICIPANTS: Participant[] = [
  {
    id: 'p1',
    rank: 1,
    name: 'Ahmad Firdaus',
    school: 'SDN 1 Cirebon',
    score: 96,
    tabSwitches: 0,
    status: 'qualified',
    category: 'SD-SMP'
  },
  {
    id: 'p2',
    rank: 2,
    name: 'Siti Aminah',
    school: 'SMPN 1 Bandung',
    score: 92,
    tabSwitches: 1,
    status: 'qualified',
    category: 'SD-SMP'
  },
  {
    id: 'p3',
    rank: 3,
    name: 'Andi Pratama',
    school: 'SMAN 1 Cirebon',
    score: 94,
    tabSwitches: 0,
    status: 'qualified',
    category: 'SMA'
  },
  {
    id: 'p4',
    rank: 4,
    name: 'Clarissa Maharani',
    school: 'SMA Kristen 1 BPK Penabur',
    score: 90,
    tabSwitches: 0,
    status: 'qualified',
    category: 'SMA'
  },
  {
    id: 'p21',
    rank: 21,
    name: 'Budi Santoso',
    school: 'SMP Al-Azhar Cirebon',
    score: 78,
    tabSwitches: 2,
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
    questionText: 'Berapakah jumlah sudut dalam pada bangun segi delapan beraturan?',
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
