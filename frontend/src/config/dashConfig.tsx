import {
  LayoutDashboard,
  FileText,
  BarChart3,
  Database,
  type LucideIcon,
} from 'lucide-react';

// Rôles gérés par le dashboard. DataFlowCI n'expose que USER et ADMIN.
export type Role = 'USER' | 'ADMIN';

// Un item de navigation (sidebar ou barre mobile).
// `to` est optionnel : les items non câblés à une route existante restent
// purement visuels (désactivés).
export interface NavItem {
  label: string;
  icon: LucideIcon;
  to?: string;
}

export interface NavSection {
  title?: string;
  items: NavItem[];
}

export interface DashColors {
  // Fond de la sidebar
  bg: string;
  // Fond de l'item actif
  activeBg: string;
  // Couleur d'accent (bordures, indicateurs)
  accent: string;
  // Couleur du texte de la sidebar
  text: string;
}

export interface DashUser {
  name: string;
  subtitle: string;
  initials: string;
  role: string;
}

export interface DashConfig {
  brand: { name: string };
  navBar: { title: string };
  colors: DashColors;
  sections: NavSection[];
  bottomItems: NavItem[];
  mobileBottomBar?: NavItem[];
  user: DashUser;
}

// Table de redirection par rôle : où renvoyer un utilisateur vers "son" dashboard.
export const ROLE_ROUTES: Record<Role, string> = {
  USER: '/dashboard',
  ADMIN: '/admin',
};

export const DASH_CONFIG: Record<Role, DashConfig> = {
  ADMIN: {
    brand: { name: 'DataFlowCI' },
    navBar: { title: 'Administration' },
    colors: {
      bg: 'var(--color-brand-dark)',
      activeBg: 'var(--color-brand)',
      accent: 'var(--color-highlight)',
      text: '#e8f6f4',
    },
    sections: [
      {
        title: 'Statistiques',
        items: [
          { label: 'Dashboard', icon: BarChart3, to: '/dashboard-stats' },
        ],
      },
      {
        title: 'Gestion',
        items: [
          { label: 'Sources', icon: Database, to: '/sources' },
          { label: 'Imports', icon: FileText, to: '/import-jobs' },
        ],
      },
      {
        items: [
          { label: 'Tableau de bord', icon: LayoutDashboard, to: '/admin' },
        ],
      },
    ],
    bottomItems: [],
    user: {
      name: 'Administrateur',
      subtitle: 'Administrateur DataFlowCI',
      initials: 'A',
      role: 'ADMIN',
    },
  },

  USER: {
    brand: { name: 'DataFlowCI' },
    navBar: { title: 'Mon Espace' },
    colors: {
      bg: 'var(--color-brand)',
      activeBg: 'var(--color-brand-dark)',
      accent: 'var(--color-accent)',
      text: '#e8f6f4',
    },
    sections: [
      {
        title: 'Statistiques',
        items: [
          { label: 'Dashboard', icon: BarChart3, to: '/dashboard-stats' },
        ],
      },
      {
        items: [
          { label: 'Tableau de bord', icon: LayoutDashboard, to: '/dashboard' },
        ],
      },
      {
        title: 'Sources',
        items: [{ label: 'Mes sources', icon: Database, to: '/sources' }],
      },
      {
        title: 'Imports',
        items: [{ label: 'Mes imports', icon: FileText, to: '/import-jobs' }],
      },
    ],
    bottomItems: [],
    mobileBottomBar: [
      { label: 'Accueil', icon: LayoutDashboard, to: '/dashboard' },
      { label: 'Sources', icon: Database, to: '/sources' },
      { label: 'Imports', icon: FileText, to: '/import-jobs' },
      { label: 'Stats', icon: BarChart3, to: '/dashboard-stats' },
    ],
    user: {
      name: 'Utilisateur',
      subtitle: 'Espace utilisateur',
      initials: 'U',
      role: 'USER',
    },
  },
};
