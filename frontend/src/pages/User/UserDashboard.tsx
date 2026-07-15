import { useAuth } from '../../features/auth/context/AuthContext';

export default function UserDashboardPage() {
  const { user } = useAuth();

  return (
    <div className="mx-auto max-w-5xl space-y-2">
      <h1 className="text-2xl font-bold text-brand-dark">
        Tableau de bord Utilisateur
      </h1>
      <p className="text-sm text-text-muted">
        Connecté en tant que {user?.email} ({user?.role})
      </p>
    </div>
  );
}
