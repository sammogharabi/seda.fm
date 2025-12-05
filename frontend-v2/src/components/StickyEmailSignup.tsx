import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, ArrowRight } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { supabase, isSupabaseAvailable } from '../utils/supabase/client';

interface StickyEmailSignupProps {
  onDismiss?: () => void;
  isDismissed?: boolean;
}

export function StickyEmailSignup({ onDismiss, isDismissed }: StickyEmailSignupProps) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Check if Supabase is configured and available
      if (isSupabaseAvailable() && supabase) {
        console.log('Saving email to Supabase...');
        // Save email to Supabase
        const { error } = await supabase
          .from('beta_waitlist')
          .insert([
            {
              email: email,
              created_at: new Date().toISOString(),
              source: 'sticky_signup'
            }
          ]);

        if (error) {
          console.error('Supabase error:', error);
          // Fallback to localStorage
          console.log('Falling back to localStorage due to Supabase error');
          const existingEmails = JSON.parse(localStorage.getItem('seda_beta_emails') || '[]');
          existingEmails.push({
            email: email,
            created_at: new Date().toISOString(),
            source: 'sticky_signup_supabase_fallback'
          });
          localStorage.setItem('seda_beta_emails', JSON.stringify(existingEmails));
        } else {
          console.log('Email saved to Supabase successfully');
        }
      } else {
        // Fallback to localStorage if Supabase not configured
        console.log('Supabase not configured, saving to localStorage');
        const existingEmails = JSON.parse(localStorage.getItem('seda_beta_emails') || '[]');
        existingEmails.push({
          email: email,
          created_at: new Date().toISOString(),
          source: 'sticky_signup_local'
        });
        localStorage.setItem('seda_beta_emails', JSON.stringify(existingEmails));
      }
      
      toast.success("Thanks! You're on the waitlist. We'll email you when beta launches.");
      setEmail('');
      onDismiss?.();
    } catch (error) {
      console.error('Error saving email:', error);
      // Fallback to localStorage on any error
      try {
        console.log('Final fallback to localStorage');
        const existingEmails = JSON.parse(localStorage.getItem('seda_beta_emails') || '[]');
        existingEmails.push({
          email: email,
          created_at: new Date().toISOString(),
          source: 'sticky_signup_error_fallback'
        });
        localStorage.setItem('seda_beta_emails', JSON.stringify(existingEmails));
      } catch (storageError) {
        console.error('LocalStorage error:', storageError);
      }
      
      // Always show success to user - don't break the UX  
      toast.success("Thanks! You're on the waitlist. We'll email you when beta launches.");
      setEmail('');
      onDismiss?.();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isDismissed) return null;

  return (
    <AnimatePresence>
      <motion.div 
        className="fixed bottom-0 left-0 right-0 z-40 bg-accent-coral border-t border-accent-coral/20 shadow-2xl"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            {/* Icon */}
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-background/10 rounded-lg flex items-center justify-center">
                <Mail className="w-6 h-6 text-background" />
              </div>
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <div className="flex-shrink-0">
                  <h3 className="font-black text-background text-lg uppercase tracking-wide">
                    JOIN BETA WAITLIST
                  </h3>
                  <p className="text-background/90 text-sm font-medium">
                    Get early access to sedā.fm - where artists keep 90%
                  </p>
                </div>
                
                {/* Email Form */}
                <form 
                  onSubmit={handleSubmit}
                  className="flex gap-2 flex-1 min-w-0"
                >
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@domain.com"
                    className="flex-1 px-3 py-2 bg-background/20 border border-background/30 rounded-lg text-background placeholder:text-background/70 font-medium focus:bg-background/30 focus:border-background/50 focus:outline-none transition-colors text-sm min-w-0"
                    required
                  />
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-shrink-0 bg-background text-accent-coral px-4 py-2 rounded-lg font-black text-sm uppercase tracking-wider hover:bg-background/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <motion.div
                        className="w-4 h-4 border-2 border-accent-coral/30 border-t-accent-coral rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                    ) : (
                      <>
                        JOIN
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
            
            {/* Dismiss Button */}
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="flex-shrink-0 w-8 h-8 bg-background/10 hover:bg-background/20 rounded-lg flex items-center justify-center transition-colors group"
                aria-label="Dismiss signup"
              >
                <X className="w-4 h-4 text-background group-hover:text-background/80" />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}