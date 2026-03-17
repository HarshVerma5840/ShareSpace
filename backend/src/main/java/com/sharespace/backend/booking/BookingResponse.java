package com.sharespace.backend.booking;

import java.math.BigDecimal;
import java.time.Instant;

public record BookingResponse(
    Long id,
    Long guestId,
    String guestName,
    Long spotId,
    String spotTitle,
    String hostName,
    BigDecimal totalAmount,
    BookingStatus status,
    Instant createdAt
) {
    public static BookingResponse from(Booking booking) {
        return new BookingResponse(
            booking.getId(),
            booking.getGuest().getId(),
            booking.getGuest().getFullName(),
            booking.getSpot().getId(),
            booking.getSpot().getTitle(),
            booking.getSpot().getHost().getFullName(),
            booking.getTotalAmount(),
            booking.getStatus(),
            booking.getCreatedAt()
        );
    }
}
