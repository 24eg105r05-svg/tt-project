package com.cems.util;

import java.util.UUID;

public final class Ids {
    private Ids() {}

    /** e.g. next("evt") -> "evt-3f9a1c7b2d4e" (keeps the string-id style the React app already uses). */
    public static String next(String prefix) {
        return prefix + "-" + UUID.randomUUID().toString().replace("-", "").substring(0, 12);
    }
}
