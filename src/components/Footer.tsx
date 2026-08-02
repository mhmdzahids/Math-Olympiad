import React from 'react';
import { ScreenView } from '../types';

interface FooterProps {
  onNavigate?: (screen: ScreenView) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="w-full bg-[#f8f3e9] border-t border-[#e7e2d8] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
        <div className="flex flex-col gap-1">
          <span 
            className="font-black text-xl text-[#0a0a0a] cursor-pointer hover:text-[#ff6b5a] transition-colors"
            onClick={() => onNavigate && onNavigate('landing')}
          >
            MathOlympiad
          </span>
          <p className="text-xs text-[#6a6a6a]">
            Membangun generasi pemecah masalah berikutnya melalui pembelajaran interaktif.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-6 text-xs font-semibold text-[#6a6a6a]">
          <a href="#about" onClick={(e) => { e.preventDefault(); alert('Tentang MathOlympiad: Platform Kompetisi Matematika Digital Terdepan.'); }} className="hover:text-[#ff6b5a] transition-colors">
            Tentang Kami
          </a>
          <a href="#contact" onClick={(e) => { e.preventDefault(); alert('Kontak: support@matholympiad.org'); }} className="hover:text-[#ff6b5a] transition-colors">
            Kontak
          </a>
          <a href="#privacy" onClick={(e) => { e.preventDefault(); alert('Kebijakan Privasi: Semua data peserta dienkripsi sesuai standar pendidikan.'); }} className="hover:text-[#ff6b5a] transition-colors">
            Kebijakan Privasi
          </a>
          <a href="#terms" onClick={(e) => { e.preventDefault(); alert('Syarat & Ketentuan: Aturan resmi kompetisi dan panduan mode fokus berlaku.'); }} className="hover:text-[#ff6b5a] transition-colors">
            Syarat & Ketentuan
          </a>
        </div>

        <p className="text-xs text-[#6a6a6a]">
          © 2024 MathOlympiad. Hak cipta dilindungi.
        </p>
      </div>
    </footer>
  );
};
