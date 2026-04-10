package com.sharespace.backend.spot;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.List;

public record SpotRequest(
    @NotNull(message = "Host id is required")
    Long hostId,
    @NotBlank(message = "Title is required")
    String title,
    @NotBlank(message = "Address is required")
    String address,
    @NotBlank(message = "Availability window is required")
    String availabilityWindow,
    @NotNull(message = "Latitude is required")
    @DecimalMin(value = "6.4", message = "Latitude must be within India")
    @DecimalMax(value = "37.6", message = "Latitude must be within India")
    Double latitude,
    @NotNull(message = "Longitude is required")
    @DecimalMin(value = "68.0", message = "Longitude must be within India")
    @DecimalMax(value = "97.5", message = "Longitude must be within India")
    Double longitude,
    @NotNull(message = "Hourly rate is required")
    @DecimalMin(value = "1.0", message = "Hourly rate must be at least 1")
    BigDecimal hourlyRate,
    @NotBlank(message = "Slot type is required")
    String slotType,
    @NotNull(message = "Covered flag is required")
    Boolean covered,
    /** Optional — hosts may attach zero or more navigation waypoints. */
    @Valid
    List<SpotLandmarkRequest> landmarks
) {
}

