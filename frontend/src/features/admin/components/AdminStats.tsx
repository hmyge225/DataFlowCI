import { useQuery } from '@tanstack/react-query';
import { getPlatformStats } from '../services/admin.service';

export const AdminStats = () => {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: getPlatformStats,
  });

  if (isLoading) {
    return <div className="text-center py-8">Chargement...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">Erreur de chargement</div>;
  }

  if (!stats) {
    return <div className="text-center py-8 text-gray-500">Aucune donnée</div>;
  }

  const successRate =
    stats.totalImports > 0
      ? Math.round((stats.successCount / stats.totalImports) * 100)
      : 0;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h3 className="text-sm font-medium text-gray-600">Total Imports</h3>
          <p className="text-2xl font-bold text-gray-900">{stats.totalImports}</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h3 className="text-sm font-medium text-gray-600">Taux de succès</h3>
          <p className="text-2xl font-bold text-green-600">{successRate}%</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h3 className="text-sm font-medium text-gray-600">Utilisateurs</h3>
          <p className="text-2xl font-bold text-blue-600">{stats.totalUsers}</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h3 className="text-sm font-medium text-gray-600">Sources</h3>
          <p className="text-2xl font-bold text-purple-600">{stats.totalSources}</p>
        </div>
      </div>

      {/* Status Distribution */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Répartition des statuts
        </h3>
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="flex justify-between mb-1">
              <span className="text-sm text-gray-600">Succès</span>
              <span className="text-sm font-medium text-green-600">
                {stats.successCount}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full"
                style={{
                  width: `${(stats.successCount / stats.totalImports) * 100}%`,
                }}
              />
            </div>
          </div>
          <div className="flex-1">
            <div className="flex justify-between mb-1">
              <span className="text-sm text-gray-600">Partiel</span>
              <span className="text-sm font-medium text-orange-600">
                {stats.partialCount}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-orange-600 h-2 rounded-full"
                style={{
                  width: `${(stats.partialCount / stats.totalImports) * 100}%`,
                }}
              />
            </div>
          </div>
          <div className="flex-1">
            <div className="flex justify-between mb-1">
              <span className="text-sm text-gray-600">Échec</span>
              <span className="text-sm font-medium text-red-600">
                {stats.failedCount}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-red-600 h-2 rounded-full"
                style={{
                  width: `${(stats.failedCount / stats.totalImports) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Top Sources */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Sources les plus actives
        </h3>
        {stats.topSources.length > 0 ? (
          <div className="space-y-2">
            {stats.topSources.map((source: Record<string, unknown>) => (
              <div
                key={source.sourceId as string}
                className="flex justify-between items-center"
              >
                <div>
                  <span className="text-sm text-gray-900 font-medium">
                    {source.sourceName as string}
                  </span>
                  <span className="text-sm text-gray-500 ml-2">
                    ({source.userEmail as string})
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {source.count as number}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">Aucune source</p>
        )}
      </div>

      {/* Top Users */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Utilisateurs les plus actifs
        </h3>
        {stats.topUsers.length > 0 ? (
          <div className="space-y-2">
            {stats.topUsers.map((user: Record<string, unknown>) => (
              <div
                key={user.userId as string}
                className="flex justify-between items-center"
              >
                <span className="text-sm text-gray-900">{user.email as string}</span>
                <span className="text-sm font-medium text-gray-900">
                  {user.count as number}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">Aucun utilisateur</p>
        )}
      </div>

      {/* Imports by Day */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Imports par jour (30 derniers jours)
        </h3>
        {stats.importsByDay.length > 0 ? (
          <div className="space-y-2">
            {stats.importsByDay.map((item: Record<string, unknown>) => (
              <div
                key={item.date as string}
                className="flex justify-between items-center"
              >
                <span className="text-sm text-gray-600">{item.date as string}</span>
                <span className="text-sm font-medium text-gray-900">
                  {item.count as number}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">Aucune donnée</p>
        )}
      </div>
    </div>
  );
};
