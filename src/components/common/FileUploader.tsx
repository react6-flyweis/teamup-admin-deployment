import React, { useState, useRef } from 'react';
import UploadIcon from '@/assets/icons/UploadIcon';
import { uploadFile } from '@/utils/fileUpload';

interface FileUploaderProps {
  value: string;
  onChange: (url: string) => void;
  accept?: string;
  className?: string;
}

const FileUploader: React.FC<FileUploaderProps> = ({
  value,
  onChange,
  accept = 'image/*,video/*',
  className = '',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);
    try {
      const fileUrl = await uploadFile(file);
      onChange(fileUrl);
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'message' in err) {
        const error = err as { message: string; response?: { data?: { message?: string } } };
        setUploadError(error.response?.data?.message || error.message || 'Failed to upload file');
      } else {
        setUploadError('Failed to upload file');
      }
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const isVideo = value.match(/\.(mp4|webm|ogg|mov)$/i) || value.includes('video');

  return (
    <div className={className}>
      <div 
        onClick={!value && !isUploading ? triggerFileInput : undefined}
        className={`relative w-full h-[200px] rounded-lg border-2 border-dashed border-gray-500 flex flex-col items-center justify-center overflow-hidden ${!value && !isUploading ? 'cursor-pointer hover:border-[#E1017D] transition-colors' : ''}`}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          className="hidden" 
          accept={accept}
        />
        {isUploading ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E1017D] mx-auto mb-2"></div>
            <p className="text-gray-400 text-sm">Uploading file...</p>
          </div>
        ) : value ? (
          <>
            {isVideo ? (
              <video src={value} autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-50" />
            ) : (
              <img src={value} alt="Uploaded file" className="absolute inset-0 w-full h-full object-cover opacity-50" />
            )}
            <div className="relative z-10 flex flex-col items-center gap-2">
              <button 
                type="button"
                className="bg-black/50 hover:bg-black/75 px-4 py-2 rounded text-white text-sm backdrop-blur-sm transition-colors" 
                onClick={(e) => { e.stopPropagation(); onChange(''); }}
              >
                Remove Media
              </button>
            </div>
          </>
        ) : (
          <div className="text-center">
            <UploadIcon size={32} className="mx-auto mb-2 text-gray-400" />
            <p className="text-gray-400 text-sm">Click to upload image or video</p>
            <p className="text-gray-500 text-xs mt-1">Or enter URL below</p>
          </div>
        )}
      </div>
      {uploadError && (
        <p className="text-red-500 text-xs mt-2">{uploadError}</p>
      )}
    </div>
  );
};

export default FileUploader;
