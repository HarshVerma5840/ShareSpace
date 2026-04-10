package com.sharespace.backend.spot;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record SpotLandmarkRequest(
    @NotNull(message = "Step number is required")
    Integer stepNumber,
    @NotBlank(message = "Landmark description is required")
    String description,
    /** Optional lat/lng to pin this waypoint on the map. */
    Double latitude,
    Double longitude
) {
}
