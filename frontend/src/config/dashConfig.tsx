import {
  LayoutDashboard,
  FolderKanban,
  Library,
  HelpCircle,
  User,
  Users,
  FileText,
  BarChart3,
  Settings,
  Bell,
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
        items: [{ label: 'Tableau de bord', icon: LayoutDashboard, to: '/admin' }],
      },
      {
        title: 'Gestion',
        items: [
          { label: 'Utilisateurs', icon: Users },
          { label: 'Postulations', icon: FileText },
        ],
      },
      {
        title: 'Contenus',
        items: [
          { label: 'Programmes', icon: FolderKanban },
          { label: 'Kits', icon: Library },
          { label: 'FAQ', icon: HelpCircle },
        ],
      },
      {
        title: 'Analyse',
        items: [{ label: "Journal d'audit", icon: BarChart3 }],
      },
      {
        title: 'Système',
        items: [{ label: 'Paramètres', icon: Settings }],
      },
    ],
    bottomItems: [{ label: 'Notifications', icon: Bell }],
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
        items: [{ label: 'Tableau de bord', icon: LayoutDashboard, to: '/dashboard' }],
      },
      {
        title: 'Ressources',
        items: [
          { label: 'Bibliothèque', icon: Library },
          { label: 'FAQ', icon: HelpCircle },
        ],
      },
      {
        title: 'Mon compte',
        items: [{ label: 'Profil', icon: User }],
      },
    ],
    bottomItems: [{ label: 'Notifications', icon: Bell }],
    mobileBottomBar: [
      { label: 'Accueil', icon: LayoutDashboard, to: '/dashboard' },
      { label: 'Dossiers', icon: FolderKanban },
      { label: 'Bibliothèque', icon: Library },
      { label: 'FAQ', icon: HelpCircle },
      { label: 'Profil', icon: User },
    ],
    user: {
      name: 'Utilisateur',
      subtitle: 'Espace utilisateur',
      initials: 'U',
      role: 'USER',
    },
  },
};
