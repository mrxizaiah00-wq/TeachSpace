import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import teachspaceMark from '../../assets/teachspace-mark.svg';

const NAV_LINKS = [
  { label: 'Home', href: '#home' },
  { label: 'Features', href: '#features' },
  { label: 'Benefits', href: '#benefits' },
  { label: 'About', href: '#about' },
  { label: 'FAQ', href: '#faq' },
];

export default function Navbar({ loginPath = '/login', registerPath = '/register' }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 12);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const handleLinkClick = () => {
    setMobileOpen(false);
  };

  return (
    <header
      className={`ts-navbar sticky top-0 z-40 border-b ${
        scrolled
          ? 'ts-navbar-scrolled border-slate-200/90'
          : 'bg-[#F7F9FC]/90 border-transparent'
      }`}
    >
      <div className="max-w-300 mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <a
          href="#home"
          className="inline-flex items-center gap-2.5 text-lg font-bold tracking-tight text-[#142B4A] ts-font-display whitespace-nowrap shrink-0"
        >
          <img
            src={teachspaceMark}
            alt=""
            aria-hidden="true"
            className="w-7 h-7 rounded-lg shrink-0"
          />
          <span>TeachSpace</span>
        </a>

        {/* Zone 2: Primary Section Navigation */}
        <nav
          aria-label="Main navigation"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600"
        >
          {NAV_LINKS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="hover:text-[#142B4A] transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 border-transparent hover:border-[#3478C8]"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Zone 3: Auth Actions */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          <Link
            to={loginPath}
            className="ts-btn px-4 py-2 text-sm font-semibold text-[#142B4A] hover:text-[#3478C8] rounded-lg whitespace-nowrap shrink-0"
          >
            Login
          </Link>
          <Link
            to={registerPath}
            className="ts-btn px-4 py-2 text-sm font-semibold text-white bg-[#3478C8] hover:bg-[#2A65AC] rounded-lg whitespace-nowrap shrink-0"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-expanded={mobileOpen}
          aria-controls="ts-mobile-menu"
          aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
          className="md:hidden inline-flex items-center justify-center w-11 h-11 rounded-lg text-[#142B4A] hover:bg-slate-200/60 transition-colors"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <div
          id="ts-mobile-menu"
          className="md:hidden bg-white border-t border-slate-200 shadow-lg"
        >
          <div className="max-w-300 mx-auto px-4 py-4 space-y-1">
            {NAV_LINKS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={handleLinkClick}
                className="block px-3 py-2.5 rounded-lg text-sm font-medium text-[#142B4A] hover:bg-[#EAF2FB] transition-colors"
              >
                {item.label}
              </a>
            ))}
            <div className="pt-3 mt-3 border-t border-slate-100 grid grid-cols-2 gap-2.5">
              <Link
                to={loginPath}
                onClick={handleLinkClick}
                className="ts-btn text-center px-4 py-2.5 text-sm font-semibold text-[#142B4A] bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
              >
                Login
              </Link>
              <Link
                to={registerPath}
                onClick={handleLinkClick}
                className="ts-btn text-center px-4 py-2.5 text-sm font-semibold text-white bg-[#3478C8] hover:bg-[#2A65AC] rounded-lg"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
