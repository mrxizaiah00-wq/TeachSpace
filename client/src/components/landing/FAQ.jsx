import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const FAQ_ITEMS = [
  {
    question: 'What is TeachSpace?',
    answer:
      'TeachSpace is a Personal Academic Management Platform designed to help teachers, private tutors, and independent educators organize classes, student rosters, weekly schedules, attendance, grades, learning materials, and academic reports in one workspace.',
  },
  {
    question: 'Who can use TeachSpace?',
    answer:
      'TeachSpace is built for school teachers, private tutors, learning center instructors, and independent educators. Each user receives a personal workspace upon registration, and adding a school or institution name is optional.',
  },
  {
    question: 'Is TeachSpace free to use?',
    answer:
      'TeachSpace is currently developed as an independent academic management platform (MVP). Pricing plans or subscription tiers have not been finalized at this stage, so please check your TeachSpace deployment or official release notes for the latest access details.',
  },
  {
    question: 'Can I manage multiple classes?',
    answer:
      'Yes. Within your personal workspace, you can create and manage multiple classes across different grade levels and academic years, assign students to each class, and link relevant subjects and weekly schedules.',
  },
  {
    question: 'Can I track student attendance and grades?',
    answer:
      'Yes. TeachSpace includes dedicated Attendance Management (Present, Excused, Sick, Absent with notes and attendance recaps) and Grade Management (assessments, score entry, class averages, and passing status based on your configurable threshold).',
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);

  const toggleItem = (index) => {
    setOpenIndex((prev) => (prev === index ? -1 : index));
  };

  return (
    <section id="faq" className="py-16 sm:py-24 bg-white border-b border-slate-200/80">
      <div className="max-w-225 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto ts-reveal">
          <p className="text-xs font-semibold text-[#3478C8] tracking-wide">FAQ</p>
          <h2 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-[#142B4A] ts-font-display ts-balance">
            Frequently asked questions
          </h2>
          <p className="mt-3 text-base text-slate-600 leading-relaxed">
            Clear answers about how TeachSpace works for individual teachers and tutors.
          </p>
        </div>

        <div className="mt-10 bg-[#F7F9FC] border border-slate-200/90 rounded-2xl divide-y divide-slate-200/80 ts-reveal">
          {FAQ_ITEMS.map((item, idx) => {
            const isOpen = openIndex === idx;
            const panelId = `ts-faq-panel-${idx}`;
            return (
              <div key={item.question} className="px-5 sm:px-6 py-4">
                <button
                  type="button"
                  onClick={() => toggleItem(idx)}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  className="w-full py-1.5 flex items-center justify-between gap-4 text-left"
                >
                  <span className="text-sm sm:text-base font-semibold text-[#142B4A] ts-font-display">
                    {item.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-500 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-[#3478C8]' : ''
                    }`}
                    aria-hidden="true"
                  />
                </button>
                <div
                  id={panelId}
                  data-open={isOpen ? 'true' : 'false'}
                  className="ts-accordion-panel"
                >
                  <div className="ts-accordion-inner">
                    <p className="pt-2.5 pb-1 text-sm text-slate-600 leading-relaxed">
                      {item.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
