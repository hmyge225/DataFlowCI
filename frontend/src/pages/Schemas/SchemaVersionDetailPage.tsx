import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Clock, CheckCircle, XCircle, Upload, Trash2 } from 'lucide-react';
import { useSchemaVersion, useDeleteSchemaVersion } from '../../features/schemas/hooks/useSchemas';
import ConcentricLoader from '../../shared/components/feedback/ConcentricLoader';

export default function SchemaVersionDetailPage() {
  const { id: sourceId, version } = useParams<{ id: string; version: string }>();
  const navigate = useNavigate();
  const { data: schemaVersion, isLoading } = useSchemaVersion(
    sourceId ?? '',
    version ? parseInt(version, 10) : 0
  );
  const deleteMutation = useDeleteSchemaVersion(sourceId ?? '');

  if (isLoading) return <ConcentricLoader />;

  if (!schemaVersion) {
    return (
      <div className="text-center text-[var(--color-text-muted)]">
        Version de schéma introuvable.
        <button
          onClick={() => navigate(`/sources/${sourceId}`)}
          className="mt-4 block text-[var(--color-brand)] hover:underline"
        >
          Retour à la source
        </button>
      </div>
    );
  }

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
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
              Schéma Version {schemaVersion.version}
            </h1>
            <p className="text-sm text-[var(--color-text-muted)] flex items-center gap-2">
              <Clock className="h-3 w-3" />
              {new Date(schemaVersion.createdAt).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (confirm('Êtes-vous sûr de vouloir supprimer cette version de schéma ?')) {
                deleteMutation.mutate(schemaVersion.version, {
                  onSuccess: () => navigate(`/sources/${sourceId}`),
                });
              }
            }}
            disabled={deleteMutation.isPending}
            className="flex items-center gap-2 rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 className="h-4 w-4" />
            Supprimer
          </button>
          <button
            onClick={() => navigate(`/sources/${sourceId}/upload`)}
            className="flex items-center gap-2 rounded-lg bg-[var(--color-brand)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-brand-dark)]"
          >
            <Upload className="h-4 w-4" />
            Upload fichier
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-[var(--color-brand)]/20 bg-white p-6">
        <div className="mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5 text-[var(--color-brand)]" />
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
            Champs du schéma
          </h2>
        </div>

        {schemaVersion.fields.length === 0 ? (
          <p className="text-[var(--color-text-muted)]">Aucun champ défini.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-[var(--color-surface)] text-xs uppercase text-[var(--color-text-muted)]">
                <tr>
                  <th className="px-4 py-3">Nom</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Requis</th>
                  <th className="px-4 py-3">Contraintes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {schemaVersion.fields.map((field, index) => (
                  <tr key={index} className="hover:bg-[var(--color-surface)]">
                    <td className="px-4 py-3 font-medium text-[var(--color-text-primary)]">
                      {field.name}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full bg-[var(--color-brand)]/10 px-2 py-1 text-xs font-medium text-[var(--color-brand)]">
                        {field.type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {field.required ? (
                        <span className="flex items-center gap-1 text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          Oui
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-gray-400">
                          <XCircle className="h-4 w-4" />
                          Non
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[var(--color-text-muted)]">
                      <div className="space-y-1">
                        {field.min !== undefined && (
                          <div className="text-xs">Min: {field.min}</div>
                        )}
                        {field.max !== undefined && (
                          <div className="text-xs">Max: {field.max}</div>
                        )}
                        {field.pattern && (
                          <div className="text-xs">Pattern: {field.pattern}</div>
                        )}
                        {field.enum && field.enum.length > 0 && (
                          <div className="text-xs">
                            Enum: {field.enum.join(', ')}
                          </div>
                        )}
                        {!field.min &&
                          !field.max &&
                          !field.pattern &&
                          (!field.enum || field.enum.length === 0) && (
                            <span className="text-xs text-gray-400">Aucune</span>
                          )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
