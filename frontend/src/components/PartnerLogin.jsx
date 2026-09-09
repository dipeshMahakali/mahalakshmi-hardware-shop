import React, { useState } from 'react';
import { Hammer } from 'lucide-react';
import { businessApi } from '../api/businessApi';

export function PartnerLogin({ onLoginSuccess, onCancel }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      await businessApi.login({ email, password });
      const user = await businessApi.getMe();
      if (user.role !== 'CARPENTER') throw new Error('This sign-in is only for carpenter partners.');
      onLoginSuccess(user);
    } catch (err) {
      setError(err.message || 'Unable to sign in. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="partner-login-card">
      <div className="partner-login-icon"><Hammer size={24} /></div>
      <span className="panel-eyebrow">CARPENTER PARTNER</span>
      <h2>Welcome back</h2>
      <p>Sign in to send orders, check projects, and view your Khata.</p>
      {error && <div className="partner-login-error" role="alert">{error}</div>}
      <form onSubmit={handleSubmit}>
        <label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
        <label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
        <button type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Sign in to Partner Panel'}</button>
      </form>
      <button className="partner-back-button" type="button" onClick={onCancel}>Back to public shop</button>
    </section>
  );
}
