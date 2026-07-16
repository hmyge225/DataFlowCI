import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Clock, ArrowLeft, Upload, FileJson } from 'lucide-react';
import { useSchemaVersions } from '../hooks/useSchemas';
import ConcentricLoader from '../../../shared/components/feedback/ConcentricLoader';
import { UploadModal } from '../../uploads/components/UploadModal';
import { useState } from 'react';

export default function SchemaVersionsListPage() {
  const { id: sourceId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: versions, isLoading } = useSchemaVersions(sourceId ?? '');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  if (isLoading) return <ConcentricLoader />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/sources/${sourceId}`)}
            className="rounded-lg p-2 text-[var(--color-text-muted)] hover:bg-[var(--color-brand)]/10 hover:text-[var(--color-brand)]"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
            Versions de schéma
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-[var(--color-brand)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-brand-dark)]"
          >
            <Upload className="h-4 w-4" />
            Upload
          </button>
          <button
            onClick={() => navigate(`/sources/${sourceId}/schemas/import`)}
            className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-[var(--color-text-muted)] hover:bg-gray-50"
          >
            <FileJson className="h-4 w-4" />
            Importer JSON
          </button>
          <button
            onClick={() => navigate(`/sources/${sourceId}/schemas/new`)}
            className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-[var(--color-text-muted)] hover:bg-gray-50"
          >
            <Plus className="h-4 w-4" />
            Nouvelle version
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-[var(--color-brand)]/20 bg-white">
        <table className="w-full text-sm text-left">
          <thead className="bg-[var(--color-surface)] text-xs uppercase text-[var(--color-text-muted)]">
            <tr>
              <th className="px-4 py-3">Version</th>
              <th className="px-4 py-3">Champs</th>
              <th className="px-4 py-3">Créée le</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {versions?.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-8 text-center text-[var(--color-text-muted)]"
                >
                  <div className="space-y-2">
                    <p>Aucune version de schéma.</p>
                    <p className="text-xs">
                      Créez un schéma pour définir la structure de vos données, puis vous pourrez uploader des fichiers CSV.
                    </p>
                  </div>
                </td>
              </tr>
            )}
            {versions?.map((sv) => (
              <tr key={sv.id} className="hover:bg-[var(--color-surface)]">
                <td className="px-4 py-3 font-medium text-[var(--color-text-primary)]">
                  v{sv.version}
                </td>
                <td className="px-4 py-3 text-[var(--color-text-muted)]">
                  {sv.fields.length} champ{sv.fields.length > 1 ? 's' : ''}
                </td>
                <td className="px-4 py-3 text-[var(--color-text-muted)] flex items-center gap-2">
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
                    className="rounded px-3 py-1.5 text-xs text-[var(--color-text-muted)] hover:bg-[var(--color-brand)]/10 hover:text-[var(--color-brand)]"
                  >
                    Voir détail
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <UploadModal
        sourceId={sourceId ?? ''}
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />
    </div>
  );
}
