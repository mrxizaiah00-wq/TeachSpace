import { Link } from 'react-router-dom';
import {
  ArrowRight,
  LayoutDashboard,
  School,
  Users,
  CalendarClock,
  ClipboardCheck,
  Award,
  FolderOpen,
} from 'lucide-react';

const HERO_KPIS = [
  { label: 'Classes', value: '6', unit: 'active' },
  { label: 'Students', value: '148', unit: 'enrolled' },
  { label: 'Attendance', value: '96.4%', unit: 'this term' },
  { label: 'Avg. Grade', value: '84.2', unit: 'scale 100' },
];

const HERO_SCHEDULE = [
  { time: '08:00 – 09:30', subject: 'Mathematics', className: 'Grade 10 · Science A', room: 'Room 204' },
  { time: '10:00 – 11:30', subject: 'Physics', className: 'Grade 11 · Science B', room: 'Lab 2' },
  { time: '13:30 – 15:00', subject: 'Private Calculus', className: 'Tutoring Group', room: 'Online' },
];

export default function Hero({ registerPath = '/register' }) {
  return (
    <section
      id="home"
      className="ts-hero-surface relative overflow-hidden border-b border-slate-200/80"
    >
      <div className="max-w-300 mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-16 sm:pt-20 sm:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Value Proposition */}
          <div className="lg:col-span-6 space-y-6">
            <p className="text-xs sm:text-sm font-medium text-slate-500">
              Personal Academic Management Platform · Built for Teachers &amp; Tutors
            </p>

            <h1
              className="ts-font-display ts-balance font-bold tracking-tight text-[#142B4A] leading-[1.08]"
              style={{ fontSize: 'clamp(2.25rem, 4.2vw, 3.5rem)' }}
            >
              Your Teaching, Organized.
            </h1>

            <p className="text-lg sm:text-xl font-medium text-[#142B4A]/90 leading-snug max-w-xl">
              Everything you need to manage your teaching in one place.
            </p>

            <p className="text-base text-slate-600 leading-relaxed max-w-xl">
              Manage students, classes, schedules, attendance, grades, and learning materials
              through one simple academic workspace.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                to={registerPath}
                className="ts-btn inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-[#3478C8] hover:bg-[#2A65AC] rounded-lg whitespace-nowrap"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#features"
                className="ts-btn inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-[#142B4A] bg-white border border-slate-200 hover:bg-slate-50 rounded-lg whitespace-nowrap"
              >
                Explore Features
              </a>
            </div>

            <div className="pt-4 border-t border-slate-200/80 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
              <span>Personal Independent Workspace</span>
              <span aria-hidden="true">·</span>
              <span>No School Admin Required</span>
              <span aria-hidden="true">·</span>
              <span>PDF &amp; Excel Reports</span>
            </div>
          </div>

          {/* Right Column: TeachSpace Workspace Preview */}
          <div className="lg:col-span-6">
            <div className="ts-hero-float bg-white border border-slate-200/90 rounded-2xl shadow-lg shadow-[#142B4A]/8 overflow-hidden">
              {/* Mock Browser / App Top Chrome */}
              <div className="h-10 bg-[#F7F9FC] border-b border-slate-200/80 px-4 flex items-center justify-between">
                <span className="text-xs font-semibold text-[#142B4A] ts-font-display">
                  TeachSpace Workspace
                </span>
                <span className="text-[11px] text-slate-400">Academic Year 2025/2026</span>
              </div>

              <div className="grid grid-cols-12 min-h-90">
                {/* Mini Navy Sidebar matching TeachSpace AppLayout */}
                <div className="hidden sm:flex sm:col-span-3 bg-[#142B4A] text-white p-3 flex-col justify-between">
                  <div className="space-y-1">
                    <div className="px-2.5 py-2 rounded-lg bg-[#3478C8] text-white text-[11px] font-medium flex items-center gap-2">
                      <LayoutDashboard className="w-3.5 h-3.5 shrink-0" />
                      <span>Dashboard</span>
                    </div>
                    {[
                      { icon: School, label: 'Classes' },
                      { icon: Users, label: 'Students' },
                      { icon: CalendarClock, label: 'Schedules' },
                      { icon: ClipboardCheck, label: 'Attendance' },
                      { icon: Award, label: 'Grades' },
                      { icon: FolderOpen, label: 'Materials' },
                    ].map((nav) => {
                      const Icon = nav.icon;
                      return (
                        <div
                          key={nav.label}
                          className="px-2.5 py-1.5 rounded-lg text-slate-300 text-[11px] flex items-center gap-2"
                        >
                          <Icon className="w-3.5 h-3.5 shrink-0 opacity-80" />
                          <span className="truncate">{nav.label}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="pt-3 border-t border-white/10">
                    <p className="text-[10px] text-blue-200/80 truncate">Personal Workspace</p>
                    <p className="text-[10px] text-slate-400 truncate">Independent Teacher</p>
                  </div>
                </div>

                {/* Main Workspace Preview Area */}
                <div className="col-span-12 sm:col-span-9 p-4 sm:p-5 bg-[#F7F9FC] space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-bold text-[#142B4A] ts-font-display">
                        Academic Overview
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Illustrative workspace preview with sample data
                      </p>
                    </div>
                    <span className="text-[11px] font-semibold text-[#3478C8] bg-[#EAF2FB] px-2.5 py-1 rounded-md whitespace-nowrap">
                      3 Sessions Today
                    </span>
                  </div>

                  {/* KPI Row */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {HERO_KPIS.map((kpi) => (
                      <div
                        key={kpi.label}
                        className="bg-white border border-slate-200/90 rounded-xl p-3"
                      >
                        <p className="text-[11px] text-slate-500 truncate">{kpi.label}</p>
                        <p className="mt-1 text-base font-bold text-[#142B4A] ts-font-mono">
                          {kpi.value}
                        </p>
                        <p className="text-[10px] text-slate-400">{kpi.unit}</p>
                      </div>
                    ))}
                  </div>

                  {/* Mini Attendance Trend Visual */}
                  <div className="bg-white border border-slate-200/90 rounded-xl p-3.5">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold text-[#142B4A] ts-font-display">
                        Attendance Consistency
                      </p>
                      <span className="text-[11px] text-slate-500 ts-font-mono">Last 6 weeks</span>
                    </div>
                    <svg
                      viewBox="0 0 320 72"
                      className="w-full h-16 overflow-visible"
                      role="img"
                      aria-label="Illustrative student attendance trend chart"
                    >
                      <defs>
                        <linearGradient id="tsHeroChartFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3478C8" stopOpacity="0.22" />
                          <stop offset="100%" stopColor="#3478C8" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <line x1="0" y1="18" x2="320" y2="18" stroke="#E2E8F0" strokeDasharray="3 3" />
                      <line x1="0" y1="44" x2="320" y2="44" stroke="#E2E8F0" strokeDasharray="3 3" />
                      <path
                        d="M0 44 L64 34 L128 38 L192 22 L256 26 L320 14 L320 68 L0 68 Z"
                        fill="url(#tsHeroChartFill)"
                      />
                      <path
                        d="M0 44 L64 34 L128 38 L192 22 L256 26 L320 14"
                        fill="none"
                        stroke="#3478C8"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      {[
                        [0, 44],
                        [64, 34],
                        [128, 38],
                        [192, 22],
                        [256, 26],
                        [320, 14],
                      ].map(([cx, cy], idx) => (
                        <circle
                          key={idx}
                          cx={cx}
                          cy={cy}
                          r="3.2"
                          fill="#FFFFFF"
                          stroke="#3478C8"
                          strokeWidth="2"
                        />
                      ))}
                    </svg>
                  </div>

                  {/* Today's Schedule Compact List */}
                  <div className="bg-white border border-slate-200/90 rounded-xl p-3.5">
                    <p className="text-xs font-semibold text-[#142B4A] ts-font-display mb-2.5">
                      Today&apos;s Teaching Schedule
                    </p>
                    <div className="divide-y divide-slate-100">
                      {HERO_SCHEDULE.map((item) => (
                        <div
                          key={item.time}
                          className="py-2 first:pt-0 last:pb-0 flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="min-w-0">
                            <p className="font-semibold text-[#142B4A] truncate">{item.subject}</p>
                            <p className="text-[11px] text-slate-500 truncate">
                              {item.className} · {item.room}
                            </p>
                          </div>
                          <span className="ts-font-mono text-[11px] text-slate-500 shrink-0">
                            {item.time}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
