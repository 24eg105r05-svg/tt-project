import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { api, setUnauthorizedHandler, tokenStore } from '../api/client';

const CemsContext = createContext();

// Demo role-switcher: logs in as the seeded accounts. Disable for real deployments
// by building with VITE_DEMO_MODE=false (the backend should also run with CEMS_SEED=false).
export const DEMO_MODE = import.meta.env.VITE_DEMO_MODE !== 'false';
const DEMO_PASSWORD = import.meta.env.VITE_DEMO_PASSWORD || 'cems@123';
export const DEMO_ACCOUNTS = {
  student: 'alex.rivera@college.edu',
  organizer: 's.connor@college.edu',
  admin: 'm.vance@college.edu',
};

const EMPTY_ANALYTICS = {
  totalEvents: 0,
  totalVenues: 0,
  totalRegistrations: 0,
  totalCheckedIn: 0,
  attendanceRate: 0,
  departments: [],
  categories: [],
  topEvents: [],
};

const welcomeNotification = () => ({
  id: `notif-${Date.now()}`,
  text: 'Welcome to CEMS! Browse upcoming technical fests and register.',
  time: 'Just now',
  type: 'info',
});

export const CemsProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [booting, setBooting] = useState(true);
  const [authMessage, setAuthMessage] = useState(null);

  const [venues, setVenues] = useState([]);
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [analytics, setAnalytics] = useState(EMPTY_ANALYTICS);
  const [notifications, setNotifications] = useState([]);

  // Modals state
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [proposalModalOpen, setProposalModalOpen] = useState(false);

  const userRef = useRef(null);
  userRef.current = currentUser;

  const notify = useCallback((text, type = 'info') => {
    const item = {
      id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      text,
      time: 'Just now',
      type,
    };
    setNotifications((prev) => [item, ...prev].slice(0, 50));
  }, []);

  // Pull everything the current role is allowed to see.
  const loadAll = useCallback(async (user) => {
    const u = user || userRef.current;
    if (!u) return;
    const tasks = [api.getEvents(), api.getVenues(), api.getRegistrations(), api.getAnalytics()];
    if (u.role === 'admin') tasks.push(api.getAuditLogs());
    const [ev, ve, re, an, au] = await Promise.all(tasks);
    setEvents(ev);
    setVenues(ve);
    setRegistrations(re);
    setAnalytics(an);
    setAuditLogs(au || []);
  }, []);

  const clearSession = useCallback(() => {
    tokenStore.clear();
    setCurrentUser(null);
    setEvents([]);
    setVenues([]);
    setRegistrations([]);
    setAuditLogs([]);
    setAnalytics(EMPTY_ANALYTICS);
    setNotifications([]);
    setSelectedTicket(null);
    setScannerOpen(false);
    setProposalModalOpen(false);
  }, []);

  // Expired / revoked token -> back to the login screen.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearSession();
      setAuthMessage('Your session has expired. Please sign in again.');
    });
    return () => setUnauthorizedHandler(null);
  }, [clearSession]);

  // Restore a previous session on first load.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!tokenStore.get()) {
        setBooting(false);
        return;
      }
      try {
        const me = await api.me();
        if (cancelled) return;
        await loadAll(me); // load data BEFORE exposing the user so portals mount with real venues/events
        if (cancelled) return;
        setCurrentUser(me);
        setNotifications([welcomeNotification()]);
      } catch {
        tokenStore.clear();
        setCurrentUser(null);
      } finally {
        if (!cancelled) setBooting(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loadAll]);

  // Light polling keeps seat counts, approvals and check-ins fresh across users.
  useEffect(() => {
    if (!currentUser) return undefined;
    const timer = setInterval(() => {
      loadAll().catch(() => {});
    }, 20000);
    return () => clearInterval(timer);
  }, [currentUser, loadAll]);

  // ---------- Auth ----------
  const startSession = async ({ token, user }) => {
    tokenStore.set(token);
    try {
      await loadAll(user); // load data BEFORE exposing the user so portals mount with real venues/events
    } catch (e) {
      tokenStore.clear();
      throw e;
    }
    setAuthMessage(null);
    setNotifications([welcomeNotification()]);
    setCurrentUser(user);
    return user;
  };

  const signIn = async (email, password) => startSession(await api.login(email, password));
  const signUp = async (form) => startSession(await api.register(form));
  const signOut = () => clearSession();

  // Demo persona switch = a real login as the seeded account for that role.
  const switchUser = async (role) => {
    if (!DEMO_MODE || !DEMO_ACCOUNTS[role]) return;
    try {
      const user = await signIn(DEMO_ACCOUNTS[role], DEMO_PASSWORD);
      notify(`Switched session role to: ${user.role.toUpperCase()} (${user.name})`, 'info');
    } catch (e) {
      notify(e.message, 'warning');
    }
  };

  // ---------- Scheduling ----------
  // Async preview of venue clashes (server compares venue + date + overlapping time slot).
  const checkVenueConflict = async (venueId, date, time, excludeEventId = null) => {
    try {
      const res = await api.checkConflict({ venueId, date, time, excludeEventId });
      return res.conflict ? res.event : null;
    } catch {
      return null;
    }
  };

  const proposeEvent = async (eventData) => {
    try {
      const created = await api.proposeEvent({ ...eventData, capacity: Number(eventData.capacity) });
      await loadAll();
      if (created.status === 'APPROVED') {
        notify(`Event "${created.title}" created and published on the campus hub!`, 'success');
      } else {
        notify(`Event Proposal "${created.title}" submitted for Admin approval!`, 'success');
      }
      return { success: true };
    } catch (e) {
      return { success: false, message: e.message };
    }
  };

  const decideEvent = async (eventId, approve) => {
    try {
      const updated = approve ? await api.approveEvent(eventId) : await api.rejectEvent(eventId);
      await loadAll();
      if (approve) {
        notify(`EVENT APPROVED: "${updated.title}" is now published on campus hub!`, 'success');
      } else {
        notify(`EVENT REJECTED: "${updated.title}"`, 'warning');
      }
    } catch (e) {
      notify(e.message, 'warning');
      loadAll().catch(() => {});
    }
  };
  const approveEvent = (eventId) => decideEvent(eventId, true);
  const rejectEvent = (eventId) => decideEvent(eventId, false);

  // ---------- Registration ----------
  // Resolves true only when a confirmed seat was issued (so the UI can celebrate).
  const registerForEvent = async (eventId) => {
    try {
      const { registration, event } = await api.registerForEvent(eventId);
      await loadAll();
      if (registration.status === 'WAITLIST') {
        notify(`Seat limit reached! Placed on Waitlist for "${event.title}".`, 'warning');
        return false;
      }
      notify(`Successfully Registered for "${event.title}"! Digital QR Ticket issued.`, 'success');
      setSelectedTicket({ registration, event });
      return true;
    } catch (e) {
      notify(e.message, 'warning');
      loadAll().catch(() => {});
      return false;
    }
  };

  const cancelRegistration = async (registrationId) => {
    try {
      await api.cancelRegistration(registrationId);
      await loadAll();
      notify('Registration cancelled. If others were waitlisted, the next student was promoted.', 'info');
    } catch (e) {
      notify(e.message, 'warning');
    }
  };

  // ---------- Gate scanner ----------
  const verifyQrCode = async (scannedToken) => {
    try {
      const res = await api.checkIn(scannedToken);
      if (res.success) {
        notify(`QR VERIFIED: ${res.registration.studentName} checked in for ${res.event.title}!`, 'success');
        await loadAll();
      }
      return res;
    } catch (e) {
      return { success: false, message: e.message };
    }
  };

  // ---------- Venues ----------
  const addVenue = async (venueData) => {
    try {
      const venue = await api.addVenue(venueData);
      await loadAll();
      notify(`New Venue added: ${venue.name} (Capacity: ${venue.capacity})`, 'success');
    } catch (e) {
      notify(e.message, 'warning');
    }
  };

  return (
    <CemsContext.Provider
      value={{
        currentUser,
        booting,
        authMessage,
        signIn,
        signUp,
        signOut,
        switchUser,
        events,
        venues,
        registrations,
        auditLogs,
        analytics,
        notifications,
        notify,
        refresh: loadAll,
        checkVenueConflict,
        proposeEvent,
        approveEvent,
        rejectEvent,
        registerForEvent,
        cancelRegistration,
        verifyQrCode,
        addVenue,
        selectedTicket,
        setSelectedTicket,
        scannerOpen,
        setScannerOpen,
        proposalModalOpen,
        setProposalModalOpen,
      }}
    >
      {children}
    </CemsContext.Provider>
  );
};

export const useCems = () => useContext(CemsContext);
