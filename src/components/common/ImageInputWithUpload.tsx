import React, { useState, useRef, useEffect } from 'react';
import { uploadFile } from '@/utils/fileUpload';
import UploadIcon from '@/assets/icons/UploadIcon';
import { isVideoUrl, resolvePreviewUrl } from '@/utils/mediaUtils';

interface ImageInputWithUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  hint?: string;
  aspectRatio?: string;
  objectFit?: 'cover' | 'contain';
  placeholder?: string;
  accept?: string;
  className?: string;
  inputClassName?: string;
  labelClassName?: string;
  buttonClassName?: string;
  showPreview?: boolean;
  previewHeight?: string;
  previewWidth?: string;
  buttonText?: string;
  maxSizeBytes?: number;
  maxSizeErrorMessage?: string;
}

const parseAspectRatio = (aspectRatio?: string, hint?: string): { cssRatio: string; label: string } | null => {
  const source = aspectRatio || hint;
  if (!source) return null;
  const match = source.match(/(\d+)\s*[:/]\s*(\d+)/);
  if (match) {
    return {
      cssRatio: `${match[1]} / ${match[2]}`,
      label: `${match[1]}:${match[2]}`,
    };
  }
  return null;
};

export const ImageInputWithUpload: React.FC<ImageInputWithUploadProps> = ({
  value,
  onChange,
  label,
  hint,
  aspectRatio,
  objectFit,
  placeholder = 'Paste image URL or click upload',
  accept = 'image/*',
  className = '',
  inputClassName = '',
  labelClassName = '',
  buttonClassName = '',
  showPreview = true,
  previewHeight = 'h-20',
  previewWidth = 'w-32',
  buttonText = 'Upload',
  maxSizeBytes,
  maxSizeErrorMessage,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [selectedFileType, setSelectedFileType] = useState<'image' | 'video' | null>(null);
  const [hasLoadError, setHasLoadError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const ratioInfo = parseAspectRatio(aspectRatio, hint);
  const fit = objectFit || (hint?.toLowerCase().includes('svg') || hint?.toLowerCase().includes('contain') || label?.toLowerCase().includes('icon') || label?.toLowerCase().includes('badge') ? 'contain' : 'cover');

  // Reset load error and local preview if value changes externally
  useEffect(() => {
    setHasLoadError(false);
  }, [value]);

  useEffect(() => {
    return () => {
      if (localPreview) {
        URL.revokeObjectURL(localPreview);
      }
    };
  }, [localPreview]);

  let widthClass = previewWidth;
  if (ratioInfo) {
    if (previewWidth === 'w-32') {
      if (ratioInfo.label === '1:1') widthClass = 'w-28';
      else if (['2:1', '16:9', '21:9', '3:1'].includes(ratioInfo.label)) widthClass = 'w-48';
      else if (['3:2', '16:10'].includes(ratioInfo.label)) widthClass = 'w-40';
      else if (['5:4', '4:3'].includes(ratioInfo.label)) widthClass = 'w-36';
    } else if (previewWidth === 'w-full') {
      widthClass = 'w-full max-w-[280px]';
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (maxSizeBytes && file.size > maxSizeBytes) {
      const defaultMsg = `File size exceeds the allowed limit of ${(maxSizeBytes / (1024 * 1024)).toFixed(1)}MB.`;
      setError(maxSizeErrorMessage || defaultMsg);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    // Create an instant local object URL preview
    const objectUrl = URL.createObjectURL(file);
    if (localPreview) {
      URL.revokeObjectURL(localPreview);
    }
    setLocalPreview(objectUrl);
    setSelectedFileType(file.type.startsWith('video/') ? 'video' : 'image');
    setHasLoadError(false);

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
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const previewSrc = localPreview || resolvePreviewUrl(value);
  const isVideo = selectedFileType === 'video' || (!selectedFileType && isVideoUrl(previewSrc));

  return (
    <div className={className}>
      {label && (
        <label className={labelClassName || "block text-xs text-gray-400 mb-1 font-medium"}>
          <span>{label}</span>
          {hint && (
            <span className="text-[11px] text-gray-400 font-normal ml-1.5">
              ({hint})
            </span>
          )}
        </label>
      )}
      <div className="flex gap-2 items-center">
        <input
          type="text"
          value={value}
          onChange={(e) => {
            if (localPreview) {
              URL.revokeObjectURL(localPreview);
              setLocalPreview(null);
            }
            setSelectedFileType(null);
            onChange(e.target.value);
          }}
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
          className={
            buttonClassName ||
            "bg-[#2A2A2A] hover:bg-[#3A3530] text-white px-3 py-1.5 rounded text-xs border border-[#3A3530] shrink-0 disabled:opacity-50 flex items-center gap-1.5 transition-colors cursor-pointer"
          }
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
      {showPreview && previewSrc && (
        <div
          className={`mt-2 ${widthClass} ${ratioInfo ? 'h-auto' : previewHeight} rounded-lg overflow-hidden border border-[#3A3530] bg-[#1A1A1A] relative group shadow-sm flex items-center justify-center`}
          style={ratioInfo ? { aspectRatio: ratioInfo.cssRatio } : undefined}
        >
          {isUploading && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center z-10 text-white gap-1.5">
              <span className="animate-spin rounded-full h-5 w-5 border-2 border-[#E1017D] border-t-transparent"></span>
              <span className="text-[11px] font-medium text-gray-300">Uploading...</span>
            </div>
          )}

          {hasLoadError && !isUploading ? (
            <div className="flex flex-col items-center justify-center p-3 text-center text-gray-500">
              <svg className="w-5 h-5 mb-1 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-[11px]">Preview unavailable</span>
            </div>
          ) : isVideo ? (
            <video
              key={previewSrc}
              src={previewSrc}
              autoPlay
              loop
              muted
              playsInline
              className={`w-full h-full ${fit === 'contain' ? 'object-contain p-1.5' : 'object-cover'}`}
              onLoadedData={() => setHasLoadError(false)}
              onError={() => setHasLoadError(true)}
            />
          ) : (
            <img
              key={previewSrc}
              src={previewSrc}
              alt="Preview"
              className={`w-full h-full ${fit === 'contain' ? 'object-contain p-1.5' : 'object-cover'}`}
              onLoad={() => setHasLoadError(false)}
              onError={() => setHasLoadError(true)}
            />
          )}

          {ratioInfo && !hasLoadError && (
            <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/80 text-[10px] text-gray-300 font-mono font-medium pointer-events-none opacity-85 group-hover:opacity-100 transition-opacity z-20">
              {isVideo ? `VIDEO • ${ratioInfo.label}` : ratioInfo.label}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageInputWithUpload;
