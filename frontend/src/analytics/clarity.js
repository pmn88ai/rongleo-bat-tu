/**
 * Microsoft Clarity — heatmaps + session recordings
 * Loaded only when VITE_CLARITY_ID is set in environment.
 */

const CLARITY_ID = typeof import.meta !== 'undefined' ? import.meta.env.VITE_CLARITY_ID : '';

let initialized = false;

export function initClarity() {
    if (initialized || !CLARITY_ID) return;
    initialized = true;

    (function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src='https://www.clarity.ms/tag/'+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, 'clarity', 'script', CLARITY_ID);

    console.log(`[Clarity] Initialized: ${CLARITY_ID}`);
}

export function isClarityEnabled() {
    return !!CLARITY_ID;
}
