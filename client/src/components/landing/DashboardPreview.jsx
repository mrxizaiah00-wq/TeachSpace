import { useState } from 'react';
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
} from 'lucide-react';

const SIDEBAR_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'classes', label: 'Classes', icon: School },
  { id: 'students', label: 'Students', icon: Users },
  { id: 'subjects', label: 'Subjects', icon: BookOpen },
  { id: 'schedules', label: 'Schedules', icon: CalendarClock },
  { id: 'attendance', label: 'Attendance', icon: ClipboardCheck },
  { id: 'grades', label: 'Grades', icon: Award },
  { id: 'materials', label: 'Materials', icon: FolderOpen },
  { id: 'reports', label: 'Reports', icon: FileBarChart2 },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const PREVIEW_TABS = [
  { id: 'dashboard', label: 'Dashboard View' },
  { id: 'attendance', label: 'Attendance Sheet' },
  { id: 'grades', label: 'Grade Recap' },
];

const CLASS_AVERAGES = [
  { name: 'Grade 10 · Science A', avg: 86 },
  { name: 'Grade 10 · Science B', avg: 81 },
  { name: 'Grade 11 · Math Club', avg: 91 },
  { name: 'Private Tutoring · Physics', avg: 88 },
];

const ATTENDANCE_SAMPLE = [
  { student: 'Alya Pratama', nis: '2025-101', status: 'Present', note: 'On time' },
  { student: 'Bima Mahendra', nis: '2025-102', status: 'Present', note: '—' },
  { student: 'Citra Lestari', nis: '2025-103', status: 'Excused', note: 'Family event' },
  { student: 'Dimas Saputra', nis: '2025-104', status: 'Present', note: '—' },
  { student: 'Nadia Kusuma', nis: '2025-105', status: 'Sick', note: 'Medical note submitted' },
];

const GRADES_SAMPLE = [
  { student: 'Alya Pratama', assessment: 'Midterm Algebra', score: 92, max: 100, passed: true },
  { student: 'Bima Mahendra', assessment: 'Midterm Algebra', score: 84, max: 100, passed: true },
  { student: 'Citra Lestari', assessment: 'Midterm Algebra', score: 78, max: 100, passed: true },
  { student: 'Dimas Saputra', assessment: 'Midterm Algebra', score: 71, max: 100, passed: false },
  { student: 'Nadia Kusuma', assessment: 'Midterm Algebra', score: 88, max: 100, passed: true },
];

