package com.cems.dto;

import java.time.LocalDate;
import java.util.List;

public record EventDto(
        String id,
        String title,
        String description,
        String organizerId,
        String organizerName,
        String department,
        String category,
        String venueId,
        String venueName,
        LocalDate date,
        String time,
        int capacity,
        String status,
        String image,
        List<String> tags,
        int registeredCount,
        int waitlistCount,
        int seatsLeft) {
}
