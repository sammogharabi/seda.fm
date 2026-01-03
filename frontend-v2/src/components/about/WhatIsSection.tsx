import React from 'react';
import { motion } from 'motion/react';

export function WhatIsSection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl sm:text-4xl font-medium text-foreground mb-6">
            What is sedā.fm?
          </h2>
          <p className="text-xl text-muted-foreground leading-relaxed mb-6">
            A music platform where discovery happens through people, not algorithms.
          </p>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Artists upload. Fans curate. Scenes grow. Nobody's getting their taste dictated by
            an AI that thinks you want to hear "Chill Beats for Doing Your Taxes."
          </p>
        </motion.div>
      </div>
    </section>
  );
}
