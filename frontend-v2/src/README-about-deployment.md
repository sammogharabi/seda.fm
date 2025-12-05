# sedā.fm About Page - Standalone Deployment

This is a standalone deployment of the sedā.fm about page with email collection functionality.

## 🚀 Quick Deploy Options

### Option 1: Vercel (Recommended)
1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Build the about page:**
   ```bash
   npm run build-about
   ```

3. **Deploy to Vercel:**
   ```bash
   # Install Vercel CLI if you haven't
   npm i -g vercel
   
   # Deploy the dist-about folder
   cd dist-about
   vercel --prod
   ```

4. **Optional: Add Supabase Environment Variables in Vercel Dashboard:**
   - `VITE_SUPABASE_URL` = your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` = your Supabase anon key

### Option 2: Netlify
1. **Build:**
   ```bash
   npm install
   npm run build-about
   ```

2. **Deploy:**
   - Drag the `dist-about` folder to netlify.com
   - Or connect your GitHub repo and set build command to `npm run build-about` and publish directory to `dist-about`

### Option 3: GitHub Pages
1. **Build:**
   ```bash
   npm install
   npm run build-about
   ```

2. **Deploy:**
   - Push the `dist-about` contents to a `gh-pages` branch
   - Enable GitHub Pages in repository settings

## 📧 Email Collection

The about page includes email signup functionality with multiple fallback strategies:

- **✅ Real Supabase Database** (if environment variables are configured)
- **✅ localStorage Fallback** (works without any backend setup)
- **✅ Graceful Error Handling** (never breaks user experience)

## 🎯 Features Included

- **Complete About Page** with zine-style design
- **Sticky Email Signup** with "90% of sales" messaging
- **Dark Theme** with proper mobile support
- **PWA Ready** with meta tags and theming
- **Mobile Optimized** with safe area support
- **SEO Optimized** with meta tags and Open Graph

## 🛠 Local Development

```bash
# Install dependencies
npm install

# Start dev server for about page
npm run dev -- --config vite.about.config.js

# Or build and preview
npm run build-about
npm run preview-about
```

## 🎵 About sedā.fm

This about page showcases sedā.fm's mission as a Public Benefit Corporation (PBC) focused on:

- **90% of sales** go to artists
- **100% ownership** retained by artists  
- **Anti-Big Tech** positioning
- **Underground zine aesthetic**
- **Music community focus**

The page emphasizes the platform's role as a cultural movement rather than a corporate platform.

## 📱 Mobile & PWA Support

The about page is fully optimized for mobile with:
- Proper viewport configuration
- Safe area insets for notched devices
- Touch-friendly interface elements
- Dark theme with proper contrast
- PWA-ready meta tags

## 🎨 Design System

Uses sedā.fm's complete design system with:
- Fast Company inspired typography
- Underground music memorabilia aesthetics
- Professional spacing and layouts
- Custom accent colors (coral, blue, mint, yellow)
- Responsive breakpoints

Ready to deploy your sedā.fm about page and start collecting beta signups! 🎸