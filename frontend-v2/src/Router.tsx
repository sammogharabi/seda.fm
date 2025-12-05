import React, { useState, useEffect } from 'react';

export function useRouter() {
  const [currentPath, setCurrentPath] = useState(() => {
    if (typeof window !== 'undefined') {
      // Handle GitHub Pages base path
      const path = window.location.pathname;
      if (path.startsWith('/seda-fm')) {
        return path.replace('/seda-fm', '') || '/';
      }
      return path;
    }
    return '/';
  });

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path.startsWith('/seda-fm')) {
        setCurrentPath(path.replace('/seda-fm', '') || '/');
      } else {
        setCurrentPath(path);
      }
    };

    window.addEventListener('popstate', handlePopState);
    
    // Handle initial load
    const path = window.location.pathname;
    if (path.startsWith('/seda-fm')) {
      setCurrentPath(path.replace('/seda-fm', '') || '/');
    } else {
      setCurrentPath(path);
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const navigate = (path: string) => {
    // Handle GitHub Pages base path in production
    const basePath = process.env.NODE_ENV === 'production' ? '/seda-fm' : '';
    const fullPath = basePath + path;
    window.history.pushState({}, '', fullPath);
    setCurrentPath(path);
  };

  const isAboutPage = currentPath === '/about';

  return {
    currentPath,
    navigate,
    isAboutPage
  };
}