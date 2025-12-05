import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import '../../styles/about-override.css';
import { IconRow } from '../../components/IconRow';
import { HeroSection } from '../../components/about/HeroSection';
import { WhatIsSection } from '../../components/about/WhatIsSection';
import { BenefitsSection } from '../../components/about/BenefitsSection';
import { PBCSection } from '../../components/about/PBCSection';
import { PrivacySection } from '../../components/about/PrivacySection';
import { HowItWorksSection } from '../../components/about/HowItWorksSection';
import { TierComparison } from '../../components/about/TierComparison';
import { ArtistMonetizationSection } from '../../components/about/ArtistMonetizationSection';
import { FAQSection } from '../../components/about/FAQSection';
import { Footer } from '../../components/about/Footer';

export function AboutPage() {
  const pbcSectionRef = useRef<HTMLDivElement>(null);

  const handleSignup = (email: string) => {
    // Simulate beta signup
    console.log('Beta signup:', email);
    toast.success('Welcome to the beta waitlist! We\'ll notify you when access opens.');
  };

  const handleLearnMorePBC = () => {
    // Scroll to PBC section
    pbcSectionRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  };

  const handleSignupRedirect = () => {
    // In a real app, this would redirect to signup flow
    toast.info('Beta signup coming soon! Join the waitlist above.');
  };

  return (
    <motion.div
      className="about-page min-h-screen bg-background text-foreground"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="w-full mx-auto">
        {/* IconRow sanity test */}
        <div className="py-4">
          <IconRow />
        </div>

        {/* Hero Section */}
        <HeroSection
          onSignup={handleSignup}
          onLearnMorePBC={handleLearnMorePBC}
        />

        {/* What is sedā.fm? */}
        <WhatIsSection />

        {/* Benefits for Fans and Artists */}
        <BenefitsSection />

        {/* Public Benefit Company */}
        <div ref={pbcSectionRef}>
          <PBCSection />
        </div>

        {/* Data Privacy Commitment */}
        <PrivacySection />

        {/* How sedā.fm Works */}
        <HowItWorksSection />

        {/* Free vs Premium Tier Comparison */}
        <TierComparison onSignup={handleSignupRedirect} />

        {/* Artist Monetization */}
        <ArtistMonetizationSection />

        {/* FAQ Section */}
        <FAQSection />

        {/* Footer */}
        <Footer />
      </div>
    </motion.div>
  );
}