/**
 * Utility functions for handling media (images and videos).
 */

export const isVideoUrl = (url?: string): boolean => {
  if (!url) return false;
  return /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(url) || url.includes('video');
};

export const resolvePreviewUrl = (url: string): string => {
  if (!url) return '';
  if (
    url.startsWith('blob:') ||
    url.startsWith('data:') ||
    url.startsWith('http://') ||
    url.startsWith('https://')
  ) {
    return url;
  }
  const apiBase = import.meta.env.VITE_API_URL || '';
  try {
    const origin = apiBase ? new URL(apiBase).origin : 'https://api.teamuparena.com';
    const cleanPath = url.startsWith('/') ? url : `/${url}`;
    return `${origin}${cleanPath}`;
  } catch {
    return url;
  }
};
