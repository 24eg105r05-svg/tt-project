package com.cems.service;

import com.cems.dto.AuditLogDto;
import com.cems.dto.EventDto;
import com.cems.dto.RegistrationDto;
import com.cems.dto.UserDto;
import com.cems.dto.VenueDto;
import com.cems.model.AppUser;
import com.cems.model.AuditLog;
import com.cems.model.Event;
import com.cems.model.Registration;
import com.cems.model.Venue;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Locale;

@Component
public class DtoMapper {

    public UserDto user(AppUser u) {
        return new UserDto(u.getId(), u.getName(), u.getEmail(),
                u.getRole().name().toLowerCase(Locale.ROOT), u.getDepartment());
    }

    public VenueDto venue(Venue v) {
        return new VenueDto(v.getId(), v.getName(), v.getLocation(), v.getCapacity(), v.getStatus());
    }

    public EventDto event(Event e, int registered, int waitlisted) {
        return new EventDto(
                e.getId(), e.getTitle(), e.getDescription(),
                e.getOrganizer().getId(), e.getOrganizer().getName(),
                e.getDepartment(), e.getCategory(),
                e.getVenue().getId(), e.getVenue().getName(),
                e.getDate(), e.getTime(), e.getCapacity(),
                e.getStatus().name(), e.getImage(),
                new ArrayList<>(e.getTags()),
                registered, waitlisted, Math.max(0, e.getCapacity() - registered));
    }

    public RegistrationDto registration(Registration r) {
        return new RegistrationDto(
                r.getId(), r.getEvent().getId(), r.getEvent().getTitle(),
                r.getStudent().getId(), r.getStudent().getName(), r.getStudent().getEmail(),
                r.getRegisteredAt(), r.getQrToken(), r.getStatus().name(),
                r.isCheckedIn(), r.getCheckedInAt());
    }

    public AuditLogDto audit(AuditLog a) {
        return new AuditLogDto(a.getId(), a.getCreatedAt(), a.getActor(), a.getAction(), a.getEntity());
    }
}
