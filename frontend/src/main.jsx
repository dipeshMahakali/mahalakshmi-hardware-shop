import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

// ==============================================================================
// ⚡ DEVELOPER SIGNATURE & SYSTEM ARCHITECTURE WATERMARK
// ==============================================================================
if (typeof window !== 'undefined') {
  console.log(
    '%c ⚡ SHRI MAHALAKSHMI TRADER %c Architected & Engineered by Dipesh Mahakali ',
    'background: #121418; color: #F47B20; font-size: 11px; font-weight: 700; padding: 4px 8px; border-radius: 4px 0 0 4px; border: 1px solid rgba(244, 123, 32, 0.4);',
    'background: #F47B20; color: #0E1013; font-size: 11px; font-weight: 800; padding: 4px 8px; border-radius: 0 4px 4px 0;'
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
