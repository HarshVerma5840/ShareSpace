package com.sharespace.backend.auth;

import com.sharespace.backend.common.ApiException;
import com.sharespace.backend.user.AppUser;
import com.sharespace.backend.user.UserRepository;
import com.sharespace.backend.user.UserSummaryResponse;
import com.sharespace.backend.wallet.Wallet;
import com.sharespace.backend.wallet.WalletResponse;
import com.sharespace.backend.wallet.WalletService;
import java.math.BigDecimal;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final WalletService walletService;
    private final BCryptPasswordEncoder passwordEncoder;

    public AuthService(
        UserRepository userRepository,
        WalletService walletService,
        BCryptPasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.walletService = walletService;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        userRepository.findByEmailIgnoreCase(request.email().trim()).ifPresent(user -> {
            throw new ApiException("An account with this email already exists.");
        });

        AppUser user = new AppUser();
        user.setFullName(request.fullName().trim());
        user.setEmail(request.email().trim().toLowerCase());
        user.setPhone(request.phone().trim());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setRole(request.role());

        AppUser savedUser = userRepository.save(user);
        Wallet wallet = walletService.createWalletForUser(savedUser, new BigDecimal("2500.00"));

        return new AuthResponse(UserSummaryResponse.from(savedUser), WalletResponse.from(wallet));
    }

    @Transactional(readOnly = true)
    public AuthResponse login(AuthRequest request) {
        AppUser user = userRepository.findByEmailIgnoreCase(request.email().trim())
            .orElseThrow(() -> new ApiException("No account found with that email."));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new ApiException("Incorrect password.");
        }

        return new AuthResponse(
            UserSummaryResponse.from(user),
            walletService.getWallet(user.getId())
        );
    }
}
