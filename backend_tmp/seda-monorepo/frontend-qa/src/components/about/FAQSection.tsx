import React from 'react';
import { motion } from 'framer-motion';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../ui/accordion';

const faqs = [
  {
    question: "Do you run ads?",
    answer: "Yes — on Free. Ads keep the free tier alive, which means nobody has to pay just to join the community if they can't. But you can earn Premium (ad-free) by listening, sharing, and buying songs, merch, and tickets."
  },
  {
    question: "Why Premium?",
    answer: "So you can enjoy music ad-free while we keep sedā.fm people-first without relying on creepy ad sales."
  },
  {
    question: "Do you sell my data?",
    answer: "No. Never."
  },
  {
    question: "How do credits work (Free → ad-free)?",
    answer: "Join rooms, share music, support artists — and every time you buy songs, merch, or tickets, you earn credits that unlock Premium (ad-free) time."
  },
  {
    question: "How do points work (Premium → more Premium)?",
    answer: "Premium users earn points by being active, which extend Premium time."
  },
  {
    question: "How do artists earn money here?",
    answer: "Upload songs, set a price (or let fans choose), and keep ~90%. Plus sell merch and concert tickets directly to your fans."
  },
  {
    question: "What's \"bot-free ticketing\"?",
    answer: "A purchasing flow designed to keep bots and scalpers out, so real fans can get tickets at fair prices."
  },
  {
    question: "Can fans set their own price?",
    answer: "Yes — when an artist enables fan-determined pricing."
  },
  {
    question: "When's beta?",
    answer: "Soon. Join the waitlist and be first in."
  }
];

export function FAQSection() {
  return (
    <section className="about-section about-section-padding px-4 sm:px-6 lg:px-8 bg-secondary/20">
      <div className="max-w-4xl mx-auto" style={{ maxWidth: '896px', marginLeft: 'auto', marginRight: 'auto' }}>
        <motion.div
          className="text-center mb-20"
          style={{ textAlign: 'center', marginBottom: '80px' }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl sm:text-4xl font-medium text-foreground mb-2" style={{ fontSize: '36px', fontWeight: '500', color: '#ffffff', marginBottom: '8px' }}>
            FAQ
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed" style={{ fontSize: '18px', color: '#a3a3a3', lineHeight: '1.6' }}>
            Questions about how sedā.fm works, from ads to artists to beta access.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <Accordion type="single" collapsible className="w-full space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                viewport={{ once: true }}
              >
                <AccordionItem
                  value={`item-${index}`}
                  className="bg-card border border-border rounded-lg px-6 py-2 data-[state=open]:bg-card/80 transition-colors duration-200"
                >
                  <AccordionTrigger className="text-left hover:no-underline py-4 [&[data-state=open]>svg]:rotate-45">
                    <span className="text-foreground font-medium pr-4 leading-relaxed">
                      {faq.question}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed pb-6 pt-2">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </motion.div>

        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <p className="text-muted-foreground mb-4">
            Still have questions?
          </p>
          <a
            href="mailto:hello@seda.fm"
            className="text-primary hover:text-primary/80 transition-colors duration-200 font-medium"
          >
            Get in touch →
          </a>
        </motion.div>
      </div>
    </section>
  );
}