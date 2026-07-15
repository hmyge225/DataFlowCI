import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, Trash2, Pencil, MoreVertical, Upload, FileText } from 'lucide-react';
import { useSources, useDeleteSource } from '../hooks/useSources';
import { useAuth } from '../../auth/context/AuthContext';
import ConcentricLoader from '../../../shared/components/feedback/ConcentricLoader';

export default function SourcesListPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const { data: sources, isLoading } = useSources();
  const deleteMutation = useDeleteSource();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  if (isLoading) return <ConcentricLoader />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Sources de données</h1>
        <button
          onClick={() => navigate('/sources/new')}
          className="flex items-center gap-2 rounded-lg bg-[var(--color-brand)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-brand-dark)]"
        >
          <Plus className="h-4 w-4" />
          Nouvelle source
        </button>
      </div>

      <div className="rounded-xl border border-[var(--color-brand)]/20 bg-white">
        <table className="w-full text-sm text-left">
          <thead className="bg-[var(--color-surface)] text-xs uppercase text-[var(--color-text-muted)]">
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
          <tbody className="divide-y divide-gray-200">
            {sources?.length === 0 && (
              <tr>
                <td
                  colSpan={isAdmin ? 7 : 6}
                  className="px-4 py-8 text-center text-[var(--color-text-muted)]"
                >
                  Aucune source. Créez votre première source de données.
                </td>
              </tr>
            )}
            {sources?.map((source) => (
              <tr key={source.id} className="hover:bg-[var(--color-surface)]">
                <td className="px-4 py-3 font-medium text-[var(--color-text-primary)]">
                  {source.name}
                </td>
                <td className="px-4 py-3 text-[var(--color-text-muted)]">
                  {source.description ?? '—'}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                      source.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {source.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3 text-[var(--color-text-muted)]">
                  {source._count?.schemaVersions ?? 0}
                </td>
                <td className="px-4 py-3 text-[var(--color-text-muted)]">
                  {source._count?.importJobs ?? 0}
                </td>
                {isAdmin && (
                  <td className="px-4 py-3 text-[var(--color-text-muted)]">
                    {source.user?.email ?? '—'}
                  </td>
                )}
                <td className="px-4 py-3 text-right">
                  <div className="relative">
                    <button
                      onClick={() => setOpenDropdown(openDropdown === source.id ? null : source.id)}
                      className="rounded p-1.5 text-[var(--color-text-muted)] hover:bg-[var(--color-brand)]/10 hover:text-[var(--color-brand)]"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                    {openDropdown === source.id && (
                      <div className="absolute right-0 -bottom-52 z-50 mb-1 w-48 rounded-lg border border-gray-200 bg-white shadow-lg">
                        <div className="py-1">
                          <button
                            onClick={() => {
                              navigate(`/sources/${source.id}`);
                              setOpenDropdown(null);
                            }}
                            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-surface)]"
                          >
                            <Eye className="h-4 w-4" />
                            Voir détails
                          </button>
                          <button
                            onClick={() => {
                              navigate(`/sources/${source.id}/edit`);
                              setOpenDropdown(null);
                            }}
                            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-surface)]"
                          >
                            <Pencil className="h-4 w-4" />
                            Modifier
                          </button>
                          <button
                            onClick={() => {
                              navigate(`/sources/${source.id}/schemas/new`);
                              setOpenDropdown(null);
                            }}
                            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-surface)]"
                          >
                            <FileText className="h-4 w-4" />
                            Créer schéma
                          </button>
                          {(source._count?.schemaVersions ?? 0) > 0 && (
                            <button
                              onClick={() => {
                                navigate(`/sources/${source.id}/upload`);
                                setOpenDropdown(null);
                              }}
                              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-surface)]"
                            >
                              <Upload className="h-4 w-4" />
                              Upload fichier
                            </button>
                          )}
                          <div className="my-1 border-t border-gray-200" />
                          <button
                            onClick={() => {
                              if (confirm('Êtes-vous sûr de vouloir supprimer cette source ?')) {
                                deleteMutation.mutate(source.id);
                              }
                              setOpenDropdown(null);
                            }}
                            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                            Supprimer
                          </button>
                        </div>
                      </div>
                    )}
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
