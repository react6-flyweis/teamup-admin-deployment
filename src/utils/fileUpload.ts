import apiClient from '@/utils/apiClient';

/**
 * Uploads a single file to the backend `/uploads` API endpoint.
 * @param file The File object to upload
 * @returns Promise<string> The uploaded file URL or path returned by the server
 */
export async function uploadFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post('/uploads', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  const fileData = response.data?.file || response.data?.data || response.data;
  const fileUrl = fileData?.url || fileData?.filePath || fileData?.path || (typeof response.data === 'string' ? response.data : '');
  
  if (!fileUrl) {
    throw new Error('Upload completed, but no file URL was returned by the server.');
  }

  return fileUrl;
}

export default uploadFile;
