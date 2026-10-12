import React, { useState } from 'react';
import { useCems } from '../context/CemsContext';
import { QrCode, CheckCircle2, AlertOctagon, Zap, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';

export const QRScannerModal = () => {
  const { scannerOpen, setScannerOpen, verifyQrCode, registrations } = useCems();

  const [inputToken, setInputToken] = useState('');
  const [scanResult, setScanResult] = useState(null);

  if (!scannerOpen) return null;

  const handleVerify = async (tokenToTest) => {
    const token = tokenToTest || inputToken;
    if (!token) return;

    const res = await verifyQrCode(token);
    setScanResult(res);

    if (res.success) {
      confetti({
        particleCount: 110,
        spread: 80,
        origin: { y: 0.6 }
      });
    }
  };

  const sampleTokens = registrations.map(r => ({
    token: r.qrToken,
    name: r.studentName,
    checkedIn: r.checkedIn
  }));

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ padding: '30px', maxWidth: '560px', borderColor: 'var(--cyan-neon)' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h3 style={{ color: '#fff', fontSize: '1.35rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <QrCode color="var(--cyan-neon)" size={24} /> Cyber Gate Scanner Desk
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Scan or verify single-use student QR ticket tokens</p>
          </div>
          <button onClick={() => { setScannerOpen(false); setScanResult(null); }} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.6rem', cursor: 'pointer' }}>×</button>
        </div>

        {/* Viewfinder Target Scanner Overlay */}
        <div style={{
          height: '190px',
          borderRadius: '20px',
          background: 'linear-gradient(135deg, rgba(7, 10, 20, 0.95) 0%, rgba(20, 30, 55, 0.95) 100%)',
          border: '1.5px solid rgba(0, 240, 255, 0.4)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          marginBottom: '20px',
          boxShadow: 'inset 0 0 30px rgba(0, 240, 255, 0.15)'
        }}>
          {/* Laser Scanning Line */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: 'var(--cyan-neon)',
            boxShadow: '0 0 20px var(--cyan-neon)',
            animation: 'scanLaser 2.2s infinite ease-in-out'
          }} />

          {/* Corner Target Bracket Hints */}
          <div style={{ position: 'absolute', top: '14px', left: '14px', width: '20px', height: '20px', borderTop: '2px solid var(--cyan-neon)', borderLeft: '2px solid var(--cyan-neon)' }} />
          <div style={{ position: 'absolute', top: '14px', right: '14px', width: '20px', height: '20px', borderTop: '2px solid var(--cyan-neon)', borderRight: '2px solid var(--cyan-neon)' }} />
          <div style={{ position: 'absolute', bottom: '14px', left: '14px', width: '20px', height: '20px', borderBottom: '2px solid var(--cyan-neon)', borderLeft: '2px solid var(--cyan-neon)' }} />
          <div style={{ position: 'absolute', bottom: '14px', right: '14px', width: '20px', height: '20px', borderBottom: '2px solid var(--cyan-neon)', borderRight: '2px solid var(--cyan-neon)' }} />

          <QrCode size={52} color="var(--cyan-neon)" style={{ marginBottom: '10px', opacity: 0.9 }} />
          <div style={{ fontSize: '0.88rem', color: '#fff', fontWeight: 700 }}>Scanner Viewfinder Active</div>
          <div className="mono-text" style={{ fontSize: '0.72rem', color: 'var(--cyan-neon)' }}>Awaiting CEMS QR Token Stream...</div>
        </div>

        {/* Manual Token Verification Input */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <input
            type="text"
            className="glass-input"
            placeholder="Paste student QR Token (e.g. CEMS-QR-101...)"
            value={inputToken}
            onChange={(e) => setInputToken(e.target.value)}
            style={{ flex: 1 }}
          />
          <button className="btn btn-primary" onClick={() => handleVerify()}>
            Verify
          </button>
        </div>

        {/* 1-Click Interactive Verification Samples */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Zap size={14} color="var(--gold-neon)" /> Interactive 1-Click Verification Test:
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '130px', overflowY: 'auto' }}>
            {sampleTokens.length === 0 ? (
              <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>No registered student tickets available to test. Register as a student first!</span>
            ) : (
              sampleTokens.map((item, i) => (
                <button
                  key={i}
                  onClick={() => { setInputToken(item.token); handleVerify(item.token); }}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1px solid var(--border-glass)',
                    background: 'rgba(255,255,255,0.02)',
                    color: 'var(--text-main)',
                    fontSize: '0.8rem',
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <span><strong>{item.name}</strong> — <span className="mono-text" style={{ color: 'var(--cyan-neon)' }}>{item.token}</span></span>
                  <span className={`badge ${item.checkedIn ? 'badge-approved' : 'badge-pending'}`} style={{ fontSize: '0.65rem' }}>
                    {item.checkedIn ? 'Checked-In' : 'Unchecked'}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Gate Scan Feedback Box */}
        {scanResult && (
          <div style={{
            padding: '18px',
            borderRadius: '14px',
            background: scanResult.success ? 'rgba(0, 255, 157, 0.15)' : 'rgba(255, 0, 127, 0.15)',
            border: `1px solid ${scanResult.success ? 'rgba(0, 255, 157, 0.5)' : 'rgba(255, 0, 127, 0.5)'}`,
            color: scanResult.success ? 'var(--emerald-neon)' : 'var(--pink-neon)',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '14px'
          }}>
            {scanResult.success ? <CheckCircle2 size={26} /> : <AlertOctagon size={26} />}
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>{scanResult.success ? 'GATE ACCESS GRANTED ✓' : 'ACCESS DENIED ❌'}</div>
              <div style={{ fontSize: '0.82rem', marginTop: '2px' }}>{scanResult.message}</div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
