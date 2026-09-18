import React, { useState } from 'react';
import { 
  Hammer, 
  Phone, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ArrowLeft, 
  AlertCircle, 
  MessageSquare, 
  Globe, 
  Check, 
  X,
  HelpCircle
} from 'lucide-react';
import { businessApi } from '../api/businessApi';
import { buildWhatsAppLink } from '../utils/whatsapp.js';

export function PartnerLogin({ onLoginSuccess, onCancel }) {
  // Mobile-first identity: 'phone' is the default for Indian carpentry contractors, with 'email' available
  const [authMethod, setAuthMethod] = useState('phone'); // 'phone' | 'email'
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [showPinHelpModal, setShowPinHelpModal] = useState(false);
  const [currentLang, setCurrentLang] = useState('en'); // 'en', 'hi', 'gu'
  const [langNotice, setLangNotice] = useState('');

  // Language options suitable for Western/Northern India hardware and carpentry trade
  const languages = [
    { code: 'hi', label: 'हिन्दी' },
    { code: 'gu', label: 'ગુજરાતી' },
    { code: 'en', label: 'English' }
  ];

  const handleLanguageSelect = (langCode) => {
    setCurrentLang(langCode);
    if (langCode === 'en') {
      setLangNotice('');
    } else if (langCode === 'hi') {
      setLangNotice('हिन्दी भाषा समर्थन जल्द उपलब्ध होगा (Continuing in English)');
    } else if (langCode === 'gu') {
      setLangNotice('ગુજરાતી ભાષા ટૂંક સમયમાં ઉપલબ્ધ થશે (Continuing in English)');
    }
    setTimeout(() => setLangNotice(''), 4000);
  };

  const validate = () => {
    const errors = {};

    if (authMethod === 'phone') {
      const cleanPhone = phone.replace(/\D/g, '');
      if (!cleanPhone) {
        errors.identifier = 'Please enter your 10-digit mobile number.';
      } else if (cleanPhone.length !== 10) {
        errors.identifier = 'Mobile number must be exactly 10 digits.';
      } else if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
        errors.identifier = 'Please enter a valid Indian mobile number starting with 6, 7, 8, or 9.';
      }
    } else {
      const trimmedEmail = email.trim();
      if (!trimmedEmail) {
        errors.identifier = 'Please enter your registered email address.';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
        errors.identifier = 'Please enter a valid email address (e.g. ramesh@carpenter.com).';
      }
    }

    if (!password) {
      errors.password = 'Please enter your password or PIN.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setServerError('');

    if (!validate()) return;
    if (loading) return; // Prevent double submission

    setLoading(true);

    const identifier = authMethod === 'phone' ? phone.replace(/\D/g, '') : email.trim();

    try {
      await businessApi.login({ email: identifier, password });
      const user = await businessApi.getMe();
      if (user.role !== 'CARPENTER' && user.role !== 'OWNER') {
        throw new Error('This portal is reserved for registered carpenter partners.');
      }
      onLoginSuccess(user);
    } catch (err) {
      const msg = err.message || '';
      if (msg.toLowerCase().includes('network') || msg.toLowerCase().includes('failed to fetch')) {
        setServerError('Unable to connect to the shop server. Please check your internet connection and try again.');
      } else if (msg.includes('401') || msg.toLowerCase().includes('invalid') || msg.toLowerCase().includes('credentials')) {
        setServerError('The mobile number/email or password you entered is incorrect. Please try again or reach out on WhatsApp.');
      } else if (msg.includes('reserved') || msg.includes('Access')) {
        setServerError(msg);
      } else {
        setServerError('Unable to sign in at this time. Please verify your details or message us on WhatsApp.');
      }
    } finally {
      setLoading(false);
    }
  };

  const whatsappHelpUrl = buildWhatsAppLink(
    '919526162225',
    'Namaste Shri Mahalakshmi Trader! I need assistance signing into the Carpenter Partner Portal.'
  );

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      background: 'linear-gradient(135deg, #111215 0%, #17191D 50%, #0E0F11 100%)',
      color: '#FFFFFF',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem 1rem',
      position: 'relative',
      overflow: 'hidden',
      boxSizing: 'border-box'
    }}>
      {/* Subtle Ambient Warm Saffron Sheen */}
      <div style={{
        position: 'absolute',
        top: '22%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '560px',
        height: '560px',
        background: 'radial-gradient(circle, rgba(244, 123, 32, 0.14) 0%, rgba(212, 175, 55, 0.05) 50%, transparent 75%)',
        borderRadius: '50%',
        pointerEvents: 'none',
        filter: 'blur(50px)'
      }} />

      {/* Subtle Structural Dotted Grid */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px)',
        backgroundSize: '28px 28px',
        pointerEvents: 'none'
      }} />

      {/* Glassmorphic Elevated Auth Card */}
      <div style={{
        position: 'relative',
        zIndex: 2,
        width: '100%',
        maxWidth: '450px',
        background: 'rgba(26, 28, 33, 0.92)',
        backdropFilter: 'blur(16px)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(244, 123, 32, 0.15)',
        padding: '2.25rem 1.75rem',
        boxSizing: 'border-box'
      }}>
        {/* Language Switcher Affordance */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '0.75rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '3px 6px',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.75rem'
          }}>
            <Globe size={13} style={{ color: 'var(--color-accent)', marginLeft: '2px' }} />
            {languages.map((lang, idx) => (
              <React.Fragment key={lang.code}>
                {idx > 0 && <span style={{ color: 'rgba(255,255,255,0.2)' }}>•</span>}
                <button
                  type="button"
                  onClick={() => handleLanguageSelect(lang.code)}
                  style={{
                    background: currentLang === lang.code ? 'rgba(244, 123, 32, 0.25)' : 'none',
                    border: 'none',
                    color: currentLang === lang.code ? 'var(--color-accent)' : 'var(--color-text-inverse-muted)',
                    fontWeight: currentLang === lang.code ? '700' : '500',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    padding: '2px 6px',
                    borderRadius: 'var(--radius-full)',
                    transition: 'all var(--transition-fast)'
                  }}
                  title={`Switch language to ${lang.label}`}
                >
                  {lang.label}
                </button>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Temporary Notice for Regional Languages */}
        {langNotice && (
          <div style={{
            fontSize: '0.75rem',
            color: 'var(--color-accent)',
            textAlign: 'right',
            marginBottom: '0.5rem',
            animation: 'fadeIn 0.3s ease'
          }}>
            {langNotice}
          </div>
        )}

        {/* Brand & Welcoming Header */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          marginBottom: '1.75rem'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '54px',
            height: '54px',
            background: 'linear-gradient(135deg, rgba(244, 123, 32, 0.2) 0%, rgba(212, 175, 55, 0.1) 100%)',
            border: '1px solid rgba(244, 123, 32, 0.4)',
            borderRadius: '16px',
            marginBottom: '0.85rem',
            boxShadow: '0 8px 20px rgba(244, 123, 32, 0.18)'
          }}>
            <Hammer size={26} color="var(--color-accent)" />
          </div>

          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            fontSize: '10.5px',
            fontWeight: '800',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--color-accent)',
            background: 'rgba(244, 123, 32, 0.12)',
            padding: '4px 12px',
            borderRadius: 'var(--radius-full)',
            border: '1px solid rgba(244, 123, 32, 0.3)',
            marginBottom: '0.75rem'
          }}>
            CARPENTER PARTNER NETWORK
          </div>

          <h2 style={{
            fontSize: '1.65rem',
            fontWeight: '800',
            color: '#FFFFFF',
            margin: '0 0 0.35rem 0',
            letterSpacing: '-0.02em'
          }}>
            Welcome Back <span style={{ color: 'var(--color-accent)' }}>👋</span>
          </h2>
          <p style={{
            fontSize: '0.875rem',
            color: 'var(--color-text-inverse-muted)',
            margin: 0,
            lineHeight: '1.45',
            maxWidth: '340px'
          }}>
            Order materials • Track deliveries • Check your Khata
          </p>
        </div>

        {/* Server Error Alert */}
        {serverError && (
          <div 
            role="alert" 
            style={{
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#FCA5A5',
              padding: '0.8rem 0.95rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{serverError}</span>
          </div>
        )}

        {/* Form with noValidate to disable unsightly native browser popups */}
        <form onSubmit={handleSubmit} noValidate>
          {/* Identity Field Header with Toggle */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.4rem'
            }}>
              <label 
                htmlFor={authMethod === 'phone' ? 'partner-phone' : 'partner-email'}
                style={{
                  fontSize: '0.825rem',
                  fontWeight: '600',
                  color: 'var(--color-text-inverse-muted)'
                }}
              >
                {authMethod === 'phone' ? 'Mobile Number' : 'Email Address'}
              </label>
              
              <button
                type="button"
                onClick={() => {
                  setAuthMethod(authMethod === 'phone' ? 'email' : 'phone');
                  setFieldErrors(prev => ({ ...prev, identifier: null }));
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-accent)',
                  fontSize: '0.785rem',
                  cursor: 'pointer',
                  padding: 0,
                  textDecoration: 'none',
                  fontWeight: '500'
                }}
                onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
              >
                {authMethod === 'phone' ? 'Use email instead' : 'Use mobile number instead'}
              </button>
            </div>

            {/* Input with Country Prefix for Phone, or Mail Icon for Email */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              {authMethod === 'phone' ? (
                <>
                  <div style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: '56px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(255, 255, 255, 0.04)',
                    borderRight: '1px solid rgba(255, 255, 255, 0.12)',
                    borderTopLeftRadius: 'var(--radius-md)',
                    borderBottomLeftRadius: 'var(--radius-md)',
                    color: '#FFFFFF',
                    fontSize: '0.875rem',
                    fontWeight: '700',
                    userSelect: 'none',
                    pointerEvents: 'none'
                  }}>
                    +91
                  </div>
                  <input
                    id="partner-phone"
                    type="tel"
                    name="tel"
                    autoComplete="tel"
                    inputMode="numeric"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setPhone(val);
                      if (fieldErrors.identifier) setFieldErrors(prev => ({ ...prev, identifier: null }));
                    }}
                    disabled={loading}
                    placeholder="98765 43210"
                    aria-invalid={!!fieldErrors.identifier}
                    aria-describedby={fieldErrors.identifier ? 'partner-id-error' : undefined}
                    style={{
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: `1px solid ${fieldErrors.identifier ? '#EF4444' : 'rgba(255, 255, 255, 0.14)'}`,
                      borderRadius: 'var(--radius-md)',
                      color: '#FFFFFF',
                      padding: '0.85rem 1rem 0.85rem 4.25rem',
                      fontSize: '1rem', // 16px prevents iOS Safari automatic zoom
                      boxSizing: 'border-box',
                      outline: 'none',
                      letterSpacing: phone ? '0.04em' : 'normal',
                      transition: 'all var(--transition-fast)'
                    }}
                    onFocus={(e) => {
                      if (!fieldErrors.identifier) e.target.style.borderColor = 'var(--color-accent)';
                      e.target.style.boxShadow = '0 0 0 3px rgba(244, 123, 32, 0.2)';
                    }}
                    onBlur={(e) => {
                      if (!fieldErrors.identifier) e.target.style.borderColor = 'rgba(255, 255, 255, 0.14)';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </>
              ) : (
                <>
                  <Mail 
                    size={17} 
                    style={{ 
                      position: 'absolute', 
                      left: '13px', 
                      color: fieldErrors.identifier ? '#EF4444' : 'rgba(255,255,255,0.4)', 
                      pointerEvents: 'none' 
                    }} 
                  />
                  <input
                    id="partner-email"
                    type="email"
                    name="email"
                    autoComplete="email"
                    inputMode="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (fieldErrors.identifier) setFieldErrors(prev => ({ ...prev, identifier: null }));
                    }}
                    disabled={loading}
                    placeholder="e.g. ramesh@carpenter.com"
                    aria-invalid={!!fieldErrors.identifier}
                    aria-describedby={fieldErrors.identifier ? 'partner-id-error' : undefined}
                    style={{
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: `1px solid ${fieldErrors.identifier ? '#EF4444' : 'rgba(255, 255, 255, 0.14)'}`,
                      borderRadius: 'var(--radius-md)',
                      color: '#FFFFFF',
                      padding: '0.85rem 1rem 0.85rem 2.55rem',
                      fontSize: '1rem',
                      boxSizing: 'border-box',
                      outline: 'none',
                      transition: 'all var(--transition-fast)'
                    }}
                    onFocus={(e) => {
                      if (!fieldErrors.identifier) e.target.style.borderColor = 'var(--color-accent)';
                      e.target.style.boxShadow = '0 0 0 3px rgba(244, 123, 32, 0.2)';
                    }}
                    onBlur={(e) => {
                      if (!fieldErrors.identifier) e.target.style.borderColor = 'rgba(255, 255, 255, 0.14)';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </>
              )}
            </div>
            {fieldErrors.identifier && (
              <span id="partner-id-error" role="alert" style={{ display: 'block', color: '#EF4444', fontSize: '0.75rem', marginTop: '4px', fontWeight: '500' }}>
                {fieldErrors.identifier}
              </span>
            )}
          </div>

          {/* Password / PIN Field */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <label 
                htmlFor="partner-password" 
                style={{
                  fontSize: '0.825rem',
                  fontWeight: '600',
                  color: 'var(--color-text-inverse-muted)'
                }}
              >
                Password or Security PIN
              </label>
              <button
                type="button"
                onClick={() => setShowPinHelpModal(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-accent)',
                  fontSize: '0.785rem',
                  cursor: 'pointer',
                  padding: 0,
                  textDecoration: 'none'
                }}
                onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
              >
                Forgot PIN?
              </button>
            </div>

            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Lock 
                size={17} 
                style={{ 
                  position: 'absolute', 
                  left: '13px', 
                  color: fieldErrors.password ? '#EF4444' : 'rgba(255,255,255,0.4)', 
                  pointerEvents: 'none' 
                }} 
              />
              <input
                id="partner-password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldErrors.password) setFieldErrors(prev => ({ ...prev, password: null }));
                }}
                disabled={loading}
                placeholder="••••••••"
                aria-invalid={!!fieldErrors.password}
                aria-describedby={fieldErrors.password ? 'partner-password-error' : undefined}
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: `1px solid ${fieldErrors.password ? '#EF4444' : 'rgba(255, 255, 255, 0.14)'}`,
                  borderRadius: 'var(--radius-md)',
                  color: '#FFFFFF',
                  padding: '0.85rem 2.65rem 0.85rem 2.55rem',
                  fontSize: '1rem',
                  boxSizing: 'border-box',
                  outline: 'none',
                  transition: 'all var(--transition-fast)'
                }}
                onFocus={(e) => {
                  if (!fieldErrors.password) e.target.style.borderColor = 'var(--color-accent)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(244, 123, 32, 0.2)';
                }}
                onBlur={(e) => {
                  if (!fieldErrors.password) e.target.style.borderColor = 'rgba(255, 255, 255, 0.14)';
                  e.target.style.boxShadow = 'none';
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                style={{
                  position: 'absolute',
                  right: '10px',
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255,255,255,0.5)',
                  cursor: 'pointer',
                  padding: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: '32px',
                  minHeight: '32px'
                }}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
            {fieldErrors.password && (
              <span id="partner-password-error" role="alert" style={{ display: 'block', color: '#EF4444', fontSize: '0.75rem', marginTop: '4px', fontWeight: '500' }}>
                {fieldErrors.password}
              </span>
            )}
          </div>

          {/* Primary Submit CTA Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              background: loading ? '#9A4605' : 'var(--color-accent)',
              color: '#FFFFFF',
              border: 'none',
              padding: '0.92rem',
              borderRadius: 'var(--radius-md)',
              fontWeight: '700',
              fontSize: '0.98rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: 'var(--shadow-accent)',
              transition: 'all var(--transition-fast)',
              opacity: loading ? 0.8 : 1,
              minHeight: '48px' // Touch target for mobile accessibility
            }}
          >
            {loading ? (
              <>
                <span style={{ 
                  display: 'inline-block', 
                  width: '16px', 
                  height: '16px', 
                  border: '2px solid rgba(255,255,255,0.3)', 
                  borderTopColor: '#fff', 
                  borderRadius: '50%', 
                  animation: 'spin 0.8s linear infinite' 
                }} />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Sign In to Partner Portal</span>
                <ArrowRight size={17} />
              </>
            )}
          </button>
        </form>

        {/* WhatsApp Direct Support Card */}
        <div style={{
          marginTop: '1.25rem',
          padding: '0.85rem 1rem',
          background: 'rgba(37, 211, 102, 0.08)',
          border: '1px solid rgba(37, 211, 102, 0.25)',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'rgba(37, 211, 102, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <MessageSquare size={16} color="#25D366" />
            </div>
            <div>
              <span style={{ fontSize: '0.825rem', fontWeight: '700', color: '#FFFFFF', display: 'block' }}>
                Need help signing in?
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-inverse-muted)', display: 'block' }}>
                Chat with shop team directly
              </span>
            </div>
          </div>

          <a
            href={whatsappHelpUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: '#25D366',
              color: '#FFFFFF',
              textDecoration: 'none',
              fontSize: '0.785rem',
              fontWeight: '700',
              padding: '6px 12px',
              borderRadius: 'var(--radius-full)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              boxShadow: '0 2px 6px rgba(37, 211, 102, 0.3)',
              flexShrink: 0
            }}
          >
            WhatsApp
          </a>
        </div>

        {/* Standardized Return to Public Showroom */}
        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-text-inverse-muted)',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 10px',
              borderRadius: 'var(--radius-sm)',
              transition: 'color var(--transition-fast)'
            }}
            onMouseEnter={(e) => e.target.style.color = '#FFFFFF'}
            onMouseLeave={(e) => e.target.style.color = 'var(--color-text-inverse-muted)'}
          >
            <ArrowLeft size={14} /> Back to Public Showroom
          </button>
        </div>
      </div>

      {/* Forgot PIN / Password Help Modal */}
      {showPinHelpModal && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            zIndex: 100
          }}
          onClick={() => setShowPinHelpModal(false)}
        >
          <div 
            style={{
              background: '#1A1C20',
              border: '1px solid rgba(244, 123, 32, 0.3)',
              borderRadius: 'var(--radius-lg)',
              maxWidth: '420px',
              width: '100%',
              padding: '1.75rem',
              position: 'relative',
              boxShadow: '0 20px 40px rgba(0,0,0,0.8)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setShowPinHelpModal(false)}
              style={{ position: 'absolute', right: '14px', top: '14px', background: 'none', border: 'none', color: '#999', cursor: 'pointer' }}
              aria-label="Close"
            >
              <X size={18} />
            </button>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.75rem' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'rgba(244, 123, 32, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <HelpCircle size={20} color="var(--color-accent)" />
              </div>
              <h4 style={{ margin: 0, color: '#FFFFFF', fontSize: '1.15rem' }}>Forgot PIN or Password?</h4>
            </div>

            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-inverse-muted)', lineHeight: '1.5', margin: '0 0 1.25rem 0' }}>
              Your partner account is managed directly by Shri Mahalakshmi Trader. If you forgot your login PIN or registered phone number, you can get it reset in 2 minutes via WhatsApp or by visiting the shop counter near Bharat Petrol Pump, Bagbahara.
            </p>

            <div style={{ display: 'flex', gap: '10px' }}>
              <a
                href={buildWhatsAppLink('919526162225', 'Namaste Shri Mahalakshmi Trader! I forgot my carpenter partner portal PIN and need help resetting it.')}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  flex: 1,
                  background: '#25D366',
                  color: '#FFFFFF',
                  textDecoration: 'none',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.875rem',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <MessageSquare size={16} /> Message Shop on WhatsApp
              </a>

              <button
                type="button"
                onClick={() => setShowPinHelpModal(false)}
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  color: '#FFFFFF',
                  border: '1px solid rgba(255,255,255,0.15)',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Subtle CSS animation for the button spinner */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
