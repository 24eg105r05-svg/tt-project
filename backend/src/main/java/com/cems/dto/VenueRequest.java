package com.cems.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record VenueRequest(
        @NotBlank @Size(max = 160) String name,
        @NotBlank @Size(max = 200) String location,
        @NotNull @Min(1) @Max(100000) Integer capacity) {
}
