package com.cems.service;

import com.cems.dto.AnalyticsDto;
import com.cems.model.AppUser;
import com.cems.model.Event;
import com.cems.model.EventStatus;
import com.cems.model.Registration;
import com.cems.model.Role;
import com.cems.repository.EventRepository;
import com.cems.repository.RegistrationRepository;
import com.cems.repository.VenueRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
public class AnalyticsService {

    private static final List<String> CORE_CATEGORIES = List.of("Technical", "Cultural", "Academic", "Sports");

    private final EventRepository events;
    private final RegistrationRepository registrations;
    private final VenueRepository venues;

    public AnalyticsService(EventRepository events, RegistrationRepository registrations, VenueRepository venues) {
        this.events = events;
        this.registrations = registrations;
        this.venues = venues;
    }

    /** Aggregates only. Students are limited to published events so unapproved proposals don't leak. */
    @Transactional(readOnly = true)
    public AnalyticsDto compute(AppUser caller) {
        List<Event> scope = caller.getRole() == Role.STUDENT
                ? events.findByStatus(EventStatus.APPROVED)
                : events.findAllOrdered();

        Set<String> eventIds = new HashSet<>();
        scope.forEach(e -> eventIds.add(e.getId()));

        Map<String, Integer> regsPerEvent = new HashMap<>();
        Map<String, Integer> checkedPerEvent = new HashMap<>();
        int totalRegs = 0;
        int totalChecked = 0;
        for (Registration r : registrations.findAll()) {
            String eventId = r.getEvent().getId();
            if (!eventIds.contains(eventId)) {
                continue;
            }
            totalRegs++;
            regsPerEvent.merge(eventId, 1, Integer::sum);
            if (r.isCheckedIn()) {
                totalChecked++;
                checkedPerEvent.merge(eventId, 1, Integer::sum);
            }
        }
        int rate = totalRegs == 0 ? 0 : Math.round(totalChecked * 100f / totalRegs);

        Map<String, int[]> byDept = new LinkedHashMap<>();
        Map<String, Integer> byCategory = new LinkedHashMap<>();
        CORE_CATEGORIES.forEach(c -> byCategory.put(c, 0));

        for (Event e : scope) {
            int[] d = byDept.computeIfAbsent(e.getDepartment(), k -> new int[2]);
            d[0] += 1;
            d[1] += regsPerEvent.getOrDefault(e.getId(), 0);

            String key = byCategory.keySet().stream()
                    .filter(k -> k.equalsIgnoreCase(e.getCategory()))
                    .findFirst().orElse(e.getCategory());
            byCategory.merge(key, 1, Integer::sum);
        }

        List<AnalyticsDto.DepartmentStat> departments = byDept.entrySet().stream()
                .map(en -> new AnalyticsDto.DepartmentStat(en.getKey(), en.getValue()[0], en.getValue()[1]))
                .sorted(Comparator.comparingInt(AnalyticsDto.DepartmentStat::regCount).reversed()
                        .thenComparing(AnalyticsDto.DepartmentStat::name))
                .toList();

        List<AnalyticsDto.CategoryStat> categories = byCategory.entrySet().stream()
                .map(en -> new AnalyticsDto.CategoryStat(en.getKey(), en.getValue()))
                .toList();

        List<AnalyticsDto.TopEvent> top = scope.stream()
                .map(e -> new AnalyticsDto.TopEvent(e.getId(), e.getTitle(),
                        regsPerEvent.getOrDefault(e.getId(), 0), checkedPerEvent.getOrDefault(e.getId(), 0)))
                .sorted(Comparator.comparingInt(AnalyticsDto.TopEvent::registrations).reversed())
                .limit(5)
                .toList();

        return new AnalyticsDto(scope.size(), (int) venues.count(), totalRegs, totalChecked, rate,
                departments, categories, top);
    }
}
