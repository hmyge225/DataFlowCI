import { Outlet } from 'react-router-dom';
import { useAuth } from '../../../features/auth/context/AuthContext';
import { DASH_CONFIG, type DashUser, type Role } from '../../../config/dashConfig';
import NavBarDash from './NavBarDash';
import SideBarDash from './SideBarDash';

interface DashLayoutProps {
  role: Role;
}

export default function DashLayout({ role }: DashLayoutProps) {
  const { user, logout } = useAuth();

  // Résolution du rôle actif : on privilégie le rôle réel de l'utilisateur
  // connecté, avec fallback sur le rôle attendu par le groupe de routes.
  const roleActif: Role = (user?.role as Role) ?? role;
  const cfg = DASH_CONFIG[roleActif] ?? DASH_CONFIG[role];

  // Surcharge de la config statique avec les données réelles de l'utilisateur.
  const dynamicUserConfig: DashUser = {
    name: user?.email ?? cfg.user.name,
    subtitle: cfg.user.subtitle,
    initials: user?.email?.charAt(0)?.toUpperCase() ?? cfg.user.initials,
    role: user?.role ?? cfg.user.role,
  };

  return (
    <>
      <div className="flex h-screen flex-col">
        <NavBarDash
          brand={cfg.brand}
          title={cfg.navBar.title}
          user={dynamicUserConfig}
          onLogout={logout}
        />

        <div className="relative flex flex-1 overflow-hidden">
          <SideBarDash
            sections={cfg.sections}
            bottomItems={cfg.bottomItems}
            colors={cfg.colors}
          />

          <main className="flex-1 overflow-y-auto bg-surface px-5 pb-20 pt-6 md:pb-8">
            <Outlet />
          </main>
        </div>
      </div>
    </>
  );
}
