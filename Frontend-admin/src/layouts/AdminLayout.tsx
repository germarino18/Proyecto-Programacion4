import { NavLink, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/admin/productos', icon: 'coffee', label: 'Productos' },
  { to: '/admin/ingredientes', icon: 'liquor', label: 'Ingredientes' },
  { to: '/admin/categorias', icon: 'category', label: 'Categorías' },
  { to: '/admin/pedidos', icon: 'orders', label: 'Pedidos' },
];

const pageTitles: Record<string, string> = {
  '/admin/productos': 'Productos',
  '/admin/ingredientes': 'Ingredientes',
  '/admin/categorias': 'Categorías',
  '/admin/pedidos': 'Gestión de Pedidos',
};

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { usuario, logout } = useAuth();
  const currentTitle = pageTitles[location.pathname] ?? 'Panel de Control';

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen">
      <aside className="flex flex-col h-screen w-64 bg-[#354867] text-white flex-shrink-0">
        <div className="px-6 py-8">
          <img src="/logo2.png" alt="ROST" className="h-14" />
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
        <div className="border-t border-white/10 px-4 py-4 space-y-2">
          {usuario && (
            <div className="text-xs text-white/70">
              <p className="font-semibold text-white/90">{usuario.nombre}</p>
              <p>{usuario.email}</p>
              <p className="mt-1">
                Roles: {usuario.roles?.map((r) => r.rol_codigo).join(', ')}
              </p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="text-xs text-white/50 hover:text-white transition-colors w-full text-left"
          >
            Cerrar sesión
          </button>
          <span className="block text-xs text-white/30">ROST Admin v2.0</span>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto" style={{ backgroundColor: '#ffeddb' }}>
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
