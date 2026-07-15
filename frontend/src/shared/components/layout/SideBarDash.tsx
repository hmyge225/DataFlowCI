import { NavLink, useLocation } from 'react-router-dom';
import type { DashColors, NavItem, NavSection } from '../../../config/dashConfig';

interface SideBarDashProps {
  sections: NavSection[];
  bottomItems: NavItem[];
  colors: DashColors;
}

function ItemButton({
  item,
  active,
  colors,
}: {
  item: NavItem;
  active: boolean;
  colors: DashColors;
}) {
  const baseClasses =
    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition';
  const Icon = item.icon;

  // Item non câblé à une route : purement visuel, désactivé.
  if (!item.to) {
    return (
      <span
        className={`${baseClasses} cursor-not-allowed opacity-50`}
        style={{ color: colors.text }}
        title="Bientôt disponible"
      >
        <Icon size={18} />
        {item.label}
      </span>
    );
  }

  return (
    <NavLink
      to={item.to}
      className={baseClasses}
      style={{
        color: colors.text,
        backgroundColor: active ? colors.activeBg : 'transparent',
      }}
    >
      <Icon size={18} />
      {item.label}
    </NavLink>
  );
}

export default function SideBarDash({
  sections,
  bottomItems,
  colors,
}: SideBarDashProps) {
  const location = useLocation();

  return (
    <aside
      className="hidden w-64 shrink-0 flex-col justify-between overflow-y-auto px-4 py-6 md:flex"
      style={{ backgroundColor: colors.bg }}
    >
      <nav className="flex flex-col gap-6">
        {sections.map((section, i) => (
          <div key={section.title ?? `section-${i}`} className="flex flex-col gap-1">
            {section.title && (
              <p
                className="mb-1 px-3 text-xs font-semibold uppercase tracking-wide opacity-60"
                style={{ color: colors.text }}
              >
                {section.title}
              </p>
            )}
            {section.items.map((item) => (
              <ItemButton
                key={item.label}
                item={item}
                active={item.to === location.pathname}
                colors={colors}
              />
            ))}
          </div>
        ))}
      </nav>

      <div
        className="mt-6 flex flex-col gap-1 border-t pt-4"
        style={{ borderColor: 'rgba(255,255,255,0.15)' }}
      >
        {bottomItems.map((item) => (
          <ItemButton
            key={item.label}
            item={item}
            active={item.to === location.pathname}
            colors={colors}
          />
        ))}
      </div>
    </aside>
  );
}
