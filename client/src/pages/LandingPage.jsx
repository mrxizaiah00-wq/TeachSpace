import { useEffect } from "react";

import Navbar from "../components/landing/Navbar.jsx";
import Hero from "../components/landing/Hero.jsx";
import Features from "../components/landing/Features.jsx";
import Benefits from "../components/landing/Benefits.jsx";
import HowItWorks from "../components/landing/HowItWorks.jsx";
import DashboardPreview from "../components/landing/DashboardPreview.jsx";
import FAQ from "../components/landing/FAQ.jsx";
import FinalCTA from "../components/landing/FinalCTA.jsx";
import Footer from "../components/landing/Footer.jsx";

import "../styles/landing.css";

export default function LandingPage({
  loginPath = '/login',
  registerPath = '/register',
  contactEmail = 'support@teachspace.id',
}) {
  useEffect(() => {
    const targets = Array.from(document.querySelectorAll('.ts-reveal'));
    if (targets.length === 0) return undefined;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion || typeof IntersectionObserver === 'undefined') {
      targets.forEach((el) => el.classList.add('ts-revealed'));
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('ts-revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    targets.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="ts-landing min-h-screen flex flex-col">
      <Navbar loginPath={loginPath} registerPath={registerPath} />
      <main className="flex-1">
        <Hero registerPath={registerPath} />
        <Features />
        <Benefits />
        <HowItWorks />
        <DashboardPreview />
        <FAQ />
        <FinalCTA registerPath={registerPath} loginPath={loginPath} />
      </main>
      <Footer
        loginPath={loginPath}
        registerPath={registerPath}
        contactEmail={contactEmail}
      />
    </div>
  );
}
