import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAllSources, getAllSchemas, getAllImportJobs } from '../services/admin.service';

export const AdminSupervision = () => {
  const [activeTab, setActiveTab] = useState<'sources' | 'schemas' | 'imports'>('sources');
  const [userIdFilter, setUserIdFilter] = useState('');
  const [sourceIdFilter, setSourceIdFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { data: sources, isLoading: sourcesLoading } = useQuery({
    queryKey: ['admin-sources', userIdFilter],
    queryFn: () => getAllSources(userIdFilter || undefined),
  });

  const { data: schemas, isLoading: schemasLoading } = useQuery({
    queryKey: ['admin-schemas', sourceIdFilter],
    queryFn: () => getAllSchemas(sourceIdFilter || undefined),
  });

  const { data: importJobs, isLoading: importsLoading } = useQuery({
    queryKey: ['admin-import-jobs', userIdFilter, sourceIdFilter, statusFilter],
    queryFn: () => getAllImportJobs(userIdFilter || undefined, sourceIdFilter || undefined, statusFilter || undefined),
  });

  return (
    <div className="space-y-4">
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab('sources')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'sources'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600'
          }`}
        >
          Sources
        </button>
        <button
          onClick={() => setActiveTab('schemas')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'schemas'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600'
          }`}
        >
          Schémas
        </button>
        <button
          onClick={() => setActiveTab('imports')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'imports'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600'
          }`}
        >
          Imports
        </button>
      </div>

      {activeTab === 'sources' && (
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Filtrer par userId..."
            value={userIdFilter}
            onChange={(e) => setUserIdFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg w-64"
          />
          {sourcesLoading ? (
            <div className="text-center py-8">Chargement...</div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Nom</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Utilisateur</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Imports</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Schémas</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Créé le</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {sources?.map((source: Record<string, unknown>) => (
                    <tr key={source.id as string}>
                      <td className="px-4 py-3 text-sm text-gray-900">{source.name as string}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{(source.user as Record<string, unknown>)?.email as string}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{(source._count as Record<string, unknown>)?.importJobs as number}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{(source._count as Record<string, unknown>)?.schemaVersions as number}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(source.createdAt as string).toLocaleDateString('fr-FR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'schemas' && (
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Filtrer par sourceId..."
            value={sourceIdFilter}
            onChange={(e) => setSourceIdFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg w-64"
          />
          {schemasLoading ? (
            <div className="text-center py-8">Chargement...</div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Source</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Version</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Utilisateur</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Créé le</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {schemas?.map((schema: Record<string, unknown>) => (
                    <tr key={schema.id as string}>
                      <td className="px-4 py-3 text-sm text-gray-900">{(schema.source as Record<string, unknown>)?.name as string}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{schema.version as number}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{((schema.source as Record<string, unknown>)?.user as Record<string, unknown>)?.email as string}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(schema.createdAt as string).toLocaleDateString('fr-FR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'imports' && (
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Filtrer par userId..."
              value={userIdFilter}
              onChange={(e) => setUserIdFilter(e.target.value)}
              className="px-3 py-2 border rounded-lg w-48"
            />
            <input
              type="text"
              placeholder="Filtrer par sourceId..."
              value={sourceIdFilter}
              onChange={(e) => setSourceIdFilter(e.target.value)}
              className="px-3 py-2 border rounded-lg w-48"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border rounded-lg"
            >
              <option value="">Tous les statuts</option>
              <option value="PENDING">PENDING</option>
              <option value="PROCESSING">PROCESSING</option>
              <option value="SUCCESS">SUCCESS</option>
              <option value="PARTIAL">PARTIAL</option>
              <option value="FAILED">FAILED</option>
            </select>
          </div>
          {importsLoading ? (
            <div className="text-center py-8">Chargement...</div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Fichier</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Source</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Utilisateur</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Statut</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Créé le</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {importJobs?.map((job: Record<string, unknown>) => (
                    <tr key={job.id as string}>
                      <td className="px-4 py-3 text-sm text-gray-900">{job.originalFilename as string}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{(job.source as Record<string, unknown>)?.name as string}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{((job.source as Record<string, unknown>)?.user as Record<string, unknown>)?.email as string}</td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            job.status === 'SUCCESS'
                              ? 'bg-green-100 text-green-800'
                              : job.status === 'FAILED'
                                ? 'bg-red-100 text-red-800'
                                : job.status === 'PARTIAL'
                                  ? 'bg-orange-100 text-orange-800'
                                  : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {job.status as string}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(job.createdAt as string).toLocaleDateString('fr-FR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
