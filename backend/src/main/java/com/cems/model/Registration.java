package com.cems.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "registrations",
        uniqueConstraints = @UniqueConstraint(name = "uk_reg_event_student", columnNames = {"event_id", "student_id"}),
        indexes = @Index(name = "idx_reg_event_status", columnList = "event_id,status"))
@Getter
@Setter
@NoArgsConstructor
public class Registration {

    @Id
    @Column(length = 40)
    private String id;

    /** Optimistic lock: stops two simultaneous scans of one QR code both succeeding. */
    @Version
    private Long version;

    @ManyToOne(optional = false)
    @JoinColumn(name = "event_id")
    private Event event;

    @ManyToOne(optional = false)
    @JoinColumn(name = "student_id")
    private AppUser student;

    @Column(name = "registered_at", nullable = false)
    private Instant registeredAt;

    @Column(name = "qr_token", nullable = false, unique = true, length = 80)
    private String qrToken;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private RegistrationStatus status;

    @Column(name = "checked_in", nullable = false)
    private boolean checkedIn;

    @Column(name = "checked_in_at")
    private Instant checkedInAt;
}
