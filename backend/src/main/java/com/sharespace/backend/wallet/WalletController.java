package com.sharespace.backend.wallet;

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

    public WalletController(WalletService walletService) {
        this.walletService = walletService;
    }

    @GetMapping("/{userId}")
    public WalletResponse getWallet(@PathVariable Long userId) {
        return walletService.getWallet(userId);
    }

    @PostMapping("/{userId}/top-up")
    public WalletResponse topUp(
        @PathVariable Long userId,
        @Valid @RequestBody WalletTopUpRequest request
    ) {
        return walletService.topUp(userId, request.amount());
    }
}
