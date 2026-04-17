package com.sharespace.backend.wallet;

import com.sharespace.backend.common.ApiException;
import com.sharespace.backend.user.AppUser;
import com.sharespace.backend.user.UserRepository;
import java.math.BigDecimal;
import java.time.Instant;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class WalletService {

    private final WalletRepository walletRepository;
    private final UserRepository userRepository;

    public WalletService(WalletRepository walletRepository, UserRepository userRepository) {
        this.walletRepository = walletRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public Wallet createWalletForUser(AppUser user, BigDecimal initialBalance) {
        Wallet wallet = new Wallet();
        wallet.setUser(user);
        wallet.setBalance(initialBalance);
        wallet.setUpdatedAt(Instant.now());
        return walletRepository.save(wallet);
    }

    @Transactional
    public Wallet getOrCreateWalletForUser(AppUser user, BigDecimal initialBalance) {
        return walletRepository.findByUserId(user.getId())
            .orElseGet(() -> createWalletForUser(user, initialBalance));
    }

    @Transactional(readOnly = true)
    public WalletResponse getWallet(Long userId) {
        return WalletResponse.from(findWalletEntity(userId));
    }

    @Transactional
    public WalletResponse topUp(Long userId, BigDecimal amount) {
        Wallet wallet = findWalletEntity(userId);
        wallet.setBalance(wallet.getBalance().add(amount));
        wallet.setUpdatedAt(Instant.now());
        return WalletResponse.from(walletRepository.save(wallet));
    }

    @Transactional
    public void transfer(Long payerId, Long payeeId, BigDecimal amount) {
        Wallet payerWallet = findWalletEntity(payerId);
        Wallet payeeWallet = findWalletEntity(payeeId);

        if (payerWallet.getBalance().compareTo(amount) < 0) {
            throw new ApiException("Insufficient wallet balance. Please top up before booking.");
        }

        payerWallet.setBalance(payerWallet.getBalance().subtract(amount));
        payerWallet.setUpdatedAt(Instant.now());
        payeeWallet.setBalance(payeeWallet.getBalance().add(amount));
        payeeWallet.setUpdatedAt(Instant.now());

        walletRepository.save(payerWallet);
        walletRepository.save(payeeWallet);
    }

    @Transactional
    public void settleBooking(Long payerId, Long payeeId, BigDecimal totalCharge, BigDecimal hostPayout) {
        Wallet payerWallet = findWalletEntity(payerId);
        Wallet payeeWallet = findWalletEntity(payeeId);

        if (payerWallet.getBalance().compareTo(totalCharge) < 0) {
            throw new ApiException("Insufficient wallet balance. Please top up before booking.");
        }

        payerWallet.setBalance(payerWallet.getBalance().subtract(totalCharge));
        payerWallet.setUpdatedAt(Instant.now());
        payeeWallet.setBalance(payeeWallet.getBalance().add(hostPayout));
        payeeWallet.setUpdatedAt(Instant.now());

        walletRepository.save(payerWallet);
        walletRepository.save(payeeWallet);
    }

    private Wallet findWalletEntity(Long userId) {
        userRepository.findById(userId).orElseThrow(() -> new ApiException("User not found."));
        return walletRepository.findByUserId(userId)
            .orElseThrow(() -> new ApiException("Wallet not found for this user."));
    }
}
