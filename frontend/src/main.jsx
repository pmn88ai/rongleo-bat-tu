import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import './scroll-fix.css'   // Mobile scroll fixes — must come after index.css

console.log("🚀 BaZi App Version 3.0 - Loaded");
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
