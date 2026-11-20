
import { useEffect, useState } from 'react';
import teachspaceMark from '../../assets/teachspace-mark.svg';

export default function LandingLoader({ onComplete }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const duration = 1800;
    const interval = 30;
    const increment = (100 * interval) / duration;

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = Math.min(prev + increment, 100);

        if (next >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 250);
        }

        return next;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-9999 flex flex-col items-center justify-center bg-[#F7F9FC]">
      <div className="flex flex-col items-center animate-fade-in">

        <img
          src={teachspaceMark}
          alt="TeachSpace"
          className="w-16 h-16 mb-5 animate-pulse"
        />

        <h1 className="text-3xl font-bold text-[#142B4A]">
          TeachSpace
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Mempersiapkan ruang belajar Anda...
        </p>

        <div className="w-56 h-1.5 bg-slate-200 rounded-full mt-8 overflow-hidden">
          <div
            className="h-full bg-[#3478C8] rounded-full transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>

        <span className="mt-3 text-xs text-slate-400">
          {Math.round(progress)}%
        </span>

      </div>
    </div>
  );
}
