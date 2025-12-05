# sedā.fm Deployment Guide

## 🚀 GitHub Pages Deployment (Recommended)

### One-time Setup

1. **Push your code to GitHub:**
   ```bash
   git add .
   git commit -m "Initial sedā.fm app with integrated about page"
   git push origin main
   ```

2. **Install deployment dependencies:**
   ```bash
   npm install
   ```

3. **Deploy to GitHub Pages:**
   ```bash
   npm run deploy
   ```

### Enable GitHub Pages

1. Go to your GitHub repository
2. Click **Settings** tab
3. Scroll to **Pages** section
4. Set source to **Deploy from a branch**
5. Choose **gh-pages** branch
6. Click **Save**

Your app will be available at: `https://yourusername.github.io/seda-fm/`

## 🎯 About Page Integration

Your about page is **fully integrated** with URL-based routing! Users can access it via:

- **Desktop**: "About" link in the sidebar
- **Mobile**: Menu → "About" option  
- **Direct URL**: `https://yourusername.github.io/seda-fm/about`
- **Custom domain**: `seda.fm/about` (once you set up custom domain)

### URL Routing Features
- ✅ **Direct linking**: Share `seda.fm/about` links directly
- ✅ **Browser back/forward**: Full browser navigation support
- ✅ **SEO friendly**: Proper meta tags for each route
- ✅ **Social sharing**: About page has its own Open Graph tags

### About Page Features
- ✅ Complete zine-style design with underground aesthetic
- ✅ Sticky email signup with "90% of sales" messaging  
- ✅ PBC legal structure explanation
- ✅ Anti-Big Tech positioning
- ✅ Mobile-optimized with safe area support
- ✅ SEO optimized with proper meta tags

## 📧 Email Collection

The app includes robust email collection with multiple fallback strategies:

### Production (with Supabase)
Add environment variables to your hosting platform:
- `VITE_SUPABASE_URL` = your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` = your Supabase anon key

### Development/Frontend-only
- Emails automatically save to localStorage
- No backend setup required
- Users always see success messages

## 🌐 Alternative Deployment Options

### Vercel
1. Connect your GitHub repo to Vercel
2. Add environment variables in dashboard
3. Deploy automatically on push

### Netlify  
1. Connect your GitHub repo to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables

### Custom Domain
Once deployed, you can add a custom domain like `seda.fm` in your hosting platform's settings.

## 📱 PWA Features

Your app is PWA-ready with:
- **Installable** on mobile devices
- **Offline functionality** for core features
- **Push notifications** (when backend is connected)
- **Mobile-optimized** touch interfaces
- **Dark theme** with proper safe areas

## 🎵 Ready to Launch

Your sedā.fm app includes:

### Core Features  
- ✅ **Social feed** with music sharing
- ✅ **DJ Mode** with real-time sessions
- ✅ **Channel-based discovery** (#hiphop, #jazz, etc.)
- ✅ **Following system** and notifications
- ✅ **Now Playing** with persistent player

### Marketing Ready
- ✅ **Complete about page** showcasing your mission
- ✅ **Email collection** for beta waitlist
- ✅ **SEO optimization** with meta tags
- ✅ **Social media ready** with Open Graph tags
- ✅ **Professional design** with underground aesthetic

### Technical Excellence
- ✅ **Mobile-first PWA** with offline support
- ✅ **Responsive design** for all screen sizes  
- ✅ **Performance optimized** with code splitting
- ✅ **Accessibility compliant** with ARIA support
- ✅ **Production ready** with error handling

## 🎸 Launch Checklist

Before going live:
- [ ] Update repository name to `seda-fm`
- [ ] Update GitHub Pages URL in README
- [ ] Test email signup functionality
- [ ] Test mobile/PWA installation
- [ ] Update social media meta tags with actual URLs
- [ ] Add analytics (Google Analytics, etc.)
- [ ] Set up Supabase for production email collection

## 🎯 URL Structure After Deployment

Your app will support these URLs:

- **Main app**: `https://yourusername.github.io/seda-fm/`
- **About page**: `https://yourusername.github.io/seda-fm/about`

### Custom Domain Setup (Optional)
Once you add a custom domain (`seda.fm`):
- **Main app**: `https://seda.fm/`
- **About page**: `https://seda.fm/about`

**Ready to launch sedā.fm and start building your music community!** 🎵