package com.cems.dto;

import java.util.List;

public record AnalyticsDto(
        int totalEvents,
        int totalVenues,
        int totalRegistrations,
        int totalCheckedIn,
        int attendanceRate,
        List<DepartmentStat> departments,
        List<CategoryStat> categories,
        List<TopEvent> topEvents) {

    public record DepartmentStat(String name, int eventsCount, int regCount) {
    }

    public record CategoryStat(String name, int count) {
    }

    public record TopEvent(String id, String title, int registrations, int checkedIn) {
    }
}
