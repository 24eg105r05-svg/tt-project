package com.cems.util;

import java.security.SecureRandom;

public final class QrTokens {
    private static final SecureRandom RANDOM = new SecureRandom();
    // No 0/O/1/I so tokens are easy to read out loud at the gate.
    private static final String ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    private QrTokens() {}

    /** Unguessable single-use ticket code, e.g. CEMS-QR-K7QM-2XTA-9PWD-HE4N (~80 bits of entropy). */
    public static String generate() {
        StringBuilder sb = new StringBuilder("CEMS-QR-");
        for (int i = 0; i < 16; i++) {
            if (i > 0 && i % 4 == 0) {
                sb.append('-');
            }
            sb.append(ALPHABET.charAt(RANDOM.nextInt(ALPHABET.length())));
        }
        return sb.toString();
    }
}
