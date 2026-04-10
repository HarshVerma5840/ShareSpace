package com.sharespace.backend.wallet;

import com.sharespace.backend.auth.SessionAuthService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/wallets")
public class WalletController {

    private final WalletService walletService;
    private final SessionAuthService sessionAuthService;

    public WalletController(WalletService walletService, SessionAuthService sessionAuthService) {
        this.walletService = walletService;
        this.sessionAuthService = sessionAuthService;
    }

    @GetMapping("/{userId}")
    public WalletResponse getWallet(@PathVariable Long userId, HttpSession session) {
        sessionAuthService.requireSelf(session, userId);
        return walletService.getWallet(userId);
    }

    @PostMapping("/{userId}/top-up")
    public WalletResponse topUp(
        @PathVariable Long userId,
        @Valid @RequestBody WalletTopUpRequest request,
        HttpSession session
    ) {
        sessionAuthService.requireSelf(session, userId);
        return walletService.topUp(userId, request.amount());
    }
}
