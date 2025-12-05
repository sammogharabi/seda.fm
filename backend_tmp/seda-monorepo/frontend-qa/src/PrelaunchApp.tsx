import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from './components/ui/sonner';
import { AboutPage } from './pages/about/AboutPage';
import BetaSignupsAdmin from './pages/admin/BetaSignupsAdmin';
import { SuccessPage } from './pages/about/SuccessPage';

export default function PrelaunchApp() {
  useEffect(() => {
    // Ensure dark theme and meta tags for a polished landing page
    document.documentElement.classList.add('dark');

    const ensureMeta = (name: string, content: string) => {
      let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        el.name = name;
        document.head.appendChild(el);
      }
      el.content = content;
    };

    ensureMeta('viewport', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover');
    ensureMeta('theme-color', '#000000');
    ensureMeta('apple-mobile-web-app-capable', 'yes');
    ensureMeta('apple-mobile-web-app-status-bar-style', 'black-translucent');
  }, []);

  const hasAdminKey = (import.meta as any).env?.VITE_ADMIN_KEY ? true : false;
  const showAdminLink = (() => {
    try {
      const url = new URL(window.location.href);
      if (url.searchParams.get('admin') === '1') {
        localStorage.setItem('admin_hint', '1');
        return true;
      }
      return localStorage.getItem('admin_hint') === '1';
    } catch {
      return false;
    }
  })();

  return (
    <Router>
      <div className="fixed top-3 right-3 z-50">
        <button
          onClick={() => {
            try { localStorage.setItem('prelaunch_override', 'true'); } catch {}
            location.reload();
          }}
          className="text-xs px-2 py-1 rounded-md bg-card/80 border border-border hover:bg-card transition-colors"
          title="Enter the app"
        >
          Enter App
        </button>
      </div>
      {hasAdminKey && showAdminLink && (
        <div className="fixed bottom-3 right-3 z-50">
          <a
            href="/admin/beta"
            className="text-xs px-2 py-1 rounded-md bg-card/80 border border-border hover:bg-card transition-colors"
            title="Admin"
          >
            Admin
          </a>
        </div>
      )}
      <Routes>
        {/* Admin view for signups (no auth in UAT) */}
        <Route path="/admin/beta" element={<BetaSignupsAdmin />} />
        {/* Route everything else to About for prelaunch */}
        <Route path="/about/success" element={<SuccessPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/*" element={<Navigate to="/about" replace />} />
      </Routes>
      <Toaster />
    </Router>
  );
}
