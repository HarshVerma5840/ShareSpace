package com.sharespace.backend.booking;

import jakarta.validation.constraints.NotNull;

public record BookingRequest(
    @NotNull(message = "Guest id is required")
    Long guestId,
    @NotNull(message = "Spot id is required")
    Long spotId
) {
}
