package vn.tdtu.shop.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import vn.tdtu.shop.domain.PasswordResetToken;
import vn.tdtu.shop.domain.User;
import vn.tdtu.shop.repository.PasswordResetTokenRepository;
import vn.tdtu.shop.repository.UserRepository;
import vn.tdtu.shop.util.error.InputInvalidException;

import java.time.Instant;
import java.util.Optional;

@Service
public class ForgotPasswordService {

    private final EmailService emailService;
    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;

    public ForgotPasswordService(
            EmailService emailService,
            UserRepository userRepository,
            PasswordResetTokenRepository tokenRepository,
            PasswordEncoder passwordEncoder) {
        this.emailService = emailService;
        this.userRepository = userRepository;
        this.tokenRepository = tokenRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public void requestPasswordReset(String email) throws InputInvalidException {
        Optional<User> userOptional = userRepository.findByEmail(email);
        if (userOptional.isEmpty()) {
            throw new InputInvalidException("Email không tồn tại");
        }

        User user = userOptional.get();
        String resetCode = emailService.generateResetCode();

        PasswordResetToken token = new PasswordResetToken();
        token.setToken(resetCode);
        token.setUser(user);
        tokenRepository.save(token);

        emailService.sendForgotPasswordEmail(email, user.getName(), resetCode);
    }

    public void resetPassword(String email, String code, String newPassword) throws InputInvalidException {
        Optional<PasswordResetToken> tokenOptional = tokenRepository.findByTokenAndUserEmail(code, email);
        if (tokenOptional.isEmpty()) {
            throw new InputInvalidException("Mã xác nhận không hợp lệ");
        }

        PasswordResetToken token = tokenOptional.get();
        if (Instant.now().isAfter(token.getExpirationTime())) {
            throw new InputInvalidException("Mã xác nhận đã hết hạn");
        }

        Optional<User> userOptional = userRepository.findByEmail(email);
        if (userOptional.isEmpty()) {
            throw new InputInvalidException("Email không tồn tại");
        }

        User user = userOptional.get();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        tokenRepository.delete(token);
    }
}