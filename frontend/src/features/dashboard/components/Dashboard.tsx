import { useQuery } from '@tanstack/react-query';
import { getDashboard } from '../services/dashboard.service';

export const Dashboard = () => {
  const { data: dashboard, isLoading, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboard,
  });

  if (isLoading) {
    return <div className="text-center py-8">Chargement...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">Erreur de chargement</div>;
  }

  if (!dashboard) {
    return <div className="text-center py-8 text-gray-500">Aucune donnée</div>;
  }

  const successRate =
    dashboard.totalImports > 0
      ? Math.round((dashboard.successCount / dashboard.totalImports) * 100)
      : 0;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h3 className="text-sm font-medium text-gray-600">Total Imports</h3>
          <p className="text-2xl font-bold text-gray-900">{dashboard.totalImports}</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h3 className="text-sm font-medium text-gray-600">Taux de succès</h3>
          <p className="text-2xl font-bold text-green-600">{successRate}%</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h3 className="text-sm font-medium text-gray-600">Temps moyen</h3>
          <p className="text-2xl font-bold text-blue-600">
            {dashboard.avgProcessingTime}s
          </p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h3 className="text-sm font-medium text-gray-600">Échecs</h3>
          <p className="text-2xl font-bold text-red-600">{dashboard.failedCount}</p>
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
                {dashboard.successCount}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full"
                style={{
                  width: `${(dashboard.successCount / dashboard.totalImports) * 100}%`,
                }}
              />
            </div>
          </div>
          <div className="flex-1">
            <div className="flex justify-between mb-1">
              <span className="text-sm text-gray-600">Partiel</span>
              <span className="text-sm font-medium text-orange-600">
                {dashboard.partialCount}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-orange-600 h-2 rounded-full"
                style={{
                  width: `${(dashboard.partialCount / dashboard.totalImports) * 100}%`,
                }}
              />
            </div>
          </div>
          <div className="flex-1">
            <div className="flex justify-between mb-1">
              <span className="text-sm text-gray-600">Échec</span>
              <span className="text-sm font-medium text-red-600">
                {dashboard.failedCount}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-red-600 h-2 rounded-full"
                style={{
                  width: `${(dashboard.failedCount / dashboard.totalImports) * 100}%`,
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
        {dashboard.topSources.length > 0 ? (
          <div className="space-y-2">
            {dashboard.topSources.map((source) => (
              <div
                key={source.sourceId}
                className="flex justify-between items-center"
              >
                <span className="text-sm text-gray-600">{source.sourceName}</span>
                <span className="text-sm font-medium text-gray-900">{source.count}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">Aucune source</p>
        )}
      </div>

      {/* Imports by Day */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Imports par jour (30 derniers jours)
        </h3>
        {dashboard.importsByDay.length > 0 ? (
          <div className="space-y-2">
            {dashboard.importsByDay.map((item) => (
              <div
                key={item.date}
                className="flex justify-between items-center"
              >
                <span className="text-sm text-gray-600">{item.date}</span>
                <span className="text-sm font-medium text-gray-900">{item.count}</span>
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
