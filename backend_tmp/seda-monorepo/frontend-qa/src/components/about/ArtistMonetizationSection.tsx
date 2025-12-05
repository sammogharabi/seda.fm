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
    <section className="about-section about-section-padding px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-medium text-foreground mb-2">
            Artist Monetization
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Fair, transparent monetization that puts artists first. No complex algorithms
            or hidden fees - just honest revenue sharing.
          </p>
        </motion.div>

        <motion.div
          className="bg-card border border-border rounded-2xl p-8"
          style={{
            backgroundColor: '#111111',
            borderColor: '#333333',
            borderRadius: '16px',
            border: '1px solid #333333',
            padding: '32px'
          }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {monetizationSteps.map((step, index) => (
              <motion.div
                key={step.title}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="w-16 h-16 bg-gradient-to-br from-green-500/20 to-secondary rounded-2xl flex items-center justify-center mx-auto mb-4" style={{
                  background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(26, 26, 26, 1))',
                  borderRadius: '16px'
                }}>
                  <step.icon className="w-8 h-8 text-green-400" style={{ color: '#4ade80' }} />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-3" style={{ color: '#ffffff' }}>
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed" style={{ color: '#a3a3a3', fontSize: '12pt' }}>
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>

          <div className="border-t border-border my-8" style={{
            borderTopColor: '#333333',
            marginTop: '24px',
            marginBottom: '24px'
          }}></div>

          <motion.div
            className="space-y-6"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4" style={{
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                borderColor: 'rgba(34, 197, 94, 0.2)',
                border: '1px solid rgba(34, 197, 94, 0.2)',
                borderRadius: '8px',
                padding: '16px'
              }}>
                <h4 className="text-green-400 font-medium mb-2" style={{ color: '#4ade80' }}>Revenue Split</h4>
                <p className="text-muted-foreground text-sm" style={{ color: '#a3a3a3' }}>
                  Artists keep <strong style={{ color: '#ffffff' }}>90%</strong> of all revenue. Our 10% fee covers platform
                  costs, payment processing, and community development.
                </p>
              </div>
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4" style={{
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderColor: 'rgba(59, 130, 246, 0.2)',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                borderRadius: '8px',
                padding: '16px'
              }}>
                <h4 className="text-blue-400 font-medium mb-2" style={{ color: '#60a5fa' }}>Payment Terms</h4>
                <p className="text-muted-foreground text-sm" style={{ color: '#a3a3a3' }}>
                  Monthly payouts with no minimum threshold. Transparent reporting
                  and real-time analytics for all your content.
                </p>
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm text-muted-foreground" style={{ color: '#a3a3a3' }}>
                <strong style={{ color: '#ffffff' }}>No exclusivity required.</strong> Upload to sedā.fm while maintaining
                your presence on other platforms. Your music, your choice.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}