package vn.tdtu.shop.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.MockedStatic;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import vn.tdtu.shop.config.TestSecurityConfiguration;
import vn.tdtu.shop.domain.User;
import vn.tdtu.shop.service.ForgotPasswordService;
import vn.tdtu.shop.service.UserService;
import vn.tdtu.shop.util.SecurityUtil;
import vn.tdtu.shop.util.constant.GenderEnum;
import vn.tdtu.shop.util.constant.RoleEnum;
import vn.tdtu.shop.util.error.InputInvalidException;
import vn.tdtu.shop.util.request.ChangePasswordRequest;
import vn.tdtu.shop.util.request.EmailRequest;
import vn.tdtu.shop.util.request.LoginDTO;
import vn.tdtu.shop.util.request.RegisterDTO;
import vn.tdtu.shop.util.request.ResetPasswordRequest;
import vn.tdtu.shop.util.response.ResCreateUserDTO;
import vn.tdtu.shop.util.response.ResLoginDTO;

import java.time.Instant;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthController.class)
@Import(TestSecurityConfiguration.class)
class AuthControllerTest {

        @Autowired
        private MockMvc mockMvc;

        @MockitoBean
        private AuthenticationManagerBuilder authenticationManagerBuilder;

        @MockitoBean
        private SecurityUtil securityUtil;

        @MockitoBean
        private UserService userService;

        @MockitoBean
        private PasswordEncoder passwordEncoder;

        @MockitoBean
        private ForgotPasswordService forgotPasswordService;

        @Autowired
        private ObjectMapper objectMapper;

        private User user;
        private LoginDTO loginDTO;
        private RegisterDTO registerDTO;
        private ResLoginDTO resLoginDTO;
        private ResCreateUserDTO resCreateUserDTO;

        @BeforeEach
        void setUp() {
                // Initialize sample User
                user = new User();
                user.setId(1L);
                user.setEmail("test@example.com");
                user.setName("Test User");
                user.setPassword("encodedPassword");
                user.setRole(RoleEnum.USER);
                user.setGender(GenderEnum.MALE);
                user.setPhone("0123456789");
                user.setAvatar("avatar-default.webp");
                user.setAddress("123 Test St");
                user.setCreatedAt(Instant.now());

                // Initialize LoginDTO
                loginDTO = new LoginDTO();
                loginDTO.setUsername("test@example.com");
                loginDTO.setPassword("password123");

                // Initialize RegisterDTO
                registerDTO = new RegisterDTO();
                registerDTO.setName("Test User");
                registerDTO.setEmail("test@example.com");
                registerDTO.setPassword("password123");
                registerDTO.setPhone("0123456789");
                registerDTO.setGender(GenderEnum.MALE);

                // Initialize ResLoginDTO
                resLoginDTO = new ResLoginDTO();
                resLoginDTO.setAccessToken("mocked-jwt-token");
                ResLoginDTO.UserLogin userLogin = new ResLoginDTO.UserLogin(
                                user.getId(),
                                user.getEmail(),
                                user.getName(),
                                user.getRole(),
                                user.getAvatar(),
                                user.getGender(),
                                user.getPhone(),
                                user.getAddress());
                resLoginDTO.setUser(userLogin);

                // Initialize ResCreateUserDTO
                resCreateUserDTO = new ResCreateUserDTO();
                resCreateUserDTO.setId(user.getId());
                resCreateUserDTO.setName(user.getName());
                resCreateUserDTO.setEmail(user.getEmail());
                resCreateUserDTO.setRole(user.getRole());
                resCreateUserDTO.setGender(user.getGender());
                resCreateUserDTO.setPhone(user.getPhone());
                resCreateUserDTO.setCreatedAt(user.getCreatedAt());
                resCreateUserDTO.setCreatedBy(user.getEmail());
        }

