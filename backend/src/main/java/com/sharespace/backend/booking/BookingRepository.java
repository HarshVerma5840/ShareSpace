package com.sharespace.backend.booking;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByGuestIdOrderByCreatedAtDesc(Long guestId);
    List<Booking> findBySpotHostIdOrderByCreatedAtDesc(Long hostId);
    void deleteByGuestId(Long guestId);
    void deleteBySpotHostId(Long hostId);
}
