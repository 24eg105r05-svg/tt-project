package com.cems.service;

import com.cems.dto.CheckInResponse;
import com.cems.dto.RegistrationDto;
import com.cems.dto.RegistrationResult;
import com.cems.exception.ApiException;
import com.cems.model.AppUser;
import com.cems.model.Event;
import com.cems.model.EventStatus;
import com.cems.model.Registration;
import com.cems.model.RegistrationStatus;
import com.cems.model.Role;
import com.cems.repository.EventRepository;
import com.cems.repository.RegistrationRepository;
import com.cems.repository.UserRepository;
import com.cems.util.Ids;
import com.cems.util.QrTokens;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

@Service
public class RegistrationService {

    private static final DateTimeFormatter CLOCK =
            DateTimeFormatter.ofPattern("HH:mm 'UTC'").withZone(ZoneOffset.UTC);

    private final RegistrationRepository registrations;
    private final EventRepository events;
    private final UserRepository users;
    private final EventService eventService;
    private final AuditService audit;
    private final DtoMapper mapper;

    public RegistrationService(RegistrationRepository registrations, EventRepository events, UserRepository users,
                               EventService eventService, AuditService audit, DtoMapper mapper) {
        this.registrations = registrations;
        this.events = events;
        this.users = users;
        this.eventService = eventService;
        this.audit = audit;
        this.mapper = mapper;
    }

    @Transactional(readOnly = true)
    public List<RegistrationDto> list(AppUser caller) {
        List<Registration> rows = switch (caller.getRole()) {
            case STUDENT -> registrations.findByStudent(caller.getId());
            case ORGANIZER -> registrations.findByOrganizer(caller.getId());
            case ADMIN -> registrations.findAllOrdered();
        };
        return rows.stream().map(mapper::registration).toList();
    }

    /** Confirmed seat if capacity remains, otherwise waitlist. The event row is locked while we count. */
    @Transactional
    public RegistrationResult register(String eventId, AppUser caller) {
        Event event = events.findByIdForUpdate(eventId)
                .orElseThrow(() -> ApiException.notFound("Event not found."));
        if (event.getStatus() != EventStatus.APPROVED) {
            throw ApiException.badRequest("Registration is only open for approved events.");
        }
        if (event.getDate().isBefore(LocalDate.now())) {
            throw ApiException.badRequest("This event has already taken place.");
        }
        if (registrations.findByEventAndStudent(eventId, caller.getId()).isPresent()) {
            throw ApiException.conflict("You are already registered for this event.");
        }
        AppUser student = users.findById(caller.getId())
                .orElseThrow(() -> ApiException.unauthorized("Account no longer exists."));

        long confirmed = registrations.countByEventAndStatus(eventId, RegistrationStatus.CONFIRMED);
        boolean waitlist = confirmed >= event.getCapacity();

        Registration reg = new Registration();
        reg.setId(Ids.next("reg"));
        reg.setEvent(event);
        reg.setStudent(student);
        reg.setRegisteredAt(Instant.now());
        reg.setQrToken(QrTokens.generate());
        reg.setStatus(waitlist ? RegistrationStatus.WAITLIST : RegistrationStatus.CONFIRMED);
        reg.setCheckedIn(false);
        Registration saved = registrations.saveAndFlush(reg);

        audit.log(student.getName(), "REGISTERED", event.getTitle() + " (" + saved.getStatus() + ")");
        return new RegistrationResult(mapper.registration(saved), eventService.toDto(event));
    }

    /** Students cancel their own; admins can cancel any. A freed confirmed seat promotes the oldest waitlister. */
    @Transactional
    public void cancel(String registrationId, AppUser caller) {
        Registration reg = registrations.findById(registrationId)
                .orElseThrow(() -> ApiException.notFound("Registration not found."));
        boolean owner = reg.getStudent().getId().equals(caller.getId());
        if (!owner && caller.getRole() != Role.ADMIN) {
            throw ApiException.forbidden("You can only cancel your own registration.");
        }
        if (reg.isCheckedIn()) {
            throw ApiException.conflict("This ticket was already used for check-in and cannot be cancelled.");
        }
        Event event = events.findByIdForUpdate(reg.getEvent().getId())
                .orElseThrow(() -> ApiException.notFound("Event not found."));
        boolean freedSeat = reg.getStatus() == RegistrationStatus.CONFIRMED;
        String studentName = reg.getStudent().getName();

        registrations.delete(reg);
        registrations.flush();
        audit.log(caller.getName(), "CANCELLED_REGISTRATION", studentName + " - " + event.getTitle());

        if (freedSeat) {
            List<Registration> queue =
                    registrations.findByEventAndStatusOrdered(event.getId(), RegistrationStatus.WAITLIST);
            if (!queue.isEmpty()) {
                Registration next = queue.get(0);
                next.setStatus(RegistrationStatus.CONFIRMED);
                audit.log("SYSTEM", "WAITLIST_PROMOTED", next.getStudent().getName() + " - " + event.getTitle());
            }
        }
    }

    /** Gate scan. Single-use: the second scan of the same code is denied. */
    @Transactional
    public CheckInResponse checkIn(String rawToken, AppUser caller) {
        String token = rawToken.trim();
        Optional<Registration> found = registrations.findByQrToken(token);
        if (found.isEmpty()) {
            audit.log(caller.getName(), "QR_CHECKIN_REJECTED", "Unknown token");
            return reject("Invalid or Fraudulent QR Code token.");
        }
        Registration reg = found.get();
        Event event = reg.getEvent();

        if (caller.getRole() == Role.ORGANIZER && !event.getOrganizer().getId().equals(caller.getId())) {
            return reject("This ticket belongs to an event you do not organise.");
        }
        if (reg.getStatus() != RegistrationStatus.CONFIRMED) {
            return reject("This ticket is still on the waitlist and is not valid for entry.");
        }
        if (reg.isCheckedIn()) {
            return reject("ALREADY CHECKED IN at " + CLOCK.format(reg.getCheckedInAt())
                    + "! Duplicate entry denied.");
        }

        reg.setCheckedIn(true);
        reg.setCheckedInAt(Instant.now());
        audit.log(caller.getName(), "QR_ATTENDANCE_CHECKIN", reg.getStudent().getName() + " at " + event.getTitle());

        return new CheckInResponse(true,
                "Verified! Welcome " + reg.getStudent().getName() + " to " + event.getTitle(),
                mapper.registration(reg), eventService.toDto(event));
    }

    private CheckInResponse reject(String message) {
        return new CheckInResponse(false, message, null, null);
    }
}
