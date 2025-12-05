import React from 'react';
import { motion } from 'motion/react';
import { 
  HeadphonesIcon, 
  Users, 
  Heart,
  Upload,
  TrendingUp,
  DollarSign,
  Target,
  Shield,
  Ticket,
  Bot
} from 'lucide-react';

const fanBenefits = [
  {
    icon: Users,
    title: 'Human-Made Discovery',
    description: 'Find music through people, not mystery math.'
  },
  {
    icon: Heart,
    title: 'Direct Artist Support',
    description: 'Support artists directly by buying songs, merch, and tickets.'
  },
  {
    icon: DollarSign,
    title: 'Earn Premium by Engaging',
    description: 'Earn Premium (ad-free) by listening, sharing, AND buying.'
  },
  {
    icon: Ticket,
    title: 'Bot-Free Ticketing',
    description: 'Enjoy bot-free ticketing that keeps scalpers out.'
  },
  {
    icon: HeadphonesIcon,
    title: 'Real Connections',
    description: 'Connect with listeners who actually share your taste.'
  }
];

const artistBenefits = [
  {
    icon: Upload,
    title: 'Direct Upload',
    description: 'Upload your songs straight to the community.'
  },
  {
    icon: DollarSign,
    title: 'Direct Sales',
    description: 'Sell songs, merch, and tickets directly to your fans.'
  },
  {
    icon: Bot,
    title: 'Bot-Free Ticketing',
    description: 'Count on bot-free ticketing so real fans get seats, not bots.'
  },
  {
    icon: TrendingUp,
    title: 'Keep ~90% Revenue',
    description: 'Keep ~90% of music revenue (we only skim enough to keep the servers running).'
  },
  {
    icon: Users,
    title: 'People-Powered Discovery',
    description: 'Get discovered through playlists and sessions built by real people.'
  },
  {
    icon: Shield,
    title: 'Full Ownership',
    description: 'Keep full ownership of your music.'
  }
];

export function BenefitsSection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-secondary/20">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16">
          {/* Benefits for Fans */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-medium text-foreground mb-8">
              Benefits for Fans
            </h2>
            <div className="space-y-6">
              {fanBenefits.map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  className="flex gap-4"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-secondary rounded-lg flex items-center justify-center flex-shrink-0">
                    <benefit.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-foreground mb-2">
                      {benefit.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Benefits for Artists */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-medium text-foreground mb-8">
              Benefits for Artists
            </h2>
            <div className="space-y-6">
              {artistBenefits.map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  className="flex gap-4"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-secondary rounded-lg flex items-center justify-center flex-shrink-0">
                    <benefit.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-foreground mb-2">
                      {benefit.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}