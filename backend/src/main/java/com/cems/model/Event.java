package com.cems.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "events", indexes = {
        @Index(name = "idx_event_venue_date", columnList = "venue_id,event_date"),
        @Index(name = "idx_event_status", columnList = "status")
})
@Getter
@Setter
@NoArgsConstructor
public class Event {

    @Id
    @Column(length = 40)
    private String id;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, length = 4000)
    private String description;

    @ManyToOne(optional = false)
    @JoinColumn(name = "organizer_id")
    private AppUser organizer;

    @Column(nullable = false, length = 120)
    private String department;

    @Column(nullable = false, length = 60)
    private String category;

    @ManyToOne(optional = false)
    @JoinColumn(name = "venue_id")
    private Venue venue;

    @Column(name = "event_date", nullable = false)
    private LocalDate date;

    /** Free-text slot such as "09:00 AM - 05:00 PM". Parsed by TimeRange for clash detection. */
    @Column(name = "event_time", nullable = false, length = 60)
    private String time;

    @Column(nullable = false)
    private int capacity;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EventStatus status = EventStatus.PENDING;

    @Column(length = 1000)
    private String image;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "event_tags", joinColumns = @JoinColumn(name = "event_id"))
    @Column(name = "tag", length = 60)
    private List<String> tags = new ArrayList<>();
}
