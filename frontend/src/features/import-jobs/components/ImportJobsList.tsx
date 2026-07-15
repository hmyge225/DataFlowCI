import { useImportJobs, useDeleteImportJob } from '../hooks/useImportJobs';
import type { ImportStatus } from '../types';
import { ExportButtons } from '../../export/components/ExportButtons';

const statusColors: Record<ImportStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  PROCESSING: 'bg-blue-100 text-blue-800',
  SUCCESS: 'bg-green-100 text-green-800',
  PARTIAL: 'bg-orange-100 text-orange-800',
  FAILED: 'bg-red-100 text-red-800',
};

const statusLabels: Record<ImportStatus, string> = {
  PENDING: 'En attente',
  PROCESSING: 'En cours',
  SUCCESS: 'Succès',
  PARTIAL: 'Partiel',
  FAILED: 'Échec',
};

export const ImportJobsList = () => {
  const { data: jobs, isLoading, error } = useImportJobs();
  const deleteJob = useDeleteImportJob();

  if (isLoading) {
    return <div className="text-center py-8">Chargement...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">Erreur de chargement</div>;
  }

  if (!jobs || jobs.length === 0) {
    return <div className="text-center py-8 text-gray-500">Aucun job d'import</div>;
  }

  return (
    <div className="space-y-4">
      {jobs.map((job) => (
        <div
          key={job.id}
          className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-gray-900">{job.originalFilename}</h3>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[job.status]}`}
            >
              {statusLabels[job.status]}
            </span>
          </div>

          <div className="text-sm text-gray-600 space-y-1">
            <p>Source: {job.source?.name || 'N/A'}</p>
            <p>Créé le: {new Date(job.createdAt).toLocaleString('fr-FR')}</p>
            {job.finishedAt && (
              <p>Terminé le: {new Date(job.finishedAt).toLocaleString('fr-FR')}</p>
            )}
            {job.errorMessage && (
              <p className="text-red-600">Erreur: {job.errorMessage}</p>
            )}
          </div>

          {job.report && (
            <div className="mt-3 pt-3 border-t text-sm">
              <p className="text-gray-600">
                Total: {job.report.total} | Valid: {job.report.validCount} | Invalid:{' '}
                {job.report.invalidCount}
              </p>
            </div>
          )}

          <div className="mt-3">
            <ExportButtons
              importJobId={job.id}
              hasValidRows={(job.report?.validCount ?? 0) > 0}
              hasErrors={(job.report?.invalidCount ?? 0) > 0}
            />
          </div>

          <button
            onClick={() => deleteJob.mutate(job.id)}
            disabled={deleteJob.isPending}
            className="mt-3 text-sm text-red-600 hover:text-red-800 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            Supprimer
          </button>
        </div>
      ))}
    </div>
  );
};
