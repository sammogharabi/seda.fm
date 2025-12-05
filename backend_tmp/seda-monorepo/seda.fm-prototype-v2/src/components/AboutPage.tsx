import React, { useRef } from 'react';
import { motion } from 'motion/react';
import { toast } from 'sonner@2.0.3';
import { HeroSection } from './about/HeroSection';
import { WhatIsSection } from './about/WhatIsSection';
import { BenefitsSection } from './about/BenefitsSection';
import { PBCSection } from './about/PBCSection';
import { PrivacySection } from './about/PrivacySection';
import { HowItWorksSection } from './about/HowItWorksSection';
import { TierComparison } from './about/TierComparison';
import { ArtistMonetizationSection } from './about/ArtistMonetizationSection';
import { FAQSection } from './about/FAQSection';
import { Footer } from './about/Footer';

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
    </motion.div>
  );
}