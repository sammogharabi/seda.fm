import React from 'react';
import { motion } from 'framer-motion';
import { Instagram, Music } from 'lucide-react';

const footerLinks = [
  { name: 'Privacy Policy', href: '/privacy' },
  { name: 'Terms of Service', href: '/terms' },
  { name: 'Accessibility', href: '/accessibility' },
  { name: 'Contact', href: 'mailto:hello@seda.fm' }
];

const socialLinks = [
  {
    name: 'Instagram',
    href: 'https://instagram.com/seda.fm',
    icon: Instagram
  },
  {
    name: 'TikTok',
    href: 'https://tiktok.com/@seda.fm',
    icon: Music
  },
  {
    name: 'Bluesky',
    href: 'https://bsky.app/profile/seda.fm',
    icon: () => (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.5c-1.4 0-2.6.9-3.2 2.2C7.9 6.1 6.5 7.8 5.8 9.5c-.6 1.5-.8 2.9-.5 4.2.2 1 .7 1.9 1.4 2.6.7.7 1.6 1.2 2.6 1.4 1.3.3 2.7.1 4.2-.5 1.7-.7 3.4-2.1 4.8-3.0 1.3-1.1 2.2-2.3 2.2-3.7s-.9-2.6-2.2-3.7c-1.4-.9-3.1-2.3-4.8-3.0-1.5-.6-2.9-.8-4.2-.5z"/>
      </svg>
    )
  }
];

export function Footer() {
  return (
    <footer className="about-section bg-card border-t border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8" style={{ paddingTop: '25px', paddingBottom: '25px' }}>
        <motion.div
          className="grid md:grid-cols-3 gap-8 items-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          {/* Logo and tagline */}
          <div className="text-center md:text-left">
            <motion.div
              className="flex items-center justify-center md:justify-start gap-3 mb-4"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <span className="text-xl font-medium text-foreground">sedā.fm</span>
            </motion.div>
            <p className="text-muted-foreground text-sm">
              Music, merch, and tickets — powered by people, not bots.
            </p>
          </div>

          {/* Footer Links */}
          <div className="text-center">
            <nav className="flex flex-wrap justify-center gap-6">
              {footerLinks.map((link, index) => (
                <motion.a
                  key={link.name}
                  href={link.href}
                  className="text-muted-foreground hover:text-foreground transition-colors duration-200 text-sm"
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.2 }}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  style={{
                    transitionDelay: `${index * 0.1}s`
                  }}
                >
                  {link.name}
                </motion.a>
              ))}
            </nav>
          </div>

          {/* Social Links */}
          <div className="text-center md:text-right">
            <div className="flex justify-center md:justify-end gap-4">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-secondary border border-border rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors duration-200"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  style={{
                    transitionDelay: `${index * 0.1}s`
                  }}
                  aria-label={social.name}
                >
                  <social.icon />
                </motion.a>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Bottom section */}
        <motion.div
          className="mt-12 pt-8 border-t text-center"
          style={{
            marginTop: '48px',
            paddingTop: '32px',
            borderTopColor: '#333333',
            borderTopWidth: '1px',
            borderTopStyle: 'solid'
          }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <div
            className="flex flex-row justify-between items-center"
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingLeft: '32px',
              paddingRight: '32px'
            }}
          >
            <p
              className="text-muted-foreground text-sm"
              style={{
                color: '#a3a3a3',
                fontSize: '14px',
                margin: '0'
              }}
            >
              © 2024 sedā.fm, PBC. All rights reserved.
            </p>
            <p
              className="text-muted-foreground text-sm"
              style={{
                color: '#a3a3a3',
                fontSize: '14px',
                margin: '0'
              }}
            >
              Built for artists and fans, not algorithms
            </p>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}