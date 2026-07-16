import { useMutation, useQueryClient } from '@tanstack/react-query';
import { uploadFile } from '../services/uploads.service';
import toast from 'react-hot-toast';

export const useUpload = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      sourceId,
      file,
      schemaVersion,
    }: {
      sourceId: string;
      file: File;
      schemaVersion?: number;
    }) => uploadFile(sourceId, file, schemaVersion),
    onSuccess: () => {
      toast.success('Fichier uploadé avec succès');
      queryClient.invalidateQueries({ queryKey: ['import-jobs'] });
    },
    onError: () => {
      toast.error('Erreur lors de l\'upload');
    },
  });
};