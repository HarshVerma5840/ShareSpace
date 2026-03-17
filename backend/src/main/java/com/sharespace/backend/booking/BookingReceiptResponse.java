package com.sharespace.backend.booking;

import com.sharespace.backend.wallet.WalletResponse;

public record BookingReceiptResponse(
    BookingResponse booking,
    WalletResponse wallet
) {
}
