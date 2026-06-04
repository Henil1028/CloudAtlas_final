import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import { HeroSection } from '../components/landing/HeroSection';
import { TrustedTechSection } from '../components/landing/TrustedTechSection';
import { ProblemSection } from '../components/landing/ProblemSection';
import { SolutionSection } from '../components/landing/SolutionSection';
import { FeaturesSection } from '../components/landing/FeaturesSection';
import { TechStackSection } from '../components/landing/TechStackSection';
import { WorkflowSection } from '../components/landing/WorkflowSection';
import { DashboardPreviewSection } from '../components/landing/DashboardPreviewSection';
import { PricingSection } from '../components/landing/PricingSection';
import { CTASection } from '../components/landing/CTASection';
import { Footer } from '../components/common/Footer';

export const LandingPage = () => {
  const location = useLocation();

  useEffect(() => {
    // If we redirected from another route with a specific anchor
    if (location.state && location.state.scrollTo) {
      const element = document.getElementById(location.state.scrollTo);
      if (element) {
        // Delay slightly to allow the DOM to render
        const timer = setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
          // Clear history state
          window.history.replaceState({}, document.title);
        }, 100);
        return () => clearTimeout(timer);
      }
    }
  }, [location]);

  return (
    <div className="bg-navy-dark min-h-screen text-white overflow-x-hidden selection:bg-primary selection:text-white">
      {/* Header Navigation */}
      <Navbar />

      {/* Hero Intro */}
      <HeroSection />

      {/* Rolling tech marquee */}
      <TrustedTechSection />

      {/* Problem analysis */}
      <ProblemSection />

      {/* Solutions */}
      <SolutionSection />

      {/* ML precision cost features */}
      <FeaturesSection />

      {/* Platform tech architecture */}
      <TechStackSection />

      {/* Pipeline / Stepper timeline */}
      <WorkflowSection />

      {/* Simulated Console Mockup */}
      <DashboardPreviewSection />

      {/* Pricing subscriptions */}
      <PricingSection />

      {/* Action CTA */}
      <CTASection />

      {/* Page Footer */}
      <Footer />
    </div>
  );
};
export default LandingPage;
