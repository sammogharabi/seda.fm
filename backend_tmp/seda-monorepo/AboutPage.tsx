import React, { useRef } from 'react';
import { motion } from 'motion/react';
import { toast } from 'sonner@2.0.3';
import { HeroSection } from './about-sandbox/HeroSection';
import { WhatIsSection } from './about-sandbox/WhatIsSection';
import { BenefitsSection } from './about-sandbox/BenefitsSection';
import { PBCSection } from './about-sandbox/PBCSection';
import { PrivacySection } from './about-sandbox/PrivacySection';
import { HowItWorksSection } from './about-sandbox/HowItWorksSection';
import { TierComparison } from './about-sandbox/TierComparison';
import { ArtistMonetizationSection } from './about-sandbox/ArtistMonetizationSection';
import { FAQSection } from './about-sandbox/FAQSection';
import { Footer } from './about-sandbox/Footer';

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
      className="min-h-screen bg-background text-foreground"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="w-full max-w-[1024px] mx-auto px-4">
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
