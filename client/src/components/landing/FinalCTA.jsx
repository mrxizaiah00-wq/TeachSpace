import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function FinalCTA({ registerPath = '/register', loginPath = '/login' }) {
  return (
    <section className="py-16 sm:py-24 bg-[#F7F9FC]">
      <div className="max-w-300 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="ts-reveal bg-[#142B4A] text-white rounded-2xl px-6 py-12 sm:px-12 sm:py-16 text-center">
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight ts-font-display ts-balance">
            Ready to Organize Your Teaching?
          </h2>
          <p className="mt-4 text-base text-slate-200/90 max-w-xl mx-auto leading-relaxed">
            Start managing your academic activities in one organized workspace.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              to={registerPath}
              className="ts-btn inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-[#3478C8] hover:bg-[#2A65AC] rounded-lg whitespace-nowrap"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to={loginPath}
              className="ts-btn inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-white bg-white/10 hover:bg-white/15 border border-white/15 rounded-lg whitespace-nowrap"
            >
              Sign In to Workspace
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
