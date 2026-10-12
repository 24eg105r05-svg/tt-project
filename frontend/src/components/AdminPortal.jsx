import React, { useState } from 'react';
import { useCems } from '../context/CemsContext';
import { Shield, CheckCircle2, XCircle, MapPin, Plus, FileText, Activity } from 'lucide-react';

export const AdminPortal = () => {
  const { events, approveEvent, rejectEvent, venues, addVenue, auditLogs } = useCems();

  const [newVenueName, setNewVenueName] = useState('');
  const [newVenueLoc, setNewVenueLoc] = useState('');
  const [newVenueCap, setNewVenueCap] = useState(100);
  const [showAddVenue, setShowAddVenue] = useState(false);

  const pendingEvents = events.filter(e => e.status === 'PENDING');
  const processedEvents = events.filter(e => e.status !== 'PENDING');

  const handleAddVenueSubmit = (e) => {
    e.preventDefault();
    if (!newVenueName || !newVenueLoc) return;
    addVenue({
      name: newVenueName,
      location: newVenueLoc,
      capacity: parseInt(newVenueCap) || 100
    });
    setNewVenueName('');
    setNewVenueLoc('');
    setNewVenueCap(100);
    setShowAddVenue(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Admin Banner */}
      <div className="glass-panel" style={{ padding: '28px 36px', background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(99, 102, 241, 0.2) 100%)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <span className="badge badge-tech" style={{ marginBottom: '8px', background: 'rgba(139, 92, 246, 0.3)', color: '#a78bfa' }}>Administrative Oversight</span>
          <h2 style={{ fontSize: '1.8rem', color: '#fff', margin: '4px 0' }}>Approval Desk & System Audit</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Review pending event proposals, manage campus venue capacities, and inspect traceable action audit logs.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ textAlign: 'center', background: 'rgba(15, 23, 42, 0.8)', padding: '12px 20px', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--warning)' }}>{pendingEvents.length}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Pending Approvals</div>
          </div>
          <div style={{ textAlign: 'center', background: 'rgba(15, 23, 42, 0.8)', padding: '12px 20px', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--secondary)' }}>{venues.length}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Active Venues</div>
          </div>
        </div>
      </div>

      {/* Pending Proposals Section */}
      <div>
        <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Shield size={18} color="var(--warning)" /> Pending Event Approvals ({pendingEvents.length})
        </h3>

        {pendingEvents.length === 0 ? (
          <div className="glass-panel" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
            All proposals have been reviewed. Zero pending approvals! 🎉
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {pendingEvents.map(event => (
              <div key={event.id} className="glass-panel" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', borderLeft: '4px solid var(--warning)' }}>
                <div style={{ flex: '1 1 340px' }}>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                    <span className="badge badge-pending">Requires Approval</span>
                    <span className="badge badge-tech">{event.category}</span>
                    <span className="badge badge-academic">{event.department}</span>
                  </div>
                  <h4 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '6px' }}>{event.title}</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '12px' }}>{event.description}</p>
                  
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-dim)', display: 'flex', gap: '18px', flexWrap: 'wrap' }}>
                    <span>📅 {event.date} ({event.time})</span>
                    <span>📍 {event.venueName} (Cap: {event.capacity})</span>
                    <span>👤 Organizer: {event.organizerName}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button className="btn btn-danger" onClick={() => rejectEvent(event.id)}>
                    <XCircle size={16} /> Reject Proposal
                  </button>
                  <button className="btn btn-success" onClick={() => approveEvent(event.id)}>
                    <CheckCircle2 size={16} /> Approve & Publish
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Grid: Venue Manager & Audit Log */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        
        {/* Venue Management Box */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h4 style={{ fontSize: '1.1rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={18} color="var(--primary)" /> Campus Venues
            </h4>
            <button className="btn btn-secondary" onClick={() => setShowAddVenue(!showAddVenue)} style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
              <Plus size={14} /> Add Venue
            </button>
          </div>

          {showAddVenue && (
            <form onSubmit={handleAddVenueSubmit} style={{ background: 'rgba(15,23,42,0.8)', padding: '16px', borderRadius: '12px', marginBottom: '16px', border: '1px solid var(--border-glass)' }}>
              <input
                type="text"
                className="glass-input"
                placeholder="Venue Name (e.g. Auditorium B)"
                required
                value={newVenueName}
                onChange={(e) => setNewVenueName(e.target.value)}
                style={{ width: '100%', marginBottom: '10px' }}
              />
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px', marginBottom: '10px' }}>
                <input
                  type="text"
                  className="glass-input"
                  placeholder="Location (e.g. Science Block Fl 2)"
                  required
                  value={newVenueLoc}
                  onChange={(e) => setNewVenueLoc(e.target.value)}
                />
                <input
                  type="number"
                  className="glass-input"
                  placeholder="Cap"
                  value={newVenueCap}
                  onChange={(e) => setNewVenueCap(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', fontSize: '0.82rem' }}>Save Venue</button>
            </form>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '300px', overflowY: 'auto' }}>
            {venues.map(v => (
              <div key={v.id} style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid var(--border-glass)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.9rem' }}>{v.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{v.location}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className="badge badge-tech" style={{ fontSize: '0.7rem' }}>Cap: {v.capacity}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Audit Log Box */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h4 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={18} color="var(--secondary)" /> System Audit Log
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '340px', overflowY: 'auto' }}>
            {auditLogs.map(log => (
              <div key={log.id} style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', borderLeft: '3px solid var(--primary)', fontSize: '0.8rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-main)', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 700 }}>{log.actor}</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>{new Date(log.timestamp).toLocaleTimeString()}</span>
                </div>
                <div style={{ color: 'var(--text-muted)' }}>
                  Action: <span style={{ color: 'var(--secondary)' }}>{log.action}</span> — {log.entity}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
