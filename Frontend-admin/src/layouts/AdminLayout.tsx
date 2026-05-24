import { NavLink, Outlet, useLocation } from 'react-router-dom';

const navItems = [
  { to: '/admin/productos', icon: 'coffee', label: 'Productos' },
  { to: '/admin/ingredientes', icon: 'liquor', label: 'Ingredientes' },
  { to: '/admin/categorias', icon: 'category', label: 'Categorías' },
];

const pageTitles: Record<string, string> = {
  '/admin/productos': 'Productos',
  '/admin/ingredientes': 'Ingredientes',
  '/admin/categorias': 'Categorías',
};

export default function AdminLayout() {
  const location = useLocation();
  const currentTitle = pageTitles[location.pathname] ?? 'Panel de Control';

  return (
    <div className="flex min-h-screen">
      <aside className="flex flex-col h-screen w-64 bg-[#354867] text-white flex-shrink-0">
        <div className="px-6 py-8">
          <img src="/logo.png" alt="ROST" className="h-14" />
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-white/15 text-white font-semibold'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-white/10 px-4 py-4">
          <span className="text-xs text-white/50">ROST Admin v1.0</span>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto bg-background" style={{ backgroundColor: '#ffeddb' }}>
        <div className="p-6">
          <header className="mb-8">
            <h2 className="font-headline text-3xl font-bold text-primary">{currentTitle}</h2>
          </header>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
