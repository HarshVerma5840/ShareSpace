package com.sharespace.backend.spot;

import com.sharespace.backend.auth.SessionAuthService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
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
    private final SessionAuthService sessionAuthService;

    public SpotController(SpotService spotService, SessionAuthService sessionAuthService) {
        this.spotService = spotService;
        this.sessionAuthService = sessionAuthService;
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
    public List<SpotResponse> getHostSpots(@PathVariable Long hostId, HttpSession session) {
        sessionAuthService.requireSelf(session, hostId);
        return spotService.findHostSpots(hostId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public SpotResponse createSpot(@Valid @RequestBody SpotRequest request, HttpSession session) {
        sessionAuthService.requireSelf(session, request.hostId());
        return spotService.createSpot(request);
    }

    @org.springframework.web.bind.annotation.PatchMapping("/{id}/toggle-status")
    public SpotResponse toggleSpotStatus(@PathVariable Long id, HttpSession session) {
        return spotService.toggleSpotStatus(id, sessionAuthService.requireAuthenticatedUserId(session));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteSpot(@PathVariable Long id, HttpSession session) {
        spotService.deleteSpot(id, sessionAuthService.requireAuthenticatedUserId(session));
    }
}
