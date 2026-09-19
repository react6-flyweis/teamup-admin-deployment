import React from 'react';

interface SuccessModalProps {
  isOpen: boolean;
  title?: string;
  message?: string;
  buttonText?: string;
  onConfirm: () => void;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  title = 'Saved Successfully!',
  message = 'Your changes have been saved successfully.',
  buttonText = 'OK',
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onConfirm();
      }}
    >
      <div className="bg-[#1A1A1A] border border-[#3A3530] rounded-2xl p-6 w-full max-w-md shadow-2xl flex flex-col items-center text-center">
        {/* Animated Checkmark Icon Circle */}
        <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4 shadow-lg shadow-emerald-500/10">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-gray-300 text-sm leading-relaxed mb-6">{message}</p>

        <button
          type="button"
          onClick={onConfirm}
          className="w-full py-2.5 bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold rounded-lg shadow-lg shadow-emerald-900/30 transition-all duration-150 cursor-pointer"
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
};

export default SuccessModal;
