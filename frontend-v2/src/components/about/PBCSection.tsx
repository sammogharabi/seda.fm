import React from 'react';
import { motion } from 'motion/react';
import { Building2, Lock, Shield } from 'lucide-react';

export function PBCSection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-secondary/20" id="pbc">
      <div className="max-w-4xl mx-auto">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl sm:text-4xl font-medium text-foreground mb-4">
            Our Promise
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We're a Public Benefit Company. That's not marketing speak — it's a legal structure
            that means we have to put people over profit.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          <motion.div
            className="bg-card border border-border rounded-xl p-6 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-secondary rounded-lg flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              Artists & Fans First
            </h3>
            <p className="text-muted-foreground text-sm">
              Legally required to serve you, not just shareholders.
            </p>
          </motion.div>

          <motion.div
            className="bg-card border border-border rounded-xl p-6 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div className="w-12 h-12 bg-gradient-to-br from-green-500/20 to-secondary rounded-lg flex items-center justify-center mx-auto mb-4">
              <Lock className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              We Don't Sell Your Data
            </h3>
            <p className="text-muted-foreground text-sm">
              Ever. Free or Premium, your privacy is the same.
            </p>
          </motion.div>

          <motion.div
            className="bg-card border border-border rounded-xl p-6 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <div className="w-12 h-12 bg-gradient-to-br from-green-500/20 to-secondary rounded-lg flex items-center justify-center mx-auto mb-4">
              <Shield className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              No Dark Patterns
            </h3>
            <p className="text-muted-foreground text-sm">
              No tricks, no creepy tracking, no surveillance bullshit.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}