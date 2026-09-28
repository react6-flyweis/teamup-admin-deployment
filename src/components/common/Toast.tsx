import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useToastStore, type ToastItem } from '@/utils/toast';


const ToastItemComponent: React.FC<{
  toast: ToastItem;
  onClose: () => void;
}> = ({ toast: item, onClose }) => {
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(100);
  const duration = item.duration ?? 5000;
  const remainingTimeRef = useRef(duration);
  const startTimeRef = useRef(Date.now());
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (duration <= 0) return;

    if (isPaused) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
        remainingTimeRef.current -= Date.now() - startTimeRef.current;
      }
      return;
    }

    startTimeRef.current = Date.now();
    const currentRemaining = Math.max(remainingTimeRef.current, 0);

    timerRef.current = setTimeout(() => {
      onClose();
    }, currentRemaining);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isPaused, duration, onClose]);

  useEffect(() => {
    if (isPaused || duration <= 0) return;
    const interval = 50;
    const timer = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const left = Math.max(remainingTimeRef.current - elapsed, 0);
      setProgress((left / duration) * 100);
    }, interval);

    return () => clearInterval(timer);
  }, [isPaused, duration]);

  const config = {
    error: {
      card: 'bg-[#1E1315]/95 border-red-500/50 text-white shadow-[0_10px_35px_-5px_rgba(239,68,68,0.35)]',
      iconBg: 'bg-red-500/20 text-red-400 border border-red-500/40',
      progressBar: 'bg-red-500',
      titleColor: 'text-red-200',
      messageColor: 'text-red-300/90',
      icon: (
        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      ),
    },
    success: {
      card: 'bg-[#121E16]/95 border-emerald-500/50 text-white shadow-[0_10px_35px_-5px_rgba(16,185,129,0.35)]',
      iconBg: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40',
      progressBar: 'bg-emerald-500',
      titleColor: 'text-emerald-200',
      messageColor: 'text-emerald-300/90',
      icon: (
        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      ),
    },
    warning: {
      card: 'bg-[#221A10]/95 border-amber-500/50 text-white shadow-[0_10px_35px_-5px_rgba(245,158,11,0.35)]',
      iconBg: 'bg-amber-500/20 text-amber-400 border border-amber-500/40',
      progressBar: 'bg-amber-500',
      titleColor: 'text-amber-200',
      messageColor: 'text-amber-300/90',
      icon: (
        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      ),
    },
    info: {
      card: 'bg-[#121B24]/95 border-cyan-500/50 text-white shadow-[0_10px_35px_-5px_rgba(6,182,212,0.35)]',
      iconBg: 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40',
      progressBar: 'bg-cyan-500',
      titleColor: 'text-cyan-200',
      messageColor: 'text-cyan-300/90',
      icon: (
        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
      ),
    },
  }[item.type];

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      role="alert"
      className={`pointer-events-auto relative overflow-hidden rounded-xl border p-4 shadow-2xl backdrop-blur-md transition-all duration-300 ${config.card}`}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg shrink-0 ${config.iconBg}`}>
          {config.icon}
        </div>

        <div className="flex-1 min-w-0 pr-2">
          {item.title && (
            <h4 className={`text-sm font-semibold tracking-wide ${config.titleColor}`}>
              {item.title}
            </h4>
          )}
          <p className={`text-xs leading-relaxed mt-0.5 wrap-break-word whitespace-pre-line ${config.messageColor}`}>
            {item.message}
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="shrink-0 -mr-1 -mt-1 p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          title="Dismiss notification"
          aria-label="Dismiss notification"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/30 overflow-hidden">
          <div
            className={`h-full transition-all duration-75 ease-linear ${config.progressBar}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
};

let hasMountedContainer = false;

export const ToastContainer: React.FC = () => {
  const toasts = useToastStore((state) => state.toasts);
  const removeToast = useToastStore((state) => state.removeToast);
  const [mounted, setMounted] = useState(false);
  const isPrimary = useRef(false);

  useEffect(() => {
    if (!hasMountedContainer) {
      hasMountedContainer = true;
      isPrimary.current = true;
      setMounted(true);
    }
    return () => {
      if (isPrimary.current) {
        hasMountedContainer = false;
      }
    };
  }, []);

  if (!mounted || !isPrimary.current || typeof document === 'undefined') return null;

  return createPortal(
    <div
      aria-live="polite"
      className="fixed top-5 right-5 z-1080 flex flex-col gap-3 max-w-sm sm:max-w-md w-full pointer-events-none px-4 sm:px-0"
    >
      {toasts.map((item) => (
        <ToastItemComponent
          key={item.id}
          toast={item}
          onClose={() => removeToast(item.id)}
        />
      ))}
    </div>,
    document.body
  );
};

export default ToastContainer;
