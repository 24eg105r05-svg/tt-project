package com.cems.dto;

import java.time.Instant;

public record RegistrationDto(
        String id,
        String eventId,
        String eventTitle,
        String studentId,
        String studentName,
        String studentEmail,
        Instant registeredAt,
        String qrToken,
        String status,
        boolean checkedIn,
        Instant checkedInAt) {
}
