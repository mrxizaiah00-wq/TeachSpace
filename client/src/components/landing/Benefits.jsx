import { Layers, ShieldCheck, ClipboardList, Globe, Archive } from 'lucide-react';

const BENEFITS = [
  {
    icon: Layers,
    title: 'Centralized Academic Management',
    description:
      'Bring student rosters, class lists, weekly schedules, attendance logs, assessments, and materials together under one consistent interface.',
  },
  {
    icon: ShieldCheck,
    title: 'Personal Workspace',
    description:
      'Every educator receives an isolated personal workspace immediately upon signing up—no school IT administrator or institutional approval required.',
  },
  {
    icon: ClipboardList,
    title: 'Simplified Administration',
    description:
      'Replace disconnected notebooks and manual formulas with structured forms, automatic attendance percentages, and instant grade summaries.',
  },
  {
    icon: Globe,
    title: 'Accessible Anywhere',
    description:
      'Review upcoming classes, record attendance, or download teaching materials across desktop, laptop, tablet, and smartphone browsers.',
  },
  {
    icon: Archive,
    title: 'Organized Academic Records',
    description:
      'Keep historical attendance sessions, assessment scores, and class files neatly structured by academic year and ready for Excel or PDF export.',
  },
];

export default function Benefits() {
  return (
    <section id="benefits" className="py-16 sm:py-24 bg-[#F7F9FC] border-b border-slate-200/80">
      <div className="max-w-1200px mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Left Sticky Editorial Summary */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 ts-reveal">
            <p className="text-xs font-semibold text-[#3478C8] tracking-wide">Why TeachSpace</p>
            <h2 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-[#142B4A] ts-font-display ts-balance">
              Spend less time sorting files and more time teaching
            </h2>
            <p className="mt-4 text-base text-slate-600 leading-relaxed">
              Whether you teach full school classes, run private tutoring sessions, or instruct
              independent courses, TeachSpace adapts to your personal teaching structure.
            </p>
            <div className="mt-8 bg-white border border-slate-200/90 rounded-xl p-5 space-y-2">
              <p className="text-sm font-semibold text-[#142B4A] ts-font-display">
                Designed for independent educators
              </p>
              <p className="text-sm text-slate-600 leading-relaxed">
                School or institution details are completely optional. Configure your workspace
                name, academic year, and passing grade threshold to match how you teach.
              </p>
            </div>
          </div>

          {/* Right Benefit Rows */}
          <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-2xl divide-y divide-slate-200/80 ts-reveal">
            {BENEFITS.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={benefit.title}
                  className="p-6 sm:p-7 flex items-start gap-4 sm:gap-5 hover:bg-[#F7F9FC]/70 transition-colors first:rounded-t-2xl last:rounded-b-2xl"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#EAF2FB] text-[#3478C8] flex items-center justify-center shrink-0 mt-0.5">
                    <Icon className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base font-semibold text-[#142B4A] ts-font-display">
                      {benefit.title}
                    </h3>
                    <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
