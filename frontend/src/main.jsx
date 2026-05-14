import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import './scroll-fix.css'   // Mobile scroll fixes — must come after index.css
import { initGA, trackPageView } from './analytics/ga4'
import { initClarity } from './analytics/clarity'

// Initialize analytics on app load
initGA();
initClarity();

// Google Site Verification (optional, from env)
const verificationToken = import.meta.env.VITE_GOOGLE_SITE_VERIFICATION;
if (verificationToken) {
    const meta = document.createElement('meta');
    meta.name = 'google-site-verification';
    meta.content = verificationToken;
    document.head.appendChild(meta);
}

// Track SPA page views via History API
const origPushState = history.pushState;
history.pushState = function(...args) {
    origPushState.apply(this, args);
    trackPageView(location.pathname);
};
window.addEventListener('popstate', () => {
    trackPageView(location.pathname);
});

console.log("🚀 BaZi App Version 3.0 - Loaded");
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
