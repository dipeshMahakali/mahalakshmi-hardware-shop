import React, { useState } from 'react';

/**
 * Discreet Developer Watermark
 * Renders an ultra-subtle, non-intrusive micro-seal in the corner of the viewport.
 * Blends naturally into the UI for regular shoppers, but clearly visible and interactive
 * upon closer inspection or hover.
 */
export function DeveloperWatermark() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <aside
      className={`dev-watermark-seal ${isHovered ? 'is-expanded' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label="Developer signature: Dipesh"
    >
      <div className="dev-seal-mark" title="System Architect: Dipesh">
        <span className="dev-seal-char">D</span>
      </div>
      {isHovered && (
        <div className="dev-seal-card">
          <div className="dev-seal-title">⚡ Architected &amp; Engineered by Dipesh</div>
          <div className="dev-seal-desc">Shri Mahalakshmi Trader • Bagbahara</div>
        </div>
      )}
    </aside>
  );
}

