import React, { useState, useRef } from 'react';
import { uploadFile } from '@/utils/fileUpload';
import UploadIcon from '@/assets/icons/UploadIcon';

interface ImageInputWithUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  placeholder?: string;
  accept?: string;
  className?: string;
  inputClassName?: string;
  labelClassName?: string;
  showPreview?: boolean;
  previewHeight?: string;
  previewWidth?: string;
  buttonText?: string;
}

export const ImageInputWithUpload: React.FC<ImageInputWithUploadProps> = ({
  value,
  onChange,
  label,
  placeholder = 'Paste image URL or click upload',
  accept = 'image/*',
  className = '',
  inputClassName = '',
  labelClassName = '',
  showPreview = true,
  previewHeight = 'h-20',
  previewWidth = 'w-32',
  buttonText = 'Upload',
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);
    try {
      const url = await uploadFile(file);
      onChange(url);
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'message' in err) {
        const errorObj = err as { message: string };
        setError(errorObj.message || 'Upload failed');
      } else {
        setError('Upload failed');
      }
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={className}>
      {label && (
        <label className={labelClassName || "block text-xs text-gray-400 mb-1 font-medium"}>
          {label}
        </label>
      )}
      <div className="flex gap-2 items-center">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={
            inputClassName ||
            "w-full bg-[#1C1C1C] border border-[#3A3530] rounded px-3 py-1.5 text-white text-sm focus:outline-none focus:border-[#E1017D] flex-1"
          }
        />
        <input
          type="file"
          ref={fileInputRef}
          accept={accept}
          className="hidden"
          onChange={handleFileChange}
        />
        <button
          type="button"
          disabled={isUploading}
          onClick={() => fileInputRef.current?.click()}
          className="bg-[#2A2A2A] hover:bg-[#3A3530] text-white px-3 py-1.5 rounded text-xs border border-[#3A3530] shrink-0 disabled:opacity-50 flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          {isUploading ? (
            <span className="animate-pulse">Uploading...</span>
          ) : (
            <>
              <UploadIcon size={14} />
              <span>{buttonText}</span>
            </>
          )}
        </button>
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      {showPreview && value && (
        <div className={`mt-2 ${previewWidth} ${previewHeight} rounded-lg overflow-hidden border border-[#3A3530] bg-[#1A1A1A] relative group`}>
          <img
            src={value}
            alt="Preview"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      )}
    </div>
  );
};

export default ImageInputWithUpload;
