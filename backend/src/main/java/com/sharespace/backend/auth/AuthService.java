package com.sharespace.backend.auth;

import com.sharespace.backend.common.ApiException;
import com.sharespace.backend.user.AppUser;
import com.sharespace.backend.user.UserRepository;
import com.sharespace.backend.user.UserSummaryResponse;
import com.sharespace.backend.user.UserRole;
import com.sharespace.backend.user.UserVerificationStatus;
import com.sharespace.backend.wallet.Wallet;
import com.sharespace.backend.wallet.WalletResponse;
import com.sharespace.backend.wallet.WalletService;
import jakarta.servlet.http.HttpSession;
import java.math.BigDecimal;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private static final String ADMIN_EMAIL = "admin@gmail.com";
    private static final String ADMIN_PASSWORD = "admin123";

    private final UserRepository userRepository;
    private final WalletService walletService;
    private final BCryptPasswordEncoder passwordEncoder;
    private final SessionAuthService sessionAuthService;

    public AuthService(
        UserRepository userRepository,
        WalletService walletService,
        BCryptPasswordEncoder passwordEncoder,
        SessionAuthService sessionAuthService
    ) {
        this.userRepository = userRepository;
        this.walletService = walletService;
        this.passwordEncoder = passwordEncoder;
        this.sessionAuthService = sessionAuthService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request, HttpSession session) {
        userRepository.findByEmailIgnoreCase(request.email().trim()).ifPresent(user -> {
            throw new ApiException("An account with this email already exists.");
        });
        if (request.role() == UserRole.ADMIN) {
            throw new ApiException("Admin accounts cannot be created from public registration.");
        }

        AppUser user = new AppUser();
        user.setFullName(request.fullName().trim());
        user.setEmail(request.email().trim().toLowerCase());
        user.setPhone(request.phone().trim());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setRole(request.role());
        user.setVerificationStatus(
            request.role() == UserRole.COMMUTER
                ? UserVerificationStatus.UNVERIFIED
                : UserVerificationStatus.NOT_APPLICABLE
        );

        AppUser savedUser = userRepository.save(user);
        Wallet wallet = walletService.createWalletForUser(savedUser, new BigDecimal("2500.00"));
        sessionAuthService.markAuthenticated(session, savedUser.getId());

        return new AuthResponse(UserSummaryResponse.from(savedUser), WalletResponse.from(wallet));
    }

    @Transactional
    public AuthResponse login(AuthRequest request, HttpSession session) {
        String email = request.email().trim().toLowerCase();
        String password = request.password().trim();
        if (ADMIN_EMAIL.equals(email) && ADMIN_PASSWORD.equals(password)) {
            return loginHardcodedAdmin(session);
        }

        AppUser user = userRepository.findByEmailIgnoreCase(request.email().trim())
            .orElseThrow(() -> new ApiException("No account found with that email."));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new ApiException("Incorrect password.");
        }
        sessionAuthService.markAuthenticated(session, user.getId());

        return new AuthResponse(
            UserSummaryResponse.from(user),
            walletService.getWallet(user.getId())
        );
    }

    private AuthResponse loginHardcodedAdmin(HttpSession session) {
        AppUser admin = userRepository.findByEmailIgnoreCase(ADMIN_EMAIL)
            .orElseGet(() -> {
                AppUser user = new AppUser();
                user.setFullName("ShareSpace Admin");
                user.setEmail(ADMIN_EMAIL);
                user.setPhone("0000000000");
                user.setPasswordHash(passwordEncoder.encode(ADMIN_PASSWORD));
                user.setRole(UserRole.ADMIN);
                user.setVerificationStatus(UserVerificationStatus.NOT_APPLICABLE);
                AppUser saved = userRepository.save(user);
                walletService.createWalletForUser(saved, BigDecimal.ZERO);
                return saved;
            });

        boolean repaired = false;
        if (admin.getRole() != UserRole.ADMIN) {
            admin.setRole(UserRole.ADMIN);
            repaired = true;
        }
        if (admin.getVerificationStatus() != UserVerificationStatus.NOT_APPLICABLE) {
            admin.setVerificationStatus(UserVerificationStatus.NOT_APPLICABLE);
            repaired = true;
        }
        if (repaired) {
            admin = userRepository.save(admin);
        }

        sessionAuthService.markAuthenticated(session, admin.getId());
        Wallet wallet = walletService.getOrCreateWalletForUser(admin, BigDecimal.ZERO);
        return new AuthResponse(
            UserSummaryResponse.from(admin),
            WalletResponse.from(wallet)
        );
    }
}
