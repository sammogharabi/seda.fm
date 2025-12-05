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
    <section className="pt-32 pb-0 px-70" style={{ paddingTop: '128px', paddingBottom: '0', paddingLeft: '32px', paddingRight: '32px' }}>
      <div className="max-w-6xl mx-auto" style={{ maxWidth: '1152px', marginLeft: 'auto', marginRight: 'auto' }}>
        <motion.div
          className="text-center mb-16"
          style={{ textAlign: 'center', marginBottom: '64px' }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl sm:text-4xl font-medium text-foreground mb-2" style={{ fontSize: '36px', fontWeight: '500', color: '#ffffff', marginBottom: '8px' }}>
            What is sedā.fm?
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-[28px]" style={{ fontSize: '18px', color: '#a3a3a3', maxWidth: '768px', marginLeft: 'auto', marginRight: 'auto', lineHeight: '1.6', marginBottom: '28px' }}>
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
                className="w-16 h-16 bg-gradient-to-br from-secondary to-card flex items-center justify-center mx-auto mb-6 shadow-lg"
                style={{
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.8), rgba(17, 17, 17, 1))'
                }}
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