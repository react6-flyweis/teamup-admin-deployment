/**
 * Upload file size limits in Megabytes (MB).
 */
export const MAX_VIDEO_SIZE_MB = Number(import.meta.env.VITE_MAX_VIDEO_SIZE_MB) || 50;
export const MAX_IMAGE_SIZE_MB = Number(import.meta.env.VITE_MAX_IMAGE_SIZE_MB) || 5;
export const MAX_FILE_SIZE_MB = Number(import.meta.env.VITE_MAX_FILE_SIZE_MB) || 10;

// General alias
export const MAX_UPLOAD_SIZE_MB = MAX_FILE_SIZE_MB;

/**
 * Upload file size limits in Bytes.
 */
export const MAX_VIDEO_SIZE_BYTES = MAX_VIDEO_SIZE_MB * 1024 * 1024;
export const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

// General alias
export const MAX_UPLOAD_SIZE_BYTES = MAX_FILE_SIZE_BYTES;

/**
 * Standard error messages for file upload size validations.
 */
export const MAX_VIDEO_SIZE_ERROR_MESSAGE = `Video size exceeds the ${MAX_VIDEO_SIZE_MB}MB limit. Please upload a smaller video.`;
export const MAX_IMAGE_SIZE_ERROR_MESSAGE = `Image file size must be less than ${MAX_IMAGE_SIZE_MB}MB.`;

/**
 * Converts a byte value to megabytes (MB) as a formatted string without decimals.
 */
export const formatBytesToMB = (bytes: number): string => {
  return (bytes / (1024 * 1024)).toFixed(0);
};

/**
 * Generates a default file size error message given the limit in bytes.
 */
export const getDefaultFileSizeErrorMessage = (maxSizeBytes: number): string => {
  const maxMb = formatBytesToMB(maxSizeBytes);
  return `File size exceeds the ${maxMb}MB limit.`;
};
