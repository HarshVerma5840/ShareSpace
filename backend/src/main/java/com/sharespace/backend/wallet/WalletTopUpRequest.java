package com.sharespace.backend.wallet;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record WalletTopUpRequest(
    @NotNull(message = "Amount is required")
    @DecimalMin(value = "1.0", message = "Top-up amount must be at least 1")
    BigDecimal amount
) {
}
