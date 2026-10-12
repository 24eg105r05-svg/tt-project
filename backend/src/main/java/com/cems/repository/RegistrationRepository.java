package com.cems.repository;

import com.cems.model.Registration;
import com.cems.model.RegistrationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface RegistrationRepository extends JpaRepository<Registration, String> {

    @Query("select r from Registration r order by r.registeredAt desc")
    List<Registration> findAllOrdered();

    @Query("select r from Registration r where r.student.id = :studentId order by r.registeredAt desc")
    List<Registration> findByStudent(@Param("studentId") String studentId);

    @Query("select r from Registration r where r.event.organizer.id = :organizerId order by r.registeredAt desc")
    List<Registration> findByOrganizer(@Param("organizerId") String organizerId);

    @Query("select r from Registration r where r.event.id = :eventId and r.student.id = :studentId")
    Optional<Registration> findByEventAndStudent(@Param("eventId") String eventId,
                                                 @Param("studentId") String studentId);

    Optional<Registration> findByQrToken(String qrToken);

    @Query("select count(r) from Registration r where r.event.id = :eventId and r.status = :status")
    long countByEventAndStatus(@Param("eventId") String eventId, @Param("status") RegistrationStatus status);

    @Query("select r from Registration r where r.event.id = :eventId and r.status = :status "
            + "order by r.registeredAt asc")
    List<Registration> findByEventAndStatusOrdered(@Param("eventId") String eventId,
                                                   @Param("status") RegistrationStatus status);

    /** rows of [eventId, status, count] used to fill registeredCount / waitlistCount on event cards. */
    @Query("select r.event.id, r.status, count(r) from Registration r group by r.event.id, r.status")
    List<Object[]> countGroupedByEventAndStatus();
}
