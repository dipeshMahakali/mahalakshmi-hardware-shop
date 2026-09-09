import React from 'react';

export function HardwareSVG({ type, width = 300, height = 300 }) {
  switch (type) {
    case 'smart_lock':
      return (
        <svg width={width} height={height} viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2A2C30"/>
              <stop offset="50%" stopColor="#18191B"/>
              <stop offset="100%" stopColor="#0E0F10"/>
            </linearGradient>
            <linearGradient id="glassGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1E2024"/>
              <stop offset="100%" stopColor="#0B0C0E"/>
            </linearGradient>
            <linearGradient id="accentOrange" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#F47B20"/>
              <stop offset="100%" stopColor="#FF9642"/>
            </linearGradient>
            <radialGradient id="ringGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#F47B20" stopOpacity="0.8"/>
              <stop offset="100%" stopColor="#F47B20" stopOpacity="0"/>
            </radialGradient>
            <filter id="shadowGlow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#000" floodOpacity="0.4"/>
            </filter>
          </defs>
          
          <rect x="110" y="30" width="80" height="240" rx="16" fill="url(#bodyGrad)" filter="url(#shadowGlow)" stroke="#3A3D42" strokeWidth="2"/>
          <rect x="114" y="34" width="72" height="232" rx="12" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5"/>
          <rect x="120" y="44" width="60" height="110" rx="8" fill="url(#glassGrad)" stroke="#2B2D32"/>
          
          <g fill="#E2E8F0" fontFamily="sans-serif" fontSize="11" fontWeight="600" textAnchor="middle" opacity="0.9">
            <text x="135" y="66">1</text><text x="150" y="66">2</text><text x="165" y="66">3</text>
            <text x="135" y="84">4</text><text x="150" y="84">5</text><text x="165" y="84">6</text>
            <text x="135" y="102">7</text><text x="150" y="102">8</text><text x="165" y="102">9</text>
            <text x="135" y="120">*</text><text x="150" y="120">0</text><text x="165" y="120">#</text>
          </g>

          <path d="M142 135 C146 132, 154 132, 158 135 M144 138 C147 136, 153 136, 156 138" stroke="#F47B20" strokeWidth="1.5" strokeLinecap="round"/>
          
          <circle cx="150" cy="190" r="18" fill="#121315" stroke="url(#accentOrange)" strokeWidth="2.5"/>
          <circle cx="150" cy="190" r="22" fill="url(#ringGlow)"/>
          <path d="M144 190 A6 6 0 0 1 156 190 M142 193 A9 9 0 0 1 158 193 M146 186 A4 4 0 0 1 154 186" stroke="#F47B20" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
          
          <circle cx="150" cy="245" r="5" fill="#0A0B0C" stroke="#4A4D52"/>
          <rect x="149" y="245" width="2" height="5" fill="#4A4D52"/>
        </svg>
      );

    case 'handle_lever':
    case 'handle_lever_gold':
      const isGold = type === 'handle_lever_gold';
      const fillGrad = isGold ? 'url(#goldGrad)' : 'url(#brassGrad)';
      return (
        <svg width={width} height={height} viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="brassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#E2B870"/>
              <stop offset="35%" stopColor="#C5A059"/>
              <stop offset="70%" stopColor="#F2D193"/>
              <stop offset="100%" stopColor="#9C7733"/>
            </linearGradient>
            <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F3E5AB"/>
              <stop offset="40%" stopColor="#D4AF37"/>
              <stop offset="75%" stopColor="#FFF2A3"/>
              <stop offset="100%" stopColor="#AA820A"/>
            </linearGradient>
            <filter id="handleShadow" x="-10%" y="-10%" width="130%" height="130%">
              <feDropShadow dx="4" dy="12" stdDeviation="10" floodColor="#000" floodOpacity="0.25"/>
            </filter>
          </defs>
          
          <rect x="125" y="40" width="50" height="220" rx="8" fill={fillGrad} filter="url(#handleShadow)"/>
          <rect x="129" y="44" width="42" height="212" rx="5" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1"/>
          
          <circle cx="150" cy="210" r="8" fill="#1C1E21"/>
          <polygon points="146,210 154,210 156,226 144,226" fill="#1C1E21"/>
          
          <circle cx="150" cy="95" r="20" fill={fillGrad} stroke="rgba(0,0,0,0.3)" strokeWidth="1"/>
          <circle cx="150" cy="95" r="14" fill="#202020"/>
          
          <g filter="url(#handleShadow)">
            <path d="M142 85 C142 85, 240 70, 255 72 C265 74, 270 82, 268 92 C265 102, 255 106, 240 105 L142 105 Z" fill={fillGrad}/>
            <path d="M145 88 L250 76" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round"/>
          </g>
          
          <circle cx="150" cy="55" r="3" fill="#2A2A2A"/>
          <circle cx="150" cy="245" r="3" fill="#2A2A2A"/>
        </svg>
      );

    case 'hinge_hydraulic':
      return (
        <svg width={width} height={height} viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="ssGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#E2E8F0"/>
              <stop offset="40%" stopColor="#CBD5E1"/>
              <stop offset="70%" stopColor="#F1F5F9"/>
              <stop offset="100%" stopColor="#94A3B8"/>
            </linearGradient>
            <linearGradient id="damperGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#CD7F32"/>
              <stop offset="100%" stopColor="#B87333"/>
            </linearGradient>
          </defs>
          
          <rect x="50" y="80" width="80" height="140" rx="8" fill="url(#ssGrad)" stroke="#64748B"/>
          <circle cx="70" cy="100" r="6" fill="#1E293B"/><circle cx="70" cy="200" r="6" fill="#1E293B"/>
          <circle cx="110" cy="120" r="6" fill="#1E293B"/><circle cx="110" cy="180" r="6" fill="#1E293B"/>

          <path d="M130 110 L200 90 L210 130 L220 130 C235 130, 245 140, 245 155 C245 170, 235 180, 220 180 L200 180 L130 190 Z" fill="url(#ssGrad)" stroke="#475569"/>
          
          <rect x="145" y="140" width="45" height="20" rx="4" fill="url(#damperGrad)" stroke="#885018"/>
          
          <circle cx="220" cy="155" r="30" fill="url(#ssGrad)" stroke="#475569" strokeWidth="2"/>
          <circle cx="220" cy="155" r="22" fill="#0F172A"/>
          <rect x="210" y="115" width="20" height="80" rx="4" fill="url(#ssGrad)"/>
          <circle cx="220" cy="125" r="4" fill="#334155"/>
          <circle cx="220" cy="185" r="4" fill="#334155"/>
        </svg>
      );

    case 'drawer_slide':
      return (
        <svg width={width} height={height} viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="slideGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#94A3B8"/>
              <stop offset="50%" stopColor="#E2E8F0"/>
              <stop offset="100%" stopColor="#64748B"/>
            </linearGradient>
          </defs>

          <rect x="30" y="140" width="240" height="30" rx="4" fill="url(#slideGrad)" stroke="#475569"/>
          <rect x="60" y="145" width="200" height="20" rx="3" fill="#CBD5E1" stroke="#64748B"/>
          
          <g fill="#475569">
            <circle cx="80" cy="155" r="4"/><circle cx="100" cy="155" r="4"/>
            <circle cx="120" cy="155" r="4"/><circle cx="140" cy="155" r="4"/>
            <circle cx="160" cy="155" r="4"/><circle cx="180" cy="155" r="4"/>
            <circle cx="200" cy="155" r="4"/><circle cx="220" cy="155" r="4"/>
          </g>

          <rect x="90" y="148" width="180" height="14" rx="2" fill="#F8FAFC" stroke="#94A3B8"/>
          <rect x="35" y="148" width="40" height="14" rx="3" fill="#F47B20"/>
          <rect x="75" y="152" width="15" height="6" fill="#475569"/>
        </svg>
      );

    case 'padlock_brass':
      return (
        <svg width={width} height={height} viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="shackleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#E2E8F0"/>
              <stop offset="50%" stopColor="#94A3B8"/>
              <stop offset="100%" stopColor="#475569"/>
            </linearGradient>
            <linearGradient id="bodyBrass" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F3E5AB"/>
              <stop offset="50%" stopColor="#D4AF37"/>
              <stop offset="100%" stopColor="#997A15"/>
            </linearGradient>
          </defs>

          <path d="M100 140 L100 90 C100 60, 200 60, 200 90 L200 140" fill="none" stroke="url(#shackleGrad)" strokeWidth="22" strokeLinecap="round"/>
          <rect x="80" y="125" width="140" height="120" rx="12" fill="url(#bodyBrass)" stroke="#7A600B" strokeWidth="2"/>
          <rect x="86" y="131" width="128" height="108" rx="8" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5"/>
          
          <circle cx="150" cy="185" r="16" fill="#1E2024"/>
          <polygon points="145,185 155,185 157,205 143,205" fill="#1E2024"/>
          
          <rect x="110" y="142" width="80" height="18" rx="4" fill="rgba(0,0,0,0.2)"/>
          <text x="150" y="155" fill="#F3E5AB" fontFamily="sans-serif" fontSize="10" fontWeight="700" textAnchor="middle">SHREE M</text>
        </svg>
      );

    case 'door_closer':
      return (
        <svg width={width} height={height} viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="bodyClose" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#CBD5E1"/>
              <stop offset="50%" stopColor="#94A3B8"/>
              <stop offset="100%" stopColor="#475569"/>
            </linearGradient>
          </defs>

          <rect x="40" y="120" width="180" height="70" rx="10" fill="url(#bodyClose)" stroke="#334155" strokeWidth="2"/>
          <circle cx="40" cy="155" r="25" fill="url(#bodyClose)" stroke="#334155"/>
          <circle cx="195" cy="140" r="5" fill="#1E293B"/><circle cx="195" cy="165" r="5" fill="#1E293B"/>
          <circle cx="130" cy="155" r="16" fill="#1E293B"/>
          <circle cx="130" cy="155" r="8" fill="url(#bodyClose)"/>

          <path d="M130 155 L220 80 L260 110" stroke="url(#bodyClose)" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="220" cy="80" r="10" fill="#334155"/>
        </svg>
      );

    case 'cabinet_knob':
      return (
        <svg width={width} height={height} viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="knobBlack" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#4A4D52"/>
              <stop offset="60%" stopColor="#1C1D20"/>
              <stop offset="100%" stopColor="#0A0B0C"/>
            </radialGradient>
          </defs>
          
          <path d="M120 200 L180 200 L165 140 L135 140 Z" fill="#202225"/>
          <ellipse cx="150" cy="200" rx="30" ry="10" fill="#121315"/>
          <circle cx="150" cy="120" r="65" fill="url(#knobBlack)" stroke="#36393E" strokeWidth="2"/>
          <ellipse cx="135" cy="100" rx="35" ry="20" fill="rgba(255,255,255,0.08)"/>
        </svg>
      );

    case 'door_stopper':
      return (
        <svg width={width} height={height} viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="brassStopper" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#D4AF37"/>
              <stop offset="50%" stopColor="#FFF2A3"/>
              <stop offset="100%" stopColor="#AA820A"/>
            </linearGradient>
          </defs>

          <ellipse cx="150" cy="220" rx="55" ry="18" fill="url(#brassStopper)" stroke="#7A600B"/>
          <path d="M95 220 L95 120 C95 90, 205 90, 205 120 L205 220 Z" fill="url(#brassStopper)"/>
          <rect x="90" y="130" width="120" height="30" rx="6" fill="#18191B"/>
          <rect x="90" y="132" width="120" height="4" fill="rgba(255,255,255,0.15)"/>
        </svg>
      );

    case 'tower_bolt':
      return (
        <svg width={width} height={height} viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="ssBolt" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#F1F5F9"/>
              <stop offset="50%" stopColor="#CBD5E1"/>
              <stop offset="100%" stopColor="#64748B"/>
            </linearGradient>
          </defs>

          <rect x="40" y="110" width="170" height="80" rx="6" fill="url(#ssBolt)" stroke="#475569"/>
          <circle cx="60" cy="130" r="5" fill="#1E293B"/><circle cx="60" cy="170" r="5" fill="#1E293B"/>
          <circle cx="190" cy="130" r="5" fill="#1E293B"/><circle cx="190" cy="170" r="5" fill="#1E293B"/>

          <rect x="220" y="110" width="40" height="80" rx="6" fill="url(#ssBolt)" stroke="#475569"/>
          <circle cx="240" cy="130" r="5" fill="#1E293B"/><circle cx="240" cy="170" r="5" fill="#1E293B"/>

          <rect x="20" y="138" width="220" height="24" rx="12" fill="url(#ssBolt)" stroke="#334155" strokeWidth="2"/>
          <circle cx="140" cy="150" r="12" fill="#F47B20"/>
        </svg>
      );

    default:
      return (
        <svg width={width} height={height} viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="60" y="60" width="180" height="180" rx="20" fill="#1E2024" stroke="#F47B20" strokeWidth="2"/>
          <circle cx="150" cy="150" r="50" fill="none" stroke="#D4AF37" strokeWidth="4"/>
          <path d="M120 150 L180 150 M150 120 L150 180" stroke="#F47B20" strokeWidth="4" strokeLinecap="round"/>
        </svg>
      );
  }
}
