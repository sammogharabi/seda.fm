import React from 'react';
import { motion } from 'motion/react';
import { Users, Mic, Music } from 'lucide-react';

const features = [
  {
    icon: Users,
    title: 'Fans',
    description: 'Discover through human-made playlists and support artists directly.'
  },
  {
    icon: Mic,
    title: 'Artists',
    description: 'Share your music, sell merch, and sell tickets directly to fans.'
  },
  {
    icon: Music,
    title: 'Scenes',
    description: 'Build communities where music and culture flow between people, not algorithms.'
  }
];

export function WhatIsSection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl sm:text-4xl font-medium text-foreground mb-6">
            What is sedā.fm?
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            sedā.fm is a people-powered music space. Artists upload real songs, fans build real playlists (we call them crates) 
            and host live DJ sessions, and scenes grow through community — not code. Free includes ads, but you can earn 
            Premium (ad-free) just by engaging or buying songs, merch, and tickets.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
            >
              <motion.div 
                className="w-16 h-16 bg-gradient-to-br from-secondary to-card rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.2 }}
              >
                <feature.icon className="w-8 h-8 text-primary" />
              </motion.div>
              <h3 className="text-xl font-medium text-foreground mb-4">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}