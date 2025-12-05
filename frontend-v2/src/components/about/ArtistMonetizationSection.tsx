import React from 'react';
import { motion } from 'motion/react';
import { Upload, DollarSign, TrendingUp } from 'lucide-react';

const monetizationSteps = [
  {
    icon: Upload,
    title: 'Upload Your Music',
    description: 'Share your original tracks directly to the platform with full metadata control'
  },
  {
    icon: DollarSign,
    title: 'Set Your Price',
    description: 'Choose fan-set pricing or set your own rates for track access and exclusive content'
  },
  {
    icon: TrendingUp,
    title: 'Earn Fairly',
    description: 'Keep 90% of revenue with our transparent 10% platform fee - no hidden costs'
  }
];

export function ArtistMonetizationSection() {
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
          <h2 className="text-3xl font-medium text-foreground mb-4">
            Artist Monetization
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Fair, transparent monetization that puts artists first. No complex algorithms 
            or hidden fees - just honest revenue sharing.
          </p>
        </motion.div>

        <motion.div 
          className="bg-card border border-border rounded-2xl p-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            {monetizationSteps.map((step, index) => (
              <motion.div
                key={step.title}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="w-16 h-16 bg-gradient-to-br from-green-500/20 to-secondary rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <step.icon className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-3">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>

          <motion.div 
            className="border-t border-border pt-8 space-y-6"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                <h4 className="text-green-400 font-medium mb-2">Revenue Split</h4>
                <p className="text-muted-foreground text-sm">
                  Artists keep <strong>90%</strong> of all revenue. Our 10% fee covers platform 
                  costs, payment processing, and community development.
                </p>
              </div>
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <h4 className="text-blue-400 font-medium mb-2">Payment Terms</h4>
                <p className="text-muted-foreground text-sm">
                  Monthly payouts with no minimum threshold. Transparent reporting 
                  and real-time analytics for all your content.
                </p>
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                <strong>No exclusivity required.</strong> Upload to sedā.fm while maintaining 
                your presence on other platforms. Your music, your choice.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}