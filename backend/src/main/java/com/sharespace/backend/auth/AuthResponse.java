package com.sharespace.backend.auth;

import com.sharespace.backend.user.UserSummaryResponse;
import com.sharespace.backend.wallet.WalletResponse;

public record AuthResponse(
    UserSummaryResponse user,
    WalletResponse wallet
) {
}
