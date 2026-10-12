package com.cems.repository;

import com.cems.model.Event;
import com.cems.model.EventStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface EventRepository extends JpaRepository<Event, String> {

    @Query("select e from Event e where e.status = :status order by e.date asc, e.id asc")
    List<Event> findByStatus(@Param("status") EventStatus status);

    @Query("select e from Event e where e.status = :status or e.organizer.id = :organizerId "
            + "order by e.date asc, e.id asc")
    List<Event> findVisibleToOrganizer(@Param("status") EventStatus status, @Param("organizerId") String organizerId);

    @Query("select e from Event e order by e.date asc, e.id asc")
    List<Event> findAllOrdered();

    /** Events that occupy a venue on a date (everything except the excluded status, i.e. REJECTED). */
    @Query("select e from Event e where e.venue.id = :venueId and e.date = :date and e.status <> :excluded")
    List<Event> findActiveAtVenueOnDate(@Param("venueId") String venueId,
                                        @Param("date") LocalDate date,
                                        @Param("excluded") EventStatus excluded);

    /** Row lock so two students can't grab the last seat at the same instant. */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select e from Event e where e.id = :id")
    Optional<Event> findByIdForUpdate(@Param("id") String id);
}
