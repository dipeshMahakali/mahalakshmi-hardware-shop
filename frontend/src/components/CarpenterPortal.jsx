import React, { useState, useEffect, useRef } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Briefcase,
  Camera,
  CheckCircle,
  CircleDollarSign,
  Copy,
  ExternalLink,
  Mic,
  MicOff,
  Package,
  PackageCheck,
  Plus,
  QrCode,
  Send,
  Sparkles,
  Star,
  Trash2,
  Upload,
  Wallet,
  X
} from 'lucide-react';
import { businessApi } from '../api/businessApi';
import { formatINR } from '../utils/currency.js';
import { buildWhatsAppLink, formatCarpenterEstimateMessage } from '../utils/whatsapp.js';

const QUICK_MATERIALS = [
  '5 sheet 18mm Commercial Ply',
  '4 sheet 19mm BWR Blockboard',
  '1 can Fevicol Marine 50kg',
  '2 box 3" SS Hinges',
  '3 pcs Godrej Mortise Lock',
  '10 pcs Dorset Door Handles',
  '2 sheet 8x4 Teak Veneer',
  '1 roll Masking Tape 1"'
];

export function CarpenterPortal({
  activeTab: propActiveTab,
  onTabChange,
  onLoyaltyUpdate
}) {
  const [localActiveTab, setLocalActiveTab] = useState('order');
  const currentTab = propActiveTab || localActiveTab;

  const handleTabSwitch = (tabId) => {
    setLocalActiveTab(tabId);
    if (onTabChange) onTabChange(tabId);
  };

  const [token, setToken] = useState(false);
  const [carpenter, setCarpenter] = useState(null);
  const [voiceText, setVoiceText] = useState('Sharma site ke liye 5 sheet 18mm ply aur 2 box 3 inch hinge chahiye');
  const [aiStatus, setAiStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState([]);
  const [khataData, setKhataData] = useState(null);
  const [loyalty, setLoyalty] = useState(null);
  const [rewards, setRewards] = useState([]);
  const [ordersList, setOrdersList] = useState([]);

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef(null);

  // Photo upload state
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState(null);
  const [photoNote, setPhotoNote] = useState('Patel Villa: 10 sheet 18mm ply, 4 box 3 inch hinge');
  const fileInputRef = useRef(null);

  // UPI QR Modal state
  const [isUpiModalOpen, setIsUpiModalOpen] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);

  // Setup Web Speech Recognition API
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      const recognizer = new SpeechRecognition();
      recognizer.continuous = false;
      recognizer.interimResults = true;
      recognizer.lang = 'hi-IN'; // Optimized for Indian English & Hindi

      recognizer.onstart = () => setIsRecording(true);
      recognizer.onend = () => setIsRecording(false);
      recognizer.onerror = (e) => {
        console.warn('Speech recognition warning:', e.error);
        setIsRecording(false);
      };
      recognizer.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map((res) => res[0].transcript)
          .join('');
        setVoiceText((prev) => (prev ? `${prev} ${transcript}` : transcript));
      };
      recognitionRef.current = recognizer;
    }
  }, []);

  const toggleRecording = () => {
    if (!speechSupported || !recognitionRef.current) {
      setAiStatus('Speech Recognition not supported in this browser. Please type or use quick chips below.');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
        setAiStatus('Listening... Speak your site materials in Hindi or English.');
      } catch (err) {
        console.warn('Speech recognition start error:', err);
      }
    }
  };

  // Auto-login and load data
  useEffect(() => {
    async function initAuth() {
      try {
        setToken(true);
        const me = await businessApi.getMe().catch(() => null);

        // Fetch customer profile & projects
        const custs = await businessApi.customers();
        const currentCust =
          custs.find((c) => (me?.phone && c.phone === me.phone) || c.name.includes('Ramesh')) ||
          custs[0];
        setCarpenter(currentCust);

        if (currentCust) {
          const [projRes, khataRes, loyRes, rewRes, ordRes] = await Promise.allSettled([
            businessApi.projects(undefined, currentCust.id),
            businessApi.khata(undefined, currentCust.id),
            businessApi.loyaltyAccount(undefined, currentCust.id),
            businessApi.rewards(),
            businessApi.orders(undefined, currentCust.id)
          ]);

          if (projRes.status === 'fulfilled') setProjects(projRes.value || []);
          if (khataRes.status === 'fulfilled') setKhataData(khataRes.value);
          if (loyRes.status === 'fulfilled' && loyRes.value) {
            setLoyalty(loyRes.value);
            if (onLoyaltyUpdate) onLoyaltyUpdate(loyRes.value);
          }
          if (rewRes.status === 'fulfilled') setRewards(rewRes.value || []);
          if (ordRes.status === 'fulfilled') setOrdersList(ordRes.value || []);
        }
      } catch (err) {
        console.error('Carpenter portal init error:', err);
      }
    }
    initAuth();
  }, []);

  const reloadData = async () => {
    if (!carpenter?.id) return;
    try {
      const [khataRes, ordRes] = await Promise.allSettled([
        businessApi.khata(undefined, carpenter.id),
        businessApi.orders(undefined, carpenter.id)
      ]);
      if (khataRes.status === 'fulfilled') setKhataData(khataRes.value);
      if (ordRes.status === 'fulfilled') setOrdersList(ordRes.value || []);
    } catch (err) {
      console.error('Reload error:', err);
    }
  };

  const handleSendVoiceOrder = async () => {
    if (!voiceText.trim()) {
      setAiStatus('Please speak or type a material request first.');
      return;
    }
    setLoading(true);
    setAiStatus('Sending voice message to AI processing pipeline...');
    try {
      const res = await businessApi.processAI(undefined, {
        source_type: 'VOICE',
        input_text: voiceText.trim(),
        customer_id: carpenter?.id
      });
      setAiStatus(`Order Received! AI Draft created for ${res.detected_project || 'your project'}. Waiting for shop owner review.`);
      reloadData();
    } catch (err) {
      setAiStatus(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const url = URL.createObjectURL(file);
      setPhotoPreviewUrl(url);
    }
  };

  const handleSendPhotoOrder = async () => {
    setLoading(true);
    setAiStatus('Uploading handwritten paper list & running OCR...');
    try {
      const res = await businessApi.processAI(undefined, {
        source_type: 'PHOTO',
        input_text: photoNote.trim() || 'Paper material list photo uploaded from job site',
        customer_id: carpenter?.id
      });
      setAiStatus(`Paper Material Slip Processed! AI detected items with ${Number(res.confidence_score).toFixed(0)}% confidence.`);
      setPhotoFile(null);
      setPhotoPreviewUrl(null);
      reloadData();
    } catch (err) {
      setAiStatus(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const shareProjectWithHomeowner = (proj) => {
    const message = formatCarpenterEstimateMessage(proj, [
      { name: '18mm Commercial Ply', quantity: 5, unit: 'sheets' },
      { name: '3" Stainless Steel Hinges', quantity: 2, unit: 'boxes' },
      { name: 'Dorset Mortise Handles', quantity: 10, unit: 'pcs' }
    ]);
    const link = buildWhatsAppLink('', message);
    window.open(link, '_blank');
  };

  const sendWhatsAppVoiceOrder = () => {
    const text = `Namaste Shree Mahalaxmi Hardware! 👋\n\nI am sending a site material order from ${carpenter?.name || 'Ramesh Carpenter'}:\n"${voiceText}"\n\nPlease confirm price and availability.`;
    const link = buildWhatsAppLink('919876543210', text);
    window.open(link, '_blank');
  };

  const copyUpiId = () => {
    navigator.clipboard?.writeText('mahalakshmi.hardware@okhdfcbank');
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  return (
    <div style={{ maxWidth: '1360px', margin: '0 auto' }}>
      {/* Partner Identity Card */}
      <div
        style={{
          background: 'linear-gradient(135deg, #15181E 0%, #1A1E26 100%)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '14px',
          padding: '20px 24px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        <div>
          <span className="panel-eyebrow" style={{ color: '#F47B20' }}>
            SHREE MAHALAXMI PARTNER NETWORK &bull; VERIFIED CONTRACTOR
          </span>
          <h2 style={{ margin: '2px 0 0 0', fontSize: '22px', fontWeight: 800, color: '#FFFFFF' }}>
            👋 {carpenter?.name || 'Ramesh Carpenter'}
          </h2>
          <span style={{ fontSize: '13px', color: '#94A3B8' }}>
            Primary Phone: {carpenter?.phone || '+91 98765 43210'} &bull; Category: {carpenter?.customer_type || 'CARPENTER'}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {loyalty && (
            <div
              style={{
                background: 'rgba(244, 123, 32, 0.12)',
                border: '1px solid rgba(244, 123, 32, 0.3)',
                padding: '8px 16px',
                borderRadius: '10px',
                textAlign: 'right'
              }}
            >
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#F47B20', textTransform: 'uppercase' }}>
                Reward Tier: {loyalty.tier}
              </div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Star size={15} fill="#F47B20" color="#F47B20" />
                <span>{loyalty.points} Points</span>
              </div>
            </div>
          )}

          {khataData && (
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                padding: '8px 16px',
                borderRadius: '10px',
                textAlign: 'right'
              }}
            >
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#F87171', textTransform: 'uppercase' }}>
                Khata Dues
              </div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#EF4444' }}>
                {formatINR(khataData.outstanding)}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Responsive In-Page Navigation Switcher */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '20px',
          overflowX: 'auto',
          paddingBottom: '4px'
        }}
      >
        {[
          { id: 'order', label: '🎙️ Voice Order Assistant' },
          { id: 'photo', label: '📷 Photo Slip Scanner' },
          { id: 'sites', label: `🏗️ My Sites (${projects.length})` },
          { id: 'khata', label: '💰 Digital Khata Ledger' },
          { id: 'orders', label: `📦 Order Tracking (${ordersList.length})` }
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`admin-action-btn ${currentTab === tab.id ? 'primary' : ''}`}
            onClick={() => handleTabSwitch(tab.id)}
            style={{ padding: '8px 16px', fontSize: '13px', whiteSpace: 'nowrap' }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* AI Status Notification */}
      {aiStatus && (
        <div
          className={`admin-feedback ${aiStatus.includes('Error') ? 'error' : 'success'}`}
          style={{ marginBottom: '20px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {aiStatus.includes('Error') ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
            <span>{aiStatus}</span>
          </div>
          <button
            type="button"
            className="admin-feedback-close"
            onClick={() => setAiStatus(null)}
          >
            &times;
          </button>
        </div>
      )}

      {/* Dual Deck Operations Grid (Desktop & Tablet) */}
      <div className="partner-dual-deck">
        {/* Left Deck: Ordering Studio */}
        <div>
          {/* TAB: VOICE ORDER */}
          {currentTab === 'order' && (
            <div className="admin-card">
              <div className="admin-card-header">
                <h3 className="admin-card-title">
                  <Mic size={18} style={{ color: '#F47B20' }} />
                  <span>Hinglish Voice Order Assistant</span>
                </h3>
                <span className="badge-status source">Web Speech AI</span>
              </div>

              <div className="voice-orb-container">
                <button
                  type="button"
                  className={`voice-recorder-orb ${isRecording ? 'is-recording' : ''}`}
                  onClick={toggleRecording}
                  title={isRecording ? 'Click to Stop Recording' : 'Click to Speak'}
                >
                  {isRecording ? <MicOff size={36} /> : <Mic size={36} />}
                </button>
                <div style={{ marginTop: '14px', fontSize: '14px', fontWeight: 700, color: '#FFFFFF' }}>
                  {isRecording ? '🔴 Listening... Speak now in Hindi or English' : 'Tap Microphone to Speak'}
                </div>
                <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '4px' }}>
                  Natural language parsing automatically extracts product names, sizes, and quantities.
                </div>
              </div>

              <div className="admin-form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label className="admin-label" style={{ margin: 0 }}>
                    Voice Message Transcript / Site Material Request:
                  </label>
                  {voiceText && (
                    <button
                      type="button"
                      onClick={() => setVoiceText('')}
                      style={{ background: 'none', border: 'none', color: '#F87171', fontSize: '11.5px', cursor: 'pointer' }}
                    >
                      Clear text
                    </button>
                  )}
                </div>
                <textarea
                  className="admin-textarea"
                  rows={4}
                  value={voiceText}
                  onChange={(e) => setVoiceText(e.target.value)}
                  placeholder="e.g. 10 sheet 18mm commercial ply aur 2 dabba fevicol chahiye kal subah tak..."
                />
              </div>

              {/* Quick Material Chips */}
              <div style={{ marginBottom: '20px' }}>
                <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' }}>
                  Quick Add Frequent Materials:
                </span>
                <div className="material-chips-grid">
                  {QUICK_MATERIALS.map((mat, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className="material-chip"
                      onClick={() => setVoiceText((prev) => (prev ? `${prev}, ${mat}` : mat))}
                    >
                      <Plus size={12} />
                      <span>{mat}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="admin-action-btn primary"
                  style={{ flex: 1, justifyContent: 'center', padding: '12px', fontSize: '14px', fontWeight: 800 }}
                  disabled={loading}
                  onClick={handleSendVoiceOrder}
                >
                  <Send size={16} />
                  <span>{loading ? 'Processing Order...' : 'Send Order to Shop'}</span>
                </button>

                <button
                  type="button"
                  className="admin-action-btn"
                  style={{ background: '#25D366', color: '#FFFFFF', border: 'none', padding: '12px 18px', fontWeight: 700 }}
                  onClick={sendWhatsAppVoiceOrder}
                  title="Forward directly to shop owner on WhatsApp"
                >
                  <span>WhatsApp</span>
                  <ExternalLink size={14} />
                </button>
              </div>
            </div>
          )}

          {/* TAB: PHOTO SLIP */}
          {currentTab === 'photo' && (
            <div className="admin-card">
              <div className="admin-card-header">
                <h3 className="admin-card-title">
                  <Camera size={18} style={{ color: '#10B981' }} />
                  <span>Handwritten Slip OCR Camera Scanner</span>
                </h3>
                <span className="badge-status active">Job Site Camera</span>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                capture="environment"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />

              <div className="photo-dropzone" onClick={() => fileInputRef.current?.click()}>
                <Camera size={40} style={{ color: '#F47B20', margin: '0 auto 10px', display: 'block' }} />
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#FFFFFF' }}>
                  {photoFile ? photoFile.name : 'Tap to Snap Photo or Upload Slip'}
                </div>
                <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '4px' }}>
                  Uses your mobile device camera to capture job site paper lists.
                </div>
              </div>

              {photoPreviewUrl && (
                <div className="photo-preview-box">
                  <img src={photoPreviewUrl} alt="Uploaded material slip" />
                </div>
              )}

              <div className="admin-form-group" style={{ marginTop: '16px' }}>
                <label className="admin-label">Site Project / Additional Notes:</label>
                <input
                  type="text"
                  className="admin-input"
                  value={photoNote}
                  onChange={(e) => setPhotoNote(e.target.value)}
                  placeholder="e.g. Patel Villa, 2nd floor master bedroom wardrobe"
                />
              </div>

              <button
                type="button"
                className="admin-action-btn primary"
                style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '14px', fontWeight: 800 }}
                disabled={loading}
                onClick={handleSendPhotoOrder}
              >
                <Upload size={16} />
                <span>{loading ? 'Analyzing with OCR...' : 'Upload & Parse Slip with AI'}</span>
              </button>
            </div>
          )}

          {/* TAB: MY SITES */}
          {currentTab === 'sites' && (
            <div className="admin-card">
              <div className="admin-card-header">
                <h3 className="admin-card-title">
                  <Briefcase size={18} style={{ color: '#F47B20' }} />
                  <span>Active Job Sites & Client Estimates</span>
                </h3>
                <span className="badge-status instock">{projects.length} Sites</span>
              </div>

              {projects.length === 0 ? (
                <div className="admin-empty-state">
                  <Briefcase className="admin-empty-icon" />
                  <p>No active construction sites registered yet. Contact the shop to register your sites.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {projects.map((proj) => (
                    <div
                      key={proj.id}
                      style={{
                        background: '#111317',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '10px',
                        padding: '16px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong style={{ fontSize: '15px', color: '#FFFFFF' }}>{proj.name}</strong>
                        <span className="badge-status active">{proj.status}</span>
                      </div>
                      <p style={{ margin: '6px 0 14px 0', fontSize: '13px', color: '#94A3B8' }}>
                        Client: <strong style={{ color: '#CBD5E1' }}>{proj.homeowner_name || 'Direct Client'}</strong> &bull; Site: {proj.site_address || 'Local Site'}
                      </p>
                      <button
                        type="button"
                        onClick={() => shareProjectWithHomeowner(proj)}
                        className="admin-action-btn"
                        style={{ background: '#25D366', color: '#FFFFFF', border: 'none', padding: '8px 14px', fontWeight: 700 }}
                      >
                        <span>📲 Share Estimate on WhatsApp</span>
                        <ExternalLink size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: KHATA */}
          {currentTab === 'khata' && (
            <div className="admin-card">
              <div className="admin-card-header">
                <h3 className="admin-card-title">
                  <Wallet size={18} style={{ color: '#F47B20' }} />
                  <span>My Digital Khata Ledger</span>
                </h3>
                <button
                  type="button"
                  className="admin-action-btn primary"
                  style={{ padding: '6px 12px', fontSize: '12px' }}
                  onClick={() => setIsUpiModalOpen(true)}
                >
                  <QrCode size={14} />
                  <span>Pay via UPI</span>
                </button>
              </div>

              {khataData && (
                <div>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: '12px',
                      marginBottom: '18px'
                    }}
                  >
                    <div style={{ background: '#111317', padding: '12px 14px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                      <span style={{ fontSize: '11px', color: '#94A3B8', textTransform: 'uppercase' }}>Purchases (Debit)</span>
                      <div style={{ fontSize: '18px', fontWeight: 800, color: '#38BDF8', marginTop: '4px' }}>
                        {formatINR(khataData.debit)}
                      </div>
                    </div>

                    <div style={{ background: '#111317', padding: '12px 14px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                      <span style={{ fontSize: '11px', color: '#94A3B8', textTransform: 'uppercase' }}>Paid (Credit)</span>
                      <div style={{ fontSize: '18px', fontWeight: 800, color: '#10B981', marginTop: '4px' }}>
                        {formatINR(khataData.credit)}
                      </div>
                    </div>

                    <div style={{ background: '#111317', padding: '12px 14px', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.25)' }}>
                      <span style={{ fontSize: '11px', color: '#F87171', textTransform: 'uppercase' }}>Net Dues</span>
                      <div style={{ fontSize: '18px', fontWeight: 800, color: '#EF4444', marginTop: '4px' }}>
                        {formatINR(khataData.outstanding)}
                      </div>
                    </div>
                  </div>

                  <div className="admin-table-container">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Type</th>
                          <th>Description</th>
                          <th>Debit (+)</th>
                          <th>Credit (-)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {khataData.transactions?.map((t, idx) => (
                          <tr key={idx}>
                            <td>
                              <span className={`badge-status ${t.type === 'CREDIT_SALE' ? 'partial' : 'paid'}`}>
                                {t.type}
                              </span>
                            </td>
                            <td style={{ color: '#FFFFFF' }}>{t.description}</td>
                            <td style={{ color: Number(t.debit) > 0 ? '#38BDF8' : '#64748B' }}>
                              {Number(t.debit) > 0 ? formatINR(t.debit) : '-'}
                            </td>
                            <td style={{ color: Number(t.credit) > 0 ? '#10B981' : '#64748B' }}>
                              {Number(t.credit) > 0 ? formatINR(t.credit) : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: ORDER TRACKING */}
          {currentTab === 'orders' && (
            <div className="admin-card">
              <div className="admin-card-header">
                <h3 className="admin-card-title">
                  <PackageCheck size={18} style={{ color: '#F47B20' }} />
                  <span>Live Site Orders & Dispatch Tracking</span>
                </h3>
                <span className="badge-status instock">{ordersList.length} Orders</span>
              </div>

              {ordersList.length === 0 ? (
                <div className="admin-empty-state">
                  <Package className="admin-empty-icon" />
                  <p>No confirmed orders found yet. Orders placed via Voice or Photo will appear here once approved by the shop owner.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {ordersList.map((ord) => (
                    <div
                      key={ord.id}
                      style={{
                        background: '#111317',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '10px',
                        padding: '16px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <strong style={{ fontSize: '15px', color: '#FFFFFF' }}>Order #{ord.order_number}</strong>
                          <span style={{ fontSize: '12px', color: '#94A3B8', display: 'block', marginTop: '2px' }}>
                            Source: {ord.source || 'VOICE'} &bull; Total: {formatINR(ord.total)}
                          </span>
                        </div>
                        <span
                          className={`badge-status ${
                            ord.status === 'CONFIRMED' || ord.status === 'APPROVED'
                              ? 'paid'
                              : ord.status === 'CANCELLED'
                              ? 'overdue'
                              : 'pending'
                          }`}
                        >
                          {ord.status}
                        </span>
                      </div>

                      {ord.items && ord.items.length > 0 && (
                        <div style={{ marginTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '10px' }}>
                          <span style={{ fontSize: '11px', color: '#94A3B8', textTransform: 'uppercase', fontWeight: 700 }}>
                            Materials Reserved:
                          </span>
                          <ul style={{ margin: '6px 0 0 0', paddingLeft: '18px', fontSize: '12.5px', color: '#CBD5E1' }}>
                            {ord.items.map((item, i) => (
                              <li key={i}>
                                {item.product_name} &times; {item.quantity} {item.unit || 'pcs'}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Deck: Live Business Cockpit (Always visible on Desktop!) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Partner Loyalty Rewards Card */}
          {loyalty && (
            <div className="admin-card">
              <div className="admin-card-header">
                <h3 className="admin-card-title">
                  <Star size={16} fill="#F47B20" color="#F47B20" />
                  <span>Partner Tier & Rewards</span>
                </h3>
                <span className="badge-status active">{loyalty.tier} TIER</span>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                  <span style={{ color: '#94A3B8' }}>Tier Progress:</span>
                  <strong style={{ color: '#FFFFFF' }}>{loyalty.points} / 2500 pts for Gold</strong>
                </div>
                <div style={{ height: '8px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${Math.min(100, (loyalty.points / 2500) * 100)}%`,
                      background: 'linear-gradient(90deg, #F47B20 0%, #D4AF37 100%)',
                      borderRadius: '4px'
                    }}
                  />
                </div>
              </div>

              <div style={{ fontSize: '12px', color: '#94A3B8', lineHeight: 1.5 }}>
                Earn 1 reward point for every ₹100 of verified materials ordered. Redeemable for power tools, store vouchers, and festive hampers.
              </div>
            </div>
          )}

          {/* Quick Khata Dues Pill */}
          {khataData && (
            <div className="admin-card">
              <div className="admin-card-header">
                <h3 className="admin-card-title">
                  <Wallet size={16} style={{ color: '#EF4444' }} />
                  <span>Active Khata Dues</span>
                </h3>
                <span className="badge-status overdue">{formatINR(khataData.outstanding)}</span>
              </div>

              <p style={{ fontSize: '12.5px', color: '#94A3B8', margin: '0 0 14px 0' }}>
                Clear running credit dues anytime via instant UPI payment or visit the shop counter.
              </p>

              <button
                type="button"
                className="admin-action-btn primary"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => setIsUpiModalOpen(true)}
              >
                <QrCode size={15} />
                <span>Pay Dues via UPI QR</span>
              </button>
            </div>
          )}

          {/* Active Sites Quick List */}
          <div className="admin-card">
            <div className="admin-card-header">
              <h3 className="admin-card-title">
                <Briefcase size={16} style={{ color: '#F47B20' }} />
                <span>Job Sites ({projects.length})</span>
              </h3>
              <button
                type="button"
                className="admin-action-btn"
                style={{ padding: '4px 8px', fontSize: '11px' }}
                onClick={() => handleTabSwitch('sites')}
              >
                View Details
              </button>
            </div>

            {projects.length === 0 ? (
              <div style={{ fontSize: '12.5px', color: '#64748B', textAlign: 'center', padding: '16px' }}>
                No active sites found.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {projects.slice(0, 3).map((p) => (
                  <div
                    key={p.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 10px',
                      background: '#111317',
                      borderRadius: '6px'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#FFFFFF' }}>{p.name}</div>
                      <div style={{ fontSize: '11px', color: '#94A3B8' }}>{p.homeowner_name || 'Client Site'}</div>
                    </div>
                    <span className="badge-status active" style={{ fontSize: '10px' }}>{p.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL: UPI PAYMENT QR CODE */}
      {isUpiModalOpen && (
        <div className="admin-modal-backdrop" onClick={() => setIsUpiModalOpen(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-card-header" style={{ marginBottom: '16px' }}>
              <h3 className="admin-card-title">
                <QrCode size={18} style={{ color: '#10B981' }} />
                <span>Pay Shree Mahalaxmi Hardware via UPI</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsUpiModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div
                style={{
                  width: '180px',
                  height: '180px',
                  margin: '0 auto 16px',
                  background: '#FFFFFF',
                  borderRadius: '12px',
                  display: 'grid',
                  placeItems: 'center',
                  padding: '12px',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)'
                }}
              >
                {/* Visual QR Placeholder representation */}
                <div style={{ width: '100%', height: '100%', border: '4px solid #000', display: 'grid', placeItems: 'center', color: '#000', textAlign: 'center' }}>
                  <QrCode size={90} />
                  <span style={{ fontSize: '10px', fontWeight: 800 }}>BHIM &bull; UPI &bull; GPay</span>
                </div>
              </div>

              <div style={{ fontSize: '13px', color: '#94A3B8', marginBottom: '4px' }}>
                Scan to pay total due:
              </div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#10B981', marginBottom: '16px' }}>
                {formatINR(khataData?.outstanding || 0)}
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: '#111317',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  marginBottom: '16px'
                }}
              >
                <code style={{ fontSize: '12.5px', color: '#FFFFFF' }}>mahalakshmi.hardware@okhdfcbank</code>
                <button
                  type="button"
                  className="admin-action-btn"
                  style={{ padding: '4px 8px', fontSize: '11.5px' }}
                  onClick={copyUpiId}
                >
                  <Copy size={12} />
                  <span>{copiedUpi ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>

              <a
                href={`upi://pay?pa=mahalakshmi.hardware@okhdfcbank&pn=Shree%20Mahalaxmi%20Hardware&am=${khataData?.outstanding || 0}&cu=INR`}
                className="admin-action-btn primary"
                style={{ width: '100%', justifyContent: 'center', padding: '12px', textDecoration: 'none', display: 'flex' }}
              >
                <span>Open GPay / PhonePe / Paytm App</span>
                <ExternalLink size={14} />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
