import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  getSchemaVersionsRequest,
  getSchemaVersionRequest,
  createSchemaVersionRequest,
  importSchemaRequest,
  deleteSchemaVersionRequest,
} from '../services/schemas.service';
import type { CreateSchemaVersionInput, ImportSchemaInput } from '../types';

const schemasKeys = {
  all: ['schemas'] as const,
  lists: () => [...schemasKeys.all, 'list'] as const,
  list: (sourceId: string) =>
    [...schemasKeys.lists(), sourceId] as const,
  details: () => [...schemasKeys.all, 'detail'] as const,
  detail: (sourceId: string, version: number) =>
    [...schemasKeys.details(), sourceId, version] as const,
};

export function useSchemaVersions(sourceId: string) {
  return useQuery({
    queryKey: schemasKeys.list(sourceId),
    queryFn: () => getSchemaVersionsRequest(sourceId),
    enabled: !!sourceId,
  });
}

export function useSchemaVersion(sourceId: string, version: number) {
  return useQuery({
    queryKey: schemasKeys.detail(sourceId, version),
    queryFn: () => getSchemaVersionRequest(sourceId, version),
    enabled: !!sourceId && !!version,
  });
}

export function useCreateSchemaVersion(sourceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateSchemaVersionInput) =>
      createSchemaVersionRequest(sourceId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: schemasKeys.lists() });
      toast.success('Version de schéma créée');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erreur lors de la création');
    },
  });
}

export function useImportSchema(sourceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ImportSchemaInput) =>
      importSchemaRequest(sourceId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: schemasKeys.lists() });
      toast.success('Schéma importé avec succès');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erreur lors de l\'import');
    },
  });
}

export function useDeleteSchemaVersion(sourceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (version: number) =>
      deleteSchemaVersionRequest(sourceId, version),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: schemasKeys.lists() });
      queryClient.invalidateQueries({ queryKey: schemasKeys.details() });
      queryClient.invalidateQueries({ queryKey: ['sources', 'detail', sourceId] });
      toast.success('Version de schéma supprimée');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erreur lors de la suppression');
    },
  });
}
