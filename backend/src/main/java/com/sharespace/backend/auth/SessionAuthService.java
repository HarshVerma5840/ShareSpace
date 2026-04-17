package com.sharespace.backend.auth;

import com.sharespace.backend.common.ApiException;
import com.sharespace.backend.user.AppUser;
import com.sharespace.backend.user.UserRepository;
import com.sharespace.backend.user.UserRole;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
public class SessionAuthService {

    public static final String AUTHENTICATED_USER_ID = "authenticatedUserId";

    private final UserRepository userRepository;

    public SessionAuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public void markAuthenticated(HttpSession session, Long userId) {
        session.setAttribute(AUTHENTICATED_USER_ID, userId);
    }

    public Long requireAuthenticatedUserId(HttpSession session) {
        Object value = session.getAttribute(AUTHENTICATED_USER_ID);
        if (!(value instanceof Long userId)) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Please log in to continue.");
        }
        return userId;
    }

    public void requireSelf(HttpSession session, Long requestedUserId) {
        Long authenticatedUserId = requireAuthenticatedUserId(session);
        if (!authenticatedUserId.equals(requestedUserId)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You can only access your own account.");
        }
    }

    public AppUser requireAdmin(HttpSession session) {
        Long authenticatedUserId = requireAuthenticatedUserId(session);
        AppUser user = userRepository.findById(authenticatedUserId)
            .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Please log in to continue."));
        if (user.getRole() != UserRole.ADMIN) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Admin access is required.");
        }
        return user;
    }
}
