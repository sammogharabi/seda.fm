import React from 'react';
import { motion } from 'motion/react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../ui/accordion';

const faqs = [
  {
    question: "Do you sell my data?",
    answer: "Nope. Never have, never will. That's a promise."
  },
  {
    question: "What about ads?",
    answer: "Free tier has 'em (gotta keep the lights on somehow). Buy from artists or stay active, and you earn your way to ad-free Premium."
  },
  {
    question: "How do artists make money?",
    answer: "Upload music, set your price, keep 90%. Sell merch and tickets too. No middlemen taking half your shit."
  },
  {
    question: "What's bot-free ticketing?",
    answer: "Exactly what it sounds like — scalpers can fuck off. Real fans get real tickets at real prices."
  },
  {
    question: "When's beta?",
    answer: "Soon. Get on the waitlist if you want in early."
  }
];

export function FAQSection() {
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
            Questions?
          </h2>
          <p className="text-lg text-muted-foreground">
            Here's the quick version.
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