import { api } from '../../../shared/lib/api';
import type { UploadResponse } from '../types';

export const uploadFile = async (
  sourceId: string,
  file: File,
): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post<UploadResponse>(
    `/sources/${sourceId}/uploads`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  );

  return response.data;
};
