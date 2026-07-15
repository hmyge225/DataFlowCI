import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getImportJobs, getImportJob, deleteImportJob } from '../services/import-jobs.service';
import toast from 'react-hot-toast';

export const useImportJobs = () => {
  return useQuery({
    queryKey: ['import-jobs'],
    queryFn: getImportJobs,
    refetchInterval: 5000, // Polling toutes les 5 secondes
  });
};

export const useImportJob = (id: string) => {
  return useQuery({
    queryKey: ['import-jobs', id],
    queryFn: () => getImportJob(id),
    enabled: !!id,
    refetchInterval: 5000, // Polling toutes les 5 secondes
  });
};

export const useDeleteImportJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteImportJob,
    onSuccess: () => {
      toast.success('Job supprimé avec succès');
      queryClient.invalidateQueries({ queryKey: ['import-jobs'] });
    },
    onError: () => {
      toast.error('Erreur lors de la suppression');
    },
  });
};
