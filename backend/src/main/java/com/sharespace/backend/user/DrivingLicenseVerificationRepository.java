package com.sharespace.backend.user;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DrivingLicenseVerificationRepository extends JpaRepository<DrivingLicenseVerification, Long> {
    Optional<DrivingLicenseVerification> findByUserId(Long userId);
}
