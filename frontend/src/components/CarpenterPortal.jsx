import React, { useState, useEffect } from 'react';
import { businessApi } from '../api/businessApi';

export function CarpenterPortal() {
  const [activeTab, setActiveTab] = useState('voice');
  const [token, setToken] = useState(false);
  const [carpenter, setCarpenter] = useState(null);
  const [voiceText, setVoiceText] = useState('Sharma site ke liye 5 18mm ply aur 2 box 3 inch hinge');
  const [aiStatus, setAiStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState([]);
  const [khataData, setKhataData] = useState(null);
  const [loyalty, setLoyalty] = useState(null);
  const [rewards, setRewards] = useState([]);

  // Auto-login as Ramesh Carpenter for seamless PWA demo
  useEffect(() => {
    async function initAuth() {
      try {
        setToken(true);
        await businessApi.getMe();

        // Fetch customer profile & projects
        const custs = await businessApi.customers();
        const ramesh = custs.find(c => c.name.includes('Ramesh')) || custs[0];
        setCarpenter(ramesh);

        if (ramesh) {
          const projRes = await businessApi.projects(undefined, ramesh.id);
          setProjects(projRes);

          const khataRes = await businessApi.khata(undefined, ramesh.id);
          setKhataData(khataRes);

          const loyRes = await businessApi.loyaltyAccount(undefined, ramesh.id);
          setLoyalty(loyRes);

          const rewRes = await businessApi.rewards();
          setRewards(rewRes);
        }
      } catch (err) {
        console.error('Carpenter login error:', err);
      }
    }
    initAuth();
  }, []);

  const handleSendVoiceOrder = async () => {
    if (!token || !voiceText) return;
    setLoading(true);
    setAiStatus('Sending voice message to AI assistant...');
    try {
      const res = await businessApi.processAI(undefined, {
        source_type: 'VOICE',
        input_text: voiceText,
        customer_id: carpenter?.id
      });
      setAiStatus(`✅ Order Request Received! Draft Order created for ${res.detected_project || 'your project'}. Waiting for shop owner review.`);
    } catch (err) {
      setAiStatus(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSendPhotoOrder = async () => {
    if (!token) return;
    setLoading(true);
    setAiStatus('Uploading handwritten list image & running OCR...');
    try {
      const res = await businessApi.processAI(undefined, {
        source_type: 'PHOTO',
        input_text: 'Patel Villa: 10 18mm ply, 4 box 3 inch hinge, 12 handle',
        customer_id: carpenter?.id
      });
      setAiStatus(`✅ Photo Material List Processed! AI detected items with ${res.confidence_score}% confidence. Shop owner notified.`);
    } catch (err) {
      setAiStatus(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const shareProjectWithHomeowner = (proj) => {
    const text = `Hello ${proj.homeowner_name || 'Sir'}! 👋\n\nHere is the material estimate summary for your project (${proj.name}):\n- 18mm Commercial Ply: 5 sheets\n- 3" Stainless Steel Hinges: 2 boxes\n- Dorset Door Handles: 10 pcs\n\nMaterials ordered directly from Mahalakshmi Hardware.`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div style={{ maxWidth: '600px', margin: '1rem auto', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ background: '#1e293b', color: '#fff', padding: '1.25rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.15rem' }}>👋 Hello, {carpenter?.name || 'Ramesh Carpenter'}</h3>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Carpenter Partner Mobile Assistant</span>
        </div>
        {loyalty && (
          <div style={{ background: '#3b82f6', padding: '0.35rem 0.75rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>
            ⭐ {loyalty.tier} ({loyalty.points} pts)
          </div>
        )}
      </div>

      {/* Quick Action Navigation */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', background: '#fff', borderBottom: '1px solid #e2e8f0' }}>
        {[
          { id: 'voice', label: '🎤 Voice', icon: '🎤' },
          { id: 'photo', label: '📷 Photo', icon: '📷' },
          { id: 'projects', label: '📋 Projects', icon: '📋' },
          { id: 'khata', label: '💰 Khata', icon: '💰' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '0.85rem 0.25rem',
              border: 'none',
              background: activeTab === tab.id ? '#eff6ff' : '#fff',
              color: activeTab === tab.id ? '#2563eb' : '#64748b',
              fontWeight: activeTab === tab.id ? 'bold' : 'normal',
              borderBottom: activeTab === tab.id ? '3px solid #2563eb' : 'none',
              cursor: 'pointer',
              fontSize: '0.85rem'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <div style={{ padding: '1.25rem' }}>
        {/* VOICE ORDER TAB */}
        {activeTab === 'voice' && (
          <div style={{ textAlign: 'center' }}>
            <h4 style={{ color: '#0f172a', margin: '0 0 0.5rem 0' }}>Voice Order Assistant</h4>
            <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1.25rem' }}>Speak or type what materials you need for your site in simple Hindi / English!</p>

            <textarea
              value={voiceText}
              onChange={(e) => setVoiceText(e.target.value)}
              rows={3}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', marginBottom: '1rem' }}
            />

            <button
              onClick={handleSendVoiceOrder}
              disabled={loading}
              style={{
                width: '100%',
                background: '#2563eb',
                color: '#fff',
                padding: '0.9rem',
                borderRadius: '10px',
                border: 'none',
                fontWeight: 'bold',
                fontSize: '1rem',
                cursor: 'pointer'
              }}
            >
              {loading ? 'Processing...' : '🎤 Send Voice Order to Shop'}
            </button>
          </div>
        )}

        {/* PHOTO ORDER TAB */}
        {activeTab === 'photo' && (
          <div style={{ textAlign: 'center' }}>
            <h4 style={{ color: '#0f172a', margin: '0 0 0.5rem 0' }}>Photo / List Upload</h4>
            <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1.25rem' }}>Take a picture of your handwritten material slip!</p>

            <div style={{ border: '2px dashed #cbd5e1', padding: '2rem', borderRadius: '12px', background: '#fff', marginBottom: '1rem' }}>
              <span style={{ fontSize: '2.5rem' }}>📷</span>
              <p style={{ margin: '0.5rem 0 0 0', color: '#64748b', fontSize: '0.85rem' }}>[Simulated Camera Slip Parser]</p>
            </div>

            <button
              onClick={handleSendPhotoOrder}
              disabled={loading}
              style={{
                width: '100%',
                background: '#16a34a',
                color: '#fff',
                padding: '0.9rem',
                borderRadius: '10px',
                border: 'none',
                fontWeight: 'bold',
                fontSize: '1rem',
                cursor: 'pointer'
              }}
            >
              {loading ? 'Processing OCR...' : '📷 Send Photo Slip to AI'}
            </button>
          </div>
        )}

        {/* AI STATUS NOTIFICATION */}
        {aiStatus && (
          <div style={{ marginTop: '1rem', padding: '0.85rem', borderRadius: '8px', background: aiStatus.includes('❌') ? '#fef2f2' : '#f0fdf4', color: aiStatus.includes('❌') ? '#991b1b' : '#166534', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}>
            {aiStatus}
          </div>
        )}

        {/* PROJECTS TAB */}
        {activeTab === 'projects' && (
          <div>
            <h4 style={{ color: '#0f172a', margin: '0 0 1rem 0' }}>My Active Sites & Projects</h4>
            {projects.map(proj => (
              <div key={proj.id} style={{ background: '#fff', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h5 style={{ margin: 0, fontSize: '1rem', color: '#1e293b' }}>{proj.name}</h5>
                  <span style={{ background: '#dcfce7', color: '#166534', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>{proj.status}</span>
                </div>
                <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0.25rem 0 0.75rem 0' }}>Homeowner: {proj.homeowner_name || 'N/A'}</p>
                <button
                  onClick={() => shareProjectWithHomeowner(proj)}
                  style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '0.4rem 0.85rem', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer' }}
                >
                  📲 Share Summary on WhatsApp
                </button>
              </div>
            ))}
          </div>
        )}

        {/* KHATA TAB */}
        {activeTab === 'khata' && (
          <div>
            <h4 style={{ color: '#0f172a', margin: '0 0 1rem 0' }}>My Digital Khata Account</h4>
            {khataData && (
              <div style={{ background: '#fff', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ color: '#64748b' }}>Total Debit (Purchases):</span>
                  <strong style={{ color: '#0f172a' }}>₹{khataData.debit}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ color: '#64748b' }}>Total Paid:</span>
                  <strong style={{ color: '#16a34a' }}>₹{khataData.credit}</strong>
                </div>
                <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '0.75rem 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem' }}>
                  <span style={{ fontWeight: 'bold', color: '#0f172a' }}>Outstanding Due:</span>
                  <strong style={{ color: '#dc2626' }}>₹{khataData.outstanding}</strong>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

