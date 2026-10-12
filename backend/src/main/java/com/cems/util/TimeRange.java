package com.cems.util;

import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Parses free-text slots such as "09:00 AM - 05:00 PM" (or 24h "14:00-16:30") and tests overlap.
 * Back-to-back slots (ends 5 PM / starts 5 PM) do NOT clash.
 */
public final class TimeRange {

    private static final Pattern CLOCK = Pattern.compile("(\\d{1,2}):(\\d{2})\\s*([AaPp][Mm])?");

    private TimeRange() {}

    /** @return {startMinute, endMinute} from midnight, or empty if the text isn't a recognisable range. */
    public static Optional<int[]> parse(String text) {
        if (text == null) {
            return Optional.empty();
        }
        Matcher m = CLOCK.matcher(text);
        int[] points = new int[2];
        int found = 0;
        while (m.find()) {
            if (found == 2) {
                return Optional.empty(); // more than two times: ambiguous
            }
            int hour = Integer.parseInt(m.group(1));
            int minute = Integer.parseInt(m.group(2));
            String meridiem = m.group(3);
            if (minute > 59 || hour > 23) {
                return Optional.empty();
            }
            if (meridiem != null) {
                if (hour < 1 || hour > 12) {
                    return Optional.empty();
                }
                hour = hour % 12;
                if (meridiem.equalsIgnoreCase("PM")) {
                    hour += 12;
                }
            }
            points[found++] = hour * 60 + minute;
        }
        if (found != 2) {
            return Optional.empty();
        }
        if (points[1] <= points[0]) {
            points[1] += 24 * 60; // runs past midnight
        }
        return Optional.of(points);
    }

    /**
     * True if the two slots overlap. If either slot can't be parsed we can't prove they are
     * disjoint, so we conservatively report a clash (same venue + same day), which is the
     * behaviour the original prototype had.
     */
    public static boolean overlaps(String a, String b) {
        Optional<int[]> ra = parse(a);
        Optional<int[]> rb = parse(b);
        if (ra.isEmpty() || rb.isEmpty()) {
            return true;
        }
        return ra.get()[0] < rb.get()[1] && rb.get()[0] < ra.get()[1];
    }
}
