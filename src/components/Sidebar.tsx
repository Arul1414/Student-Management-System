import { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  BarChart3, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  GraduationCap 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  adminUser: { email: string; fullName: string } | null;
  onLogout: () => void;
}

export default function Sidebar({ activeView, setActiveView, adminUser, onLogout }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'departments-courses', label: 'Academic Depts', icon: BookOpen },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
    { id: 'settings', label: 'System Settings', icon: Settings },
  ];

  const handleNav = (viewId: string) => {
    setActiveView(viewId);
    setIsOpen(false);
  };

  const navContent = (
    <div className="flex flex-col h-full bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100 p-5 select-none border-r border-slate-800/80">
      {/* Header / Brand Logo */}
      <div className="flex items-center gap-3 px-2 py-4 mb-6 border-b border-slate-800/80">
        <div className="w-9 h-9 bg-gradient-to-tr from-brand-600 via-brand-500 to-indigo-500 rounded-xl flex items-center justify-center font-bold text-white shrink-0 shadow-lg shadow-brand-500/25 ring-1 ring-white/20">
          <GraduationCap className="w-5 h-5 text-white" />
        </div>
        <div>
          <span className="font-extrabold text-white text-base tracking-tight block">EduPulse Pro</span>
          <span className="text-[10px] text-brand-400 font-mono font-bold uppercase tracking-wider block">Academic Suite</span>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 space-y-1.5">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              id={`nav-item-${item.id}`}
              className={`flex items-center gap-3.5 w-full px-4 py-3 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer relative group ${
                isActive 
                  ? 'bg-gradient-to-r from-brand-600/20 via-brand-500/10 to-transparent text-white font-bold border border-brand-500/30 shadow-xs' 
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-100 hover:border-slate-700/50 border border-transparent'
              }`}
            >
              <div className={`p-1.5 rounded-lg transition-colors ${isActive ? 'bg-brand-500 text-white shadow-xs' : 'bg-slate-800/50 text-slate-400 group-hover:text-slate-200 group-hover:bg-slate-800'}`}>
                <Icon className="w-4 h-4 shrink-0" />
              </div>
              <span className="text-sm">{item.label}</span>
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute right-3 w-2 h-2 bg-brand-400 rounded-full shadow-xs shadow-brand-400"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* Admin Profile Footer */}
      <div className="pt-4 border-t border-slate-800/80 mt-auto space-y-3">
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-800/40 border border-slate-800/80">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 border border-brand-400/30 flex items-center justify-center text-white font-bold text-sm shadow-xs shrink-0">
            {adminUser?.fullName ? adminUser.fullName.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase() : 'SA'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-slate-100 truncate">{adminUser?.fullName || 'School Admin'}</p>
            <p className="text-[11px] text-slate-400 truncate">{adminUser?.email || 'admin@school.edu'}</p>
          </div>
        </div>

        <button
          onClick={onLogout}
          id="nav-logout-btn"
          className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-slate-800 hover:border-rose-500/20 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Logout Portal</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between bg-slate-900 text-white p-4 shadow-md sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-brand-600 rounded-lg text-white">
            <GraduationCap className="w-5 h-5" />
          </div>
          <span className="font-bold text-base tracking-tight">EduPulse</span>
        </div>
        <button
          onClick={() => setIsOpen(true)}
          id="mobile-menu-open"
          className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Desktop Sidebar (Persistent) */}
      <aside className="hidden md:block w-64 h-screen bg-slate-900 border-r border-slate-800 shrink-0 sticky top-0">
        {navContent}
      </aside>

      {/* Mobile Sidebar (Drawer) */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black z-50 md:hidden"
            />

            {/* Sidebar drawer content */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="fixed inset-y-0 left-0 w-64 bg-slate-900 z-50 md:hidden shadow-2xl flex flex-col"
            >
              <div className="absolute right-4 top-4 z-10">
                <button
                  onClick={() => setIsOpen(false)}
                  id="mobile-menu-close"
                  className="p-1.5 bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {navContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
