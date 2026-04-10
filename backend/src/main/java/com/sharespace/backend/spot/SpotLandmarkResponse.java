package com.sharespace.backend.spot;

public record SpotLandmarkResponse(
    Long id,
    Integer stepNumber,
    String description,
    Double latitude,
    Double longitude
) {
    public static SpotLandmarkResponse from(SpotLandmark landmark) {
        return new SpotLandmarkResponse(
            landmark.getId(),
            landmark.getStepNumber(),
            landmark.getDescription(),
            landmark.getLatitude(),
            landmark.getLongitude()
        );
    }
}
