import { useNavigate } from 'react-router-dom';
import { Plus, Eye, Trash2, Pencil } from 'lucide-react';
import { useSources, useDeleteSource } from '../hooks/useSources';
import { useAuth } from '../../auth/context/AuthContext';
import ConcentricLoader from '../../../shared/components/feedback/ConcentricLoader';

export default function SourcesListPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const { data: sources, isLoading } = useSources();
  const deleteMutation = useDeleteSource();

  if (isLoading) return <ConcentricLoader />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Sources de données</h1>
        <button
          onClick={() => navigate('/sources/new')}
          className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-400"
        >
          <Plus className="h-4 w-4" />
          Nouvelle source
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5">
        <table className="w-full text-sm text-left">
          <thead className="bg-white/10 text-xs uppercase text-white/70">
            <tr>
              <th className="px-4 py-3">Nom</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3">Versions</th>
              <th className="px-4 py-3">Imports</th>
              {isAdmin && <th className="px-4 py-3">Propriétaire</th>}
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {sources?.length === 0 && (
              <tr>
                <td
                  colSpan={isAdmin ? 7 : 6}
                  className="px-4 py-8 text-center text-white/50"
                >
                  Aucune source. Créez votre première source de données.
                </td>
              </tr>
            )}
            {sources?.map((source) => (
              <tr key={source.id} className="hover:bg-white/5">
                <td className="px-4 py-3 font-medium text-white">
                  {source.name}
                </td>
                <td className="px-4 py-3 text-white/70">
                  {source.description ?? '—'}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                      source.isActive
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-amber-500/20 text-amber-400'
                    }`}
                  >
                    {source.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3 text-white/70">
                  {source._count?.schemaVersions ?? 0}
                </td>
                <td className="px-4 py-3 text-white/70">
                  {source._count?.importJobs ?? 0}
                </td>
                {isAdmin && (
                  <td className="px-4 py-3 text-white/70">
                    {source.user?.email ?? '—'}
                  </td>
                )}
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => navigate(`/sources/${source.id}`)}
                      className="rounded p-1.5 text-white/60 hover:bg-white/10 hover:text-white"
                      title="Voir"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => navigate(`/sources/${source.id}/edit`)}
                      className="rounded p-1.5 text-white/60 hover:bg-white/10 hover:text-white"
                      title="Modifier"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteMutation.mutate(source.id)}
                      className="rounded p-1.5 text-white/60 hover:bg-red-500/20 hover:text-red-400"
                      title="Supprimer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
