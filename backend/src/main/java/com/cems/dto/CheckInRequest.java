package com.cems.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CheckInRequest(@NotBlank @Size(max = 80) String token) {
}
