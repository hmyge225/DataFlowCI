import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Pencil,
  Plus,
  FileSpreadsheet,
  Calendar,
  Activity,
  Upload,
  Eye,
  Trash2,
} from 'lucide-react';
import { useSource } from '../hooks/useSources';
import { useDeleteSchemaVersion } from '../../schemas/hooks/useSchemas';
import ConcentricLoader from '../../../shared/components/feedback/ConcentricLoader';

export default function SourceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: source, isLoading } = useSource(id ?? '');
  const deleteSchemaMutation = useDeleteSchemaVersion(id ?? '');

  if (isLoading) return <ConcentricLoader />;
  if (!source) {
    return (
      <div className="text-center text-[var(--color-text-muted)]">
        Source introuvable.
        <button
          onClick={() => navigate('/sources')}
          className="mt-4 block text-[var(--color-brand)] hover:underline"
        >
          Retour à la liste
        </button>
      </div>
    );
  }

  const hasActiveSchema = source.schemaVersions && source.schemaVersions.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/sources')}
            className="rounded-lg p-2 text-[var(--color-text-muted)] hover:bg-[var(--color-brand)]/10 hover:text-[var(--color-brand)]"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">{source.name}</h1>
            <p className="text-sm text-[var(--color-text-muted)]">
              {source.description ?? 'Aucune description'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {hasActiveSchema && (
            <button
              onClick={() => navigate(`/sources/${source.id}/upload`)}
              className="flex items-center gap-2 rounded-lg bg-[var(--color-brand)] px-3 py-2 text-sm font-medium text-white hover:bg-[var(--color-brand-dark)]"
            >
              <Upload className="h-4 w-4" />
              Upload
            </button>
          )}
          <button
            onClick={() => navigate(`/sources/${source.id}/edit`)}
            className="flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm text-[var(--color-text-muted)] hover:bg-gray-50"
          >
            <Pencil className="h-4 w-4" />
            Modifier
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
            <Activity className="h-4 w-4" />
            Statut
          </div>
          <div className="mt-2">
            <span
              className={`inline-flex rounded-full px-2.5 py-1 text-sm font-medium ${
                source.isActive
                  ? 'bg-green-100 text-green-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {source.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
            <FileSpreadsheet className="h-4 w-4" />
            Versions de schéma
          </div>
          <div className="mt-2 text-2xl font-bold text-[var(--color-text-primary)]">
            {source._count?.schemaVersions ?? 0}
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
            <Calendar className="h-4 w-4" />
            Imports
          </div>
          <div className="mt-2 text-2xl font-bold text-[var(--color-text-primary)]">
            {source._count?.importJobs ?? 0}
          </div>
        </div>
      </div>

      {!hasActiveSchema && (
        <div className="rounded-xl border border-dashed border-gray-300 bg-[var(--color-surface)] p-6 text-center">
          <p className="text-[var(--color-text-muted)]">
            Aucun schéma actif. Créez un schéma pour pouvoir importer des données.
          </p>
          <button
            onClick={() => navigate(`/sources/${source.id}/schemas/new`)}
            className="mt-3 inline-flex items-center gap-2 rounded-lg bg-[var(--color-brand)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-brand-dark)]"
          >
            <Plus className="h-4 w-4" />
            Créer un schéma
          </button>
        </div>
      )}

      {hasActiveSchema && (
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <h2 className="mb-3 text-lg font-semibold text-[var(--color-text-primary)]">
            Versions de schéma
          </h2>
          <div className="space-y-2">
            {source.schemaVersions?.map((sv) => (
              <div
                key={sv.id}
                className="flex items-center justify-between rounded-lg border border-gray-200 bg-[var(--color-surface)] px-4 py-3"
              >
                <div>
                  <span className="font-medium text-[var(--color-text-primary)]">
                    Version {sv.version}
                  </span>
                  <span className="ml-2 text-xs text-[var(--color-text-muted)]">
                    {new Date(sv.createdAt).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-[var(--color-text-muted)]">Immutable</span>
                  <button
                    onClick={() => navigate(`/sources/${source.id}/schemas/${sv.version}`)}
                    className="rounded p-1.5 text-[var(--color-text-muted)] hover:bg-[var(--color-brand)]/10 hover:text-[var(--color-brand)]"
                    title="Voir détails"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Êtes-vous sûr de vouloir supprimer cette version de schéma ?')) {
                        deleteSchemaMutation.mutate(sv.version);
                      }
                    }}
                    disabled={deleteSchemaMutation.isPending}
                    className="rounded p-1.5 text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Supprimer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => navigate(`/sources/${source.id}/schemas/new`)}
            className="mt-3 inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm text-[var(--color-text-muted)] hover:bg-gray-50"
          >
            <Plus className="h-4 w-4" />
            Nouvelle version
          </button>
        </div>
      )}
    </div>
  );
}
