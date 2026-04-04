import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  FileText,
  LogOut,
  Menu,
  X,
  Zap,
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/events',    icon: Calendar,         label: 'Events'    },
  { to: '/templates', icon: FileText,          label: 'Templates' },
];

export default function Layout() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-7 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl icon-bg-green flex items-center justify-center shadow-lg" style={{ boxShadow: '0 0 16px rgba(16,185,129,0.4)' }}>
            <Zap size={18} fill="white" color="white" />
          </div>
          <div>
            <h1 className="text-[15px] font-bold text-white leading-tight">Nova Pass</h1>
            <p className="text-[11px] text-emerald-400/70 font-medium tracking-wide">GENERATOR</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-5 space-y-1">
        <p className="px-3 mb-3 text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
          Main Menu
        </p>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative ${
                isActive
                  ? 'bg-emerald-500/10 text-emerald-400 shadow-sm'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-emerald-400 rounded-r-full" />
                )}
                <item.icon
                  size={18}
                  className={`flex-shrink-0 transition-colors ${isActive ? 'text-emerald-400' : 'text-slate-500 group-hover:text-slate-300'}`}
                />
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User / Logout */}
      <div className="px-3 py-4 border-t border-white/5">
        <div className="flex items-center gap-3 px-3 py-2 mb-2 rounded-xl bg-white/3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-[13px] font-bold text-white flex-shrink-0">
            N
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-white truncate">Admin</p>
            <p className="text-[11px] text-slate-500 truncate">Nova Coders</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200"
        >
          <LogOut size={16} className="flex-shrink-0" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--color-bg-deep)' }}>

      {/* ── Desktop Sidebar ─────────────────────────── */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-full w-60 z-30"
        style={{
          background: 'linear-gradient(180deg, #0d1526 0%, #0a0f1c 100%)',
          borderRight: '1px solid rgba(255,255,255,0.05)',
        }}>
        <SidebarContent />
      </aside>

      {/* ── Mobile Header ───────────────────────────── */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center gap-3 px-4 py-3"
        style={{ background: 'rgba(10,15,28,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <Menu size={20} />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg icon-bg-green flex items-center justify-center">
            <Zap size={14} fill="white" color="white" />
          </div>
          <span className="text-[14px] font-bold text-white">Nova Pass</span>
        </div>
      </header>

      {/* ── Mobile Drawer ───────────────────────────── */}
      {mobileOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-black/60 z-40 animate-fadeIn"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="lg:hidden fixed left-0 top-0 h-full w-64 z-50 animate-slideInLeft"
            style={{ background: 'linear-gradient(180deg, #0d1526 0%, #0a0f1c 100%)', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="flex items-center justify-end px-4 pt-4">
              <button onClick={() => setMobileOpen(false)} className="p-1.5 text-slate-400 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>
            <SidebarContent />
          </aside>
        </>
      )}

      {/* ── Main Content ────────────────────────────── */}
      <main className="flex-1 lg:ml-60 min-h-screen">
        <div className="pt-0 lg:pt-0 mt-14 lg:mt-0 p-6 lg:p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
