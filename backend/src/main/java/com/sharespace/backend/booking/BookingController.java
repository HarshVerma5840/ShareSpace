package com.sharespace.backend.booking;

import com.sharespace.backend.auth.SessionAuthService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;
    private final SessionAuthService sessionAuthService;

    public BookingController(BookingService bookingService, SessionAuthService sessionAuthService) {
        this.bookingService = bookingService;
        this.sessionAuthService = sessionAuthService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public BookingReceiptResponse createBooking(@Valid @RequestBody BookingRequest request, HttpSession session) {
        sessionAuthService.requireSelf(session, request.guestId());
        return bookingService.createBooking(request);
    }

    @GetMapping("/guest/{guestId}")
    public List<BookingResponse> getGuestBookings(@PathVariable Long guestId, HttpSession session) {
        sessionAuthService.requireSelf(session, guestId);
        return bookingService.getGuestBookings(guestId);
    }

    @GetMapping("/host/{hostId}")
    public List<BookingResponse> getHostBookings(@PathVariable Long hostId, HttpSession session) {
        sessionAuthService.requireSelf(session, hostId);
        return bookingService.getHostBookings(hostId);
    }
}
