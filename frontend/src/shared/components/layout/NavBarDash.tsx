import { LogOut } from 'lucide-react';
import type { DashUser } from '../../../config/dashConfig';

interface NavBarDashProps {
  brand: { name: string };
  title: string;
  user: DashUser;
  onLogout: () => void;
}

export default function NavBarDash({
  brand,
  title,
  user,
  onLogout,
}: NavBarDashProps) {
  return (
    <header className="flex items-center justify-between border-b border-brand/10 bg-white px-6 py-3">
      <div className="flex items-center gap-4">
        <span className="text-lg font-bold text-brand-dark">{brand.name}</span>
        <span className="hidden text-sm font-medium text-text-muted md:inline">
          {title}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-semibold text-text-primary">{user.name}</p>
          <p className="text-xs text-text-muted">{user.subtitle}</p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-sm font-semibold text-white">
          {user.initials}
        </div>
        <span className="rounded-full bg-highlight px-2.5 py-1 text-xs font-semibold text-brand-dark">
          {user.role}
        </span>
        <button
          onClick={onLogout}
          className="flex items-center gap-2 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">Déconnexion</span>
        </button>
      </div>
    </header>
  );
}
