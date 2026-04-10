package com.sharespace.backend.user;

import com.sharespace.backend.common.ApiException;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.Instant;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
public class DrivingLicenseVerificationService {

    private static final Set<String> ALLOWED_TYPES = Set.of("image/jpeg", "image/png", "image/webp", "application/pdf");

    private final DrivingLicenseVerificationRepository verificationRepository;

    public DrivingLicenseVerificationService(DrivingLicenseVerificationRepository verificationRepository) {
        this.verificationRepository = verificationRepository;
    }

    @Transactional
    public UserSummaryResponse submit(AppUser user, String licenseNumber, MultipartFile frontDocument, MultipartFile backDocument) {
        if (user.getRole() != UserRole.COMMUTER) {
            throw new ApiException("Only commuter accounts can submit driving license verification.");
        }
        if (frontDocument == null || frontDocument.isEmpty()) {
            throw new ApiException("Front driving license document is required.");
        }

        String normalizedNumber = normalizeLicenseNumber(licenseNumber);
        validateDocument(frontDocument, "front");
        if (backDocument != null && !backDocument.isEmpty()) {
            validateDocument(backDocument, "back");
        }

        DrivingLicenseVerification verification = verificationRepository.findByUserId(user.getId())
            .orElseGet(DrivingLicenseVerification::new);
        verification.setUser(user);
        verification.setLicenseNumberMasked(maskLicenseNumber(normalizedNumber));
        verification.setFrontDocumentPath(storeDocument(user.getId(), "front", frontDocument));
        if (backDocument != null && !backDocument.isEmpty()) {
            verification.setBackDocumentPath(storeDocument(user.getId(), "back", backDocument));
        }
        user.setVerificationStatus(UserVerificationStatus.PENDING);
        verificationRepository.save(verification);
        return UserSummaryResponse.from(user);
    }

    private String normalizeLicenseNumber(String licenseNumber) {
        if (licenseNumber == null || licenseNumber.isBlank()) {
            throw new ApiException("Driving license number is required.");
        }
        String normalized = licenseNumber.replaceAll("[^A-Za-z0-9]", "").toUpperCase(Locale.ROOT);
        if (normalized.length() < 8) {
            throw new ApiException("Enter a valid driving license number.");
        }
        return normalized;
    }

    private void validateDocument(MultipartFile document, String label) {
        String contentType = document.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType)) {
            throw new ApiException("Unsupported " + label + " document type. Use JPG, PNG, WEBP, or PDF.");
        }
    }

    private String storeDocument(Long userId, String label, MultipartFile document) {
        try {
            Path baseDir = Path.of("C:\\Users\\harsh\\Desktop\\prjct\\backend\\uploads\\licenses", String.valueOf(userId));
            Files.createDirectories(baseDir);
            String originalName = document.getOriginalFilename() == null ? label : document.getOriginalFilename();
            String extension = extractExtension(originalName);
            Path target = baseDir.resolve(label + "-" + Instant.now().toEpochMilli() + "-" + UUID.randomUUID() + extension);
            try (InputStream inputStream = document.getInputStream()) {
                Files.copy(inputStream, target, StandardCopyOption.REPLACE_EXISTING);
            }
            return target.toString();
        } catch (IOException ex) {
            throw new ApiException("Failed to store uploaded driving license document.");
        }
    }

    private String extractExtension(String fileName) {
        int dotIndex = fileName.lastIndexOf('.');
        return dotIndex >= 0 ? fileName.substring(dotIndex) : "";
    }

    private String maskLicenseNumber(String licenseNumber) {
        if (licenseNumber.length() <= 4) {
            return licenseNumber;
        }
        return "*".repeat(Math.max(0, licenseNumber.length() - 4)) + licenseNumber.substring(licenseNumber.length() - 4);
    }
}
