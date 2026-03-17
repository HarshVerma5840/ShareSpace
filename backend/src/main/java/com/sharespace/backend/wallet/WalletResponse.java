package com.sharespace.backend.wallet;

import java.math.BigDecimal;
import java.time.Instant;

public record WalletResponse(
    Long walletId,
    Long userId,
    BigDecimal balance,
    Instant updatedAt
) {
    public static WalletResponse from(Wallet wallet) {
        return new WalletResponse(
            wallet.getId(),
            wallet.getUser().getId(),
            wallet.getBalance(),
            wallet.getUpdatedAt()
        );
    }
}
