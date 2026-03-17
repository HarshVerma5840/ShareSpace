package com.sharespace.backend.spot;

import java.math.BigDecimal;
import java.time.Instant;

public record SpotResponse(
    Long id,
    Long hostId,
    String hostName,
    String title,
    String address,
    String availabilityWindow,
    Double latitude,
    Double longitude,
    BigDecimal hourlyRate,
    String slotType,
    Boolean covered,
    Instant createdAt,
    Double distanceKm
) {
    public static SpotResponse from(Spot spot, Double distanceKm) {
        return new SpotResponse(
            spot.getId(),
            spot.getHost().getId(),
            spot.getHost().getFullName(),
            spot.getTitle(),
            spot.getAddress(),
            spot.getAvailabilityWindow(),
            spot.getLatitude(),
            spot.getLongitude(),
            spot.getHourlyRate(),
            spot.getSlotType(),
            spot.getCovered(),
            spot.getCreatedAt(),
            distanceKm
        );
    }
}
