package com.cems.util;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

class TimeRangeTest {

    @Test
    void parsesTwelveHourSlots() {
        assertArrayEquals(new int[]{9 * 60, 17 * 60}, TimeRange.parse("09:00 AM - 05:00 PM").orElseThrow());
        assertArrayEquals(new int[]{0, 60}, TimeRange.parse("12:00 AM - 01:00 AM").orElseThrow());
        assertArrayEquals(new int[]{12 * 60, 13 * 60}, TimeRange.parse("12:00 PM - 1:00 PM").orElseThrow());
    }

    @Test
    void parsesTwentyFourHourSlotsAndOvernight() {
        assertArrayEquals(new int[]{14 * 60, 16 * 60 + 30}, TimeRange.parse("14:00-16:30").orElseThrow());
        assertArrayEquals(new int[]{22 * 60, 26 * 60}, TimeRange.parse("10:00 PM - 02:00 AM").orElseThrow());
    }

    @Test
    void overlappingSlotsClash() {
        assertTrue(TimeRange.overlaps("09:00 AM - 05:00 PM", "02:00 PM - 07:00 PM"));
        assertTrue(TimeRange.overlaps("10:00 AM - 01:00 PM", "11:00 AM - 12:00 PM"));
    }

    @Test
    void backToBackAndDisjointSlotsDoNotClash() {
        assertFalse(TimeRange.overlaps("09:00 AM - 12:00 PM", "12:00 PM - 03:00 PM"));
        assertFalse(TimeRange.overlaps("09:00 AM - 11:00 AM", "06:00 PM - 08:00 PM"));
    }

    @Test
    void unparseableSlotsAreTreatedAsClashes() {
        assertTrue(TimeRange.overlaps("all day", "10:00 AM - 01:00 PM"));
        assertTrue(TimeRange.parse(null).isEmpty());
        assertTrue(TimeRange.parse("25:00 - 26:00").isEmpty());
    }
}
