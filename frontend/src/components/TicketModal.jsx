import React, { useEffect, useState } from 'react';
import { useCems } from '../context/CemsContext';
import QRCode from 'qrcode';
import { Calendar, MapPin, CheckCircle, ShieldCheck, Download, Sparkles, Cpu } from 'lucide-react';

export const TicketModal = () => {
  const { selectedTicket, setSelectedTicket } = useCems();
  const [qrSrc, setQrSrc] = useState('');

  useEffect(() => {
    if (selectedTicket?.registration?.qrToken) {
      QRCode.toDataURL(selectedTicket.registration.qrToken, {
        width: 280,
        margin: 2,
        color: {
          dark: '#070a14',
          light: '#ffffff'
        }
      })
        .then(url => setQrSrc(url))
        .catch(err => console.error(err));
    }
  }, [selectedTicket]);

  if (!selectedTicket) return null;

  const { registration, event } = selectedTicket;

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ padding: '0', overflow: 'hidden', maxWidth: '480px', border: '1px solid var(--cyan-neon)', boxShadow: '0 0 40px rgba(0, 240, 255, 0.3)' }}>
        
        {/* Holographic Header */}
        <div style={{
          background: 'linear-gradient(135deg, var(--cyan-neon) 0%, var(--violet-neon) 100%)',
          padding: '28px',
          color: '#070a14',
          textAlign: 'center',
          position: 'relative'
        }}>
          <button
            onClick={() => setSelectedTicket(null)}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'rgba(7, 10, 20, 0.3)',
              border: 'none',
              color: '#fff',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              fontSize: '1.2rem',
              cursor: 'pointer'
            }}
          >
            ×
          </button>
          
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(7, 10, 20, 0.25)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 800, color: '#fff', marginBottom: '10px' }}>
            <Cpu size={14} /> CYBER PASS TICKET
          </div>
          
          <h3 style={{ fontSize: '1.35rem', margin: '6px 0 4px', fontWeight: 900, color: '#070a14' }}>{event.title}</h3>
          <p style={{ fontSize: '0.82rem', fontWeight: 700, color: '#070a14', opacity: 0.85 }}>Host: {event.department}</p>
        </div>

        {/* Ticket Body */}
        <div style={{ padding: '28px', background: '#0d1324', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          
          {/* Animated QR Canvas Box */}
          <div style={{
            background: '#ffffff',
            padding: '18px',
            borderRadius: '20px',
            boxShadow: '0 0 30px rgba(0, 240, 255, 0.3)',
            marginBottom: '20px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {qrSrc ? (
              <img src={qrSrc} alt="QR Pass" style={{ width: '210px', height: '210px', display: 'block' }} />
            ) : (
              <div style={{ width: '210px', height: '210px', background: '#eee' }} />
            )}
            
            {/* Holographic Laser Line Effect */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '3px',
              background: 'var(--cyan-neon)',
              boxShadow: '0 0 10px var(--cyan-neon)',
              animation: 'scanLaser 2s infinite ease-in-out'
            }} />
          </div>

          <div className="mono-text" style={{ fontSize: '0.82rem', color: 'var(--cyan-neon)', fontWeight: 800, letterSpacing: '0.08em', marginBottom: '20px' }}>
            TOKEN: {registration.qrToken}
          </div>

          {/* Details Metadata List */}
          <div style={{ width: '100%', background: 'rgba(255,255,255,0.02)', borderRadius: '14px', padding: '18px', border: '1px solid var(--border-glass)', fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '10px', textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Student Holder:</span>
              <strong style={{ color: '#fff' }}>{registration.studentName}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Date & Time:</span>
              <strong style={{ color: '#fff' }}>{event.date} ({event.time})</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Venue Assigned:</span>
              <strong style={{ color: '#fff' }}>{event.venueName}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Gate Status:</span>
              <span className={`badge ${registration.checkedIn ? 'badge-approved' : 'badge-pending'}`}>
                {registration.checkedIn ? '✓ VERIFIED / CHECKED-IN' : 'VALID / UNCHECKED'}
              </span>
            </div>
          </div>

          {/* Verification Badge */}
          <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '20px', textAlign: 'center' }}>
            <ShieldCheck size={14} color="var(--emerald-neon)" style={{ display: 'inline', marginRight: '4px' }} />
            Single-Use Cryptographic Ticket • Scan at Gate Entrance Scanner
          </p>

        </div>

      </div>
    </div>
  );
};
