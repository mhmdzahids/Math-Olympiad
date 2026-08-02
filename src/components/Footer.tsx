import React from 'react';
import { ScreenView } from '../types';
import { COMPETITION_INFO } from '../data/mockData';

interface FooterProps {
  onNavigate?: (screen: ScreenView) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="w-full bg-[#f8f3e9] border-t border-[#e7e2d8] py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-[#0a0a0a]/10">
          <div className="flex flex-col gap-1">
            <span 
              className="font-black text-2xl text-[#0a0a0a] cursor-pointer hover:text-[#ff6b5a] transition-colors"
              onClick={() => onNavigate && onNavigate('landing')}
            >
              {COMPETITION_INFO.title}
            </span>
            <p className="text-xs font-bold text-[#ff6b5a]">
              {COMPETITION_INFO.eventSeries} • {COMPETITION_INFO.organizer}
            </p>
            <p className="text-xs text-[#6a6a6a] max-w-md mt-0.5">
              Tema: "{COMPETITION_INFO.theme}"
            </p>
          </div>

          <div className="flex flex-col gap-1.5 text-xs text-[#0a0a0a] font-medium">
            <span className="font-extrabold uppercase text-[#6a6a6a] text-[10px] tracking-wider">Narahubung Panitia:</span>
            {COMPETITION_INFO.contacts.map((c) => (
              <div key={c.category} className="flex items-center gap-2">
                <span className="font-bold text-[#ff6b5a]">• {c.category}:</span>
                <span>{c.name} ({c.phone})</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-[#6a6a6a] font-semibold">
          <div className="flex items-center gap-4">
            <span>Instagram: <strong className="text-[#0a0a0a]">{COMPETITION_INFO.socials.instagram}</strong></span>
            <span>TikTok: <strong className="text-[#0a0a0a]">{COMPETITION_INFO.socials.tiktok}</strong></span>
            <span>Email: <strong className="text-[#0a0a0a]">{COMPETITION_INFO.socials.email}</strong></span>
          </div>

          <p className="text-xs">
            © 2026 HIMATIKA UIN Siber Syekh Nurjati Cirebon. Hak Cipta Dilindungi.
          </p>
        </div>
      </div>
    </footer>
  );
};
