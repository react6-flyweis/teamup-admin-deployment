import React, { useState, useEffect } from 'react';
import ImageInputWithUpload from '@/components/common/ImageInputWithUpload';

interface MainBackgroundFormProps {
  initialData: string;
  onSave?: (data: string) => void;
  isSaving?: boolean;
  errorMessage?: string | null;
}

const MainBackgroundForm: React.FC<MainBackgroundFormProps> = ({
  initialData,
  onSave,
  isSaving,
  errorMessage,
}) => {
  const [backgroundUrl, setBackgroundUrl] = useState<string>(initialData || '');

  useEffect(() => {
    setBackgroundUrl(initialData || '');
  }, [initialData]);

  return (
    <div className="bg-[#1C1C1C] rounded-xl p-6 border border-[#3A3530]">
      <div className="mb-6 border-b border-[#3A3530] pb-5">
        <h2 className="text-xl font-semibold text-white">Main Background</h2>
        <p className="text-gray-400 text-sm mt-1">
          Configure or change the primary background media (image or video) displayed on the home page.
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <ImageInputWithUpload
            label="Background Media (Image or Video)"
            hint="16:9 • Rec: 1920×1080 or 2560×1440 px • WebP/JPG/MP4"
            value={backgroundUrl}
            onChange={(url) => setBackgroundUrl(url)}
            placeholder="Paste media URL or upload"
            accept="image/*,video/*"
            aspectRatio="16:9"
            previewWidth="w-full max-w-xl"
            labelClassName="block text-sm text-gray-300 mb-2 font-medium"
            inputClassName="w-full h-10 px-4 rounded-lg bg-[#2A2A2A] border border-[#3A3530] text-white text-sm focus:outline-none focus:border-[#E1017D] transition-colors"
          />
        </div>
      </div>

      <div className="mt-8 flex flex-col sm:flex-row items-end sm:items-center justify-end gap-4">
        {errorMessage && (
          <div className="text-red-400 text-sm font-medium bg-red-500/10 border border-red-500/20 px-3.5 py-2 rounded-lg">
            {errorMessage}
          </div>
        )}
        <button
          type="button"
          onClick={() => onSave && onSave(backgroundUrl)}
          disabled={isSaving}
          className="bg-[#E1017D] hover:bg-[#c0016a] text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
        >
          {isSaving && (
            <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
          )}
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};

export default MainBackgroundForm;
