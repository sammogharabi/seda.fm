import React, { useState, useEffect } from 'react';
import { Toaster } from './components/ui/sonner';
import { motion } from 'motion/react';
import { ZineAboutPage } from './components/ZineAboutPage';

export default function FigmaAboutPage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize app for Figma
    const initApp = async () => {
      setIsLoading(true);

      // Apply dark theme to document
      if (typeof document !== 'undefined') {
        document.documentElement.classList.add('dark');

        // Set page title
        document.title = 'sedā.fm - Music Community for Artists & Fans';
      }

      // Short delay for smooth loading experience
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    };

    initApp();
  }, []);

  // Show loading screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div 
            className="flex items-center justify-center gap-3 mb-6"
            animate={{ 
              scale: [1, 1.05, 1],
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <motion.div 
              className="w-16 h-16 bg-gradient-to-br from-accent-coral to-accent-mint rounded-xl flex items-center justify-center shadow-2xl border-2 border-foreground"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <span className="text-background font-black text-2xl">S</span>
            </motion.div>
            <div>
              <h1 className="text-4xl text-foreground font-black bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
                sedā.fm
              </h1>
              <div className="w-16 h-1 bg-accent-coral mt-1"></div>
            </div>
          </motion.div>
          <motion.p 
            className="text-muted-foreground text-lg font-mono"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Loading the underground...
          </motion.p>
        </motion.div>
        <Toaster />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <ZineAboutPage />

      {/* Enter Platform Button */}
      <motion.button
        onClick={() => window.location.href = '/app'}
        className="fixed bottom-6 right-6 bg-accent-coral text-background px-6 py-3 font-black uppercase tracking-wider hover:bg-accent-coral/90 transition-all border-2 border-accent-coral shadow-lg z-50 md:px-8 md:py-4"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: "spring", stiffness: 300 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <span className="hidden md:inline">Enter Platform</span>
        <span className="md:hidden">Enter</span>
      </motion.button>

      <Toaster />
    </div>
  );
}