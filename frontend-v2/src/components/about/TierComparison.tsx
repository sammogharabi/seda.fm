import React from 'react';
import { motion } from 'motion/react';
import { Check } from 'lucide-react';

interface TierComparisonProps {
  onSignup: () => void;
}

export function TierComparison({ onSignup }: TierComparisonProps) {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl sm:text-4xl font-medium text-foreground mb-4">
            Free vs Premium
          </h2>
          <p className="text-lg text-muted-foreground">
            Both get the full experience. Premium just skips the ads.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Free Tier */}
          <motion.div
            className="bg-card border border-border rounded-xl p-6"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h3 className="text-xl font-medium text-foreground mb-4">Free</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-muted-foreground">
                <Check className="w-5 h-5 text-primary flex-shrink-0" />
                Everything — rooms, crates, sessions, sharing
              </li>
              <li className="flex items-center gap-3 text-muted-foreground">
                <Check className="w-5 h-5 text-primary flex-shrink-0" />
                Some ads (we hate them too)
              </li>
              <li className="flex items-center gap-3 text-muted-foreground">
                <Check className="w-5 h-5 text-primary flex-shrink-0" />
                Earn Premium by being active or buying from artists
              </li>
            </ul>
          </motion.div>

          {/* Premium Tier */}
          <motion.div
            className="bg-card border-2 border-primary/30 rounded-xl p-6 relative"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h3 className="text-xl font-medium text-foreground mb-4">Premium</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-muted-foreground">
                <Check className="w-5 h-5 text-primary flex-shrink-0" />
                Everything from Free
              </li>
              <li className="flex items-center gap-3 text-muted-foreground">
                <Check className="w-5 h-5 text-primary flex-shrink-0" />
                Zero ads. Bliss.
              </li>
              <li className="flex items-center gap-3 text-muted-foreground">
                <Check className="w-5 h-5 text-primary flex-shrink-0" />
                Early feature access + supporter badge
              </li>
            </ul>
          </motion.div>
        </div>

        <motion.p
          className="text-center text-muted-foreground mt-8 text-sm"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
        >
          We'd rather not run ads at all. That's why you can earn Premium just by supporting artists.
        </motion.p>
      </div>
    </section>
  );
}
