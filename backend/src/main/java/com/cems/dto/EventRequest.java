package com.cems.dto;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.List;

public record EventRequest(
        @NotBlank @Size(max = 200) String title,
        @NotBlank @Size(max = 4000) String description,
        @NotBlank @Size(max = 120) String department,
        @NotBlank @Size(max = 60) String category,
        @NotBlank String venueId,
        @NotNull @FutureOrPresent LocalDate date,
        @NotBlank @Size(max = 60) String time,
        @NotNull @Min(1) @Max(100000) Integer capacity,
        @Size(max = 1000) String image,
        List<@Size(max = 60) String> tags) {
}
