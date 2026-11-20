const STEPS = [
  {
    step: '01',
    title: 'Create Your Account',
    description:
      'Register independently with your name, email, and password in under a minute—no administrator invite needed.',
  },
  {
    step: '02',
    title: 'Get Your Personal Workspace',
    description:
      'TeachSpace automatically provisions your private workspace with configurable academic year and passing grade settings.',
  },
  {
    step: '03',
    title: 'Add Students and Classes',
    description:
      'Create classes, link subjects, and organize your student roster with class assignments and status tracking.',
  },
  {
    step: '04',
    title: 'Manage Academic Activities',
    description:
      'Set weekly schedules, record daily attendance, enter assessment grades, and attach learning materials to each class.',
  },
  {
    step: '05',
    title: 'View Academic Reports',
    description:
      'Filter attendance, grade, student, and class recaps by date range and export ready-to-share Excel or PDF files.',
  },
];

export default function HowItWorks() {
  return (
    <section id="about" className="py-16 sm:py-24 bg-white border-b border-slate-200/80">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl ts-reveal">
          <p className="text-xs font-semibold text-[#3478C8] tracking-wide">How It Works</p>
          <h2 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-[#142B4A] ts-font-display ts-balance">
            From sign-up to organized teaching in five steps
          </h2>
          <p className="mt-3 text-base text-slate-600 leading-relaxed">
            TeachSpace is built to get out of your way so you can set up your classes quickly and
            keep records accurate throughout the term.
          </p>
        </div>

        <ol className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
          {STEPS.map((item, idx) => (
            <li
              key={item.step}
              className="ts-reveal relative bg-[#F7F9FC] border border-slate-200/90 rounded-xl p-6 flex flex-col"
              style={{ transitionDelay: `${idx * 65}ms` }}
            >
              <div className="flex items-center justify-between gap-2 pb-4 border-b border-slate-200/80">
                <span className="ts-font-mono text-sm font-semibold text-[#3478C8]">
                  {item.step}
                </span>
                <span className="text-xs text-slate-400">Step {idx + 1} of 5</span>
              </div>
              <h3 className="mt-4 text-base font-semibold text-[#142B4A] ts-font-display">
                {item.title}
              </h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">{item.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
