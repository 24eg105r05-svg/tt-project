package com.cems.service;

import com.cems.dto.AuthResponse;
import com.cems.dto.LoginRequest;
import com.cems.dto.RegisterRequest;
import com.cems.dto.UserDto;
import com.cems.exception.ApiException;
import com.cems.model.AppUser;
import com.cems.model.Role;
import com.cems.repository.UserRepository;
import com.cems.security.JwtService;
import com.cems.util.Ids;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository users;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final DtoMapper mapper;
    private final AuditService audit;

    public AuthService(UserRepository users, PasswordEncoder passwordEncoder, JwtService jwtService,
                       DtoMapper mapper, AuditService audit) {
        this.users = users;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.mapper = mapper;
        this.audit = audit;
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        AppUser user = users.findByEmailIgnoreCase(request.email().trim())
                .filter(u -> passwordEncoder.matches(request.password(), u.getPasswordHash()))
                .orElseThrow(() -> ApiException.unauthorized("Invalid email or password."));
        return new AuthResponse(jwtService.generate(user), mapper.user(user));
    }

    /** Self-service sign-up always creates a STUDENT. Organizers/admins are provisioned by an admin. */
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = request.email().trim().toLowerCase();
        if (users.existsByEmailIgnoreCase(email)) {
            throw ApiException.conflict("An account with this email already exists.");
        }
        AppUser user = new AppUser();
        user.setId(Ids.next("usr"));
        user.setName(request.name().trim());
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setRole(Role.STUDENT);
        user.setDepartment(request.department() == null || request.department().isBlank()
                ? "General" : request.department().trim());
        AppUser saved = users.save(user);
        audit.log(saved.getName(), "REGISTERED_ACCOUNT", saved.getEmail());
        return new AuthResponse(jwtService.generate(saved), mapper.user(saved));
    }

    public UserDto me(AppUser principal) {
        return mapper.user(principal);
    }
}
