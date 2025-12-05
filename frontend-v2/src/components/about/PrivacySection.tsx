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
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-secondary/20">
      <div className="max-w-4xl mx-auto">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="w-16 h-16 bg-gradient-to-br from-green-500/20 to-secondary rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8 text-green-400" />
          </div>
          <h2 className="text-3xl font-medium text-foreground mb-4">
            Data Privacy Commitment
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Your privacy isn't a feature we bolt on later — it's built into everything we do.
          </p>
        </motion.div>

        <motion.div 
          className="bg-card border border-border rounded-2xl p-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <div className="grid gap-6">
            {privacyFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                className="flex gap-4"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="w-12 h-12 bg-gradient-to-br from-green-500/20 to-secondary rounded-lg flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-6 h-6 text-green-400" />
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
            className="mt-8 pt-8 border-t border-border"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <p className="text-sm text-green-400 leading-relaxed">
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