package com.sharespace.backend.spot;

import com.sharespace.backend.common.ApiException;
import com.sharespace.backend.user.AppUser;
import com.sharespace.backend.user.UserRepository;
import com.sharespace.backend.user.UserRole;
import java.util.Comparator;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SpotService {

    private final SpotRepository spotRepository;
    private final UserRepository userRepository;

    public SpotService(SpotRepository spotRepository, UserRepository userRepository) {
        this.spotRepository = spotRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public SpotResponse createSpot(SpotRequest request) {
        AppUser host = userRepository.findById(request.hostId())
            .orElseThrow(() -> new ApiException("Host account not found."));

        if (host.getRole() != UserRole.HOST) {
            throw new ApiException("Only host accounts can publish parking spots.");
        }

        Spot spot = new Spot();
        spot.setHost(host);
        spot.setTitle(request.title());
        spot.setAddress(request.address());
        spot.setAvailabilityWindow(request.availabilityWindow());
        spot.setLatitude(request.latitude());
        spot.setLongitude(request.longitude());
        spot.setHourlyRate(request.hourlyRate());
        spot.setSlotType(request.slotType());
        spot.setCovered(request.covered());

        return SpotResponse.from(spotRepository.save(spot), null);
    }

    @Transactional(readOnly = true)
    public List<SpotResponse> findSpots(Double latitude, Double longitude, Double radiusKm) {
        return spotRepository.findAllByOrderByCreatedAtDesc().stream()
            .map(spot -> SpotResponse.from(spot, calculateDistance(latitude, longitude, spot)))
            .filter(spot -> radiusKm == null || spot.distanceKm() == null || spot.distanceKm() <= radiusKm)
            .sorted(Comparator.comparing(
                spot -> spot.distanceKm() == null ? Double.MAX_VALUE : spot.distanceKm()
            ))
            .toList();
    }

    @Transactional(readOnly = true)
    public List<SpotResponse> findHostSpots(Long hostId) {
        return spotRepository.findByHostIdOrderByCreatedAtDesc(hostId).stream()
            .map(spot -> SpotResponse.from(spot, null))
            .toList();
    }

    @Transactional(readOnly = true)
    public Spot getSpotEntity(Long spotId) {
        return spotRepository.findById(spotId)
            .orElseThrow(() -> new ApiException("Parking spot not found."));
    }

    private Double calculateDistance(Double latitude, Double longitude, Spot spot) {
        if (latitude == null || longitude == null) {
            return null;
        }

        double earthRadiusKm = 6371.0;
        double latitudeDelta = Math.toRadians(spot.getLatitude() - latitude);
        double longitudeDelta = Math.toRadians(spot.getLongitude() - longitude);
        double originLatitude = Math.toRadians(latitude);
        double destinationLatitude = Math.toRadians(spot.getLatitude());

        double haversine = Math.sin(latitudeDelta / 2) * Math.sin(latitudeDelta / 2)
            + Math.cos(originLatitude) * Math.cos(destinationLatitude)
            * Math.sin(longitudeDelta / 2) * Math.sin(longitudeDelta / 2);

        double arc = 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
        return Math.round(earthRadiusKm * arc * 100.0) / 100.0;
    }
}
