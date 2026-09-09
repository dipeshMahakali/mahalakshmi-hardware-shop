import React, { useState } from 'react';

export function ProductVisualizer() {
  const [laminate, setLaminate] = useState({ name: 'Royal Oak', color: '#c68a4c', texture: 'Wood' });
  const [handle, setHandle] = useState({ name: 'Matt Black Mortise', color: '#1a1a1a', style: 'Modern' });
  const [doorType, setDoorType] = useState('Main Entrance Door');

  const laminates = [
    { name: 'Royal Oak', color: '#c68a4c', texture: 'Wood Grain' },
    { name: 'Walnut Dark', color: '#5c3a21', texture: 'Deep Wood' },
    { name: 'Smokey Ash', color: '#8c8d8f', texture: 'Modern Ash' },
    { name: 'Pure White Gloss', color: '#f5f5f7', texture: 'Gloss' }
  ];

  const handles = [
    { name: 'Matt Black Mortise', color: '#1a1a1a', style: 'Modern' },
    { name: 'Antique Brass Lever', color: '#b8860b', style: 'Classic' },
    { name: 'Stainless Steel Satin', color: '#d1d5db', style: 'Minimal' },
    { name: 'Brushed Gold Deluxe', color: '#eab308', style: 'Luxury' }
  ];

  const generateWhatsAppLink = () => {
    const message = `Hello Mahalakshmi Hardware! 👋\n\nI am interested in your Door & Hardware Visualizer Combo:\n- Door Type: ${doorType}\n- Laminate Finish: ${laminate.name}\n- Handle Style: ${handle.name}\n\nPlease share price and stock availability for this combination.`;
    return `https://wa.me/919876543210?text=${encodeURIComponent(message)}`;
  };

  return (
    <div style={{ background: '#0f172a', color: '#fff', padding: '2.5rem 1.5rem', borderRadius: '16px', margin: '2rem 0' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '2rem', color: '#38bdf8', marginBottom: '0.5rem' }}>✨ Interactive Door & Hardware Visualizer</h2>
          <p style={{ color: '#94a3b8' }}>Customize your door laminate finish and handle style, then ask for price on WhatsApp!</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem', alignItems: 'center' }}>
          {/* Visual Composite Preview Box */}
          <div style={{ background: '#1e293b', padding: '2rem', borderRadius: '12px', border: '1px solid #334155', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ position: 'relative', width: '220px', height: '380px', borderRadius: '8px', overflow: 'hidden', border: '4px solid #475569', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)', backgroundColor: laminate.color, transition: 'all 0.3s ease' }}>
              {/* Door Frame Lines */}
              <div style={{ position: 'absolute', inset: '10px', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '4px' }} />
              
              {/* Handle Composite */}
              <div style={{ position: 'absolute', right: '25px', top: '180px', width: '16px', height: '60px', backgroundColor: handle.color, borderRadius: '4px', boxShadow: '2px 2px 8px rgba(0,0,0,0.6)', transition: 'all 0.3s ease' }}>
                <div style={{ position: 'absolute', top: '10px', left: '-12px', width: '28px', height: '8px', backgroundColor: handle.color, borderRadius: '2px' }} />
                <div style={{ position: 'absolute', bottom: '10px', left: '4px', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#000' }} />
              </div>
            </div>

            <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
              <span style={{ fontSize: '0.875rem', color: '#94a3b8' }}>Configured Design:</span>
              <h4 style={{ color: '#f8fafc', margin: '0.25rem 0' }}>{laminate.name} + {handle.name}</h4>
              <a href={generateWhatsAppLink()} target="_blank" rel="noreferrer" style={{ display: 'inline-block', marginTop: '1rem', background: '#22c55e', color: '#fff', padding: '0.75rem 1.5rem', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.95rem' }}>
                💬 Check Combination Price on WhatsApp
              </a>
            </div>
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label style={{ fontSize: '0.9rem', color: '#94a3b8', display: 'block', marginBottom: '0.5rem' }}>Select Laminate Finish:</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                {laminates.map(lam => (
                  <button
                    key={lam.name}
                    onClick={() => setLaminate(lam)}
                    style={{
                      background: laminate.name === lam.name ? '#3b82f6' : '#1e293b',
                      color: '#fff',
                      border: '1px solid #334155',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.85rem'
                    }}
                  >
                    <span style={{ width: '16px', height: '16px', borderRadius: '50%', background: lam.color, border: '1px solid #fff' }} />
                    {lam.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.9rem', color: '#94a3b8', display: 'block', marginBottom: '0.5rem' }}>Select Handle Style:</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                {handles.map(h => (
                  <button
                    key={h.name}
                    onClick={() => setHandle(h)}
                    style={{
                      background: handle.name === h.name ? '#3b82f6' : '#1e293b',
                      color: '#fff',
                      border: '1px solid #334155',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.85rem'
                    }}
                  >
                    <span style={{ width: '16px', height: '16px', borderRadius: '50%', background: h.color, border: '1px solid #fff' }} />
                    {h.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

