import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Pencil,
  Plus,
  FileSpreadsheet,
  Calendar,
  Activity,
} from 'lucide-react';
import { useSource } from '../hooks/useSources';
import ConcentricLoader from '../../../shared/components/feedback/ConcentricLoader';

export default function SourceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: source, isLoading } = useSource(id ?? '');

  if (isLoading) return <ConcentricLoader />;
  if (!source) {
    return (
      <div className="text-center text-white/50">
        Source introuvable.
        <button
          onClick={() => navigate('/sources')}
          className="mt-4 block text-emerald-400 hover:underline"
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
            className="rounded-lg p-2 text-white/60 hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">{source.name}</h1>
            <p className="text-sm text-white/50">
              {source.description ?? 'Aucune description'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/sources/${source.id}/edit`)}
            className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-white/70 hover:bg-white/5"
          >
            <Pencil className="h-4 w-4" />
            Modifier
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center gap-2 text-sm text-white/60">
            <Activity className="h-4 w-4" />
            Statut
          </div>
          <div className="mt-2">
            <span
              className={`inline-flex rounded-full px-2.5 py-1 text-sm font-medium ${
                source.isActive
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-amber-500/20 text-amber-400'
              }`}
            >
              {source.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center gap-2 text-sm text-white/60">
            <FileSpreadsheet className="h-4 w-4" />
            Versions de schéma
          </div>
          <div className="mt-2 text-2xl font-bold text-white">
            {source._count?.schemaVersions ?? 0}
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center gap-2 text-sm text-white/60">
            <Calendar className="h-4 w-4" />
            Imports
          </div>
          <div className="mt-2 text-2xl font-bold text-white">
            {source._count?.importJobs ?? 0}
          </div>
        </div>
      </div>

      {!hasActiveSchema && (
        <div className="rounded-xl border border-dashed border-white/20 bg-white/5 p-6 text-center">
          <p className="text-white/70">
            Aucun schéma actif. Créez un schéma pour pouvoir importer des données.
          </p>
          <button
            onClick={() => navigate(`/sources/${source.id}/schemas/new`)}
            className="mt-3 inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-400"
          >
            <Plus className="h-4 w-4" />
            Créer un schéma
          </button>
        </div>
      )}

      {hasActiveSchema && (
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <h2 className="mb-3 text-lg font-semibold text-white">
            Versions de schéma
          </h2>
          <div className="space-y-2">
            {source.schemaVersions?.map((sv) => (
              <div
                key={sv.id}
                className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 px-4 py-3"
              >
                <div>
                  <span className="font-medium text-white">
                    Version {sv.version}
                  </span>
                  <span className="ml-2 text-xs text-white/40">
                    {new Date(sv.createdAt).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                <span className="text-xs text-white/50">Immutable</span>
              </div>
            ))}
          </div>
          <button
            onClick={() => navigate(`/sources/${source.id}/schemas/new`)}
            className="mt-3 inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-white/70 hover:bg-white/5"
          >
            <Plus className="h-4 w-4" />
            Nouvelle version
          </button>
        </div>
      )}
    </div>
  );
}
