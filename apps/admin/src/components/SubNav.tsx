import { NavLink } from 'react-router-dom';

/** Onglets de sous-navigation d'une page (visibles aussi sur mobile, ou le menu lateral est replie). */
export function SubNav({ items, label }: { items: { to: string; label: string; end?: boolean }[]; label: string }) {
  return (
    <nav aria-label={label} className="-mx-1 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <ul className="flex w-max gap-2">
        {items.map((i) => (
          <li key={i.to}>
            <NavLink to={i.to} end={i.end} className={({ isActive }) => `inline-flex min-h-10 items-center rounded-full px-4 text-sm font-bold no-underline transition-colors ${isActive ? 'bg-green-500 text-white shadow-soft' : 'bg-white text-ink ring-1 ring-line hover:bg-mint-100'}`}>{i.label}</NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
