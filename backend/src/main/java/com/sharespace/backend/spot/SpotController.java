package com.sharespace.backend.spot;

import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/spots")
public class SpotController {

    private final SpotService spotService;

    public SpotController(SpotService spotService) {
        this.spotService = spotService;
    }

    @GetMapping
    public List<SpotResponse> getSpots(
        @RequestParam(required = false) Double latitude,
        @RequestParam(required = false) Double longitude,
        @RequestParam(required = false) Double radiusKm
    ) {
        return spotService.findSpots(latitude, longitude, radiusKm);
    }

    @GetMapping("/host/{hostId}")
    public List<SpotResponse> getHostSpots(@PathVariable Long hostId) {
        return spotService.findHostSpots(hostId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public SpotResponse createSpot(@Valid @RequestBody SpotRequest request) {
        return spotService.createSpot(request);
    }
}
