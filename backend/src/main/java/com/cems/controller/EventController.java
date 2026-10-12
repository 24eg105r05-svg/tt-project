package com.cems.controller;

import com.cems.dto.ConflictResponse;
import com.cems.dto.EventDto;
import com.cems.dto.EventRequest;
import com.cems.dto.RegistrationResult;
import com.cems.model.AppUser;
import com.cems.service.EventService;
import com.cems.service.RegistrationService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/events")
public class EventController {

    private final EventService eventService;
    private final RegistrationService registrationService;

    public EventController(EventService eventService, RegistrationService registrationService) {
        this.eventService = eventService;
        this.registrationService = registrationService;
    }

    @GetMapping
    public List<EventDto> list(@AuthenticationPrincipal AppUser user) {
        return eventService.list(user);
    }

    @GetMapping("/{id}")
    public EventDto get(@PathVariable String id, @AuthenticationPrincipal AppUser user) {
        return eventService.get(id, user);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('ORGANIZER','ADMIN')")
    public EventDto propose(@Valid @RequestBody EventRequest request, @AuthenticationPrincipal AppUser user) {
        return eventService.propose(request, user);
    }

    /** Live clash preview used by the proposal form while the organizer picks venue/date/time. */
    @GetMapping("/conflicts")
    @PreAuthorize("hasAnyRole('ORGANIZER','ADMIN')")
    public ConflictResponse conflicts(@RequestParam String venueId,
                                      @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
                                      @RequestParam String time,
                                      @RequestParam(required = false) String excludeEventId) {
        return eventService.checkConflict(venueId, date, time, excludeEventId);
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public EventDto approve(@PathVariable String id, @AuthenticationPrincipal AppUser user) {
        return eventService.decide(id, true, user);
    }

    @PostMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public EventDto reject(@PathVariable String id, @AuthenticationPrincipal AppUser user) {
        return eventService.decide(id, false, user);
    }

    @PostMapping("/{id}/register")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('STUDENT')")
    public RegistrationResult register(@PathVariable String id, @AuthenticationPrincipal AppUser user) {
        return registrationService.register(id, user);
    }
}
