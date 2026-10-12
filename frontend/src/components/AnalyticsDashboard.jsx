import React from 'react';
import { useCems } from '../context/CemsContext';
import { BarChart2, PieChart, Users, CheckCircle2, Calendar, Award } from 'lucide-react';

export const AnalyticsDashboard = () => {
  // Aggregates are computed server-side so every role sees correct totals.
  const { analytics } = useCems();

  const totalRegistrations = analytics.totalRegistrations;
  const totalCheckedIn = analytics.totalCheckedIn;
  const overallAttendanceRate = analytics.attendanceRate;
  const deptStats = analytics.departments; // [{ name, eventsCount, regCount }]
  const catStats = analytics.categories;   // [{ name, count }]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '28px 36px', background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(16, 185, 129, 0.2) 100%)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <span className="badge badge-academic" style={{ marginBottom: '8px' }}>Executive Reports</span>
          <h2 style={{ fontSize: '1.8rem', color: '#fff', margin: '4px 0' }}>Campus Event Analytics</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Real-time insights into student engagement, registration volume, QR attendance conversion, and departmental event demand.
          </p>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
        
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'rgba(99, 102, 241, 0.2)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Calendar size={28} />
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff' }}>{analytics.totalEvents}</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Total Campus Events</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'rgba(6, 182, 212, 0.2)', color: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={28} />
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff' }}>{totalRegistrations}</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Student Registrations</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'rgba(16, 185, 129, 0.2)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle2 size={28} />
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--success)' }}>{overallAttendanceRate}%</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>QR Attendance Rate</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'rgba(245, 158, 11, 0.2)', color: 'var(--warning)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Award size={28} />
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff' }}>{analytics.totalVenues}</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Managed Venues</div>
          </div>
        </div>

      </div>

      {/* Visual Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        
        {/* Department Participation Bar Graph Visual */}
        <div className="glass-panel" style={{ padding: '28px' }}>
          <h4 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart2 size={18} color="var(--primary)" /> Department-Wise Student Registration
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {deptStats.map(dept => {
              const maxVal = Math.max(...deptStats.map(d => d.regCount), 1);
              const pct = Math.round((dept.regCount / maxVal) * 100);

              return (
                <div key={dept.name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                    <span style={{ color: '#fff', fontWeight: 600 }}>{dept.name}</span>
                    <span style={{ color: 'var(--secondary)' }}>{dept.regCount} registrations ({dept.eventsCount} events)</span>
                  </div>
                  <div style={{ width: '100%', height: '10px', background: 'rgba(255,255,255,0.06)', borderRadius: '5px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${Math.max(pct, 5)}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, var(--primary), var(--secondary))',
                      borderRadius: '5px',
                      transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category Breakdown & Attendance Conversion */}
        <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h4 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <PieChart size={18} color="var(--secondary)" /> Event Distribution by Category
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
              {catStats.map(cat => (
                <div key={cat.name} style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--border-glass)', textAlign: 'center' }}>
                  <span className={`badge badge-${cat.name.toLowerCase()}`} style={{ marginBottom: '8px' }}>{cat.name}</span>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>{cat.count}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Events</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--success)', fontWeight: 700, marginBottom: '4px' }}>✓ QR Verification Efficiency</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Out of {totalRegistrations} total confirmed student tickets, {totalCheckedIn} have scanned their single-use QR pass at entry gates.
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
