package com.cems.config;

import com.cems.model.AppUser;
import com.cems.model.AuditLog;
import com.cems.model.Event;
import com.cems.model.EventStatus;
import com.cems.model.Registration;
import com.cems.model.RegistrationStatus;
import com.cems.model.Role;
import com.cems.model.Venue;
import com.cems.repository.AuditLogRepository;
import com.cems.repository.EventRepository;
import com.cems.repository.RegistrationRepository;
import com.cems.repository.UserRepository;
import com.cems.repository.VenueRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

/**
 * Loads the same demo data the original React prototype shipped with (users, venues, events,
 * one checked-in ticket), but with event dates relative to "today" so the demo never goes stale.
 * Runs only on an empty database.
 */
@Component
@ConditionalOnProperty(name = "cems.seed.enabled", havingValue = "true", matchIfMissing = true)
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private final UserRepository users;
    private final VenueRepository venues;
    private final EventRepository events;
    private final RegistrationRepository registrations;
    private final AuditLogRepository auditLogs;
    private final PasswordEncoder encoder;
    private final String demoPassword;

    public DataSeeder(UserRepository users, VenueRepository venues, EventRepository events,
                      RegistrationRepository registrations, AuditLogRepository auditLogs,
                      PasswordEncoder encoder, @Value("${cems.seed.demo-password}") String demoPassword) {
        this.users = users;
        this.venues = venues;
        this.events = events;
        this.registrations = registrations;
        this.auditLogs = auditLogs;
        this.encoder = encoder;
        this.demoPassword = demoPassword;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (users.count() > 0) {
            return;
        }
        String hash = encoder.encode(demoPassword);

        // Entities have assigned ids, so save() merges and returns the managed copy: always use the return value.
        AppUser alex = users.save(user("usr-1", "Alex Rivera", "alex.rivera@college.edu", Role.STUDENT, "Computer Science", hash));
        AppUser sarah = users.save(user("usr-2", "Dr. Sarah Connor", "s.connor@college.edu", Role.ORGANIZER, "Information Tech", hash));
        users.save(user("usr-3", "Dean Marcus Vance", "m.vance@college.edu", Role.ADMIN, "Academic Affairs", hash));

        venues.save(venue("v-1", "Main Auditorium", "Building A, Fl 1", 300));
        Venue lab = venues.save(venue("v-2", "Tech Innovation Lab", "CS Block, Fl 3", 50));
        Venue oat = venues.save(venue("v-3", "Open Air Theatre (OAT)", "Central Lawn", 800));
        Venue hall = venues.save(venue("v-4", "Seminar Hall A", "Admin Block, Fl 2", 120));
        Venue arena = venues.save(venue("v-5", "Indoor Sports Arena", "Sports Complex", 400));

        LocalDate today = LocalDate.now();
        Event hack = events.save(event("evt-101", "HackCampus 2026: AI & Cyber Security Hackathon",
                "Annual 24-hour flagship hackathon featuring problem statements in AI, Blockchain, and Web Security.",
                sarah, "Computer Science", "Technical", lab, today.plusDays(13), "09:00 AM - 05:00 PM", 45,
                EventStatus.APPROVED, "photo-1504384308090-c894fdcc538d", "AI", "Hackathon", "Coding"));
        events.save(event("evt-102", "Spring Cultural Night & Music Fest",
                "Live band performances, inter-college dance battle, and fusion music concert.",
                sarah, "Cultural Club", "Cultural", oat, today.plusDays(21), "05:30 PM - 10:00 PM", 750,
                EventStatus.APPROVED, "photo-1470225620780-dba8ba36b745", "Music", "Dance", "Concert"));
        events.save(event("evt-103", "Quantum Computing Fundamentals Workshop",
                "Expert guest lecture by IBM Quantum researchers introducing Qiskit and quantum circuits.",
                sarah, "Information Tech", "Academic", hall, today.plusDays(29), "10:00 AM - 01:00 PM", 100,
                EventStatus.APPROVED, "photo-1635070041078-e363dbe005cb", "Quantum", "Physics", "Tech"));
        events.save(event("evt-104", "Inter-Department Basketball Championship",
                "Fast-paced 3v3 tournament for students across all engineering and management streams.",
                sarah, "Sports Council", "Sports", arena, today.plusDays(34), "02:00 PM - 07:00 PM", 300,
                EventStatus.PENDING, "photo-1546519638-68e109498ffc", "Basketball", "Tournament", "Fitness"));

        Instant registeredAt = Instant.now().minus(2, ChronoUnit.DAYS);
        Registration reg = new Registration();
        reg.setId("reg-1");
        reg.setEvent(hack);
        reg.setStudent(alex);
        reg.setRegisteredAt(registeredAt);
        reg.setQrToken("CEMS-QR-101-USR1-8923"); // same demo token as the prototype
        reg.setStatus(RegistrationStatus.CONFIRMED);
        reg.setCheckedIn(true);
        reg.setCheckedInAt(registeredAt.plus(50, ChronoUnit.MINUTES));
        registrations.save(reg);

        auditLogs.saveAll(List.of(
                audit("log-1", registeredAt.minus(5, ChronoUnit.HOURS), "Dr. Sarah Connor", "PROPOSED_EVENT", "HackCampus 2026"),
                audit("log-2", registeredAt.minus(4, ChronoUnit.HOURS), "Dean Marcus Vance", "APPROVED_EVENT", "HackCampus 2026"),
                audit("log-3", registeredAt, "Alex Rivera", "REGISTERED", "HackCampus 2026")));

        log.warn("Seeded demo data. Demo accounts (password '{}'): alex.rivera@college.edu, "
                + "s.connor@college.edu, m.vance@college.edu. Set CEMS_SEED=false in production.", demoPassword);
    }

    private AppUser user(String id, String name, String email, Role role, String dept, String hash) {
        AppUser u = new AppUser();
        u.setId(id);
        u.setName(name);
        u.setEmail(email);
        u.setRole(role);
        u.setDepartment(dept);
        u.setPasswordHash(hash);
        return u;
    }

    private Venue venue(String id, String name, String location, int capacity) {
        Venue v = new Venue();
        v.setId(id);
        v.setName(name);
        v.setLocation(location);
        v.setCapacity(capacity);
        v.setStatus("Active");
        return v;
    }

    private Event event(String id, String title, String description, AppUser organizer, String department,
                        String category, Venue venue, LocalDate date, String time, int capacity,
                        EventStatus status, String photoId, String... tags) {
        Event e = new Event();
        e.setId(id);
        e.setTitle(title);
        e.setDescription(description);
        e.setOrganizer(organizer);
        e.setDepartment(department);
        e.setCategory(category);
        e.setVenue(venue);
        e.setDate(date);
        e.setTime(time);
        e.setCapacity(capacity);
        e.setStatus(status);
        e.setImage("https://images.unsplash.com/" + photoId + "?auto=format&fit=crop&w=800&q=80");
        e.setTags(new ArrayList<>(List.of(tags)));
        return e;
    }

    private AuditLog audit(String id, Instant at, String actor, String action, String entity) {
        AuditLog a = new AuditLog();
        a.setId(id);
        a.setCreatedAt(at);
        a.setActor(actor);
        a.setAction(action);
        a.setEntity(entity);
        return a;
    }
}
