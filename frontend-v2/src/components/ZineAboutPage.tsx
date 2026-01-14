import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Music, DollarSign, TrendingUp, Users, Radio, Heart, Shield, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export function ZineAboutPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent, emailValue: string, setSubmitting: (v: boolean) => void) => {
    e.preventDefault();
    if (!emailValue) {
      toast.error("Please enter your email address");
      return;
    }

    setSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      toast.success("Thanks! You're on the waitlist. We'll email you when beta launches.");
      setEmail('');
      setSubmitting(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* Manifesto Hero - Raw & Bold */}
      <motion.section
        className="py-12 md:py-20 lg:py-32 relative overflow-hidden"
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

        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 relative">
          <motion.div
            className="text-left max-w-5xl mx-auto lg:max-w-none"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {/* Typewriter Style Heading */}
            <div className="mb-8">
              <div className="text-accent-coral text-sm font-mono uppercase tracking-wider mb-2">
                [SOCIAL NETWORK FOR MUSIC • ARTISTS SELL DIRECT TO FANS]
              </div>
              <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black text-primary mb-4 leading-none">
                sedā<span className="text-accent-coral">.</span>fm
              </h1>
              <div className="w-24 h-1 bg-accent-mint mb-6"></div>
            </div>

            {/* Core Value Proposition */}
            <div className="space-y-6 text-left">
              <div className="bg-accent-yellow/20 border-l-8 border-accent-yellow p-4 sm:p-6 mb-6">
                <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-primary leading-tight mb-4">
                  ARTISTS GET PAID.<br/>
                  FANS FIND GEMS.<br/>
                  <span className="text-accent-coral">NOBODY GETS SCREWED OVER.</span>
                </p>
                <p className="text-base sm:text-lg lg:text-xl text-foreground font-medium">
                  sedā.fm is where artists actually make money from their music and fans discover tracks that hit different.
                  Think Instagram meets Bandcamp, but with less crying about algorithms and more discovering good music.
                </p>
              </div>

              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-foreground max-w-4xl font-medium">
                Built by music nerds who got tired of streaming crumbs. <strong className="text-primary">Artists keep 90% of sales and 100% ownership of their music forever (wild, right?). Fans discover music through humans, not robots. Everyone wins except the suits.</strong>
              </p>

              {/* No Ads & No AI - Side by Side Callouts */}
              <div className="grid md:grid-cols-2 gap-4 mt-8 max-w-5xl">
                {/* No Ads Ever */}
                <motion.div
                  className="bg-accent-mint border-2 border-accent-mint p-6 rounded-lg text-center"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                >
                  <h3 className="text-xl sm:text-2xl font-black text-background mb-2">ZERO ADS. ACTUALLY ZERO.</h3>
                  <p className="text-background leading-relaxed text-sm sm:text-base">
                    No pre-roll ads. No banner ads. No "sponsored content." No "this artist is brought to you by..." bullshit.
                    We make money when artists make money. That's the whole damn business model.
                  </p>
                </motion.div>

                {/* No AI Artists */}
                <motion.div
                  className="bg-accent-coral border-2 border-accent-coral p-6 rounded-lg text-center"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.7 }}
                >
                  <h3 className="text-xl sm:text-2xl font-black text-background mb-2">NO AI "ARTISTS." PERIOD.</h3>
                  <p className="text-background leading-relaxed text-sm sm:text-base">
                    If a robot made it, it doesn't belong here. We're a platform for actual humans making actual music.
                    AI-generated tracks can go flood Spotify's royalty pool somewhere else. This is sacred ground.
                  </p>
                </motion.div>
              </div>
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

      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-8 md:py-16">

        {/* What Artists Get Section */}
        <motion.section
          className="mb-32"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-black text-primary mb-4">
              FOR <span className="text-accent-coral">ARTISTS</span>
            </h2>
            <div className="w-32 h-1 bg-accent-coral mx-auto mb-4"></div>
            <p className="text-muted-foreground font-mono text-sm uppercase tracking-wider">
              [FINALLY MAKE MONEY FROM YOUR MUSIC]
            </p>
          </div>

          {/* Zero Subscription Fee Callout */}
          <motion.div
            className="bg-accent-coral border-4 border-accent-coral p-8 mb-12 relative"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="text-center">
              <div className="font-mono text-xs text-background/80 mb-2 uppercase tracking-wider">
                ZERO FEES FOR ARTISTS
              </div>
              <h3 className="text-3xl md:text-4xl font-black text-background mb-3 uppercase">
                $0 TO JOIN
              </h3>
              <div className="w-16 h-0.5 bg-background mx-auto mb-4"></div>
              <p className="text-sm text-background leading-relaxed max-w-2xl mx-auto mb-4">
                <strong>Artists pay ZERO subscription fees.</strong> While other platforms charge $20-50+ monthly, we believe artists shouldn't pay to share their art.
              </p>
              <div className="bg-background/20 border border-background p-3 rounded inline-block">
                <div className="font-mono text-xs text-background flex items-center justify-center gap-4">
                  <span>Setup: <strong>$0</strong></span>
                  <span>Monthly: <strong>$0</strong></span>
                  <span>Annual: <strong>$0</strong></span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Music Memorabilia Layout */}
          <div className="grid md:grid-cols-3 gap-8 relative">


            {/* Revenue Share - Polaroid Photo */}
            <motion.div
              className="bg-card border-2 border-foreground p-6 relative shadow-md"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              {/* Polaroid photo */}
              <div className="bg-accent-coral h-32 mb-4 flex items-center justify-center relative overflow-hidden">
                <div className="text-6xl font-black text-background">90%</div>
                {/* Photo grain effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-background/5 to-background/10"></div>
              </div>
              {/* Handwritten caption */}
              <div className="font-mono text-sm text-muted-foreground mb-2">
                "Revenue Split"
              </div>
              <h3 className="text-xl font-black text-primary mb-3">
                MAKE REAL MONEY
              </h3>
              <p className="text-foreground leading-relaxed text-sm">
                Keep 90% of everything you sell. Music, merch, tickets. Set your own prices. Plus you own your music 100% forever. Build a sustainable music career.
              </p>
            </motion.div>

            {/* Direct Connection - Clean Professional Card */}
            <motion.div
              className="bg-accent-mint text-background p-6 relative border border-accent-mint"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="font-mono text-xs text-background/80 mb-2 uppercase tracking-wider">
                ALL ACCESS • BACKSTAGE
              </div>
              <h3 className="text-2xl font-black text-background mb-3">
                DIRECT ACCESS
              </h3>
              <div className="border-l-4 border-background pl-4 mb-4">
                <div className="font-mono text-xs text-background/90 mb-1">ARTIST:</div>
                <div className="font-mono text-xs text-background/90 mb-1">YOUR FAVORITE BAND</div>
                <div className="font-mono text-xs text-background/90">ACCESS: DIRECT CHAT</div>
              </div>
              <p className="text-background/90 leading-relaxed text-sm">
                Chat with fans who actually get your music. Share exclusive tracks. Build real connections. No robot overlords deciding who sees what.
              </p>
            </motion.div>

            {/* Store Page - Clean Professional Card */}
            <motion.div
              className="bg-card border border-foreground p-6 relative"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <div className="border-b border-foreground pb-3 mb-4">
                <div className="font-mono text-xs text-muted-foreground mb-1">SEDĀ MARKETPLACE</div>
                <h3 className="text-xl font-black text-primary">YOUR ARTIST STORE</h3>
                <div className="font-mono text-xs text-muted-foreground">DIRECT SALES PLATFORM</div>
              </div>

              <div className="space-y-2 mb-4 font-mono text-xs">
                <div className="flex justify-between">
                  <span>01. Music Sales</span>
                  <span className="font-black">90%</span>
                </div>
                <div className="flex justify-between">
                  <span>02. Merch Store</span>
                  <span className="font-black">90%</span>
                </div>
                <div className="flex justify-between">
                  <span>03. Ticket Sales</span>
                  <span className="font-black">90%</span>
                </div>
              </div>

              <div className="border-t border-foreground pt-3">
                <p className="text-foreground text-sm leading-relaxed">
                  Upload music, sell merch, hawk tickets. Your fans can buy everything without leaving. It's like having your own record store, but digital and less dusty.
                </p>
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* What Fans Get Section */}
        <motion.section
          className="mb-32"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-black text-primary mb-4">
              FOR <span className="text-accent-blue">FANS</span>
            </h2>
            <div className="w-32 h-1 bg-accent-blue mx-auto mb-4"></div>
            <p className="text-muted-foreground font-mono text-sm uppercase tracking-wider">
              [DISCOVER MUSIC YOU'LL ACTUALLY LOVE]
            </p>
          </div>

          {/* Music Culture Collection Layout */}
          <div className="space-y-8 relative">


            {/* Top Row - Human Discovery & Direct Support */}
            <div className="grid md:grid-cols-2 gap-8 relative">
              {/* Human Discovery - Band Sticker Collection */}
              <motion.div
                className="relative"
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true }}
              >
                <div className="bg-card border-2 border-foreground p-8 relative">


                  <div className="font-mono text-xs text-muted-foreground mb-3 uppercase tracking-wide">
                    DISCOVERY THAT WORKS
                  </div>
                  <h3 className="text-2xl font-black text-primary mb-4">
                    {"FRIENDS > ROBOTS"}
                  </h3>
                  <div className="border-l-4 border-accent-yellow pl-4 mb-4">
                    <p className="text-foreground leading-relaxed italic">
                      "Your friend Sarah has better taste than Spotify's algorithm. Facts."
                    </p>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    See what your friends, favorite artists, and fellow music nerds are actually listening to. No corporate playlist nonsense.
                  </p>
                </div>
              </motion.div>

              {/* Direct Support - Record Store Receipt */}
              <motion.div
                className="relative"
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <div className="bg-card border border-foreground p-6 font-mono relative">
                  {/* Receipt paper texture */}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-foreground/5"></div>

                  {/* Receipt header */}
                  <div className="text-center border-b border-dashed border-foreground pb-2 mb-4 relative">
                    <div className="text-xs">SEDĀ.FM RECORD STORE</div>
                    <div className="text-xs">DIRECT TO ARTIST</div>
                  </div>

                  <h3 className="text-xl font-black text-primary mb-4 font-sans relative">
                    YOUR MONEY → ARTISTS
                  </h3>

                  <div className="space-y-1 text-xs mb-4 relative">
                    <div className="flex justify-between">
                      <span>ALBUM PURCHASE:</span>
                      <span>$10.00</span>
                    </div>
                    <div className="flex justify-between font-black">
                      <span>TO ARTIST (90%):</span>
                      <span>$9.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>PLATFORM FEE:</span>
                      <span>$1.00</span>
                    </div>
                    <div className="flex justify-between text-accent-coral">
                      <span>TO STREAMING GIANTS:</span>
                      <span>$0.00 😎</span>
                    </div>
                  </div>

                  <div className="border-t border-dashed border-foreground pt-2 relative">
                    <p className="text-xs text-muted-foreground font-sans">
                      Your money actually reaches the artists. Revolutionary concept, we know.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Bottom Row - Artist Connection & No Algorithm */}
            <div className="grid md:grid-cols-2 gap-8 relative">
              {/* Artist Connection - Concert Poster Fragment */}
              <motion.div
                className="relative"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                viewport={{ once: true }}
              >
                <div className="bg-accent-coral text-background p-8 relative border-4 border-accent-coral">

                  <div className="text-center">
                    <div className="font-mono text-xs text-background/80 mb-2 uppercase tracking-wider">
                      LIVE • DIRECT • AUTHENTIC
                    </div>
                    <h3 className="text-3xl font-black text-background mb-4 uppercase">
                      ARTIST
                    </h3>
                    <div className="text-6xl font-black text-background mb-2">↕</div>
                    <h3 className="text-3xl font-black text-background mb-4 uppercase">
                      FAN
                    </h3>

                    <div className="border-t-2 border-background pt-4">
                      <p className="text-background/90 text-sm leading-relaxed">
                        Actually talk to the person who made that song you've been obsessed with. Join listening parties. Get early access to tracks. Connect with the scene.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* No Algorithm - Vinyl Record Sleeve */}
              <motion.div
                className="relative"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                viewport={{ once: true }}
              >
                <div className="bg-card border border-foreground p-8 relative">
                  {/* Vinyl record circle */}
                  <div className="absolute -top-6 -right-6 w-16 h-16 bg-foreground rounded-full flex items-center justify-center">
                    <div className="w-4 h-4 bg-card rounded-full"></div>
                  </div>

                  <div className="mb-6">
                    <div className="font-mono text-xs text-muted-foreground mb-2 uppercase tracking-wide">
                      OUR PLATFORM PROMISE
                    </div>
                    <h3 className="text-2xl font-black text-primary mb-2 uppercase tracking-tight">
                      NO ROBOTS
                    </h3>
                    <div className="w-full h-px bg-foreground mb-4"></div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-accent-blue rounded-full"></div>
                      <span className="font-mono text-xs">CHRONOLOGICAL FEED</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-accent-mint rounded-full"></div>
                      <span className="font-mono text-xs">HUMAN CURATION</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-accent-yellow rounded-full"></div>
                      <span className="font-mono text-xs">AUTHENTIC DISCOVERY</span>
                    </div>
                  </div>

                  <p className="text-foreground leading-relaxed text-sm">
                    See posts in order, like a normal human. No robot trying to "optimize your engagement." No mystery playlists. Just music from people you actually chose to follow.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* How It Works Section - Compact 3-Column Grid */}
        <motion.section
          className="mb-32"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-black text-primary mb-4">
              HOW <span className="text-accent-blue">SEDĀ.FM</span> WORKS
            </h2>
            <div className="w-32 h-1 bg-accent-blue mx-auto mb-4"></div>
            <p className="text-muted-foreground font-mono text-sm uppercase tracking-wider">
              [YOUR GUIDE TO THE PLATFORM]
            </p>
          </div>

          {/* Platform Features Grid - Compact 3-Column Layout */}
          <div className="grid md:grid-cols-3 gap-8 relative">

            {/* Social Feed & Discovery */}
            <motion.div
              className="bg-card border-2 border-foreground p-6 relative"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <div className="w-12 h-12 bg-accent-blue rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-background" />
              </div>
              <div className="font-mono text-xs text-muted-foreground mb-2 uppercase tracking-wider">
                STEP_01.CONNECT
              </div>
              <h3 className="text-xl font-black text-primary mb-3">
                SOCIAL FEED & DISCOVERY
              </h3>
              <p className="text-foreground leading-relaxed text-sm mb-4">
                Follow artists and discover music through human curation. Share tracks and build connections. No algorithms – just chronological feeds from people you care about.
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-accent-blue rounded-full"></div>
                  <span className="text-xs font-mono">Follow artists & fans</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-accent-blue rounded-full"></div>
                  <span className="text-xs font-mono">Share discoveries</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-accent-blue rounded-full"></div>
                  <span className="text-xs font-mono">Chronological timeline</span>
                </div>
              </div>
            </motion.div>

            {/* Artist Marketplace */}
            <motion.div
              className="bg-card border border-foreground p-6 relative"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="w-12 h-12 bg-accent-coral rounded-lg flex items-center justify-center mb-4">
                <Music className="w-6 h-6 text-background" />
              </div>
              <div className="font-mono text-xs text-muted-foreground mb-2 uppercase tracking-wider">
                STEP_02.SELL
              </div>
              <h3 className="text-xl font-black text-primary mb-3">
                ARTIST MARKETPLACE
              </h3>
              <p className="text-foreground leading-relaxed text-sm mb-4">
                Set up your digital storefront to sell music, merch, and tickets directly to fans. Keep 90% of sales and 100% ownership of your work.
              </p>
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-accent-coral rounded-full"></div>
                  <span className="text-xs font-mono">Upload & price music</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-accent-coral rounded-full"></div>
                  <span className="text-xs font-mono">Sell merch & tickets</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-accent-coral rounded-full"></div>
                  <span className="text-xs font-mono">Direct fan payments</span>
                </div>
              </div>
              <div className="bg-accent-coral/10 border border-accent-coral/30 p-3 rounded-lg">
                <div className="text-xs font-mono text-accent-coral">
                  10% platform fee • Artist keeps the rest
                </div>
              </div>
            </motion.div>

            {/* Live DJ Sessions */}
            <motion.div
              className="bg-accent-mint text-background p-6 relative border border-accent-mint"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <div className="w-12 h-12 bg-background/20 rounded-lg flex items-center justify-center mb-4">
                <Radio className="w-6 h-6 text-background" />
              </div>
              <div className="font-mono text-xs text-background/80 mb-2 uppercase tracking-wider">
                STEP_03.PERFORM
              </div>
              <h3 className="text-xl font-black text-background mb-3">
                LIVE DJ SESSIONS
              </h3>
              <p className="text-background/90 leading-relaxed text-sm mb-4">
                Host listening parties where fans vote on tracks. Artists premiere music, fans DJ discoveries. Like a house party but global.
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-background rounded-full"></div>
                  <span className="text-xs font-mono text-background/90">Host listening parties</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-background rounded-full"></div>
                  <span className="text-xs font-mono text-background/90">Public or private sessions</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-background rounded-full"></div>
                  <span className="text-xs font-mono text-background/90">Fan voting & real-time chat</span>
                </div>
              </div>
            </motion.div>

          </div>
        </motion.section>

        {/* PBC Section - Why We're Built Different */}
        <motion.section
          className="mb-32"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-black text-primary mb-4">
              BUILT <span className="text-accent-yellow">DIFFERENT</span>
            </h2>
            <div className="w-32 h-1 bg-accent-yellow mx-auto mb-4"></div>
            <p className="text-muted-foreground font-mono text-sm uppercase tracking-wider">
              [PUBLIC BENEFIT CORPORATION • LEGALLY BOUND TO DO GOOD]
            </p>
          </div>

          <div className="space-y-12 relative">

            {/* What PBC Means */}
            <motion.div
              className="bg-accent-yellow border-l-8 border-accent-yellow p-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <div className="mb-6">
                <h3 className="text-2xl font-black text-background mb-1">WHAT'S A PBC?</h3>
                <div className="font-mono text-xs text-background/70">LEGAL_STRUCTURE.EXPLAINED</div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <p className="text-background leading-relaxed mb-6">
                    We're a Delaware Public Benefit Corporation. That's fancy legal speak for: <strong>we're legally required to balance profit with doing good.</strong> Not just morally obligated—literally written into our corporate DNA.
                  </p>

                  <div className="bg-card border border-foreground p-4 rounded-lg font-mono">
                    <div className="text-xs text-muted-foreground mb-2">LEGAL DOCUMENT • ARTICLE III</div>
                    <p className="text-sm text-foreground italic">
                      "To advance a music ecosystem that serves the best interests of musicians, protecting them from exploitative practices and enabling them to retain control and ownership of their work, build equitable careers, and connect directly with fans."
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-card border-2 border-foreground p-6 rounded-lg shadow-lg">
                    <h4 className="font-black text-sm mb-4 text-card-foreground">WHAT THIS MEANS FOR YOU:</h4>
                    <div className="space-y-3 text-sm text-card-foreground">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-accent-coral rounded-full"></div>
                        <span>Artists always come first</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-accent-blue rounded-full"></div>
                        <span>No sketchy pivots or acquisitions</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-accent-mint rounded-full"></div>
                        <span>We can't sell out legally</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-accent-yellow rounded-full"></div>
                        <span>Public reporting required</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Our Legal Commitments */}
            <div className="grid md:grid-cols-2 gap-8 relative">

              {/* Social Benefits */}
              <motion.div
                className="bg-card border-2 border-foreground p-8 relative"
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <div className="font-mono text-xs text-muted-foreground mb-3 uppercase tracking-wide">
                  LEGALLY BINDING PROMISES
                </div>
                <h3 className="text-2xl font-black text-primary mb-6">
                  OUR SOCIAL BENEFITS
                </h3>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-accent-coral rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-black text-background">1</span>
                    </div>
                    <div>
                      <div className="font-black text-sm mb-1">FAIR ARTIST COMPENSATION</div>
                      <p className="text-xs text-muted-foreground">90% revenue share + 100% ownership retention</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-accent-blue rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-black text-background">2</span>
                    </div>
                    <div>
                      <div className="font-black text-sm mb-1">AUTHENTIC HUMAN CONNECTIONS</div>
                      <p className="text-xs text-muted-foreground">No algorithms deciding who you see or hear</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-accent-mint rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-black text-background">3</span>
                    </div>
                    <div>
                      <div className="font-black text-sm mb-1">PRIVACY PROTECTION</div>
                      <p className="text-xs text-muted-foreground">Your data stays yours, we don't sell or track</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-accent-yellow rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-black text-background">4</span>
                    </div>
                    <div>
                      <div className="font-black text-sm mb-1">ACCESSIBLE PLATFORM</div>
                      <p className="text-xs text-muted-foreground">Free tier available for everyone</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-foreground pt-4 mt-6">
                  <p className="text-xs text-muted-foreground">
                    These aren't just nice words. They're legally binding commitments we report on annually.
                  </p>
                </div>
              </motion.div>

              {/* Anti-Big Tech Position */}
              <motion.div
                className="bg-accent-coral text-background p-8 relative border-4 border-accent-coral"
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                viewport={{ once: true }}
              >
                <div className="text-center">
                  <div className="font-mono text-xs text-background/80 mb-4 uppercase tracking-wider">
                    ANTI-BIG TECH MANIFESTO
                  </div>

                  <div className="mb-6">
                    <div className="text-4xl font-black text-background mb-2">≠</div>
                    <h3 className="text-2xl font-black text-background mb-2 uppercase">
                      NOT LIKE THEM
                    </h3>
                    <div className="w-full h-px bg-background mb-4"></div>
                  </div>

                  <div className="space-y-3 mb-6 text-left">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-background rounded-full"></div>
                      <span className="font-mono text-xs text-background/90">NO DATA HARVESTING</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-background rounded-full"></div>
                      <span className="font-mono text-xs text-background/90">NO ENGAGEMENT MANIPULATION</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-background rounded-full"></div>
                      <span className="font-mono text-xs text-background/90">NO ARTIST EXPLOITATION</span>
                    </div>

                  </div>

                  <div className="border-t-2 border-background pt-4">
                    <p className="text-background/90 text-sm leading-relaxed">
                      Big Tech platforms extract value from artists and manipulate fans. We're built to do the opposite—support creators and serve real human connections.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Annual Impact Reporting */}
            <motion.div
              className="bg-card border border-foreground p-8 relative"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <div className="text-center mb-8">
                <div className="font-mono text-xs text-muted-foreground mb-2 uppercase tracking-wide">
                  TRANSPARENCY REPORT • COMING SOON
                </div>
                <h3 className="text-2xl font-black text-primary mb-4">
                  ACCOUNTABILITY BY LAW
                </h3>
              </div>

              <div className="grid md:grid-cols-3 gap-8 text-center">
                <div>
                  <div className="w-12 h-12 bg-accent-coral rounded-lg flex items-center justify-center mb-4 mx-auto">
                    <DollarSign className="w-6 h-6 text-background" />
                  </div>
                  <div className="font-black text-sm mb-1">ARTIST PAYMENTS</div>
                  <p className="text-xs text-muted-foreground">
                    Total paid to artists, average per-artist earnings, payment processing times
                  </p>
                </div>

                <div>
                  <div className="w-12 h-12 bg-accent-blue rounded-lg flex items-center justify-center mb-4 mx-auto">
                    <Users className="w-6 h-6 text-background" />
                  </div>
                  <div className="font-black text-sm mb-1">COMMUNITY IMPACT</div>
                  <p className="text-xs text-muted-foreground">
                    New artist discoveries, fan-artist connections, platform accessibility metrics
                  </p>
                </div>

                <div>
                  <div className="w-12 h-12 bg-accent-mint rounded-lg flex items-center justify-center mb-4 mx-auto">
                    <Shield className="w-6 h-6 text-background" />
                  </div>
                  <div className="font-black text-sm mb-1">PRIVACY & ETHICS</div>
                  <p className="text-xs text-muted-foreground">
                    Data practices, ad policies, algorithm transparency, user rights protection
                  </p>
                </div>
              </div>

              <div className="border-t border-foreground pt-6 mt-8 text-center">
                <p className="text-sm text-muted-foreground font-mono">
                  Annual benefit reports published each year • Filed with Delaware Division of Corporations
                </p>
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* Pricing Philosophy Section */}
        <motion.section
          className="mb-32"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-black text-primary mb-4">
              <span className="text-accent-mint">FAIR</span> PRICING
            </h2>
            <div className="w-32 h-1 bg-accent-mint mx-auto mb-4"></div>
            <p className="text-muted-foreground font-mono text-sm uppercase tracking-wider">
              [NOBODY GETS EXCLUDED FROM GOOD MUSIC]
            </p>
          </div>

          <div className="space-y-8 relative">

            {/* Pricing Philosophy */}
            <motion.div
              className="bg-accent-mint border-l-8 border-accent-mint p-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <h3 className="text-2xl font-black text-background mb-4">OUR PRICING PHILOSOPHY</h3>
              <p className="text-lg text-background leading-relaxed mb-4">
                Music discovery should be accessible to everyone, regardless of financial situation. That's why sedā.fm is completely free for all users. No subscriptions, no paywalls—just great music and direct artist support.
              </p>
              <div className="bg-accent-coral border border-accent-coral p-4 rounded-lg">
                <p className="text-background text-sm leading-relaxed">
                  <strong>For artists:</strong> Zero monthly fees, ever. While competitors charge $20-50+ per month just to upload music, artists on sedā.fm pay nothing to join and share their work. You only pay our 10% fee when you actually make a sale.
                </p>
              </div>
            </motion.div>

            {/* Tier Comparison */}
            <div className="grid md:grid-cols-2 gap-8 relative">

              {/* Discover Tier - Free */}
              <motion.div
                className="bg-card border-2 border-foreground p-8 relative"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
              >
                {/* Tier badge */}
                <div className="absolute -top-3 left-6 bg-accent-blue text-background px-4 py-1 font-mono text-xs uppercase tracking-wider">
                  DISCOVER TIER
                </div>

                <div className="pt-4">
                  <div className="mb-6">
                    <div className="text-6xl font-black text-primary mb-2">FREE</div>
                    <div className="font-mono text-sm text-muted-foreground">FOREVER FREE</div>
                  </div>

                  <div className="space-y-4 mb-8">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-accent-mint" />
                      <span className="text-foreground">Full social feed & discovery</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-accent-mint" />
                      <span className="text-foreground">Join DJ sessions & listen parties</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-accent-mint" />
                      <span className="text-foreground">Follow artists & fans</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-accent-mint" />
                      <span className="text-foreground">Earn credits for engagement</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-accent-mint" />
                      <span className="text-foreground">Support artists with tips</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* All Features - Free */}
              <motion.div
                className="bg-card border-2 border-accent-coral p-8 relative"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                viewport={{ once: true }}
              >
                {/* Tier badge */}
                <div className="absolute -top-3 left-6 bg-accent-coral text-background px-4 py-1 font-mono text-xs uppercase tracking-wider">
                  ALL FEATURES
                </div>

                <div className="pt-4">
                  <div className="mb-6">
                    <div className="text-6xl font-black text-primary mb-2">FREE</div>
                    <div className="font-mono text-sm text-muted-foreground">EVERYTHING INCLUDED</div>
                  </div>

                  <div className="space-y-4 mb-8">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-accent-mint" />
                      <span className="text-foreground">Full social feed & discovery</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-accent-mint" />
                      <span className="text-foreground">Host your own DJ sessions</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-accent-mint" />
                      <span className="text-foreground">Advanced discovery features</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-accent-mint" />
                      <span className="text-foreground">Support artists directly</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Credit System Explanation */}
            <motion.div
              className="bg-accent-yellow border border-accent-yellow p-8 rounded-lg"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <div className="mb-6">
                <div>
                  <h3 className="text-2xl font-black text-background mb-1">PLATFORM CREDITS</h3>
                  <div className="font-mono text-xs text-background/70">ENGAGEMENT_REWARDS.SYSTEM</div>
                </div>
              </div>

              <p className="text-background leading-relaxed mb-6">
                Earn credits through platform engagement. Active community members get rewarded for sharing great music, supporting artists, and contributing to the ecosystem. Credits can be used to support your favorite artists.
              </p>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-accent-blue rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Music className="w-6 h-6 text-card" />
                  </div>
                  <div className="font-black text-sm mb-1 text-background">SHARE MUSIC</div>
                  <div className="text-xs text-background/70">Posts with upvotes earn credits</div>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-accent-coral rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Heart className="w-6 h-6 text-card" />
                  </div>
                  <div className="font-black text-sm mb-1 text-background">TIP ARTISTS</div>
                  <div className="text-xs text-background/70">Supporting creators earns bonus credits</div>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-accent-mint rounded-lg flex items-center justify-center mx-auto mb-3">
                    <TrendingUp className="w-6 h-6 text-card" />
                  </div>
                  <div className="font-black text-sm mb-1 text-background">STAY ACTIVE</div>
                  <div className="text-xs text-background/70">Weekly engagement builds credit balance</div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.section>
      </div>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-16">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 text-center">


          <div className="text-center py-4">
            <p className="text-muted-foreground text-xs">
              © 2024 sedā.fm • Built different • For the culture
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
