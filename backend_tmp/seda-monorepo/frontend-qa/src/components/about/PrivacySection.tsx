import React from 'react';
import { motion } from 'motion/react';
import { Shield, Lock, Eye, Database, Crown } from 'lucide-react';

const privacyFeatures = [
  {
    icon: Lock,
    title: 'We Do Not Sell Your Data — Ever',
    description: 'Your personal information stays yours, period.'
  },
  {
    icon: Eye,
    title: 'Equal Privacy Protection',
    description: 'Free and Premium both protect your privacy equally.'
  },
  {
    icon: Database,
    title: 'Artist-Helpful Data Only',
    description: 'We only collect engagement info that helps artists understand how fans are connecting (e.g., "your track was added to 10 crates").'
  },
  {
    icon: Crown,
    title: 'Premium Protects Everyone',
    description: 'Premium exists so we don\'t have to rely on creepy ad sales — and so you can go ad-free.'
  }
];

export function PrivacySection() {
  return (
    <section className="about-section about-section-padding px-8 sm:px-12 lg:px-16 bg-secondary/20">
      <div className="max-w-4xl mx-auto">
        <motion.div
          className="text-center mb-24"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div
            className="w-16 h-16 flex items-center justify-center mx-auto mb-8"
            style={{
              borderRadius: '16px',
              background: 'linear-gradient(to bottom right, rgba(34, 197, 94, 0.2), var(--secondary))'
            }}
          >
            <Shield className="w-8 h-8" style={{ color: '#4ade80' }} />
          </div>
          <h2 className="text-3xl font-medium text-foreground mb-2">
            Data Privacy Commitment
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Your privacy isn't a feature we bolt on later — it's built into everything we do.
          </p>
        </motion.div>

        <motion.div
          className="bg-card border border-border"
          style={{ borderRadius: '16px', padding: '48px 48px 24px 48px' }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <div className="grid" style={{ gap: '30px' }}>
            {privacyFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                className="flex gap-6"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                viewport={{ once: true }}
              >
                <div
                  className="w-12 h-12 flex items-center justify-center flex-shrink-0"
                  style={{
                    borderRadius: '8px',
                    background: 'linear-gradient(to bottom right, rgba(34, 197, 94, 0.2), var(--secondary))'
                  }}
                >
                  <feature.icon className="w-6 h-6" style={{ color: '#4ade80' }} />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            className="border-t border-border"
            style={{ marginTop: '30px', paddingTop: '30px' }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            viewport={{ once: true }}
          >
            <div
              className="border p-6"
              style={{
                borderRadius: '8px',
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                borderColor: 'rgba(34, 197, 94, 0.2)'
              }}
            >
              <p className="text-sm leading-relaxed" style={{ color: '#4ade80' }}>
                <strong>Privacy Promise:</strong> We will never sell your personal data,
                use dark patterns to extract information, or build surveillance features.
                This commitment is backed by our PBC charter and can't be changed without community input.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}