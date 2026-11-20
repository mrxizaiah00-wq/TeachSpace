import { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  School,
  Users,
  BookOpen,
  CalendarClock,
  ClipboardCheck,
  Award,
  FolderOpen,
  FileBarChart2,
  Settings,
  LogOut,
  Menu,
  X,
  Plus,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useToast } from '../contexts/ToastContext.jsx';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/classes', label: 'Kelas', icon: School },
  { to: '/students', label: 'Siswa', icon: Users },
  { to: '/subjects', label: 'Mata Pelajaran', icon: BookOpen },
  { to: '/schedules', label: 'Jadwal', icon: CalendarClock },
  { to: '/attendance', label: 'Absensi', icon: ClipboardCheck },
  { to: '/grades', label: 'Nilai', icon: Award },
  { to: '/materials', label: 'Materi', icon: FolderOpen },
  { to: '/reports', label: 'Laporan', icon: FileBarChart2 },
  { to: '/settings', label: 'Pengaturan', icon: Settings },
];

const ROUTE_TITLES = {
  '/': 'Dashboard',
  '/classes': 'Manajemen Kelas',
  '/students': 'Manajemen Siswa',
  '/subjects': 'Mata Pelajaran',
  '/schedules': 'Jadwal Mengajar',
  '/attendance': 'Absensi Siswa',
  '/grades': 'Manajemen Nilai',
  '/materials': 'Materi Pembelajaran',
  '/reports': 'Laporan Akademik',
  '/settings': 'Pengaturan Workspace',
};

const DEFAULT_AVATAR = '/assets/teacher_avatar.jpg';

export default function AppLayout() {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const pageTitle = ROUTE_TITLES[location.pathname] || 'TeachSpace';

  const handleLogout = async () => {
    await logout();
    showToast('Anda telah keluar dari TeachSpace.', 'info');
    navigate('/login');
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#142B4A] text-white">
      <div className="px-5 h-16 flex items-center justify-between border-b border-white/10 shrink-0">
        <span className="text-lg font-bold tracking-tight font-display text-white">TeachSpace</span>
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className="lg:hidden p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10"
          aria-label="Tutup menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="px-4 py-3 border-b border-white/10">
        <p className="text-xs font-medium text-blue-200/80 truncate">{user?.workspace_name}</p>
        <p className="text-xs text-slate-300/70 truncate mt-0.5">
          {user?.institution_name || 'Pengajar Independen'} · TA {user?.academic_year}
        </p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto" aria-label="Navigasi utama">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  isActive ? 'bg-[#3478C8] text-white' : 'text-slate-200/85 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-3 border-t border-white/10 shrink-0">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-200 hover:bg-white/10 hover:text-white transition-colors whitespace-nowrap"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Keluar</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-[#F7F9FC] text-[#142B4A]">
      <aside className="hidden lg:block w-64 shrink-0 sticky top-0 h-screen">{sidebarContent}</aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="w-64 h-full shrink-0 shadow-2xl">{sidebarContent}</div>
          <div className="flex-1 bg-[#142B4A]/40" onClick={() => setMobileOpen(false)} />
        </div>
      )}

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-8 flex items-center justify-between gap-4 sticky top-0 z-30">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-lg text-[#142B4A] hover:bg-slate-100"
              aria-label="Buka navigasi"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-sm min-w-0">
              <span className="text-slate-400 hidden sm:inline">Workspace</span>
              <span className="text-slate-300 hidden sm:inline">/</span>
              <span className="font-semibold text-[#142B4A] truncate">{pageTitle}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => navigate('/attendance')}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-[#3478C8] rounded-lg hover:bg-[#2a65ac] transition-colors whitespace-nowrap shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              Catat Absensi
            </button>

            <button
              type="button"
              onClick={() => navigate('/settings')}
              className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <img
                src={user?.avatar_url || DEFAULT_AVATAR}
                alt={user?.full_name || 'Foto profil guru'}
                onError={(e) => {
                  e.currentTarget.src = DEFAULT_AVATAR;
                }}
                className="w-8 h-8 rounded-lg object-cover border border-slate-200 bg-[#EAF2FB]"
              />
              <div className="hidden md:block text-left">
                <p className="text-xs font-semibold text-[#142B4A] leading-tight max-w-35 truncate">{user?.full_name}</p>
                <p className="text-[11px] text-slate-500 leading-tight max-w-35 truncate">{user?.email}</p>
              </div>
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-8 max-w-340w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
