package com.sharespace.backend.auth;

import com.sharespace.backend.user.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
    @NotBlank(message = "Full name is required")
    String fullName,
    @NotBlank(message = "Email is required")
    @Email(message = "Enter a valid email address")
    String email,
    @NotBlank(message = "Phone is required")
    String phone,
    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    String password,
    @NotNull(message = "Role is required")
    UserRole role
) {
}
