// API Configuration — Vercel-compatible
// All API calls use relative /api/ paths — no cross-origin needed
// Works both locally (via Vite proxy → vercel dev) and on Vercel

export const API_CONFIG = {
    HOST: "",
    BASE_URL: "/api",
    AUTH: "/api/auth",
    CONSULTANT: "/api/consultant",
    ADMIN: "/api/admin",
    BAZI: "/api",
}

export default API_CONFIG
