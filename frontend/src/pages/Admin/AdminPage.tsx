import { useState } from 'react';
import { AdminUsersList } from '../../features/admin/components/AdminUsersList';
import { AdminSupervision } from '../../features/admin/components/AdminSupervision';
import { AdminStats } from '../../features/admin/components/AdminStats';

export const AdminPage = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'supervision' | 'stats'>('users');

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Administration</h1>
      <div className="flex gap-2 border-b mb-6">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'users'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600'
          }`}
        >
          Utilisateurs
        </button>
        <button
          onClick={() => setActiveTab('supervision')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'supervision'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600'
          }`}
        >
          Supervision
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'stats'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600'
          }`}
        >
          Statistiques
        </button>
      </div>

      {activeTab === 'users' && <AdminUsersList />}
      {activeTab === 'supervision' && <AdminSupervision />}
      {activeTab === 'stats' && <AdminStats />}
    </div>
  );
};
