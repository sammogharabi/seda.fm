# sedā.fm

**Real-time music-centric social platform where artists keep 90% of sales and 100% ownership.**

sedā.fm is a Public Benefit Corporation (PBC) building a streaming-agnostic music community that puts artists first. Share, discover, and DJ music together in real time while supporting artists directly.

## 🎵 Features

### Core Platform
- **Social Feed** - Chronological timeline with music sharing and discovery
- **Real-time DJ Mode** - Turn-based DJing with crowd voting and auto-skip
- **Channel-based Discovery** - Genre-specific communities (#hiphop, #jazz, etc.)
- **Following System** - Connect with artists and fellow music lovers
- **Streaming-agnostic** - Works with your existing music services

### Artist-First Economics
- **90% of sales** go directly to artists
- **100% ownership** retained by artists
- **Direct fan connection** without platform interference
- **Transparent royalty system**

### Social Features
- **Now Playing** - See what your friends are listening to
- **Leaderboards** - Top DJs and most played tracks
- **Playlists** - Collaborative and personal collections
- **Live Notifications** - Join friends' DJ sessions instantly

## 🎨 Design Philosophy

sedā.fm embraces an **underground zine aesthetic** that feels like a cultural movement rather than a corporate platform. Our design draws inspiration from:

- Authentic music memorabilia (polaroids, backstage passes, vinyl sleeves)
- Independent music publications and zines
- Anti-Big Tech positioning
- Community-driven culture

## 🏗 Tech Stack

- **Frontend**: React 18 + TypeScript + Tailwind CSS v4
- **Animation**: Motion (formerly Framer Motion)
- **Backend**: Supabase (optional - app works offline)
- **Deployment**: GitHub Pages / Vercel / Netlify
- **PWA**: Mobile-optimized with offline support

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/seda-fm.git
cd seda-fm

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Variables (Optional)

For full backend functionality, add these to your deployment environment:

```env
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

**Note**: The app works completely frontend-only without these variables, using localStorage for persistence.

## 📱 PWA Support

sedā.fm is designed as a Progressive Web App (PWA) for mobile-first experiences:

- **Installable** on iOS and Android
- **Offline functionality** for core features
- **Push notifications** for DJ sessions
- **Mobile-optimized** touch interfaces

## 🌐 Deployment

### GitHub Pages (Recommended)

```bash
# Build and deploy to GitHub Pages
npm run deploy
```

### Manual Deployment

```bash
# Build for production
npm run build

# Deploy the dist/ folder to your hosting platform
```

### Supported Platforms
- GitHub Pages
- Vercel
- Netlify
- Cloudflare Pages
- Any static hosting service

## 🎯 About sedā.fm

### Public Benefit Corporation (PBC)

We're legally structured as a Public Benefit Corporation, which means we're **legally bound** to:

- Advance a music ecosystem that serves musicians' best interests
- Protect artists from exploitative practices
- Enable artists to retain control and ownership of their work
- Help artists build equitable, sustainable careers
- Facilitate direct artist-fan connections

### Anti-Big Tech Mission

sedā.fm stands against the current music industry model where:
- Streaming platforms take 30-70% of artist revenue
- Algorithms control music discovery
- Artists have no direct relationship with fans
- Corporate interests override artistic integrity

### Community-Driven

Our platform prioritizes:
- **Authentic music discovery** over algorithmic manipulation
- **Real human connections** over engagement metrics  
- **Fair compensation** over platform profit maximization
- **Cultural movements** over corporate music marketing

## 🤝 Contributing

We welcome contributions from the music and developer communities! This is an open-source project building tools for artists and music lovers.

### Ways to Contribute
- **Code** - Frontend features, mobile improvements, accessibility
- **Design** - UI/UX improvements, iconography, branding
- **Music** - Artist feedback, feature requests, community building
- **Testing** - Bug reports, mobile testing, user feedback

## 📄 License

This project is open source. We believe in building tools for the music community, by the music community.

## 🎸 Join the Movement

sedā.fm isn't just a platform - it's a movement toward a more equitable music ecosystem. Whether you're an artist, developer, or music lover, there's a place for you in our community.

**Ready to experience music differently?**

Visit [sedā.fm](https://yourusername.github.io/seda-fm) and join the beta waitlist.

---

*Built with ❤️ for the music community*