export default function DashboardPreview() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <section id="preview" className="py-16 sm:py-24 bg-[#F7F9FC] border-b border-slate-200/80">
      <div className="max-w-300 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 ts-reveal">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold text-[#3478C8] tracking-wide">
              Application Preview
            </p>
            <h2 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-[#142B4A] ts-font-display ts-balance">
              A clear academic interface designed for daily focus
            </h2>
            <p className="mt-3 text-base text-slate-600 leading-relaxed">
              Switch between workspace views below to preview how TeachSpace structures KPIs,
              attendance tracking, and grade records.
            </p>
          </div>

          {/* Interactive Tab Switcher */}
          <div
            role="tablist"
            aria-label="Workspace preview modes"
            className="inline-flex items-center gap-1 p-1 bg-slate-200/70 rounded-lg self-start lg:self-auto"
          >
            {PREVIEW_TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-white text-[#142B4A] shadow-xs'
                      : 'text-slate-600 hover:text-[#142B4A]'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Full Workspace Mockup Frame */}
        <div className="mt-10 ts-reveal bg-white border border-slate-200/90 rounded-2xl shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-117.5">
            {/* TeachSpace Navy Sidebar */}
            <aside className="hidden lg:flex lg:col-span-3 bg-[#142B4A] text-white flex-col">
              <div className="h-14 px-5 flex items-center border-b border-white/10">
                <span className="text-base font-bold tracking-tight ts-font-display">
                  TeachSpace
                </span>
              </div>
              <div className="px-4 py-3 border-b border-white/10">
                <p className="text-xs font-medium text-blue-200/90 truncate">
                  Personal Teaching Workspace
                </p>
                <p className="text-[11px] text-slate-300/70 truncate mt-0.5">
                  Independent Educator · AY 2025/2026
                </p>
              </div>
              <div className="flex-1 px-3 py-3 space-y-1">
                {SIDEBAR_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isHighlighted = item.id === activeTab;
                  const isClickable = ['dashboard', 'attendance', 'grades'].includes(item.id);
                  if (isClickable) {
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left ${
                          isHighlighted
                            ? 'bg-[#3478C8] text-white'
                            : 'text-slate-200/85 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span>{item.label}</span>
                      </button>
                    );
                  }
                  return (
                    <div
                      key={item.id}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-300/75"
                    >
                      <Icon className="w-4 h-4 shrink-0 opacity-80" />
                      <span>{item.label}</span>
                    </div>
                  );
                })}
              </div>
            </aside>

            {/* Right Main Panel */}
            <div className="lg:col-span-9 flex flex-col bg-[#F7F9FC]">
              {/* Topbar */}
              <div className="h-14 bg-white border-b border-slate-200/80 px-5 sm:px-6 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs sm:text-sm min-w-0">
                  <span className="text-slate-400">Workspace</span>
                  <span className="text-slate-300">/</span>
                  <span className="font-semibold text-[#142B4A] truncate">
                    {activeTab === 'dashboard'
                      ? 'Academic Dashboard'
                      : activeTab === 'attendance'
                      ? 'Attendance Management'
                      : 'Grade Management'}
                  </span>
                </div>
                <span className="text-xs text-slate-500 whitespace-nowrap">
                  Sample Mockup Data
                </span>
              </div>

              {/* Dynamic View Content */}
              <div className="p-5 sm:p-6 flex-1 space-y-5">
                {activeTab === 'dashboard' && (
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                      {[
                        { label: 'Total Classes', value: '6', note: 'active classes' },
                        { label: 'Active Students', value: '148', note: 'enrolled' },
                        { label: 'Attendance Rate', value: '96.4%', note: 'overall sessions' },
                        { label: 'Average Grade', value: '84.2', note: 'out of 100' },
                      ].map((stat) => (
                        <div
                          key={stat.label}
                          className="bg-white border border-slate-200/90 rounded-xl p-4"
                        >
                          <p className="text-xs text-slate-500">{stat.label}</p>
                          <p className="mt-1.5 text-xl font-bold text-[#142B4A] ts-font-mono">
                            {stat.value}
                          </p>
                          <p className="mt-0.5 text-[11px] text-slate-400">{stat.note}</p>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Class Grade Bars */}
                      <div className="bg-white border border-slate-200/90 rounded-xl p-5">
                        <h3 className="text-sm font-semibold text-[#142B4A] ts-font-display">
                          Average Score by Class
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Passing threshold set to 75
                        </p>
                        <div className="mt-4 space-y-3.5">
                          {CLASS_AVERAGES.map((row) => (
                            <div key={row.name} className="space-y-1.5">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-medium text-[#142B4A] truncate">
                                  {row.name}
                                </span>
                                <span className="ts-font-mono font-semibold text-[#142B4A]">
                                  {row.avg}
                                </span>
                              </div>
                              <div className="h-2 bg-[#EAF2FB] rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-[#3478C8] rounded-full"
                                  style={{ width: `${row.avg}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Recent Workspace Activity */}
                      <div className="bg-white border border-slate-200/90 rounded-xl p-5">
                        <h3 className="text-sm font-semibold text-[#142B4A] ts-font-display">
                          Recent Academic Activity
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Logged workspace actions
                        </p>
                        <ul className="mt-4 divide-y divide-slate-100 text-xs">
                          {[
                            {
                              action: 'Attendance recorded for Grade 10 · Science A',
                              meta: 'Attendance · Today, 09:35',
                            },
                            {
                              action: 'Midterm Algebra scores updated (32 students)',
                              meta: 'Grades · Yesterday',
                            },
                            {
                              action: 'Uploaded Linear Equations Workbook.pdf',
                              meta: 'Materials · 2 days ago',
                            },
                            {
                              action: 'Exported monthly attendance report (Excel)',
                              meta: 'Reports · 3 days ago',
                            },
                          ].map((item) => (
                            <li key={item.action} className="py-2.5 first:pt-0 last:pb-0">
                              <p className="font-medium text-[#142B4A]">{item.action}</p>
                              <p className="text-[11px] text-slate-400 mt-0.5">{item.meta}</p>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </>
                )}

                {activeTab === 'attendance' && (
                  <div className="bg-white border border-slate-200/90 rounded-xl overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-semibold text-[#142B4A] ts-font-display">
                          Grade 10 · Science A — Session Attendance
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Mathematics · Present: 3 · Excused: 1 · Sick: 1 · Absent: 0
                        </p>
                      </div>
                      <span className="ts-font-mono text-xs font-semibold text-[#3478C8]">
                        60.0% Sample Rows Shown
                      </span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs sm:text-sm">
                        <thead>
                          <tr className="bg-[#F7F9FC] border-b border-slate-200 text-xs font-semibold text-slate-500">
                            <th className="py-2.5 px-5">Student Name</th>
                            <th className="py-2.5 px-5">Student ID</th>
                            <th className="py-2.5 px-5">Status</th>
                            <th className="py-2.5 px-5">Note</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {ATTENDANCE_SAMPLE.map((row) => (
                            <tr key={row.nis}>
                              <td className="py-3 px-5 font-medium text-[#142B4A]">
                                {row.student}
                              </td>
                              <td className="py-3 px-5 ts-font-mono text-xs text-slate-500">
                                {row.nis}
                              </td>
                              <td className="py-3 px-5 font-semibold text-xs text-[#142B4A]">
                                {row.status}
                              </td>
                              <td className="py-3 px-5 text-xs text-slate-500">{row.note}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {activeTab === 'grades' && (
                  <div className="bg-white border border-slate-200/90 rounded-xl overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-semibold text-[#142B4A] ts-font-display">
                          Midterm Algebra — Grade Entry &amp; Passing Status
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Configured Passing Threshold: 75 / 100
                        </p>
                      </div>
                      <span className="ts-font-mono text-xs font-semibold text-[#142B4A]">
                        Sample Avg: 82.6
                      </span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs sm:text-sm">
                        <thead>
                          <tr className="bg-[#F7F9FC] border-b border-slate-200 text-xs font-semibold text-slate-500">
                            <th className="py-2.5 px-5">Student</th>
                            <th className="py-2.5 px-5">Assessment</th>
                            <th className="py-2.5 px-5 text-right">Score</th>
                            <th className="py-2.5 px-5 text-right">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {GRADES_SAMPLE.map((row) => (
                            <tr key={row.student}>
                              <td className="py-3 px-5 font-medium text-[#142B4A]">
                                {row.student}
                              </td>
                              <td className="py-3 px-5 text-xs text-slate-600">
                                {row.assessment}
                              </td>
                              <td className="py-3 px-5 text-right ts-font-mono font-semibold text-[#142B4A]">
                                {row.score} / {row.max}
                              </td>
                              <td
                                className={`py-3 px-5 text-right text-xs font-semibold ${
                                  row.passed ? 'text-emerald-700' : 'text-amber-700'
                                }`}
                              >
                                {row.passed ? 'Passed' : 'Needs Review'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <p className="mt-4 text-xs text-slate-500 text-center">
          Note: The interface above is an illustrative design mockup using sample academic data to
          demonstrate TeachSpace&apos;s layout structure, not a live production screenshot.
        </p>
      </div>
    </section>
  );
}