        @Test
        void login_ShouldReturnTokenAndUser_WhenCredentialsAreValid() throws Exception {
                Authentication authentication = new UsernamePasswordAuthenticationToken(
                                loginDTO.getUsername(), loginDTO.getPassword());
                when(authenticationManagerBuilder.getObject()).thenReturn(mock(AuthenticationManager.class));
                when(authenticationManagerBuilder.getObject().authenticate(any())).thenReturn(authentication);
                when(securityUtil.createToken(authentication)).thenReturn("mocked-jwt-token");
                when(userService.handleGetUserByUserName(loginDTO.getUsername())).thenReturn(user);

                mockMvc.perform(post("/api/auth/login")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(loginDTO))
                                .with(csrf()))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.data.accessToken").value("mocked-jwt-token"))
                                .andExpect(jsonPath("$.data.user.id").value(user.getId()))
                                .andExpect(jsonPath("$.data.user.email").value(user.getEmail()))
                                .andExpect(jsonPath("$.data.user.name").value(user.getName()));
        }

        @Test
        void login_ShouldReturnBadRequest_WhenCredentialsAreInvalid() throws Exception {
                when(authenticationManagerBuilder.getObject()).thenReturn(mock(AuthenticationManager.class));
                when(authenticationManagerBuilder.getObject().authenticate(any()))
                                .thenThrow(new BadCredentialsException("Invalid credentials"));

                mockMvc.perform(post("/api/auth/login")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(loginDTO))
                                .with(csrf()))
                                .andExpect(status().isUnauthorized());
        }

        @Test
        void getAccount_ShouldReturnUserDetails_WhenAuthenticated() throws Exception {
                try (MockedStatic<SecurityUtil> mockedSecurityUtil = Mockito.mockStatic(SecurityUtil.class)) {
                        mockedSecurityUtil.when(SecurityUtil::getCurrentUserLogin)
                                        .thenReturn(Optional.of(user.getEmail()));
                        when(userService.handleGetUserByUserName(user.getEmail())).thenReturn(user);

                        mockMvc.perform(get("/api/auth/account")
                                        .with(jwt().jwt(jwt -> jwt.subject(user.getEmail()))))
                                        .andExpect(status().isOk())
                                        .andExpect(jsonPath("$.data.id").value(user.getId()))
                                        .andExpect(jsonPath("$.data.email").value(user.getEmail()))
                                        .andExpect(jsonPath("$.data.name").value(user.getName()))
                                        .andExpect(jsonPath("$.data.role").value(user.getRole().toString()));
                }
        }

        @Test
        void getAccount_ShouldReturnEmptyUser_WhenNotAuthenticated() throws Exception {
                try (MockedStatic<SecurityUtil> mockedSecurityUtil = Mockito.mockStatic(SecurityUtil.class)) {
                        mockedSecurityUtil.when(SecurityUtil::getCurrentUserLogin).thenReturn(Optional.empty());
                        when(userService.handleGetUserByUserName("")).thenReturn(null);

                        mockMvc.perform(get("/api/auth/account")
                                        .with(jwt()))
                                        .andExpect(status().isOk())
                                        .andExpect(jsonPath("$.data.id").value(0));
                }
        }

        @Test
        void register_ShouldCreateUser_WhenEmailIsUnique() throws Exception {
                when(userService.isEmailExist(registerDTO.getEmail())).thenReturn(false);
                when(passwordEncoder.encode(registerDTO.getPassword())).thenReturn("encodedPassword");
                when(userService.handleCreateUser(any(User.class))).thenReturn(user);

                mockMvc.perform(post("/api/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(registerDTO))
                                .with(csrf()))
                                .andExpect(status().isCreated())
                                .andExpect(jsonPath("$.data.id").value(user.getId()))
                                .andExpect(jsonPath("$.data.email").value(user.getEmail()))
                                .andExpect(jsonPath("$.data.name").value(user.getName()))
                                .andExpect(jsonPath("$.data.role").value(user.getRole().toString()));
        }

        @Test
        void register_ShouldReturnBadRequest_WhenEmailExists() throws Exception {
                when(userService.isEmailExist(registerDTO.getEmail())).thenReturn(true);

                mockMvc.perform(post("/api/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(registerDTO))
                                .with(csrf()))
                                .andExpect(status().isBadRequest())
                                .andExpect(jsonPath("$.message")
                                                .value("Email " + registerDTO.getEmail()
                                                                + " đã tồn tại, vui lòng sử dụng email khác."));
        }

        @Test
        void requestPasswordReset_ShouldReturnOk_WhenEmailIsValid() throws Exception {
                EmailRequest emailRequest = new EmailRequest();
                emailRequest.setEmail("test@example.com");

                doNothing().when(forgotPasswordService).requestPasswordReset(emailRequest.getEmail());

                mockMvc.perform(post("/api/auth/forgot-password")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(emailRequest))
                                .with(csrf()))
                                .andExpect(status().isOk());
        }

        @Test
        void requestPasswordReset_ShouldReturnBadRequest_WhenEmailIsInvalid() throws Exception {
                EmailRequest emailRequest = new EmailRequest();
                emailRequest.setEmail("invalid@example.com");

                doThrow(new InputInvalidException("Email not found")).when(forgotPasswordService)
                                .requestPasswordReset(emailRequest.getEmail());

                mockMvc.perform(post("/api/auth/forgot-password")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(emailRequest))
                                .with(csrf()))
                                .andExpect(status().isBadRequest());
        }

        @Test
        void resetPassword_ShouldReturnOk_WhenRequestIsValid() throws Exception {
                ResetPasswordRequest resetRequest = new ResetPasswordRequest();
                resetRequest.setEmail("test@example.com");
                resetRequest.setCode("123456");
                resetRequest.setNewPassword("newPassword123");

                doNothing().when(forgotPasswordService).resetPassword(
                                resetRequest.getEmail(), resetRequest.getCode(), resetRequest.getNewPassword());

                mockMvc.perform(post("/api/auth/reset-password")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(resetRequest))
                                .with(csrf()))
                                .andExpect(status().isOk());
        }

        @Test
        void resetPassword_ShouldReturnBadRequest_WhenCodeIsInvalid() throws Exception {
                ResetPasswordRequest resetRequest = new ResetPasswordRequest();
                resetRequest.setEmail("test@example.com");
                resetRequest.setCode("invalidCode");
                resetRequest.setNewPassword("newPassword123");

                doThrow(new InputInvalidException("Invalid reset code")).when(forgotPasswordService)
                                .resetPassword(resetRequest.getEmail(), resetRequest.getCode(),
                                                resetRequest.getNewPassword());

                mockMvc.perform(post("/api/auth/reset-password")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(resetRequest))
                                .with(csrf()))
                                .andExpect(status().isBadRequest());
        }

        @Test
        void changePassword_ShouldReturnOk_WhenRequestIsValid() throws Exception {
                ChangePasswordRequest changeRequest = new ChangePasswordRequest();
                changeRequest.setCurrentPassword("oldPassword123");
                changeRequest.setNewPassword("newPassword123");

                try (MockedStatic<SecurityUtil> mockedSecurityUtil = Mockito.mockStatic(SecurityUtil.class)) {
                        mockedSecurityUtil.when(SecurityUtil::getCurrentUserLogin)
                                        .thenReturn(Optional.of(user.getEmail()));
                        doNothing().when(userService).changePassword(
                                        user.getEmail(), changeRequest.getCurrentPassword(),
                                        changeRequest.getNewPassword());

                        mockMvc.perform(post("/api/auth/change-password")
                                        .contentType(MediaType.APPLICATION_JSON)
                                        .content(objectMapper.writeValueAsString(changeRequest))
                                        .with(jwt().jwt(jwt -> jwt.subject(user.getEmail())))
                                        .with(csrf()))
                                        .andExpect(status().isOk());
                }
        }

        @Test
        void changePassword_ShouldReturnBadRequest_WhenNotAuthenticated() throws Exception {
                ChangePasswordRequest changeRequest = new ChangePasswordRequest();
                changeRequest.setCurrentPassword("oldPassword123");
                changeRequest.setNewPassword("newPassword123");

                try (MockedStatic<SecurityUtil> mockedSecurityUtil = Mockito.mockStatic(SecurityUtil.class)) {
                        mockedSecurityUtil.when(SecurityUtil::getCurrentUserLogin).thenReturn(Optional.empty());

                        mockMvc.perform(post("/api/auth/change-password")
                                        .contentType(MediaType.APPLICATION_JSON)
                                        .content(objectMapper.writeValueAsString(changeRequest))
                                        .with(csrf()))
                                        .andExpect(status().isBadRequest());
                }
        }
}