package com.sharespace.backend.spot;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

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
    Double distanceKm,
    Boolean isActive,
    List<SpotLandmarkResponse> landmarks
) {
    public static SpotResponse from(Spot spot, Double distanceKm) {
        List<SpotLandmarkResponse> landmarkResponses = spot.getLandmarks().stream()
            .map(SpotLandmarkResponse::from)
            .sorted(Comparator.comparingInt(SpotLandmarkResponse::stepNumber))
            .collect(Collectors.toList());

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
            distanceKm,
            spot.getIsActive(),
            landmarkResponses
        );
    }
}
