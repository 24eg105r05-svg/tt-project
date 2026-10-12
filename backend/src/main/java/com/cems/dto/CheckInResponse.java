package com.cems.dto;

/** Always HTTP 200: a rejected scan is a normal outcome at the gate, not an error. */
public record CheckInResponse(boolean success, String message, RegistrationDto registration, EventDto event) {
}
