import React from 'react';
import { motion } from 'motion/react';
import { Music, Zap, Star, Ban, Clock, Badge } from 'lucide-react';

const freeFeatures = [
  { text: 'Access human-made playlists, rooms, and sharing.', icon: Music },
  { text: 'Ads keep the free tier alive so nobody has to pay just to join the community if they can\'t.', icon: Zap },
  { text: 'Earn Premium credits by listening, sharing, and buying songs, merch, and tickets.', icon: Star }
];

const premiumFeatures = [
  { text: 'No ads.', icon: Ban },
  { text: 'Early access to new features.', icon: Clock },
  { text: 'Supporter badge.', icon: Badge },
  { text: 'Earn points to extend Premium by being active.', icon: Star }
];

interface TierComparisonProps {
  onSignup: () => void;
}

export function TierComparison({ onSignup }: TierComparisonProps) {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl sm:text-4xl font-medium text-foreground mb-6">
            Tiers & Pricing Overview
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Free Tier */}
          <motion.div 
            className="bg-secondary/20 border border-border rounded-2xl p-8 shadow-lg"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="mb-8">
              <h3 className="text-2xl font-medium text-foreground mb-6">Free (with ads)</h3>
              
              <ul className="space-y-4">
                {freeFeatures.map((feature, index) => (
                  <motion.li 
                    key={index}
                    className="flex items-start gap-3"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <div className="w-6 h-6 bg-muted rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <feature.icon className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <span className="text-muted-foreground leading-relaxed">
                      {feature.text}
                    </span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Premium Tier */}
          <motion.div 
            className="bg-card border-2 border-primary/20 rounded-2xl p-8 relative overflow-hidden shadow-lg"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="absolute top-4 right-4">
              <div className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                Upgrade
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-2xl font-medium text-foreground mb-6">Premium (ad-free)</h3>
              
              <ul className="space-y-4">
                {premiumFeatures.map((feature, index) => (
                  <motion.li 
                    key={index}
                    className="flex items-start gap-3"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <div className="w-6 h-6 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <feature.icon className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-muted-foreground leading-relaxed">
                      {feature.text}
                    </span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>

        {/* Callout */}
        <motion.div 
          className="bg-card border border-border rounded-xl p-6 text-center max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <p className="text-muted-foreground leading-relaxed">
            "We'd rather not run ads. That's why Premium exists — and why Free users can earn ad-free time by engaging or buying directly from artists."
          </p>
        </motion.div>
      </div>
    </section>
  );
}