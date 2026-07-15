import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Clock, ArrowLeft } from 'lucide-react';
import { useSchemaVersions } from '../hooks/useSchemas';
import ConcentricLoader from '../../../shared/components/feedback/ConcentricLoader';

export default function SchemaVersionsListPage() {
  const { id: sourceId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: versions, isLoading } = useSchemaVersions(sourceId ?? '');

  if (isLoading) return <ConcentricLoader />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/sources/${sourceId}`)}
            className="rounded-lg p-2 text-white/60 hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold text-white">
            Versions de schéma
          </h1>
        </div>
        <button
          onClick={() => navigate(`/sources/${sourceId}/schemas/new`)}
          className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-400"
        >
          <Plus className="h-4 w-4" />
          Nouvelle version
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5">
        <table className="w-full text-sm text-left">
          <thead className="bg-white/10 text-xs uppercase text-white/70">
            <tr>
              <th className="px-4 py-3">Version</th>
              <th className="px-4 py-3">Champs</th>
              <th className="px-4 py-3">Créée le</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {versions?.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-8 text-center text-white/50"
                >
                  Aucune version de schéma. Créez la première version.
                </td>
              </tr>
            )}
            {versions?.map((sv) => (
              <tr key={sv.id} className="hover:bg-white/5">
                <td className="px-4 py-3 font-medium text-white">
                  v{sv.version}
                </td>
                <td className="px-4 py-3 text-white/70">
                  {sv.fields.length} champ{sv.fields.length > 1 ? 's' : ''}
                </td>
                <td className="px-4 py-3 text-white/70 flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  {new Date(sv.createdAt).toLocaleDateString('fr-FR')}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() =>
                      navigate(
                        `/sources/${sourceId}/schemas/${sv.version}`,
                      )
                    }
                    className="rounded px-3 py-1.5 text-xs text-white/60 hover:bg-white/10 hover:text-white"
                  >
                    Voir détail
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
