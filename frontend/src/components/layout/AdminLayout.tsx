import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarCheck,
  CalendarDays,
  Users,
  Palette,
  Image as ImageIcon,
  Tag,
  LogOut,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Citas y Reservaciones', path: '/admin/citas', icon: CalendarCheck },
    { name: 'Calendario y Bloqueos', path: '/admin/calendario', icon: CalendarDays },
    { name: 'Clientes', path: '/admin/clientes', icon: Users },
    { name: 'Catálogo de Servicios', path: '/admin/servicios', icon: Palette },
    { name: 'Galería de Trabajos', path: '/admin/galeria', icon: ImageIcon },
    { name: 'Promociones', path: '/admin/promociones', icon: Tag },
  ];

  const isActive = (path: string) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-[#0E0E0E] text-[#F5F1E9] flex flex-col md:flex-row font-sans">
      
      {/* Barra Lateral Admin */}
      <aside className="w-full md:w-64 bg-[#141414] border-r border-[#262626] flex flex-col shrink-0">
        
        {/* Cabecera */}
        <div className="p-6 border-b border-[#262626]">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full border border-[#C6A15B] flex items-center justify-center bg-[#1A1A1A]">
              <Sparkles className="w-4 h-4 text-[#C6A15B]" />
            </div>
            <div>
              <span className="font-serif text-base tracking-wider text-[#FFFFFF] font-bold block">
                AURA <span className="text-[#C6A15B]">ADMIN</span>
              </span>
              <span className="text-[10px] uppercase tracking-widest text-[#888888] block">
                Gestión Operativa
              </span>
            </div>
          </Link>
        </div>

        {/* Perfil del Usuario Activo */}
        <div className="p-4 mx-4 mt-4 bg-[#1B1B1B] rounded border border-[#2D2D2D]">
          <p className="text-xs font-semibold text-[#FFFFFF] truncate">{user?.name || 'Administrador'}</p>
          <p className="text-[10px] text-[#C6A15B] uppercase tracking-wider font-mono">
            {user?.role === 'ADMIN_PRINCIPAL' ? 'Administrador Principal' : 'Administrador Operativo'}
          </p>
        </div>

        {/* Navegación */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-sm text-xs font-medium tracking-wide transition-all ${
                  active
                    ? 'bg-[#C6A15B] text-[#111111] font-semibold shadow-sm'
                    : 'text-[#888888] hover:text-[#FFFFFF] hover:bg-[#202020]'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-[#111111]' : 'text-[#C6A15B]'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Acciones Finales */}
        <div className="p-4 border-t border-[#262626] space-y-2">
          <Link
            to="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 text-xs text-[#888888] hover:text-[#C6A15B] transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Ver Sitio Web</span>
            </span>
          </Link>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors text-left"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Contenido Principal */}
      <main className="flex-1 overflow-y-auto p-6 md:p-10">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>

    </div>
  );
};
