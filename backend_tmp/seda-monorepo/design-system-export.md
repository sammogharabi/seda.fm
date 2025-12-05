# sedā.fm Design System Export

## Colors
```css
/* Background & Surfaces */
--background: #000000;           /* Pure black main background */
--card: #111111;                 /* Surface/card background */
--secondary: #1a1a1a;           /* Secondary surface (inputs, hover states) */
--sidebar: #0a0a0a;             /* Sidebar background (darker than main) */

/* Borders & Outlines */
--border: #333333;              /* Default borders */
--sidebar-border: #333333;      /* Sidebar borders */
--ring: #666666;                /* Focus rings and accents */

/* Primary & Interactive */
--primary: #ffffff;             /* Primary buttons, active states */
--primary-foreground: #000000;  /* Text on primary elements */

/* Text Colors */
--foreground: #ffffff;          /* Primary text color */
--muted-foreground: #a3a3a3;   /* Secondary/muted text */

/* Status Colors */
--destructive: #ef4444;         /* Error/destructive actions */
--destructive-foreground: #ffffff;

/* Chart/Data Colors */
--chart-1: #ffffff;  --chart-2: #a3a3a3;  --chart-3: #737373;
--chart-4: #525252;  --chart-5: #404040;
```

## Radii
```css
--radius-sm: calc(var(--radius) - 4px);  /* 8px - Small elements */
--radius-md: calc(var(--radius) - 2px);  /* 10px - Medium elements */
--radius-lg: var(--radius);              /* 12px - Large elements/cards */
--radius-xl: calc(var(--radius) + 4px);  /* 16px - Modal/major elements */
```

## Shadows
```css
/* Card Elevation */
.shadow-sm    /* Subtle card hover: 0 1px 2px rgba(0,0,0,0.2) */
.shadow-md    /* Default card: 0 4px 6px rgba(0,0,0,0.3) */
.shadow-lg    /* Elevated cards: 0 8px 16px rgba(0,0,0,0.4) */

/* Modal/Dialog */
.shadow-2xl   /* Modals: 0 20px 40px rgba(0,0,0,0.6) */

/* Footer/Sticky Elements */
.shadow-lg    /* NowPlaying bar: 0 -4px 16px rgba(0,0,0,0.4) */
```

## Spacing Ramp
```css
/* Tailwind spacing scale (your app uses): */
1  = 4px    /* Tiny gaps */
2  = 8px    /* Small gaps */
3  = 12px   /* Standard gaps */
4  = 16px   /* Default padding */
5  = 20px   /* Medium spacing */
6  = 24px   /* Large spacing */
8  = 32px   /* Section spacing */
12 = 48px   /* Major spacing */
16 = 64px   /* Component padding */
20 = 80px   /* Large component margins */
```

## Typography
```css
/* Font Weights */
--font-weight-normal: 500;  /* Body text */
--font-weight-medium: 600;  /* Headings, buttons, labels */

/* Font Sizes & Line Heights */
/* Title/H1 */ font-size: var(--text-2xl); font-weight: 600; line-height: 1.5;
/* H2 */       font-size: var(--text-xl);  font-weight: 600; line-height: 1.5;
/* H3 */       font-size: var(--text-lg);  font-weight: 600; line-height: 1.5;
/* Body/H4 */  font-size: var(--text-base); font-weight: 500; line-height: 1.5;
/* Small */    font-size: var(--text-sm);  font-weight: 500; line-height: 1.4;

/* Base font size */
html { font-size: 14px; }
```

## Motion System
```css
/* Default Duration & Easing */
transition-duration: 200ms;
transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); /* ease-out */

/* Special Animations */
/* Button Tap */
.hover:scale-105 { transition: transform 150ms ease-out; }

/* List Row Enter */
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.3, ease: "easeOut" }}

/* NowPlaying Enter */
initial={{ opacity: 0, y: 40 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }} /* Custom easing */

/* DJ Session Pulse */
animate={{ scale: [1, 1.05, 1] }}
transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
```

## NowPlaying Component Specs

### Mobile (isMobile: true)
```css
/* Heights & Layout */
height: auto;                    /* Dynamic based on content */
padding: 12px;                   /* p-3 */

/* Artwork */
width: 40px; height: 40px;       /* w-10 h-10 */
border-radius: 8px;              /* rounded-lg */

/* Typography */
title: text-sm font-medium;      /* 14px, weight 600 */
artist: text-xs muted-foreground; /* 12px, #a3a3a3 */
```

### Desktop (isMobile: false)
```css
/* Heights & Layout */
height: auto;                    /* Dynamic based on content */
padding: 20px;                   /* p-5 */

/* Artwork */
width: 56px; height: 56px;       /* w-14 h-14 */
border-radius: 8px;              /* rounded-lg */

/* Typography */
title: text-sm font-medium;      /* 14px, weight 600 */
artist: text-xs muted-foreground; /* 12px, #a3a3a3 */
```

### Gradient & Dividers
```css
/* Top Divider Gradient */
background: linear-gradient(
  to right,
  var(--border),           /* #333333 */
  transparent,
  var(--border)
);
opacity: 0.6;
height: 1px;

/* Card Background */
background: rgba(var(--card), 0.98);    /* #111111 with 98% opacity */
backdrop-filter: blur(12px);
```

### Live Pulse Animation
```css
/* DJ Session Live Indicator */
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Live Dot */
background-color: var(--destructive);   /* #ef4444 red */
width: 8px; height: 8px;               /* w-2 h-2 */
border-radius: 50%;
animation: pulse 1.5s ease-in-out infinite;

/* Equalizer Bars (if used) */
.equalizer-bar {
  background: var(--ring);              /* #666666 */
  animation: equalizer 1.2s ease-in-out infinite;
  animation-delay: calc(var(--bar-index) * 0.1s);
}

@keyframes equalizer {
  0%, 100% { height: 4px; }
  50% { height: 16px; }
}
```

## Mobile-Specific Specs
```css
/* Touch Targets */
min-height: 44px;               /* All interactive elements */

/* Safe Areas */
.pb-safe { padding-bottom: env(safe-area-inset-bottom); }
.pt-safe { padding-top: env(safe-area-inset-top); }

/* Bottom Navigation */
height: 64px;                   /* Fixed height */
padding-bottom: env(safe-area-inset-bottom);

/* NowPlaying Mobile Position */
position: fixed;
bottom: 64px;                   /* Above mobile nav */
left: 0; right: 0;
z-index: 30;
```

## Component Export Summary

**Copy/Paste Ready:**
```jsx
// Colors
const colors = {
  background: '#000000',
  card: '#111111', 
  border: '#333333',
  ring: '#666666',
  primary: '#ffffff',
  muted: '#a3a3a3',
  destructive: '#ef4444'
};

// Radii
const radii = { sm: '8px', md: '10px', lg: '12px', xl: '16px' };

// Shadows  
const shadows = { sm: 'shadow-sm', md: 'shadow-md', lg: 'shadow-lg' };

// Motion
const motion = {
  duration: '200ms',
  easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  spring: [0.23, 1, 0.32, 1]
};

// NowPlaying
const nowPlaying = {
  mobile: { artwork: '40px', padding: '12px' },
  desktop: { artwork: '56px', padding: '20px' },
  pulse: { color: '#ef4444', period: '1.5s' }
};
```