package com.sharespace.backend.auth;

import com.sharespace.backend.common.ApiException;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
public class SessionAuthService {

    public static final String AUTHENTICATED_USER_ID = "authenticatedUserId";

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
}
