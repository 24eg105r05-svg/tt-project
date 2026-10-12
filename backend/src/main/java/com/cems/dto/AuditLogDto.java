package com.cems.dto;

import java.time.Instant;

public record AuditLogDto(String id, Instant timestamp, String actor, String action, String entity) {
}
