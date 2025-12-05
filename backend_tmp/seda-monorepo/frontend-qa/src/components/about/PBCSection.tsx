import React from 'react';
import { motion } from 'motion/react';
import { Building2, Heart, Users, Bot } from 'lucide-react';

const pbcBenefits = [
  {
    icon: Users,
    title: 'People-Powered Discovery',
    description: 'Make discovery people-powered and fair.'
  },
  {
    icon: Heart,
    title: 'Human-Made Playlists',
    description: 'Keep playlists human-made and inclusive.'
  },
  {
    icon: Bot,
    title: 'Artists & Listeners First',
    description: 'Put artists and listeners ahead of ad algorithms and scalpers.'
  }
];

export function PBCSection() {
  return (
    <section className="about-section about-section-padding px-8 sm:px-12 lg:px-16" id="pbc">
      <div className="max-w-4xl mx-auto">
        <motion.div
          className="text-center mb-24"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div
            className="w-16 h-16 bg-gradient-to-br from-primary/20 to-secondary flex items-center justify-center mx-auto mb-8"
            style={{ borderRadius: '16px' }}
          >
            <Building2 className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-3xl font-medium text-foreground mb-2">
            Public Benefit Company
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            We're a Delaware Public Benefit Company, which means we're legally required to balance profit with doing good.
            Translation: we're here to serve artists and fans first — not ads, not algorithms, not even a board of directors.
          </p>
        </motion.div>

        <motion.div
          className="bg-card border border-border p-12"
          style={{ borderRadius: '16px' }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <div className="grid md:grid-cols-3 gap-12">
            {pbcBenefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-secondary rounded-lg flex items-center justify-center mx-auto mb-6">
                  <benefit.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-4">
                  {benefit.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {benefit.description}
                </p>
              </motion.div>
            ))}
          </div>

          <motion.div
            className="mt-8 pt-8 border-t border-border text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            viewport={{ once: true }}
          >
            <p className="text-sm text-muted-foreground">
              Our PBC status is filed with the state of Delaware and we publish annual benefit reports
              detailing our social impact.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}