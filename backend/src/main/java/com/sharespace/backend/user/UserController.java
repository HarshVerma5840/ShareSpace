package com.sharespace.backend.user;

import com.sharespace.backend.auth.SessionAuthService;
import jakarta.validation.Valid;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;
    private final DrivingLicenseVerificationService drivingLicenseVerificationService;
    private final SessionAuthService sessionAuthService;

    public UserController(
        UserRepository userRepository,
        DrivingLicenseVerificationService drivingLicenseVerificationService,
        SessionAuthService sessionAuthService
    ) {
        this.userRepository = userRepository;
        this.drivingLicenseVerificationService = drivingLicenseVerificationService;
        this.sessionAuthService = sessionAuthService;
    }

    @PutMapping("/{id}")
    @Transactional
    public UserSummaryResponse updateProfile(
        @PathVariable Long id,
        @Valid @RequestBody UserUpdateRequest request,
        HttpSession session
    ) {
        sessionAuthService.requireSelf(session, id);
        AppUser user = userRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        
        user.setFullName(request.fullName());
        user.setEmail(request.email());
        user.setPhone(request.phone());
        
        userRepository.save(user);
        
        return UserSummaryResponse.from(user);
    }

    @PostMapping("/{id}/license-verification")
    @Transactional
    public UserSummaryResponse submitLicenseVerification(
        @PathVariable Long id,
        @RequestParam("licenseNumber") String licenseNumber,
        @RequestParam("frontDocument") MultipartFile frontDocument,
        @RequestParam(value = "backDocument", required = false) MultipartFile backDocument,
        HttpSession session
    ) {
        sessionAuthService.requireSelf(session, id);
        AppUser user = userRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        return drivingLicenseVerificationService.submit(user, licenseNumber, frontDocument, backDocument);
    }
}
