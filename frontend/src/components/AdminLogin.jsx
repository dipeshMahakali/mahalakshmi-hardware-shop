import React, { useState } from 'react';
import { Shield, Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, AlertCircle, Check, HelpCircle, X } from 'lucide-react';
import { businessApi } from '../api/businessApi';

export function AdminLogin({ onLoginSuccess, onCancel }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);

  const validate = () => {
    const errors = {};
    if (!email.trim()) {
      errors.email = 'Please enter your email address.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = 'Please enter a valid email address (e.g. owner@hardware.com).';
    }

    if (!password) {
      errors.password = 'Please enter your password.';
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

    try {
      await businessApi.login({ email: email.trim(), password });
      const userMe = await businessApi.getMe();
      if (userMe.role !== 'OWNER' && userMe.role !== 'STAFF') {
        throw new Error('Access restricted. Only authorized shop owner or staff can access this workspace.');
      }
      onLoginSuccess(true, userMe);
    } catch (err) {
      const msg = err.message || '';
      if (msg.toLowerCase().includes('network') || msg.toLowerCase().includes('failed to fetch')) {
        setServerError('Unable to connect to server. Please check your internet connection and try again.');
      } else if (msg.includes('401') || msg.toLowerCase().includes('invalid') || msg.toLowerCase().includes('credentials')) {
        setServerError('The email or password you entered is incorrect. Please try again.');
      } else if (msg.includes('restricted') || msg.includes('Access')) {
        setServerError(msg);
      } else {
        setServerError('Unable to sign in at this moment. Please check your details and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

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
      {/* Subtle Ambient Radial Lighting */}
      <div style={{
        position: 'absolute',
        top: '20%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '580px',
        height: '580px',
        background: 'radial-gradient(circle, rgba(244, 123, 32, 0.12) 0%, rgba(212, 175, 55, 0.04) 50%, transparent 75%)',
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
        maxWidth: '440px',
        background: 'rgba(26, 28, 33, 0.92)',
        backdropFilter: 'blur(16px)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(244, 123, 32, 0.15)',
        padding: '2.25rem 1.75rem',
        boxSizing: 'border-box'
      }}>
        {/* Security / Owner Emblem & Header */}
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
            <Shield size={26} color="var(--color-accent)" />
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
            AUTHORIZED PERSONNEL ONLY
          </div>

          <h2 style={{
            fontSize: '1.65rem',
            fontWeight: '800',
            color: '#FFFFFF',
            margin: '0 0 0.35rem 0',
            letterSpacing: '-0.02em'
          }}>
            Owner <span style={{ color: 'var(--color-accent)' }}>Workspace</span>
          </h2>
          <p style={{
            fontSize: '0.875rem',
            color: 'var(--color-text-inverse-muted)',
            margin: 0,
            lineHeight: '1.45',
            maxWidth: '340px'
          }}>
            Manage your shop, orders, inventory & carpenter network.
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

        {/* Form with noValidate to avoid ugly browser-native tooltips */}
        <form onSubmit={handleSubmit} noValidate>
          {/* Email Field */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label 
              htmlFor="owner-email" 
              style={{
                display: 'block',
                fontSize: '0.825rem',
                fontWeight: '600',
                color: 'var(--color-text-inverse-muted)',
                marginBottom: '0.4rem'
              }}
            >
              Email Address
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Mail size={17} style={{ position: 'absolute', left: '13px', color: fieldErrors.email ? '#EF4444' : 'rgba(255,255,255,0.4)', pointerEvents: 'none' }} />
              <input
                id="owner-email"
                type="email"
                name="email"
                autoComplete="email"
                inputMode="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.email) setFieldErrors(prev => ({ ...prev, email: null }));
                }}
                disabled={loading}
                placeholder="e.g. owner@hardware.com"
                aria-invalid={!!fieldErrors.email}
                aria-describedby={fieldErrors.email ? "owner-email-error" : undefined}
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: `1px solid ${fieldErrors.email ? '#EF4444' : 'rgba(255, 255, 255, 0.14)'}`,
                  borderRadius: 'var(--radius-md)',
                  color: '#FFFFFF',
                  padding: '0.85rem 1rem 0.85rem 2.55rem',
                  fontSize: '0.95rem',
                  boxSizing: 'border-box',
                  outline: 'none',
                  transition: 'all var(--transition-fast)'
                }}
                onFocus={(e) => {
                  if (!fieldErrors.email) e.target.style.borderColor = 'var(--color-accent)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(244, 123, 32, 0.2)';
                }}
                onBlur={(e) => {
                  if (!fieldErrors.email) e.target.style.borderColor = 'rgba(255, 255, 255, 0.14)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
            {fieldErrors.email && (
              <span id="owner-email-error" role="alert" style={{ display: 'block', color: '#EF4444', fontSize: '0.75rem', marginTop: '4px', fontWeight: '500' }}>
                {fieldErrors.email}
              </span>
            )}
          </div>

          {/* Password Field */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <label 
                htmlFor="owner-password" 
                style={{
                  fontSize: '0.825rem',
                  fontWeight: '600',
                  color: 'var(--color-text-inverse-muted)'
                }}
              >
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
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
                Forgot password?
              </button>
            </div>

            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Lock size={17} style={{ position: 'absolute', left: '13px', color: fieldErrors.password ? '#EF4444' : 'rgba(255,255,255,0.4)', pointerEvents: 'none' }} />
              <input
                id="owner-password"
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
                aria-describedby={fieldErrors.password ? "owner-password-error" : undefined}
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: `1px solid ${fieldErrors.password ? '#EF4444' : 'rgba(255, 255, 255, 0.14)'}`,
                  borderRadius: 'var(--radius-md)',
                  color: '#FFFFFF',
                  padding: '0.85rem 2.65rem 0.85rem 2.55rem',
                  fontSize: '0.95rem',
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
                aria-label={showPassword ? "Hide password" : "Show password"}
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
              <span id="owner-password-error" role="alert" style={{ display: 'block', color: '#EF4444', fontSize: '0.75rem', marginTop: '4px', fontWeight: '500' }}>
                {fieldErrors.password}
              </span>
            )}
          </div>

          {/* Remember Me Checkbox */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.825rem', color: 'var(--color-text-inverse-muted)' }}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{
                  accentColor: 'var(--color-accent)',
                  width: '16px',
                  height: '16px',
                  cursor: 'pointer',
                  borderRadius: '4px'
                }}
              />
              <span>Remember this workstation</span>
            </label>
          </div>

          {/* Primary CTA Button */}
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
              opacity: loading ? 0.8 : 1
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
                <span>Sign In to Owner Workspace</span>
                <ArrowRight size={17} />
              </>
            )}
          </button>
        </form>

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

      {/* Forgot Password Helper Modal */}
      {showForgotModal && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            zIndex: 100
          }}
          onClick={() => setShowForgotModal(false)}
        >
          <div 
            style={{
              background: '#1A1C20',
              border: '1px solid rgba(244, 123, 32, 0.3)',
              borderRadius: 'var(--radius-lg)',
              maxWidth: '400px',
              width: '100%',
              padding: '1.75rem',
              position: 'relative',
              boxShadow: '0 20px 40px rgba(0,0,0,0.8)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setShowForgotModal(false)}
              style={{ position: 'absolute', right: '14px', top: '14px', background: 'none', border: 'none', color: '#999', cursor: 'pointer' }}
              aria-label="Close"
            >
              <X size={18} />
            </button>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#FFFFFF', fontSize: '1.15rem' }}>Owner Workspace Recovery</h4>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-inverse-muted)', lineHeight: '1.5', margin: '0 0 1rem 0' }}>
              For security compliance, owner master credentials can only be reset via direct server console or master recovery passphrase.
            </p>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-accent)', margin: 0 }}>
              Need assistance? Contact your system administrator or verify local server configuration.
            </p>
          </div>
        </div>
      )}

      {/* Subtle CSS animation for the button spinner */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
