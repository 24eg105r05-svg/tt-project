import React, { useState } from 'react';
import { useCems } from '../context/CemsContext';
import { Search, MapPin, Calendar, Clock, Users, QrCode, CheckCircle2, Ticket, AlertCircle, Sparkles, Compass, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';

export const StudentPortal = () => {
  const { events, registrations, registerForEvent, cancelRegistration, currentUser, setSelectedTicket } = useCems();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedDept, setSelectedDept] = useState('ALL');

  const approvedEvents = events.filter(e => e.status === 'APPROVED');

  const filteredEvents = approvedEvents.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          event.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'ALL' || event.category.toUpperCase() === selectedCategory.toUpperCase();
    const matchesDept = selectedDept === 'ALL' || event.department.toUpperCase() === selectedDept.toUpperCase();
    return matchesSearch && matchesCat && matchesDept;
  });

  const myRegistrations = registrations.filter(r => r.studentId === currentUser.id);

  const handleRegister = async (eventId) => {
    const gotSeat = await registerForEvent(eventId);
    if (gotSeat) {
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.65 }
      });
    }
  };

  // Helper: Live Countdown Calculator
  const getCountdown = (eventDateStr) => {
    const eventTime = new Date(`${eventDateStr}T00:00:00`).getTime(); // local midnight
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const days = Math.round((eventTime - today.getTime()) / (1000 * 60 * 60 * 24));
    if (days < 0) return 'Event Ended';
    if (days === 0) return 'Starts Today!';
    return `In ${days} days`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '36px' }}>
      
      {/* Hero Cyber Header Banner */}
      <div className="glass-panel" style={{
        padding: '36px 44px',
        background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.15) 0%, rgba(157, 78, 221, 0.15) 100%)',
        borderColor: 'rgba(0, 240, 255, 0.3)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '24px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)'
      }}>
        <div style={{ maxWidth: '680px' }}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            <span className="badge badge-tech"><Sparkles size={12} /> Student Discovery Portal</span>
            <span className="badge badge-academic">Verifiable QR Check-In</span>
          </div>
          <h2 style={{ fontSize: '2.2rem', color: '#ffffff', marginBottom: '10px', fontWeight: 900 }}>
            Welcome back, <span style={{ color: 'var(--cyan-neon)' }}>{currentUser.name}</span> 👋
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>
            Explore technical hackathons, cultural music nights, sports leagues, and quantum computing workshops. Register with 1-click and get your single-use QR pass instantly.
          </p>
        </div>

        {/* Digital Wallet Card Summary */}
        <div className="holo-card" style={{ padding: '2px' }}>
          <div style={{
            background: 'rgba(10, 16, 30, 0.9)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px 28px',
            display: 'flex',
            alignItems: 'center',
            gap: '18px',
            minWidth: '260px'
          }}>
            <div style={{
              width: '54px',
              height: '54px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, var(--cyan-neon) 0%, var(--violet-neon) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#070a14',
              boxShadow: '0 0 20px rgba(0, 240, 255, 0.4)'
            }}>
              <Ticket size={28} />
            </div>
            <div>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#fff' }}>{myRegistrations.length}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Active QR Passes</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Cyber Search Bar */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        
        {/* Search Input */}
        <div style={{ position: 'relative', flex: '1 1 340px' }}>
          <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--cyan-neon)' }} />
          <input
            type="text"
            className="glass-input"
            placeholder="Search AI workshops, dance battles, quantum labs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', paddingLeft: '46px' }}
          />
        </div>

        {/* Category Pills */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {['ALL', 'Technical', 'Cultural', 'Academic', 'Sports'].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '9px 18px',
                borderRadius: '20px',
                border: selectedCategory === cat ? '1px solid var(--cyan-neon)' : '1px solid var(--border-glass)',
                background: selectedCategory === cat ? 'rgba(0, 240, 255, 0.2)' : 'rgba(13, 19, 36, 0.6)',
                color: selectedCategory === cat ? 'var(--cyan-neon)' : 'var(--text-muted)',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: selectedCategory === cat ? '0 0 15px rgba(0, 240, 255, 0.3)' : 'none'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

      </div>

      {/* My Digital Pass Wallet Section */}
      {myRegistrations.length > 0 && (
        <div>
          <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Ticket size={20} color="var(--cyan-neon)" /> My Digital Ticket Wallet
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '18px' }}>
            {myRegistrations.map(reg => {
              const evt = events.find(e => e.id === reg.eventId);
              if (!evt) return null;
              return (
                <div key={reg.id} className="glass-panel" style={{ padding: '20px', borderLeft: '4px solid var(--cyan-neon)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span className="badge badge-tech" style={{ fontSize: '0.65rem' }}>{reg.status}</span>
                    <h4 style={{ fontSize: '1rem', color: '#fff', margin: '6px 0', fontWeight: 700 }}>{evt.title}</h4>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', gap: '12px' }}>
                      <span><Calendar size={12} /> {evt.date}</span>
                      <span><MapPin size={12} /> {evt.venueName}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'stretch' }}>
                    <button
                      className="btn btn-secondary"
                      onClick={() => setSelectedTicket({ registration: reg, event: evt })}
                      style={{ padding: '8px 14px', fontSize: '0.8rem', borderColor: 'var(--cyan-neon)' }}
                    >
                      <QrCode size={16} color="var(--cyan-neon)" /> View Pass
                    </button>
                    {!reg.checkedIn && (
                      <button
                        className="btn btn-danger"
                        onClick={() => cancelRegistration(reg.id)}
                        style={{ padding: '6px 14px', fontSize: '0.75rem' }}
                      >
                        {reg.status === 'WAITLIST' ? 'Leave Waitlist' : 'Cancel'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Events Grid */}
      <div>
        <h3 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Compass size={20} color="var(--emerald-neon)" /> Upcoming Campus Events
        </h3>

        {filteredEvents.length === 0 ? (
          <div className="glass-panel" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <AlertCircle size={44} style={{ margin: '0 auto 12px', color: 'var(--text-dim)' }} />
            <p style={{ fontSize: '1.05rem' }}>No events found matching your filter criteria.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '26px' }}>
            {filteredEvents.map(event => {
              const regCount = event.registeredCount; // confirmed seats, computed by the server for everyone
              const seatsLeft = Math.max(0, event.capacity - regCount);
              const percentFull = Math.min(100, Math.round((regCount / event.capacity) * 100));
              
              const isRegistered = registrations.some(r => r.eventId === event.id && r.studentId === currentUser.id);
              const myReg = registrations.find(r => r.eventId === event.id && r.studentId === currentUser.id);
              const countdown = getCountdown(event.date);

              return (
                <div key={event.id} className="glass-panel glass-panel-hover" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                  
                  {/* Image Cover */}
                  <div style={{ height: '170px', position: 'relative', overflow: 'hidden' }}>
                    <img
                      src={event.image}
                      alt={event.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(13,19,36,0.95) 0%, transparent 60%)' }} />
                    
                    {/* Top Badges */}
                    <div style={{ position: 'absolute', top: '12px', left: '12px', display: 'flex', gap: '6px' }}>
                      <span className={`badge badge-${event.category.toLowerCase()}`}>
                        {event.category}
                      </span>
                      <span className="badge badge-tech">{event.department}</span>
                    </div>

                    {/* Countdown Badge */}
                    <div className="mono-text" style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      background: 'rgba(7, 10, 20, 0.85)',
                      border: '1px solid var(--border-glass)',
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontSize: '0.72rem',
                      color: 'var(--cyan-neon)',
                      fontWeight: 700
                    }}>
                      <Clock size={11} style={{ display: 'inline', marginRight: '4px' }} />
                      {countdown}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div style={{ padding: '22px', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                    <div>
                      <h4 style={{ fontSize: '1.15rem', color: '#fff', marginBottom: '8px', lineHeight: 1.3, fontWeight: 800 }}>{event.title}</h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '18px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {event.description}
                      </p>

                      {/* Meta Details */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Calendar size={14} color="var(--cyan-neon)" /> <span>{event.date} • {event.time}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <MapPin size={14} color="var(--violet-neon)" /> <span>{event.venueName}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Users size={14} color="var(--gold-neon)" /> <span>Organizer: {event.organizerName}</span>
                        </div>
                      </div>

                      {/* Capacity Progress Bar */}
                      <div style={{ marginBottom: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '6px' }}>
                          <span style={{ color: 'var(--text-muted)' }}>Capacity Occupancy</span>
                          <span style={{ color: seatsLeft === 0 ? 'var(--pink-neon)' : 'var(--emerald-neon)', fontWeight: 800 }}>
                            {regCount} / {event.capacity} registered ({seatsLeft} left)
                          </span>
                        </div>
                        <div style={{ width: '100%', height: '7px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{
                            width: `${percentFull}%`,
                            height: '100%',
                            background: percentFull > 90 ? 'var(--pink-neon)' : 'linear-gradient(90deg, var(--cyan-neon), var(--emerald-neon))',
                            borderRadius: '4px'
                          }} />
                        </div>
                      </div>
                    </div>

                    {/* Action Footer */}
                    <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      {isRegistered ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '10px' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--emerald-neon)', fontSize: '0.88rem', fontWeight: 800 }}>
                            <CheckCircle2 size={18} /> Registered
                          </span>
                          <button
                            className="btn btn-secondary"
                            onClick={() => setSelectedTicket({ registration: myReg, event })}
                            style={{ padding: '8px 14px', fontSize: '0.8rem', borderColor: 'var(--cyan-neon)' }}
                          >
                            <QrCode size={14} color="var(--cyan-neon)" /> Pass
                          </button>
                        </div>
                      ) : (
                        <button
                          className={`btn ${seatsLeft === 0 ? 'btn-secondary' : 'btn-primary'}`}
                          onClick={() => handleRegister(event.id)}
                          style={{ width: '100%' }}
                        >
                          {seatsLeft === 0 ? 'Join Waitlist' : 'Instant Registration'}
                        </button>
                      )}
                    </div>

                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
