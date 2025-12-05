import React from 'react';
import { motion } from 'framer-motion';
import { FAQSection } from '../components/about/FAQSection';
import { TierComparison } from '../components/about/TierComparison';
import { HowItWorksSection } from '../components/about/HowItWorksSection';
import { Footer } from '../components/about/Footer';

export function TestAboutPage() {
  const handleSignup = () => {
    console.log('Signup clicked');
  };

  return (
    <motion.div
      className="min-h-screen bg-background text-foreground"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="w-full max-w-[1024px] mx-auto px-4">
        {/* Header */}
        <div className="py-8 text-center">
          <h1 className="text-4xl font-bold mb-4">sedā.fm - Updated Copy UAT</h1>
          <p className="text-lg text-muted-foreground">Testing the new human-first, anti-AI copy</p>
        </div>

        {/* How sedā.fm Works */}
        <HowItWorksSection />

        {/* Free vs Premium Tier Comparison */}
        <TierComparison onSignup={handleSignup} />

        {/* FAQ Section */}
        <FAQSection />

        {/* Footer */}
        <Footer />
      </div>
    </motion.div>
  );
}