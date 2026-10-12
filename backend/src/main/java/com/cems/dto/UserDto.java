package com.cems.dto;

/** role is lower-case ("student" | "organizer" | "admin") because the React UI compares against those strings. */
public record UserDto(String id, String name, String email, String role, String department) {
}
