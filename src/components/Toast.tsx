import React, { useEffect } from 'react';

export interface ToastMessage {
  id: string;
  message: string;
  type?: 'success' | 'info' | 'warning';
  title?: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

/**
 * Compact Light-Themed Bubblechat Toast Overlay with Smooth Slide-Up
 */
export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-[320px] w-full pointer-events-none px-3 sm:px-0">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: (id: string) => void }> = ({
  toast,
  onDismiss,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 3500);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const typeConfig = {
    success: {
      badgeBg: 'bg-[#a4d4c5]',
      iconColor: 'text-[#0a0a0a]',
      icon: 'check_circle',
      label: 'BERHASIL',
    },
    info: {
      badgeBg: 'bg-[#ffb084]',
      iconColor: 'text-[#0a0a0a]',
      icon: 'info',
      label: 'INFORMASI',
    },
    warning: {
      badgeBg: 'bg-[#e8b94a]',
      iconColor: 'text-[#0a0a0a]',
      icon: 'warning',
      label: 'PERINGATAN',
    },
  };

  const config = typeConfig[toast.type || 'success'];

  return (
    <div className="pointer-events-auto bg-white text-[#0a0a0a] p-3 px-4 rounded-2xl rounded-br-xs clay-shadow-sm border-2 border-[#0a0a0a]/15 flex items-center gap-3 shadow-xl toast-slide-up relative overflow-hidden group">
      {/* Small Colorful Icon Badge */}
      <div className={`w-8 h-8 rounded-xl ${config.badgeBg} flex items-center justify-center shrink-0 shadow-2xs`}>
        <span className={`material-symbols-outlined text-lg ${config.iconColor}`}>
          {config.icon}
        </span>
      </div>

      {/* Message Content */}
      <div className="flex-1 space-y-0.5 min-w-0">
        <div className="text-[10px] font-black uppercase tracking-wider text-[#6a6a6a]">
          {toast.title || config.label}
        </div>
        <p className="text-xs font-bold text-[#0a0a0a] leading-tight truncate">
          {toast.message}
        </p>
      </div>

      {/* Close Button */}
      <button
        onClick={() => onDismiss(toast.id)}
        className="w-6 h-6 rounded-lg hover:bg-[#ebe6d6] text-[#6a6a6a] hover:text-[#0a0a0a] flex items-center justify-center transition-colors shrink-0 cursor-pointer"
        title="Tutup"
      >
        <span className="material-symbols-outlined text-xs">close</span>
      </button>
    </div>
  );
};
