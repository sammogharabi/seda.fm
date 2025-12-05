import React from 'react';
import ReactDOM from 'react-dom/client';
import AboutApp from './AboutApp.tsx';
import './styles/globals.css';

// Create root and render the about app
const root = ReactDOM.createRoot(document.getElementById('about-root')!);
root.render(
  <React.StrictMode>
    <AboutApp />
  </React.StrictMode>
);