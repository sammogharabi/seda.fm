import React from 'react';
import { motion } from 'motion/react';
import { 
  Radio, 
  Users, 
  FolderOpen, 
  Share2, 
  Upload, 
  Ticket,
  DollarSign
} from 'lucide-react';

const features = [
  {
    icon: Radio,
    title: 'Rooms',
    description: 'Live listening parties hosted by people.'
  },
  {
    icon: Users,
    title: 'DJ Sessions',
    description: 'Fans and artists take turns choosing songs.'
  },
  {
    icon: FolderOpen,
    title: 'Crates (Playlists)',
    description: 'Curated by humans, shared across the scene.'
  },
  {
    icon: Share2,
    title: 'Sharing',
    description: 'Post songs and crates so your friends discover with you.'
  },
  {
    icon: Upload,
    title: 'Artist Uploads',
    description: 'Add your music directly to the ecosystem.'
  },
  {
    icon: Ticket,
    title: 'Merch & Tickets',
    description: 'Artists sell directly to fans — with bot-free ticketing.'
  },
  {
    icon: DollarSign,
    title: 'Ads',
    description: 'Exist on Free. Earn Premium (ad-free) by engaging or buying.'
  }
];

export function HowItWorksSection() {
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
            How sedā.fm Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Here's how the people-powered music experience works.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              className="bg-card border border-border rounded-xl p-6 hover:border-primary/30 transition-colors duration-200"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
            >
              <motion.div 
                className="w-12 h-12 bg-gradient-to-br from-primary/20 to-secondary rounded-lg flex items-center justify-center mb-4"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.2 }}
              >
                <feature.icon className="w-6 h-6 text-primary" />
              </motion.div>
              <h3 className="text-lg font-medium text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div 
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="bg-card border border-border rounded-xl p-8 max-w-2xl mx-auto">
            <h3 className="text-xl font-medium text-foreground mb-4">
              Real Music, Real People
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              No AI-generated playlists, no algorithmic recommendations. 
              Everything you hear is chosen by real people who love music as much as you do.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}