package com.cems.service;

import com.cems.dto.VenueDto;
import com.cems.dto.VenueRequest;
import com.cems.model.AppUser;
import com.cems.model.Venue;
import com.cems.repository.VenueRepository;
import com.cems.util.Ids;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class VenueService {

    private final VenueRepository venues;
    private final DtoMapper mapper;
    private final AuditService audit;

    public VenueService(VenueRepository venues, DtoMapper mapper, AuditService audit) {
        this.venues = venues;
        this.mapper = mapper;
        this.audit = audit;
    }

    @Transactional(readOnly = true)
    public List<VenueDto> list() {
        return venues.findAll(Sort.by("name")).stream().map(mapper::venue).toList();
    }

    @Transactional
    public VenueDto create(VenueRequest request, AppUser caller) {
        Venue venue = new Venue();
        venue.setId(Ids.next("v"));
        venue.setName(request.name().trim());
        venue.setLocation(request.location().trim());
        venue.setCapacity(request.capacity());
        venue.setStatus("Active");
        Venue saved = venues.save(venue);
        audit.log(caller.getName(), "ADDED_VENUE", saved.getName());
        return mapper.venue(saved);
    }
}
