package com.cems.service;

import com.cems.dto.ConflictResponse;
import com.cems.dto.EventDto;
import com.cems.dto.EventRequest;
import com.cems.exception.ApiException;
import com.cems.model.AppUser;
import com.cems.model.Event;
import com.cems.model.EventStatus;
import com.cems.model.RegistrationStatus;
import com.cems.model.Role;
import com.cems.model.Venue;
import com.cems.repository.EventRepository;
import com.cems.repository.RegistrationRepository;
import com.cems.repository.UserRepository;
import com.cems.repository.VenueRepository;
import com.cems.util.Ids;
import com.cems.util.TimeRange;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class EventService {

    private static final String DEFAULT_IMAGE =
            "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80";

    private final EventRepository events;
    private final VenueRepository venues;
    private final UserRepository users;
    private final RegistrationRepository registrations;
    private final AuditService audit;
    private final DtoMapper mapper;

    public EventService(EventRepository events, VenueRepository venues, UserRepository users,
                        RegistrationRepository registrations, AuditService audit, DtoMapper mapper) {
        this.events = events;
        this.venues = venues;
        this.users = users;
        this.registrations = registrations;
        this.audit = audit;
        this.mapper = mapper;
    }

    /** Students see published events; organizers also see their own proposals; admins see everything. */
    @Transactional(readOnly = true)
    public List<EventDto> list(AppUser caller) {
        List<Event> visible = switch (caller.getRole()) {
            case ADMIN -> events.findAllOrdered();
            case ORGANIZER -> events.findVisibleToOrganizer(EventStatus.APPROVED, caller.getId());
            case STUDENT -> events.findByStatus(EventStatus.APPROVED);
        };
        Map<String, int[]> counts = seatCounts();
        return visible.stream()
                .map(e -> {
                    int[] c = counts.getOrDefault(e.getId(), new int[2]);
                    return mapper.event(e, c[0], c[1]);
                })
                .toList();
    }

    @Transactional(readOnly = true)
    public EventDto get(String id, AppUser caller) {
        Event event = events.findById(id).orElseThrow(() -> ApiException.notFound("Event not found."));
        boolean canSee = event.getStatus() == EventStatus.APPROVED
                || caller.getRole() == Role.ADMIN
                || event.getOrganizer().getId().equals(caller.getId());
        if (!canSee) {
            throw ApiException.notFound("Event not found.");
        }
        return toDto(event);
    }

    @Transactional
    public EventDto propose(EventRequest request, AppUser caller) {
        Venue venue = venues.findById(request.venueId())
                .orElseThrow(() -> ApiException.badRequest("The selected venue does not exist."));
        if (!"Active".equalsIgnoreCase(venue.getStatus())) {
            throw ApiException.badRequest("The selected venue is not currently available.");
        }
        if (request.capacity() > venue.getCapacity()) {
            throw ApiException.badRequest("Capacity " + request.capacity() + " exceeds the venue limit of "
                    + venue.getCapacity() + " for " + venue.getName() + ".");
        }
        findConflict(venue.getId(), request.date(), request.time(), null).ifPresent(c -> {
            throw ApiException.conflict(conflictMessage(c, request.date()));
        });

        AppUser organizer = users.findById(caller.getId())
                .orElseThrow(() -> ApiException.unauthorized("Account no longer exists."));

        Event event = new Event();
        event.setId(Ids.next("evt"));
        event.setTitle(request.title().trim());
        event.setDescription(request.description().trim());
        event.setOrganizer(organizer);
        event.setDepartment(request.department().trim());
        event.setCategory(request.category().trim());
        event.setVenue(venue);
        event.setDate(request.date());
        event.setTime(request.time().trim());
        event.setCapacity(request.capacity());
        // Admin-created events skip the approval queue; organizer proposals wait for an admin.
        event.setStatus(caller.getRole() == Role.ADMIN ? EventStatus.APPROVED : EventStatus.PENDING);
        event.setImage(request.image() == null || request.image().isBlank() ? DEFAULT_IMAGE : request.image().trim());
        event.setTags(request.tags() == null || request.tags().isEmpty()
                ? new java.util.ArrayList<>(List.of(event.getCategory()))
                : new java.util.ArrayList<>(request.tags()));

        Event saved = events.save(event);
        audit.log(caller.getName(), "PROPOSED_EVENT", saved.getTitle());
        return mapper.event(saved, 0, 0);
    }

    @Transactional
    public EventDto decide(String id, boolean approve, AppUser caller) {
        Event event = events.findById(id).orElseThrow(() -> ApiException.notFound("Event not found."));
        if (event.getStatus() != EventStatus.PENDING) {
            throw ApiException.conflict("This event has already been " + event.getStatus().name().toLowerCase() + ".");
        }
        event.setStatus(approve ? EventStatus.APPROVED : EventStatus.REJECTED);
        audit.log(caller.getName(), approve ? "APPROVED_EVENT" : "REJECTED_EVENT", event.getTitle());
        return toDto(event);
    }

    @Transactional(readOnly = true)
    public ConflictResponse checkConflict(String venueId, LocalDate date, String time, String excludeEventId) {
        return findConflict(venueId, date, time, excludeEventId)
                .map(c -> new ConflictResponse(true, conflictMessage(c, date), toDto(c)))
                .orElse(new ConflictResponse(false, null, null));
    }

    /** Smart scheduling: same venue, same day, overlapping time slot, ignoring rejected events. */
    @Transactional(readOnly = true)
    public Optional<Event> findConflict(String venueId, LocalDate date, String time, String excludeEventId) {
        return events.findActiveAtVenueOnDate(venueId, date, EventStatus.REJECTED).stream()
                .filter(e -> excludeEventId == null || !e.getId().equals(excludeEventId))
                .filter(e -> TimeRange.overlaps(e.getTime(), time))
                .findFirst();
    }

    /** Builds a DTO with live seat counts for one event. */
    @Transactional(readOnly = true)
    public EventDto toDto(Event event) {
        int confirmed = (int) registrations.countByEventAndStatus(event.getId(), RegistrationStatus.CONFIRMED);
        int waitlisted = (int) registrations.countByEventAndStatus(event.getId(), RegistrationStatus.WAITLIST);
        return mapper.event(event, confirmed, waitlisted);
    }

    private String conflictMessage(Event clash, LocalDate date) {
        return "Venue clash detected! \"" + clash.getTitle() + "\" is already scheduled at this venue on "
                + date + " (" + clash.getTime() + ").";
    }

    private Map<String, int[]> seatCounts() {
        Map<String, int[]> map = new HashMap<>();
        for (Object[] row : registrations.countGroupedByEventAndStatus()) {
            String eventId = (String) row[0];
            RegistrationStatus status = (RegistrationStatus) row[1];
            int count = ((Number) row[2]).intValue();
            int[] slot = map.computeIfAbsent(eventId, k -> new int[2]);
            if (status == RegistrationStatus.CONFIRMED) {
                slot[0] = count;
            } else {
                slot[1] = count;
            }
        }
        return map;
    }
}
