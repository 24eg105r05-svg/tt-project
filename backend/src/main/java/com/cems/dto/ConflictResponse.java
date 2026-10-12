package com.cems.dto;

public record ConflictResponse(boolean conflict, String message, EventDto event) {
}
