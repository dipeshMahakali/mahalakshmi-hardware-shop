import React, { useState } from 'react';
import { businessApi } from '../api/businessApi';

export function AdminLogin({ onLoginSuccess, onCancel }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const loginRes = await businessApi.login({ email, password });
      // Verify user role
      const userMe = await businessApi.getMe();
      if (userMe.role !== 'OWNER' && userMe.role !== 'STAFF') {
        throw new Error('Access Denied. Only Shop Owner or Staff can access the Admin Panel.');
      }

      onLoginSuccess(true, userMe);
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '440px', margin: '4rem auto', padding: '2rem', background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'inline-flex', background: '#eff6ff', color: '#2563eb', padding: '0.75rem', borderRadius: '50%', marginBottom: '1rem' }}>
          <span style={{ fontSize: '1.8rem' }}>🔒</span>
        </div>
        <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem', color: '#0f172a' }}>Shop Owner Admin Login</h3>
        <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>Authorized Personnel Access Only</p>
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '0.75rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
          ❌ {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', color: '#334155', marginBottom: '0.35rem' }}>
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="owner@hardware.com"
            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', color: '#334155', marginBottom: '0.35rem' }}>
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', boxSizing: 'border-box' }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{ width: '100%', background: '#2563eb', color: '#fff', border: 'none', padding: '0.85rem', borderRadius: '8px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', marginBottom: '1rem' }}
        >
          {loading ? 'Authenticating...' : '🔐 Sign In to Admin Panel'}
        </button>

        <button
          type="button"
          onClick={onCancel}
          style={{ width: '100%', background: 'none', border: '1px solid #cbd5e1', color: '#64748b', padding: '0.6rem', borderRadius: '8px', fontSize: '0.85rem', cursor: 'pointer' }}
        >
          ← Back to Public Shop
        </button>
      </form>
    </div>
  );
}

