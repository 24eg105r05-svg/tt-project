import React, { useState } from 'react';
import { CemsProvider, useCems } from './context/CemsContext';
import { Header } from './components/Header';
import { StudentPortal } from './components/StudentPortal';
import { OrganizerPortal } from './components/OrganizerPortal';
import { AdminPortal } from './components/AdminPortal';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { TicketModal } from './components/TicketModal';
import { QRScannerModal } from './components/QRScannerModal';
import { Login } from './components/Login';

const AppContent = () => {
  const { currentUser, booting } = useCems();
  const [activeTab, setActiveTab] = useState('events');

  if (booting) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
        Connecting to CEMS server…
      </div>
    );
  }

  if (!currentUser) {
    return <Login />;
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Header & Role Navigation */}
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main View Area */}
      <main style={{ flex: 1, maxWidth: '1400px', width: '100%', margin: '0 auto', padding: '32px 28px' }}>
        
        {activeTab === 'analytics' ? (
          <AnalyticsDashboard />
        ) : (
          <>
            {currentUser.role === 'student' && <StudentPortal />}
            {currentUser.role === 'organizer' && <OrganizerPortal />}
            {currentUser.role === 'admin' && <AdminPortal />}
          </>
        )}

      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-glass)',
        padding: '20px 28px',
        textAlign: 'center',
        color: 'var(--text-dim)',
        fontSize: '0.8rem',
        background: 'rgba(9, 13, 22, 0.9)'
      }}>
        College Event Management System (CEMS) • Smart Campus Event Planning, QR Attendance & Analytics • CSE Training Project
      </footer>

      {/* Modals & Overlays */}
      <TicketModal />
      <QRScannerModal />

    </div>
  );
};

export default function App() {
  return (
    <CemsProvider>
      <AppContent />
    </CemsProvider>
  );
}
