import { useMutation, useQueryClient } from '@tanstack/react-query';
import { uploadFile } from '../services/uploads.service';
import toast from 'react-hot-toast';

export const useUpload = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      sourceId,
      file,
    }: {
      sourceId: string;
      file: File;
    }) => uploadFile(sourceId, file),
    onSuccess: () => {
      toast.success('Fichier uploadé avec succès');
      queryClient.invalidateQueries({ queryKey: ['import-jobs'] });
    },
    onError: () => {
      toast.error('Erreur lors de l\'upload');
    },
  });
};
