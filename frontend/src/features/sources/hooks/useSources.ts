import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  getSourcesRequest,
  getSourceRequest,
  createSourceRequest,
  updateSourceRequest,
  deleteSourceRequest,
} from '../services/sources.service';
import type { CreateSourceInput, UpdateSourceInput } from '../types';

const sourcesKeys = {
  all: ['sources'] as const,
  lists: () => [...sourcesKeys.all, 'list'] as const,
  list: (filters: { userId?: string }) =>
    [...sourcesKeys.lists(), filters] as const,
  details: () => [...sourcesKeys.all, 'detail'] as const,
  detail: (id: string) => [...sourcesKeys.details(), id] as const,
};

export function useSources(userId?: string) {
  return useQuery({
    queryKey: sourcesKeys.list({ userId }),
    queryFn: () => getSourcesRequest(userId),
  });
}

export function useSource(id: string) {
  return useQuery({
    queryKey: sourcesKeys.detail(id),
    queryFn: () => getSourceRequest(id),
    enabled: !!id,
  });
}

export function useCreateSource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateSourceInput) => createSourceRequest(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sourcesKeys.lists() });
      toast.success('Source créée avec succès');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erreur lors de la création');
    },
  });
}

export function useUpdateSource(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateSourceInput) => updateSourceRequest(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sourcesKeys.lists() });
      queryClient.invalidateQueries({ queryKey: sourcesKeys.detail(id) });
      toast.success('Source mise à jour');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erreur lors de la mise à jour');
    },
  });
}

export function useDeleteSource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteSourceRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sourcesKeys.lists() });
      toast.success('Source supprimée');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erreur lors de la suppression');
    },
  });
}
