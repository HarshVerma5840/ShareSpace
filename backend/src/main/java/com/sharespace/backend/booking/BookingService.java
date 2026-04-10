package com.sharespace.backend.booking;

import com.sharespace.backend.common.ApiException;
import com.sharespace.backend.spot.Spot;
import com.sharespace.backend.spot.SpotService;
import com.sharespace.backend.user.AppUser;
import com.sharespace.backend.user.UserRepository;
import com.sharespace.backend.user.UserRole;
import com.sharespace.backend.user.UserVerificationStatus;
import com.sharespace.backend.wallet.WalletResponse;
import com.sharespace.backend.wallet.WalletService;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class BookingService {

    private static final BigDecimal PLATFORM_FEE_RATE = new BigDecimal("0.10");
    private static final BigDecimal VERIFIED_COMMUTER_DISCOUNT_RATE = new BigDecimal("0.05");
    private static final BigDecimal ZERO = new BigDecimal("0.00");

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final SpotService spotService;
    private final WalletService walletService;

    public BookingService(
        BookingRepository bookingRepository,
        UserRepository userRepository,
        SpotService spotService,
        WalletService walletService
    ) {
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
        this.spotService = spotService;
        this.walletService = walletService;
    }

    @Transactional
    public BookingReceiptResponse createBooking(BookingRequest request) {
        AppUser guest = userRepository.findById(request.guestId())
            .orElseThrow(() -> new ApiException("Guest account not found."));

        if (guest.getRole() == UserRole.HOST) {
            throw new ApiException("Only tourist and commuter accounts can book parking.");
        }

        Spot spot = spotService.getSpotEntity(request.spotId());
        if (spot.getHost().getId().equals(guest.getId())) {
            throw new ApiException("Hosts cannot book their own parking spot.");
        }

        BigDecimal baseAmount = spot.getHourlyRate().setScale(2, RoundingMode.HALF_UP);
        BigDecimal platformFeeAmount = baseAmount.multiply(PLATFORM_FEE_RATE).setScale(2, RoundingMode.HALF_UP);
        boolean verifiedCommuter = guest.getRole() == UserRole.COMMUTER
            && guest.getVerificationStatus() == UserVerificationStatus.VERIFIED;
        BigDecimal discountAmount = verifiedCommuter
            ? baseAmount.multiply(VERIFIED_COMMUTER_DISCOUNT_RATE).setScale(2, RoundingMode.HALF_UP)
            : ZERO;
        BigDecimal totalAmount = baseAmount.add(platformFeeAmount).subtract(discountAmount).setScale(2, RoundingMode.HALF_UP);
        BigDecimal hostPayoutAmount = baseAmount;

        walletService.settleBooking(guest.getId(), spot.getHost().getId(), totalAmount, hostPayoutAmount);

        Booking booking = new Booking();
        booking.setGuest(guest);
        booking.setSpot(spot);
        booking.setBaseAmount(baseAmount);
        booking.setDiscountAmount(discountAmount);
        booking.setPlatformFeeAmount(platformFeeAmount);
        booking.setHostPayoutAmount(hostPayoutAmount);
        booking.setTotalAmount(totalAmount);
        booking.setStatus(BookingStatus.CONFIRMED);

        Booking savedBooking = bookingRepository.save(booking);
        WalletResponse wallet = walletService.getWallet(guest.getId());
        return new BookingReceiptResponse(BookingResponse.from(savedBooking), wallet);
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getGuestBookings(Long guestId) {
        return bookingRepository.findByGuestIdOrderByCreatedAtDesc(guestId).stream()
            .map(BookingResponse::from)
            .toList();
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getHostBookings(Long hostId) {
        return bookingRepository.findBySpotHostIdOrderByCreatedAtDesc(hostId).stream()
            .map(BookingResponse::from)
            .toList();
    }
}
