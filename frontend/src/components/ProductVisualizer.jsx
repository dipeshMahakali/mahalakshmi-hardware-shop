import React, { useState } from 'react';
import { Sparkles, MessageSquare, Check, Shield } from 'lucide-react';
import { buildWhatsAppLink, formatVisualizerQuoteMessage } from '../utils/whatsapp.js';

export function ProductVisualizer() {
  const [laminate, setLaminate] = useState({ name: 'Royal Teak Grain', color: '#8B5A2B', texture: 'Natural Wood Grain' });
  const [handle, setHandle] = useState({ name: 'Satin Gold Mortise', color: '#D4AF37', style: 'Luxury Brass' });
  const [doorType, setDoorType] = useState('Main Entrance Door');

  const laminates = [
    { name: 'Royal Teak Grain', color: '#8B5A2B', texture: 'Natural Wood Grain' },
    { name: 'Walnut Dark', color: '#4A2E18', texture: 'Deep Rich Walnut' },
    { name: 'Smokey Charcoal Ash', color: '#2B2D30', texture: 'Modern Matte' },
    { name: 'Pure White Satin', color: '#F4F5F7', texture: 'Minimalist Gloss' }
  ];

  const handles = [
    { name: 'Satin Gold Mortise', color: '#D4AF37', style: 'Luxury Brass' },
    { name: 'Matt Black Lever', color: '#1E1E1E', style: 'Modern Industrial' },
    { name: 'Stainless Steel Satin', color: '#C0C5CE', style: 'Sleek SS 304' },
    { name: 'Antique Bronze Deluxe', color: '#7E5224', style: 'Heritage Classical' }
  ];

  const whatsAppLink = buildWhatsAppLink(
    '919526162225',
    formatVisualizerQuoteMessage(doorType, laminate, handle)
  );

  return (
    <div className="visualizer-wrapper" style={{ 
      background: 'linear-gradient(135deg, #141414 0%, #1A1C20 50%, #111215 100%)', 
      color: 'var(--color-text-inverse)', 
      padding: '3rem 1.5rem', 
      borderRadius: 'var(--radius-xl)', 
      margin: '3rem 0',
      border: '1px solid rgba(244, 123, 32, 0.2)',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Ambient decorative glow */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        right: '-5%',
        width: '350px',
        height: '350px',
        background: 'radial-gradient(circle, rgba(244, 123, 32, 0.12) 0%, rgba(212, 175, 55, 0.05) 60%, transparent 80%)',
        borderRadius: '50%',
        pointerEvents: 'none',
        filter: 'blur(40px)'
      }} />

      <div style={{ maxWidth: '1050px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '6px', 
            background: 'rgba(244, 123, 32, 0.12)', 
            border: '1px solid rgba(244, 123, 32, 0.3)', 
            padding: '4px 14px', 
            borderRadius: 'var(--radius-full)', 
            fontSize: '11px', 
            fontWeight: '700', 
            letterSpacing: '0.08em', 
            textTransform: 'uppercase', 
            color: 'var(--color-accent)', 
            marginBottom: '0.75rem' 
          }}>
            <Sparkles size={13} /> Interactive Architectural Studio
          </span>
          <h2 style={{ fontSize: '2.25rem', fontWeight: '800', letterSpacing: '-0.02em', margin: '0.25rem 0' }}>
            Door & Hardware <span style={{ color: 'var(--color-accent)' }}>Visualizer</span>
          </h2>
          <p style={{ color: 'var(--color-text-inverse-muted)', fontSize: '1rem', maxWidth: '580px', margin: '0.5rem auto 0 auto', lineHeight: '1.5' }}>
            Customize your door laminate finish and metallic handle style, then request an instant trade estimate on WhatsApp.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3rem', alignItems: 'center' }}>
          {/* Visual Composite Preview Stage */}
          <div style={{ 
            background: 'rgba(26, 28, 32, 0.75)', 
            backdropFilter: 'blur(12px)', 
            padding: '2rem', 
            borderRadius: 'var(--radius-lg)', 
            border: '1px solid rgba(255, 255, 255, 0.08)', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            boxShadow: '0 16px 32px rgba(0,0,0,0.3)'
          }}>
            {/* Door Frame Mockup */}
            <div style={{ 
              position: 'relative', 
              width: '210px', 
              height: '360px', 
              borderRadius: '8px', 
              overflow: 'hidden', 
              border: '4px solid #2D3035', 
              boxShadow: '0 20px 30px rgba(0, 0, 0, 0.6)', 
              backgroundColor: laminate.color, 
              transition: 'background-color 0.35s ease' 
            }}>
              {/* Wood Grain Texture Overlay & Lighting Sheen */}
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(105deg, rgba(255,255,255,0.12) 0%, transparent 40%, rgba(0,0,0,0.2) 100%)',
                pointerEvents: 'none'
              }} />

              {/* Inset Door Paneling Lines */}
              <div style={{ position: 'absolute', inset: '12px', border: '1px solid rgba(255,255,255,0.18)', borderRadius: '4px' }} />
              <div style={{ position: 'absolute', top: '18px', left: '18px', right: '18px', bottom: '190px', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '2px' }} />
              <div style={{ position: 'absolute', top: '190px', left: '18px', right: '18px', bottom: '18px', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '2px' }} />
              
              {/* Metallic Handle Hardware Composite */}
              <div style={{ 
                position: 'absolute', 
                right: '22px', 
                top: '175px', 
                width: '16px', 
                height: '64px', 
                backgroundColor: handle.color, 
                borderRadius: '4px', 
                boxShadow: '3px 4px 10px rgba(0,0,0,0.7)', 
                transition: 'background-color 0.35s ease' 
              }}>
                <div style={{ position: 'absolute', top: '10px', left: '-12px', width: '30px', height: '8px', backgroundColor: handle.color, borderRadius: '2px' }} />
                <div style={{ position: 'absolute', bottom: '12px', left: '4px', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#111' }} />
              </div>
            </div>

            <div style={{ marginTop: '1.75rem', textAlign: 'center', width: '100%' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-inverse-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Configured Combination:</span>
              <h4 style={{ color: '#fff', fontSize: '1.15rem', fontWeight: '700', margin: '0.35rem 0' }}>
                {laminate.name} <span style={{ color: 'var(--color-accent)' }}>+</span> {handle.name}
              </h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-inverse-muted)', margin: '0 0 1rem 0' }}>
                Door Style: {doorType}
              </p>

              <a 
                href={whatsAppLink} 
                target="_blank" 
                rel="noreferrer" 
                style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '8px', 
                  width: '100%', 
                  background: '#22c55e', 
                  color: '#fff', 
                  padding: '0.85rem 1.25rem', 
                  borderRadius: 'var(--radius-md)', 
                  textDecoration: 'none', 
                  fontWeight: '700', 
                  fontSize: '0.95rem',
                  boxShadow: '0 6px 20px rgba(34, 197, 94, 0.3)',
                  transition: 'all 0.2s ease'
                }}
              >
                <MessageSquare size={18} /> Inquire Combination Price on WhatsApp
              </a>
            </div>
          </div>

          {/* Configuration Controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
            {/* Door Type Selector */}
            <div>
              <label style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--color-text-inverse)', display: 'block', marginBottom: '0.5rem' }}>
                1. Door Application:
              </label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {['Main Entrance Door', 'Bedroom Flush Door', 'Bathroom Door'].map(dt => (
                  <button
                    key={dt}
                    onClick={() => setDoorType(dt)}
                    style={{
                      background: doorType === dt ? 'var(--color-accent)' : 'rgba(255,255,255,0.06)',
                      color: '#fff',
                      border: doorType === dt ? '1px solid var(--color-accent)' : '1px solid rgba(255,255,255,0.12)',
                      padding: '6px 14px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {doorType === dt && <Check size={12} style={{ display: 'inline', marginRight: '4px' }} />}
                    {dt}
                  </button>
                ))}
              </div>
            </div>

            {/* Laminate Finishes */}
            <div>
              <label style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--color-text-inverse)', display: 'block', marginBottom: '0.5rem' }}>
                2. Select Laminate Texture & Color:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
                {laminates.map(lam => {
                  const isSelected = laminate.name === lam.name;
                  return (
                    <button
                      key={lam.name}
                      onClick={() => setLaminate(lam)}
                      style={{
                        background: isSelected ? 'rgba(244, 123, 32, 0.15)' : 'rgba(255,255,255,0.05)',
                        color: '#fff',
                        border: isSelected ? '2px solid var(--color-accent)' : '1px solid rgba(255,255,255,0.1)',
                        padding: '0.75rem',
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.65rem',
                        fontSize: '0.85rem',
                        textAlign: 'left',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <span style={{ 
                        width: '20px', 
                        height: '20px', 
                        borderRadius: '50%', 
                        background: lam.color, 
                        border: '2px solid rgba(255,255,255,0.8)',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                        flexShrink: 0
                      }} />
                      <span style={{ fontWeight: isSelected ? '700' : '500', lineHeight: '1.2' }}>{lam.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Handle Styles */}
            <div>
              <label style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--color-text-inverse)', display: 'block', marginBottom: '0.5rem' }}>
                3. Select Architectural Handle Style:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
                {handles.map(h => {
                  const isSelected = handle.name === h.name;
                  return (
                    <button
                      key={h.name}
                      onClick={() => setHandle(h)}
                      style={{
                        background: isSelected ? 'rgba(212, 175, 55, 0.15)' : 'rgba(255,255,255,0.05)',
                        color: '#fff',
                        border: isSelected ? '2px solid var(--color-gold)' : '1px solid rgba(255,255,255,0.1)',
                        padding: '0.75rem',
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.65rem',
                        fontSize: '0.85rem',
                        textAlign: 'left',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <span style={{ 
                        width: '20px', 
                        height: '20px', 
                        borderRadius: '50%', 
                        background: h.color, 
                        border: '2px solid rgba(255,255,255,0.8)',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                        flexShrink: 0
                      }} />
                      <span style={{ fontWeight: isSelected ? '700' : '500', lineHeight: '1.2' }}>{h.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Trust Assurance Badge */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px', 
              background: 'rgba(255,255,255,0.03)', 
              padding: '10px 14px', 
              borderRadius: 'var(--radius-md)', 
              border: '1px solid rgba(255,255,255,0.06)' 
            }}>
              <Shield size={20} style={{ color: 'var(--color-gold)', flexShrink: 0 }} />
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-inverse-muted)', lineHeight: '1.4' }}>
                All handles feature heavy-duty spring mechanisms and anti-tarnish protective coatings for maximum longevity.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
