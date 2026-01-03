import React from 'react';
import { motion } from 'motion/react';
import {
  Users,
  Heart,
  TrendingUp,
  Ticket,
  Shield
} from 'lucide-react';

const benefits = [
  {
    icon: Users,
    title: 'People, Not Algorithms',
    description: 'Discovery happens through real humans sharing real music. No mystery math, no AI playlists, no bullshit.'
  },
  {
    icon: Heart,
    title: 'Direct Everything',
    description: 'Artists upload, sell, and connect directly. Fans buy songs, merch, and tickets straight from the source.'
  },
  {
    icon: TrendingUp,
    title: 'Artists Keep 90%',
    description: 'We take 10% to keep the lights on. That\'s it. Your music, your money.'
  },
  {
    icon: Ticket,
    title: 'Fuck the Bots',
    description: 'Bot-free ticketing means real fans get seats. Scalpers can go find another hobby.'
  },
  {
    icon: Shield,
    title: 'You Own Your Shit',
    description: 'Full ownership of your music. No exclusivity. Upload here and anywhere else you want.'
  }
];

export function BenefitsSection() {
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
          <h2 className="text-3xl sm:text-4xl font-medium text-foreground mb-4">
            Why sedā.fm?
          </h2>
          <p className="text-lg text-muted-foreground">
            Here's what makes us different.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              className="bg-card border border-border rounded-xl p-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-secondary rounded-lg flex items-center justify-center mb-4">
                <benefit.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                {benefit.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {benefit.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}