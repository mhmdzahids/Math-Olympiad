import mammoth from 'mammoth';
import { ParsedQuestion } from '../types';

/**
 * Utility to parse .docx / .doc files or plain text into structured ParsedQuestion array
 */
export async function parseDocxFile(file: File): Promise<ParsedQuestion[]> {
  let text = '';

  try {
    if (file.name.endsWith('.docx') || file.name.endsWith('.doc')) {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      text = result.value || '';
    } else {
      text = await file.text();
    }
  } catch (err) {
    console.error('Error reading docx file:', err);
    throw new Error('Gagal membaca berkas Word. Pastikan format berkas adalah .docx yang valid.');
  }

  if (!text || text.trim().length === 0) {
    throw new Error('Dokumen Word kosong atau tidak berisi teks soal.');
  }

  return parseQuestionText(text);
}

/**
 * Parses raw text into ParsedQuestion array using regex pattern matching
 */
export function parseQuestionText(rawText: string): ParsedQuestion[] {
  // Standardize newlines
  const cleanText = rawText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = cleanText.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);

  const questions: ParsedQuestion[] = [];
  let currentQuestionText: string[] = [];
  let currentOptions: { key: string; text: string }[] = [];
  let currentKey = '';
  let questionCounter = 1;

  const isQuestionStart = (line: string) => {
    // Matches "1.", "1)", "Soal 1:", "1. ", "Q1:", etc.
    return /^(?:Soal\s*\d+[:.]?|\d+[\.\)]\s+|Q\d+[:.]?)/i.test(line);
  };

  const isOptionLine = (line: string) => {
    // Matches "A.", "B.", "a)", "B)", "A. ", "a. ", etc.
    return /^[A-Ea-e][\.\)]\s+/.test(line);
  };

  const isKeyLine = (line: string) => {
    // Matches "Kunci:", "Jawaban:", "Kunci Jawaban:", "Answer:", "Key:"
    return /^(?:Kunci(?:\s*Jawaban)?|Jawaban|Answer|Key)\s*[:=]\s*([A-[#Ea-e])/i.test(line);
  };

  const finalizeQuestion = () => {
    if (currentQuestionText.length === 0 && currentOptions.length === 0) return;

    const qText = currentQuestionText.join(' ').replace(/^(?:Soal\s*\d+[:.]?|\d+[\.\)]\s+|Q\d+[:.]?)\s*/i, '').trim();
    let isError = false;
    let errorMessage = '';

    if (!qText) {
      isError = true;
      errorMessage = 'Teks soal kosong atau tidak dapat terbaca.';
    } else if (currentOptions.length < 2) {
      isError = true;
      errorMessage = 'Pilihan jawaban kurang dari 2 opsi (minimal A dan B).';
    } else if (!currentKey) {
      isError = true;
      errorMessage = 'Kunci jawaban tidak ditemukan (format: Kunci: B).';
    }

    questions.push({
      id: `Q${String(questionCounter).padStart(2, '0')}`,
      questionText: qText || 'Teks Soal Tidak Terurai',
      options: currentOptions.length > 0 ? currentOptions : [
        { key: 'A', text: 'Pilihan A' },
        { key: 'B', text: 'Pilihan B' },
        { key: 'C', text: 'Pilihan C' },
        { key: 'D', text: 'Pilihan D' }
      ],
      key: currentKey || 'A',
      isError,
      errorMessage: isError ? errorMessage : undefined,
    });

    questionCounter++;
    currentQuestionText = [];
    currentOptions = [];
    currentKey = '';
  };

  for (const line of lines) {
    if (isQuestionStart(line)) {
      if (currentQuestionText.length > 0 || currentOptions.length > 0) {
        finalizeQuestion();
      }
      currentQuestionText.push(line);
    } else if (isOptionLine(line)) {
      const match = line.match(/^([A-Ea-e])[\.\)]\s+(.*)/);
      if (match) {
        const optKey = match[1].toUpperCase();
        const optText = match[2].trim();
        currentOptions.push({ key: optKey, text: optText });
      }
    } else if (isKeyLine(line)) {
      const match = line.match(/^(?:Kunci(?:\s*Jawaban)?|Jawaban|Answer|Key)\s*[:=]\s*([A-Ea-e])/i);
      if (match) {
        currentKey = match[1].toUpperCase();
      }
    } else {
      // If we are currently collecting question text (before options start)
      if (currentOptions.length === 0) {
        currentQuestionText.push(line);
      }
    }
  }

  // Finalize last question
  finalizeQuestion();

  // If no questions were detected via numbers, try fallback splitting by blank spaces or paragraphs
  if (questions.length === 0 && lines.length >= 4) {
    return parseFallbackFormat(lines);
  }

  return questions;
}

/**
 * Fallback parser for plain text without numbered headers
 */
function parseFallbackFormat(lines: string[]): ParsedQuestion[] {
  const sampleOptions = [
    { key: 'A', text: lines[1] || 'Opsi A' },
    { key: 'B', text: lines[2] || 'Opsi B' },
    { key: 'C', text: lines[3] || 'Opsi C' },
    { key: 'D', text: lines[4] || 'Opsi D' },
  ];

  return [
    {
      id: 'Q01',
      questionText: lines[0] || 'Soal 1',
      options: sampleOptions,
      key: 'A',
      isError: false,
    },
  ];
}

/**
 * Generates sample Word text template for admin download
 */
export function generateSampleTemplateText(): string {
  return `FORMAT TEMPLATE IMPOR SOAL OPTIMA MATRIX 2026
===============================================
Petunjuk:
1. Setiap soal diawali dengan nomor soal (contoh: 1. atau Soal 1:)
2. Pilihan jawaban diawali dengan A., B., C., D. (atau a., b., c., d.)
3. Kunci jawaban diawali dengan "Kunci: X" atau "Jawaban: X"

--- CONTOH SOAL ---

1. Hasil dari 15 + 27 * 2 adalah ...
A. 69
B. 84
C. 54
D. 99
Kunci: A

2. Jika x + 5 = 12, maka nilai x^2 - 10 adalah ...
A. 39
B. 49
C. 59
D. 69
Kunci: C

3. Diberikan sebuah segitiga siku-siku dengan panjang alas 6 cm dan tinggi 8 cm. Berapakah panjang sisi miringnya?
A. 9 cm
B. 10 cm
C. 12 cm
D. 14 cm
Kunci: B

4. Suatu deret aritmatika memiliki suku pertama a = 4 dan beda b = 3. Berapakah suku ke-10 (U10)?
A. 31
B. 34
C. 37
D. 40
Kunci: A
`;
}
