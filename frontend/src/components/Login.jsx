import React, { useState } from 'react';
import { Cpu, LogIn, UserPlus, Shield, User, Sparkles, AlertTriangle, Loader2, Settings } from 'lucide-react';
import { useCems, DEMO_MODE, DEMO_ACCOUNTS } from '../context/CemsContext';
import { getApiUrl, setApiUrl } from '../api/client';

export const Login = () => {
  const { signIn, signUp, authMessage } = useCems();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({ name: '', email: '', password: '', department: '' });
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [showApiConfig, setShowApiConfig] = useState(false);
  const [customApiUrl, setCustomApiUrl] = useState(getApiUrl());

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === 'login') {
        await signIn(form.email, form.password);
      } else {
        await signUp(form);
      }
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  const demoLogin = async (role) => {
    setError(null);
    setBusy(true);
    try {
      await signIn(DEMO_ACCOUNTS[role], import.meta.env.VITE_DEMO_PASSWORD || 'cems@123');
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  const labelStyle = { fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '440px', padding: '36px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }}>
          <div style={{
            width: '46px', height: '46px', borderRadius: '14px',
            background: 'linear-gradient(135deg, var(--cyan-neon) 0%, var(--violet-neon) 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 20px rgba(0, 240, 255, 0.5)'
          }}>
            <Cpu size={26} color="#070a14" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#fff', margin: 0 }}>
              CEMS <span style={{ color: 'var(--cyan-neon)', fontSize: '0.95rem' }}>2.0</span>
            </h1>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
              {mode === 'login' ? 'Sign in to your campus account' : 'Create a student account'}
            </p>
          </div>
        </div>

        {(error || authMessage) && (
          <div style={{
            padding: '12px', borderRadius: '10px', marginBottom: '16px',
            background: 'rgba(255, 0, 127, 0.12)', border: '1px solid rgba(255, 0, 127, 0.4)',
            color: 'var(--pink-neon)', fontSize: '0.85rem'
          }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <AlertTriangle size={18} style={{ flexShrink: 0 }} /> 
              <span>{error || authMessage}</span>
            </div>

            {error && error.includes('Cannot reach') && (
              <div style={{ marginTop: '10px', borderTop: '1px solid rgba(255, 0, 127, 0.25)', paddingTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowApiConfig(!showApiConfig)}
                  style={{
                    background: 'none', border: 'none', color: 'var(--cyan-neon)',
                    cursor: 'pointer', padding: 0, fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '5px'
                  }}
                >
                  <Settings size={14} /> {showApiConfig ? 'Hide API URL Settings' : 'Set / Change Backend URL'}
                </button>

                {showApiConfig && (
                  <div style={{ marginTop: '8px' }}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <input
                        className="glass-input"
                        style={{ flex: 1, padding: '6px 10px', fontSize: '0.8rem', color: '#fff' }}
                        placeholder="https://cems-backend-xxxx.onrender.com"
                        value={customApiUrl}
                        onChange={(e) => setCustomApiUrl(e.target.value)}
                      />
                      <button
                        type="button"
                        className="btn btn-primary"
                        style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                        onClick={() => setApiUrl(customApiUrl)}
                      >
                        Save & Connect
                      </button>
                    </div>
                    <p style={{ margin: '6px 0 0', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      Enter your live Render backend URL (e.g. from your Render dashboard).
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {mode === 'register' && (
            <>
              <div>
                <label style={labelStyle}>Full name</label>
                <input className="glass-input" style={{ width: '100%' }} value={form.name} onChange={set('name')} required />
              </div>
              <div>
                <label style={labelStyle}>Department</label>
                <input className="glass-input" style={{ width: '100%' }} value={form.department} onChange={set('department')} placeholder="Computer Science" />
              </div>
            </>
          )}
          <div>
            <label style={labelStyle}>College email</label>
            <input className="glass-input" type="email" style={{ width: '100%' }} value={form.email} onChange={set('email')} required autoComplete="username" />
          </div>
          <div>
            <label style={labelStyle}>Password{mode === 'register' ? ' (min 8 characters)' : ''}</label>
            <input
              className="glass-input" type="password" style={{ width: '100%' }} value={form.password} onChange={set('password')}
              required minLength={mode === 'register' ? 8 : undefined}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
          </div>

          <button className="btn btn-primary" type="submit" disabled={busy} style={{ justifyContent: 'center', marginTop: '4px' }}>
            {busy ? <Loader2 size={16} /> : mode === 'login' ? <LogIn size={16} /> : <UserPlus size={16} />}
            {mode === 'login' ? ' Sign In' : ' Create Account'}
          </button>
        </form>

        <button
          type="button"
          onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(null); }}
          style={{ background: 'none', border: 'none', color: 'var(--cyan-neon)', cursor: 'pointer', marginTop: '16px', fontSize: '0.85rem', width: '100%' }}
        >
          {mode === 'login' ? "New student? Create an account" : 'Already registered? Sign in'}
        </button>

        {DEMO_MODE && (
          <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border-glass)' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginBottom: '10px', textAlign: 'center' }}>
              DEMO QUICK LOGIN
            </div>
            <div className="role-switcher" style={{ justifyContent: 'center' }}>
              <button className="role-btn" disabled={busy} onClick={() => demoLogin('student')}><User size={14} /> Student</button>
              <button className="role-btn" disabled={busy} onClick={() => demoLogin('organizer')}><Sparkles size={14} /> Organizer</button>
              <button className="role-btn" disabled={busy} onClick={() => demoLogin('admin')}><Shield size={14} /> Admin</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
