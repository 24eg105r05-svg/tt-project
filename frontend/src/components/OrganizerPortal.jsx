import React, { useRef, useState } from 'react';
import { useCems } from '../context/CemsContext';
import { PlusCircle, QrCode, Calendar, MapPin, CheckCircle, AlertTriangle, Users, Send } from 'lucide-react';

// Default the proposal form to two weeks from today (server rejects past dates).
const defaultEventDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + 14);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export const OrganizerPortal = () => {
  const { 
    events, 
    venues, 
    registrations, 
    currentUser, 
    proposeEvent, 
    setScannerOpen, 
    proposalModalOpen, 
    setProposalModalOpen,
    checkVenueConflict,
    notify
  } = useCems();

  const [formData, setFormData] = useState({
    title: '',
    category: 'Technical',
    department: currentUser.department || 'Computer Science',
    venueId: venues[0]?.id || '',
    date: defaultEventDate(),
    time: '10:00 AM - 01:00 PM',
    capacity: 60,
    description: '',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80'
  });

  const conflictReq = useRef(0);
  const [conflictWarning, setConflictWarning] = useState(null);
  const [announcementText, setAnnouncementText] = useState('');

  // Filter events proposed by organizers
  const myEvents = events.filter(e => e.organizerId === currentUser.id || currentUser.role === 'organizer');

  const handleVenueDateChange = async (field, value) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);

    // Live conflict detection preview (server-side; ignore out-of-order responses)
    if (updated.venueId && updated.date && updated.time) {
      const requestId = ++conflictReq.current;
      const conflict = await checkVenueConflict(updated.venueId, updated.date, updated.time);
      if (requestId !== conflictReq.current) return;
      if (conflict) {
        setConflictWarning(`⚠️ Schedule Clash Warning: Venue is already reserved by "${conflict.title}" on ${updated.date}!`);
      } else {
        setConflictWarning(null);
      }
    }
  };

  const handleSubmitProposal = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      alert('Please fill out the title and description.');
      return;
    }

    const res = await proposeEvent(formData);
    if (res.success) {
      setProposalModalOpen(false);
      setFormData({
        title: '',
        category: 'Technical',
        department: 'Computer Science',
        venueId: venues[0]?.id || '',
        date: defaultEventDate(),
        time: '10:00 AM - 01:00 PM',
        capacity: 60,
        description: '',
        image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80'
      });
      setConflictWarning(null);
    } else {
      alert(res.message);
    }
  };

  const handleSendBroadcast = (e) => {
    e.preventDefault();
    if (!announcementText) return;
    notify(`ANNOUNCEMENT BROADCASTED: "${announcementText}"`, 'success');
    setAnnouncementText('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Organizer Header */}
      <div className="glass-panel" style={{ padding: '28px 36px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <span className="badge badge-cultural" style={{ marginBottom: '8px' }}>Organizer Control Desk</span>
          <h2 style={{ fontSize: '1.8rem', color: '#fff', margin: '4px 0' }}>Event Operations & QR Attendance</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Submit new event proposals with automated schedule conflict detection, track live registrations, and scan attendee QR passes.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-secondary" onClick={() => setScannerOpen(true)}>
            <QrCode size={18} color="var(--secondary)" /> QR Code Scanner
          </button>
          <button className="btn btn-primary" onClick={() => setProposalModalOpen(true)}>
            <PlusCircle size={18} /> Propose New Event
          </button>
        </div>
      </div>

      {/* Grid Layout: My Events List & Announcement Broadcaster */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        
        {/* Events Table / List */}
        <div>
          <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={18} color="var(--primary)" /> Managed Events Roster
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {myEvents.map(event => {
              const eventRegs = registrations.filter(r => r.eventId === event.id);
              const checkedInCount = eventRegs.filter(r => r.checkedIn).length;
              const attendanceRate = eventRegs.length > 0 ? Math.round((checkedInCount / eventRegs.length) * 100) : 0;

              return (
                <div key={event.id} className="glass-panel" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                  <div style={{ flex: '1 1 280px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                      <span className={`badge badge-${event.status.toLowerCase()}`}>
                        {event.status}
                      </span>
                      <span className="badge badge-tech">{event.category}</span>
                    </div>
                    <h4 style={{ fontSize: '1.1rem', color: '#fff', margin: '4px 0' }}>{event.title}</h4>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                      <span><Calendar size={13} /> {event.date} ({event.time})</span>
                      <span><MapPin size={13} /> {event.venueName}</span>
                    </div>
                  </div>

                  {/* Attendance Stats Pills */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>{eventRegs.length} / {event.capacity}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Registered</div>
                    </div>

                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--success)' }}>{checkedInCount} ({attendanceRate}%)</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>QR Checked-In</div>
                    </div>

                    <button className="btn btn-secondary" onClick={() => setScannerOpen(true)} style={{ padding: '8px 12px', fontSize: '0.8rem' }}>
                      <QrCode size={14} /> Scan Passes
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Broadcast Feed & Quick Scanner Widget */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Broadcaster Widget */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h4 style={{ fontSize: '1.05rem', color: '#fff', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Send size={16} color="var(--secondary)" /> Live Student Broadcast
            </h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
              Send real-time alerts or venue change notices to all registered students via WebSocket STOMP simulation.
            </p>
            <form onSubmit={handleSendBroadcast}>
              <textarea
                className="glass-input"
                placeholder="Type urgent announcement (e.g. Venue moved to Hall A)..."
                rows={3}
                value={announcementText}
                onChange={(e) => setAnnouncementText(e.target.value)}
                style={{ width: '100%', marginBottom: '12px', resize: 'vertical' }}
              />
              <button type="submit" className="btn btn-primary" style={{ width: '100%', fontSize: '0.85rem' }}>
                <Send size={14} /> Push Alert Broadcast
              </button>
            </form>
          </div>

          {/* Quick Scanner Launcher Banner */}
          <div className="glass-panel" style={{ padding: '24px', background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(16, 185, 129, 0.15) 100%)' }}>
            <h4 style={{ color: '#fff', marginBottom: '6px' }}>Verified Entrance Check-In</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
              Use the built-in scanner to verify single-use QR tickets at the event entrance.
            </p>
            <button className="btn btn-success" onClick={() => setScannerOpen(true)} style={{ width: '100%' }}>
              <QrCode size={16} /> Open Scanner Desk
            </button>
          </div>

        </div>

      </div>

      {/* Propose Event Modal */}
      {proposalModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ color: '#fff', fontSize: '1.3rem' }}>Propose New Campus Event</h3>
              <button onClick={() => setProposalModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.4rem', cursor: 'pointer' }}>×</button>
            </div>

            <form onSubmit={handleSubmitProposal} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div>
                <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Event Title *</label>
                <input
                  type="text"
                  className="glass-input"
                  required
                  placeholder="e.g. AI & Robotics Symposium 2026"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Category</label>
                  <select
                    className="glass-input"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    style={{ width: '100%' }}
                  >
                    <option value="Technical">Technical</option>
                    <option value="Cultural">Cultural</option>
                    <option value="Academic">Academic</option>
                    <option value="Sports">Sports</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Host Department</label>
                  <input
                    type="text"
                    className="glass-input"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              {/* Venue Selection & Smart Conflict Detection Trigger */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Requested Venue</label>
                  <select
                    className="glass-input"
                    value={formData.venueId}
                    onChange={(e) => handleVenueDateChange('venueId', e.target.value)}
                    style={{ width: '100%' }}
                  >
                    {venues.map(v => (
                      <option key={v.id} value={v.id}>{v.name} (Cap: {v.capacity})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Max Capacity</label>
                  <input
                    type="number"
                    className="glass-input"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 50 })}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Event Date</label>
                  <input
                    type="date"
                    className="glass-input"
                    value={formData.date}
                    onChange={(e) => handleVenueDateChange('date', e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Time Slot</label>
                  <input
                    type="text"
                    className="glass-input"
                    value={formData.time}
                    onChange={(e) => handleVenueDateChange('time', e.target.value)}
                    placeholder="10:00 AM - 01:00 PM"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              {/* Conflict Detection Alert Box */}
              {conflictWarning && (
                <div style={{
                  padding: '12px',
                  borderRadius: '10px',
                  background: 'rgba(244, 63, 94, 0.15)',
                  border: '1px solid rgba(244, 63, 94, 0.3)',
                  color: '#fb7185',
                  fontSize: '0.82rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <AlertTriangle size={16} /> {conflictWarning}
                </div>
              )}

              <div>
                <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Event Summary & Highlights</label>
                <textarea
                  className="glass-input"
                  rows={3}
                  required
                  placeholder="Outline the agenda, speakers, prerequisites..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={{ width: '100%', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setProposalModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Submit for Approval</button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
