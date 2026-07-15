import { api } from '../../../shared/lib/api';

export const exportValidRows = async (importJobId: string): Promise<void> => {
  const response = await api.get(
    `/import-jobs/${importJobId}/export/valid`,
    {
      responseType: 'blob',
    },
  );

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `valid-rows-${importJobId}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const exportErrorsReport = async (importJobId: string): Promise<void> => {
  const response = await api.get(
    `/import-jobs/${importJobId}/export/errors`,
    {
      responseType: 'blob',
    },
  );

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `errors-report-${importJobId}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const exportOriginalFile = async (importJobId: string): Promise<void> => {
  const response = await api.get(
    `/import-jobs/${importJobId}/export/original`,
    {
      responseType: 'blob',
    },
  );

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `original-${importJobId}`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};
