import {
  LayoutDashboard,
  Users,
  School,
  CalendarClock,
  ClipboardCheck,
  Award,
  FolderOpen,
  FileBarChart2,
} from 'lucide-react';

const FEATURES = [
  {
    icon: LayoutDashboard,
    title: 'Academic Dashboard',
    description:
      'Review active classes, student counts, daily schedules, attendance rates, and grade averages from one unified overview.',
  },
  {
    icon: Users,
    title: 'Student Management',
    description:
      'Keep structured student profiles with optional student IDs, contact details, enrollment status, and class placement.',
  },
  {
    icon: School,
    title: 'Class Management',
    description:
      'Organize classes by code, grade level, and academic year while linking enrolled students and taught subjects.',
  },
  {
    icon: CalendarClock,
    title: 'Schedule Management',
    description:
      'Plan weekly teaching sessions by day, start and end time, class, subject, and classroom or tutoring location.',
  },
  {
    icon: ClipboardCheck,
    title: 'Attendance Management',
    description:
      'Record daily attendance statuses (Present, Excused, Sick, Absent) with notes and track attendance percentages automatically.',
  },
  {
    icon: Award,
    title: 'Grade Management',
    description:
      'Create assessments, enter student scores in bulk, compute averages, and monitor passing status against configurable thresholds.',
  },
  {
    icon: FolderOpen,
    title: 'Learning Materials',
    description:
      'Upload and categorize PDF, DOCX, PPTX, and image resources linked to specific classes and subjects for quick retrieval.',
  },
  {
    icon: FileBarChart2,
    title: 'Academic Reports',
    description:
      'Filter student, attendance, grade, and class summaries by date or class and export clean reports to Excel and PDF.',
  },
];

export default function Features() {
  return (
    <section id="features" className="py-16 sm:py-24 bg-white border-b border-slate-200/80">
      <div className="max-w-300 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl ts-reveal">
          <p className="text-xs font-semibold text-[#3478C8] tracking-wide">Core Capabilities</p>
          <h2 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-[#142B4A] ts-font-display ts-balance">
            Built around the everyday workflow of teaching
          </h2>
          <p className="mt-3 text-base text-slate-600 leading-relaxed">
            Every core academic module works together inside your personal TeachSpace workspace,
            removing scattered spreadsheets and paper logs.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <article
                key={feature.title}
                className="ts-reveal ts-card-hover bg-[#F7F9FC] hover:bg-white border border-slate-200/90 rounded-xl p-6 flex flex-col"
                style={{ transitionDelay: `${(index % 4) * 55}ms` }}
              >
                <div className="w-10 h-10 rounded-lg bg-[#EAF2FB] text-[#3478C8] flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5" aria-hidden="true" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-[#142B4A] ts-font-display">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  {feature.description}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
