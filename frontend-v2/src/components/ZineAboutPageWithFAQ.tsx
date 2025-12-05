import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Music, Zap, Star, Ban, Clock, Badge, DollarSign, TrendingUp, Upload, Users, Radio, Heart, Shield, Lock, Eye, Globe, ArrowRight, CheckCircle, Mail, Mic, Speaker, Headphones, Volume2, Building2 } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { toast } from 'sonner@2.0.3';

export function ZineAboutPageWithFAQ() {
  const [email, setEmail] = useState('');
  const [footerEmail, setFooterEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFooterSubmitting, setIsFooterSubmitting] = useState(false);

  const handleEmailSubmit = async (e, emailValue, setSubmitting, isFooter = false) => {
    e.preventDefault();
    if (!emailValue) {
      toast.error("Please enter your email address");
      return;
    }
    
    setSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      toast.success("Thanks! You're on the waitlist. We'll email you when beta launches.");
      if (isFooter) {
        setFooterEmail('');
      } else {
        setEmail('');
      }
      setSubmitting(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      
      {/* Manifesto Hero - Raw & Bold */}
      <motion.section
        className="py-20 md:py-32 relative overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* Clean Background Elements */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-32 h-32 border-4 border-accent-coral"></div>
          <div className="absolute bottom-20 right-10 w-24 h-24 bg-accent-mint"></div>
          <div className="absolute top-1/2 left-1/4 w-16 h-16 border-2 border-accent-blue"></div>
        </div>

        <div className="max-w-6xl mx-auto px-4 relative">
          <motion.div 
            className="text-left max-w-4xl"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {/* Typewriter Style Heading */}
            <div className="mb-8">
              <div className="text-accent-coral text-sm font-mono uppercase tracking-wider mb-2">
                [SOCIAL NETWORK FOR MUSIC • ARTISTS SELL DIRECT TO FANS]
              </div>
              <h1 className="text-6xl md:text-8xl font-black text-primary mb-4 leading-none">
                sedā<span className="text-accent-coral">.</span>fm
              </h1>
              <div className="w-24 h-1 bg-accent-mint mb-6"></div>
            </div>
            
            {/* Core Value Proposition */}
            <div className="space-y-6 text-left">
              <div className="bg-accent-yellow/20 border-l-8 border-accent-yellow p-6 mb-6">
                <p className="text-2xl md:text-3xl font-black text-primary leading-tight mb-4">
                  ARTISTS GET PAID.<br/>
                  FANS FIND GEMS.<br/>
                  <span className="text-accent-coral">NOBODY GETS SCREWED OVER.</span>
                </p>
                <p className="text-lg text-foreground font-medium">
                  sedā.fm is where artists actually make money from their music and fans discover tracks that hit different. 
                  Think Instagram meets Bandcamp, but with less crying about algorithms and more discovering good music.
                </p>
              </div>
              
              <p className="text-lg md:text-xl text-foreground max-w-2xl font-medium">
                Built by music nerds who got tired of streaming crumbs. <strong className="text-primary">Artists keep 90% AND 100% ownership of their music forever (wild, right?). Fans discover music through humans, not robots. Everyone wins except the suits.</strong>
              </p>
            </div>

            {/* Raw Signup */}
            <motion.div 
              className="mt-12"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <div className="bg-primary text-primary-foreground p-1 inline-block mb-4 font-mono text-sm">
                {"> GET EARLY ACCESS"}
              </div>
              
              <form 
                onSubmit={(e) => handleEmailSubmit(e, email, setIsSubmitting)}
                className="flex flex-col sm:flex-row gap-4 max-w-lg"
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@domain.com"
                  className="flex-1 px-4 py-3 bg-transparent border-2 border-foreground font-mono focus:border-accent-coral focus:outline-none transition-colors"
                  required
                />
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-accent-coral text-background px-8 py-3 font-bold uppercase tracking-wider hover:bg-accent-coral/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed border-2 border-accent-coral"
                >
                  {isSubmitting ? 'JOINING...' : 'JOIN BETA'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      <div className="max-w-6xl mx-auto px-4 py-16">
        
        {/* FAQ Section - Underground Style */}
        <motion.section
          className="mb-32"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-black text-primary mb-4">
              <span className="text-accent-coral">FAQ</span>
            </h2>
            <div className="w-32 h-1 bg-accent-coral mx-auto mb-4"></div>
            <p className="text-muted-foreground font-mono text-sm uppercase tracking-wider">
              [ANSWERS TO YOUR QUESTIONS]
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Accordion type="single" collapsible className="w-full space-y-4">
              {[
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
              ].map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  viewport={{ once: true }}
                >
                  <AccordionItem 
                    value={`item-${index}`}
                    className="bg-card border-2 border-foreground rounded-none px-6 py-2 data-[state=open]:bg-card/80 transition-colors duration-200"
                  >
                    <AccordionTrigger className="text-left hover:no-underline py-4 [&[data-state=open]>svg]:rotate-45">
                      <span className="text-foreground font-black pr-4 leading-relaxed uppercase tracking-wide">
                        {faq.question}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="text-foreground leading-relaxed pb-6 pt-2 font-medium">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                </motion.div>
              ))}
            </Accordion>

            <motion.div 
              className="mt-12 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <div className="bg-accent-blue/20 border-l-8 border-accent-blue p-6 mb-6">
                <p className="text-foreground font-black mb-2 uppercase tracking-wide">
                  STILL HAVE QUESTIONS?
                </p>
                <a 
                  href="mailto:hello@seda.fm" 
                  className="text-accent-blue hover:text-accent-blue/80 transition-colors duration-200 font-black uppercase tracking-wider"
                >
                  GET IN TOUCH →
                </a>
              </div>
            </motion.div>
          </div>
        </motion.section>

      </div>
    </div>
  );
}