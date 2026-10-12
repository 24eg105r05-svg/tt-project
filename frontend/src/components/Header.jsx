import React, { useState } from 'react';
import { useCems, DEMO_MODE } from '../context/CemsContext';
import { Calendar, Shield, User, Bell, Sparkles, PlusCircle, QrCode, Cpu, Activity, LogOut } from 'lucide-react';

export const Header = ({ activeTab, setActiveTab }) => {
  const { currentUser, switchUser, signOut, events, notifications, setScannerOpen, setProposalModalOpen } = useCems();
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  const approvedCount = events.filter(e => e.status === 'APPROVED').length;
  const pendingCount = events.filter(e => e.status === 'PENDING').length;

  return (
    <header style={{
      sticky: 'top',
      position: 'sticky',
      top: '12px',
      zIndex: 500,
      padding: '0 24px',
      maxWidth: '1440px',
      margin: '0 auto',
      width: '100%'
    }}>
      <div className="glass-panel" style={{
        padding: '12px 24px',
        borderRadius: '24px',
        border: '1px solid rgba(0, 240, 255, 0.25)',
        background: 'rgba(7, 10, 20, 0.85)',
        backdropFilter: 'blur(24px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '20px',
        flexWrap: 'wrap',
        boxShadow: '0 10px 30px rgba(0, 240, 255, 0.15)'
      }}>
        
        {/* Brand & Cyber Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, var(--cyan-neon) 0%, var(--violet-neon) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(0, 240, 255, 0.5)',
            fontSize: '1.4rem',
            color: '#070a14'
          }}>
            <Cpu size={26} color="#070a14" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.03em', margin: 0 }}>
                CEMS <span style={{ color: 'var(--cyan-neon)', fontSize: '0.9rem' }}>2.0</span>
              </h1>
              <span className="badge badge-tech" style={{ fontSize: '0.62rem' }}>AURORA OS</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>Smart Campus Event & Attendance Platform</p>
          </div>
        </div>

        {/* Floating Navigation Island */}
        <div style={{ display: 'flex', gap: '6px', background: 'rgba(13, 19, 36, 0.8)', padding: '5px', borderRadius: '16px', border: '1px solid var(--border-glass)' }}>
          <button
            onClick={() => setActiveTab('events')}
            style={{
              padding: '8px 18px',
              borderRadius: '12px',
              border: 'none',
              background: activeTab === 'events' ? 'linear-gradient(135deg, var(--cyan-neon), #0099ff)' : 'transparent',
              color: activeTab === 'events' ? '#070a14' : 'var(--text-muted)',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.25s ease',
              fontSize: '0.88rem'
            }}
          >
            <Calendar size={16} /> Campus Events <span style={{ background: 'rgba(0,0,0,0.2)', padding: '2px 8px', borderRadius: '10px', fontSize: '0.75rem' }}>{approvedCount}</span>
          </button>
          
          <button
            onClick={() => setActiveTab('analytics')}
            style={{
              padding: '8px 18px',
              borderRadius: '12px',
              border: 'none',
              background: activeTab === 'analytics' ? 'linear-gradient(135deg, var(--cyan-neon), #0099ff)' : 'transparent',
              color: activeTab === 'analytics' ? '#070a14' : 'var(--text-muted)',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.25s ease',
              fontSize: '0.88rem'
            }}
          >
            <Activity size={16} /> Analytics & Reports
          </button>
        </div>

        {/* Quick Actions & Role Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>

          {currentUser.role === 'organizer' && (
            <button className="btn btn-primary" onClick={() => setProposalModalOpen(true)} style={{ fontSize: '0.85rem' }}>
              <PlusCircle size={16} /> Propose Event
            </button>
          )}

          {(currentUser.role === 'organizer' || currentUser.role === 'admin') && (
            <button className="btn btn-secondary" onClick={() => setScannerOpen(true)} style={{ fontSize: '0.85rem', borderColor: 'var(--cyan-neon)' }}>
              <QrCode size={16} color="var(--cyan-neon)" /> Gate Scanner
            </button>
          )}

          {/* Signed-in user */}
          <div style={{ textAlign: 'right', lineHeight: 1.2 }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fff' }}>{currentUser.name}</div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{currentUser.role}</div>
          </div>

          {/* Persona / Role Selector (demo accounts only) */}
          {DEMO_MODE && (
          <div className="role-switcher">
            <button
              className={`role-btn ${currentUser.role === 'student' ? 'active' : ''}`}
              onClick={() => switchUser('student')}
            >
              <User size={14} /> Student
            </button>
            <button
              className={`role-btn ${currentUser.role === 'organizer' ? 'active' : ''}`}
              onClick={() => switchUser('organizer')}
            >
              <Sparkles size={14} /> Organizer
            </button>
            <button
              className={`role-btn ${currentUser.role === 'admin' ? 'active' : ''}`}
              onClick={() => switchUser('admin')}
            >
              <Shield size={14} /> Admin {pendingCount > 0 && <span style={{ background: 'var(--danger)', color: '#fff', borderRadius: '50%', padding: '2px 6px', fontSize: '0.68rem' }}>{pendingCount}</span>}
            </button>
          </div>
          )}

          <button
            onClick={signOut}
            title="Sign out"
            style={{
              width: '42px', height: '42px', borderRadius: '14px',
              background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border-glass)',
              color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
            }}
          >
            <LogOut size={18} />
          </button>

          {/* Notifications Drawer Toggle */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowNotifMenu(!showNotifMenu)}
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '14px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-glass)',
                color: 'var(--cyan-neon)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                position: 'relative',
                transition: 'all 0.2s ease'
              }}
            >
              <Bell size={18} />
              {notifications.length > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  background: 'var(--pink-neon)',
                  color: '#fff',
                  fontSize: '0.65rem',
                  fontWeight: 900,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {notifications.length}
                </span>
              )}
            </button>

            {showNotifMenu && (
              <div className="glass-panel" style={{
                position: 'absolute',
                top: '52px',
                right: 0,
                width: '340px',
                padding: '18px',
                zIndex: 600,
                boxShadow: '0 20px 50px rgba(0,0,0,0.9)',
                borderColor: 'var(--border-glow)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '10px' }}>
                  <h4 style={{ fontSize: '0.9rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Sparkles size={14} color="var(--cyan-neon)" /> Live STOMP Stream
                  </h4>
                  <span className="mono-text" style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>WebSocket Active</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '250px', overflowY: 'auto' }}>
                  {notifications.map(n => (
                    <div key={n.id} style={{
                      padding: '12px',
                      borderRadius: '10px',
                      background: 'rgba(255,255,255,0.02)',
                      borderLeft: `3px solid ${n.type === 'success' ? 'var(--emerald-neon)' : n.type === 'warning' ? 'var(--gold-neon)' : 'var(--cyan-neon)'}`,
                      fontSize: '0.8rem'
                    }}>
                      <div style={{ color: 'var(--text-main)', marginBottom: '4px', fontWeight: 500 }}>{n.text}</div>
                      <div className="mono-text" style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>{n.time}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
};
