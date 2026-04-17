package com.sharespace.backend.admin;

import com.sharespace.backend.auth.SessionAuthService;
import com.sharespace.backend.booking.Booking;
import com.sharespace.backend.booking.BookingRepository;
import com.sharespace.backend.booking.BookingResponse;
import com.sharespace.backend.common.ApiException;
import com.sharespace.backend.spot.Spot;
import com.sharespace.backend.spot.SpotRepository;
import com.sharespace.backend.spot.SpotResponse;
import com.sharespace.backend.user.AppUser;
import com.sharespace.backend.user.DrivingLicenseVerification;
import com.sharespace.backend.user.DrivingLicenseVerificationRepository;
import com.sharespace.backend.user.UserRepository;
import com.sharespace.backend.user.UserRole;
import com.sharespace.backend.user.UserSummaryResponse;
import com.sharespace.backend.user.UserVerificationStatus;
import com.sharespace.backend.wallet.Wallet;
import com.sharespace.backend.wallet.WalletRepository;
import com.sharespace.backend.wallet.WalletResponse;
import jakarta.servlet.http.HttpSession;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final SessionAuthService sessionAuthService;
    private final UserRepository userRepository;
    private final SpotRepository spotRepository;
    private final BookingRepository bookingRepository;
    private final WalletRepository walletRepository;
    private final DrivingLicenseVerificationRepository verificationRepository;

    public AdminController(
        SessionAuthService sessionAuthService,
        UserRepository userRepository,
        SpotRepository spotRepository,
        BookingRepository bookingRepository,
        WalletRepository walletRepository,
        DrivingLicenseVerificationRepository verificationRepository
    ) {
        this.sessionAuthService = sessionAuthService;
        this.userRepository = userRepository;
        this.spotRepository = spotRepository;
        this.bookingRepository = bookingRepository;
        this.walletRepository = walletRepository;
        this.verificationRepository = verificationRepository;
    }

    @GetMapping("/overview")
    @Transactional(readOnly = true)
    public AdminOverviewResponse overview(HttpSession session) {
        requireAdmin(session);
        List<AppUser> users = userRepository.findAll();
        List<Spot> spots = spotRepository.findAll();
        List<Booking> bookings = bookingRepository.findAll();
        List<Wallet> wallets = walletRepository.findAll();

        BigDecimal totalBookingValue = bookings.stream()
            .map(Booking::getTotalAmount)
            .filter(amount -> amount != null)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalWalletBalance = wallets.stream()
            .map(Wallet::getBalance)
            .filter(amount -> amount != null)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        long pendingVerifications = users.stream()
            .filter(user -> user.getVerificationStatus() == UserVerificationStatus.PENDING)
            .count();
        long activeSpots = spots.stream()
            .filter(spot -> Boolean.TRUE.equals(spot.getIsActive()))
            .count();

        return new AdminOverviewResponse(
            users.size(),
            spots.size(),
            activeSpots,
            bookings.size(),
            wallets.size(),
            pendingVerifications,
            totalBookingValue,
            totalWalletBalance
        );
    }

    @GetMapping("/users")
    @Transactional(readOnly = true)
    public List<UserSummaryResponse> users(HttpSession session) {
        requireAdmin(session);
        return userRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt")).stream()
            .map(UserSummaryResponse::from)
            .toList();
    }

    @GetMapping("/spots")
    @Transactional(readOnly = true)
    public List<SpotResponse> spots(HttpSession session) {
        requireAdmin(session);
        return spotRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt")).stream()
            .map(spot -> SpotResponse.from(spot, null))
            .toList();
    }

    @GetMapping("/bookings")
    @Transactional(readOnly = true)
    public List<BookingResponse> bookings(HttpSession session) {
        requireAdmin(session);
        return bookingRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt")).stream()
            .map(BookingResponse::from)
            .toList();
    }

    @GetMapping("/wallets")
    @Transactional(readOnly = true)
    public List<WalletResponse> wallets(HttpSession session) {
        requireAdmin(session);
        return walletRepository.findAll(Sort.by(Sort.Direction.DESC, "updatedAt")).stream()
            .map(WalletResponse::from)
            .toList();
    }

    @GetMapping("/license-verifications")
    @Transactional(readOnly = true)
    public List<AdminLicenseVerificationResponse> licenseVerifications(HttpSession session) {
        requireAdmin(session);
        return verificationRepository.findAll(Sort.by(Sort.Direction.DESC, "submittedAt")).stream()
            .map(AdminLicenseVerificationResponse::from)
            .toList();
    }

    @PatchMapping("/users/{id}/verification-status")
    @Transactional
    public UserSummaryResponse updateVerificationStatus(
        @PathVariable Long id,
        @RequestBody AdminVerificationStatusRequest request,
        HttpSession session
    ) {
        requireAdmin(session);
        AppUser user = userRepository.findById(id)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found."));
        if (user.getRole() != UserRole.COMMUTER) {
            throw new ApiException("Only commuter verification status can be changed.");
        }
        user.setVerificationStatus(request.status());
        return UserSummaryResponse.from(userRepository.save(user));
    }

    @PatchMapping("/spots/{id}/toggle-status")
    @Transactional
    public SpotResponse toggleSpotStatus(@PathVariable Long id, HttpSession session) {
        requireAdmin(session);
        Spot spot = spotRepository.findById(id)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Spot not found."));
        spot.setIsActive(!Boolean.TRUE.equals(spot.getIsActive()));
        return SpotResponse.from(spotRepository.save(spot), null);
    }

    @DeleteMapping("/spots/{id}")
    @Transactional
    public void deleteSpot(@PathVariable Long id, HttpSession session) {
        requireAdmin(session);
        if (!spotRepository.existsById(id)) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Spot not found.");
        }
        spotRepository.deleteById(id);
    }

    @DeleteMapping("/users/{id}")
    @Transactional
    public void deleteUser(@PathVariable Long id, HttpSession session) {
        AppUser admin = sessionAuthService.requireAdmin(session);
        if (admin.getId().equals(id)) {
            throw new ApiException("You cannot delete the admin account you are currently using.");
        }

        AppUser user = userRepository.findById(id)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found."));
        if (user.getRole() == UserRole.ADMIN) {
            throw new ApiException("Admin accounts cannot be deleted from this dashboard.");
        }

        verificationRepository.deleteByUserId(id);
        walletRepository.deleteByUserId(id);
        bookingRepository.deleteByGuestId(id);
        bookingRepository.deleteBySpotHostId(id);
        spotRepository.deleteByHostId(id);
        userRepository.delete(user);
    }

    private void requireAdmin(HttpSession session) {
        sessionAuthService.requireAdmin(session);
    }

    public record AdminOverviewResponse(
        int totalUsers,
        int totalSpots,
        long activeSpots,
        int totalBookings,
        int totalWallets,
        long pendingVerifications,
        BigDecimal totalBookingValue,
        BigDecimal totalWalletBalance
    ) {}

    public record AdminVerificationStatusRequest(UserVerificationStatus status) {}

    public record AdminLicenseVerificationResponse(
        Long id,
        Long userId,
        String userName,
        String userEmail,
        UserVerificationStatus status,
        String licenseNumberMasked,
        String frontDocumentPath,
        String backDocumentPath,
        Instant submittedAt
    ) {
        public static AdminLicenseVerificationResponse from(DrivingLicenseVerification verification) {
            return new AdminLicenseVerificationResponse(
                verification.getId(),
                verification.getUser().getId(),
                verification.getUser().getFullName(),
                verification.getUser().getEmail(),
                verification.getUser().getVerificationStatus(),
                verification.getLicenseNumberMasked(),
                verification.getFrontDocumentPath(),
                verification.getBackDocumentPath(),
                verification.getSubmittedAt()
            );
        }
    }
}
