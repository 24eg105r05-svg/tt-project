package com.cems.controller;

import com.cems.dto.CheckInRequest;
import com.cems.dto.CheckInResponse;
import com.cems.dto.RegistrationDto;
import com.cems.model.AppUser;
import com.cems.service.RegistrationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
public class RegistrationController {

    private final RegistrationService registrationService;

    public RegistrationController(RegistrationService registrationService) {
        this.registrationService = registrationService;
    }

    /** Students: own tickets. Organizers: attendees of their events. Admins: everything. */
    @GetMapping("/registrations")
    public List<RegistrationDto> list(@AuthenticationPrincipal AppUser user) {
        return registrationService.list(user);
    }

    @DeleteMapping("/registrations/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAnyRole('STUDENT','ADMIN')")
    public void cancel(@PathVariable String id, @AuthenticationPrincipal AppUser user) {
        registrationService.cancel(id, user);
    }

    @PostMapping("/checkin")
    @PreAuthorize("hasAnyRole('ORGANIZER','ADMIN')")
    public CheckInResponse checkIn(@Valid @RequestBody CheckInRequest request, @AuthenticationPrincipal AppUser user) {
        return registrationService.checkIn(request.token(), user);
    }
}
