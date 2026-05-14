/**
 * Google Analytics 4 — gtag integration
 * Loaded only when VITE_GA_ID is set in environment.
 * Tracks page_view on route changes via history API.
 */

const GA_MEASUREMENT_ID = typeof import.meta !== 'undefined' ? import.meta.env.VITE_GA_ID : '';

let initialized = false;

export function initGA() {
    if (initialized || !GA_MEASUREMENT_ID) return;
    initialized = true;

    // Load gtag script
    const script = document.createElement('script');
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    script.async = true;
    document.head.appendChild(script);

    // Initialize gtag
    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', GA_MEASUREMENT_ID, {
        send_page_view: true,
    });

    console.log(`[GA] Initialized: ${GA_MEASUREMENT_ID}`);
}

export function trackPageView(path) {
    if (!window.gtag || !GA_MEASUREMENT_ID) return;
    window.gtag('event', 'page_view', {
        page_path: path,
        page_title: document.title,
        send_to: GA_MEASUREMENT_ID,
    });
}

export function isGAEnabled() {
    return !!GA_MEASUREMENT_ID;
}
