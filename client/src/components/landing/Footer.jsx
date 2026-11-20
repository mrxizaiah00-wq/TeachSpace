import { Link } from 'react-router-dom';
import teachspaceMark from "../../assets/teachspace-mark.svg";

const NAV_LINKS = [
  { label: 'Home', href: '#home' },
  { label: 'Features', href: '#features' },
  { label: 'Benefits', href: '#benefits' },
  { label: 'How It Works', href: '#about' },
  { label: 'Preview', href: '#preview' },
  { label: 'FAQ', href: '#faq' },
];

const FEATURE_LINKS = [
  'Academic Dashboard',
  'Student Management',
  'Class Management',
  'Schedule Management',
  'Attendance & Grades',
  'Materials & Reports',
];

export default function Footer({
  loginPath = '/login',
  registerPath = '/register',
  contactEmail = 'support@teachspace.id',
}) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-slate-200/90 text-[#142B4A]">
      <div className="max-w-300 mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10">
          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-3.5">
            <a
              href="#home"
              className="inline-flex items-center gap-2.5 text-lg font-bold tracking-tight text-[#142B4A] ts-font-display"
            >
              <img
                src={teachspaceMark}
                alt=""
                aria-hidden="true"
                className="w-7 h-7 rounded-lg shrink-0"
              />
              <span>TeachSpace</span>
            </a>
            <p className="text-sm text-slate-600 leading-relaxed max-w-xs">
              Your Teaching, Organized. Personal Academic Management Platform for teachers, private
              tutors, and independent educators.
            </p>
          </div>

          {/* Navigation Links */}
          <div className="lg:col-span-2">
            <h3 className="text-xs font-semibold text-[#142B4A] tracking-wide">Navigation</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-600">
              {NAV_LINKS.map((item) => (
                <li key={item.href}>
                  <a href={item.href} className="hover:text-[#3478C8] transition-colors">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Feature Links */}
          <div className="lg:col-span-3">
            <h3 className="text-xs font-semibold text-[#142B4A] tracking-wide">Features</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-600">
              {FEATURE_LINKS.map((label) => (
                <li key={label}>
                  <a href="#features" className="hover:text-[#3478C8] transition-colors">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Account Links */}
          <div className="lg:col-span-3">
            <h3 className="text-xs font-semibold text-[#142B4A] tracking-wide">Contact</h3>
            <div className="mt-4 space-y-2.5 text-sm text-slate-600">
              <p>Questions about your TeachSpace workspace or setup?</p>
              <a
                href={`mailto:${contactEmail}`}
                className="inline-block font-medium text-[#3478C8] hover:underline"
              >
                {contactEmail}
              </a>
              <div className="pt-3 flex items-center gap-4 text-sm font-medium">
                <Link to={loginPath} className="text-[#142B4A] hover:text-[#3478C8]">
                  Login
                </Link>
                <span aria-hidden="true" className="text-slate-300">
                  ·
                </span>
                <Link to={registerPath} className="text-[#3478C8] hover:text-[#2A65AC]">
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Copyright Row */}
        <div className="mt-12 pt-6 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>&copy; {currentYear} TeachSpace. All rights reserved.</p>
          <p>Personal Academic Management Platform</p>
        </div>
      </div>
    </footer>
  );
}
