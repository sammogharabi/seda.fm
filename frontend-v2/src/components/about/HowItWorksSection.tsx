import React from 'react';
import { motion } from 'motion/react';
import {
  Radio,
  FolderOpen,
  Upload,
  Store
} from 'lucide-react';

const features = [
  {
    icon: Radio,
    title: 'Rooms & DJ Sessions',
    description: 'Live listening parties where people — not algorithms — pick what plays next.'
  },
  {
    icon: FolderOpen,
    title: 'Crates',
    description: 'Playlists curated by humans. Share them, remix them, make them yours.'
  },
  {
    icon: Upload,
    title: 'Artist Uploads',
    description: 'Drop your music directly into the community. No gatekeepers, no waiting.'
  },
  {
    icon: Store,
    title: 'Direct Sales',
    description: 'Sell music, merch, and tickets straight to fans. Keep 90% of the money.'
  }
];

export function HowItWorksSection() {
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
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground">
            Simple. Human. Actually fun.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              className="bg-card border border-border rounded-xl p-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-secondary rounded-lg flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}