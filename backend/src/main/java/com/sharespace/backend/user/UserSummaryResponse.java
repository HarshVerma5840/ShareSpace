package com.sharespace.backend.user;

public record UserSummaryResponse(
    Long id,
    String fullName,
    String email,
    String phone,
    UserRole role,
    UserVerificationStatus verificationStatus
) {
    public static UserSummaryResponse from(AppUser user) {
        return new UserSummaryResponse(
            user.getId(),
            user.getFullName(),
            user.getEmail(),
            user.getPhone(),
            user.getRole(),
            user.getVerificationStatus()
        );
    }
}
