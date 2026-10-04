package com.arkipelago;

import com.arkipelago.dto.AuthDto;
import com.arkipelago.dto.TimeTrackingDto;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class EstudioArkipelagoApplicationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void contextLoads() {
    }

    @Test
    void testPartnerLoginAndClockInWorkflow() throws Exception {
        // 1. Authenticate with seeded partner account
        AuthDto.LoginRequest loginReq = new AuthDto.LoginRequest("partner@arkipelago.ph", "admin");
        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists())
                .andExpect(jsonPath("$.user.email").value("partner@arkipelago.ph"))
                .andExpect(jsonPath("$.user.role").value("PARTNER"))
                .andReturn();

        AuthDto.AuthResponse authResponse = objectMapper.readValue(
                loginResult.getResponse().getContentAsString(),
                AuthDto.AuthResponse.class
        );
        String bearerToken = "Bearer " + authResponse.getToken();

        // 2. Fetch authenticated profile
        mockMvc.perform(get("/api/auth/me")
                        .header("Authorization", bearerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Arch. Principal Partner"));

        // 3. Clock-in to Manila Tower (MT-2024)
        TimeTrackingDto.ClockInRequest clockInReq = new TimeTrackingDto.ClockInRequest(
                "MT-2024",
                "Manila Tower Mixed-Use",
                "Reviewing schematic elevator core drawings",
                true
        );

        mockMvc.perform(post("/api/hr/clock-in")
                        .header("Authorization", bearerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(clockInReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.projectCode").value("MT-2024"))
                .andExpect(jsonPath("$.active").value(true));

        // 4. Verify active session endpoint
        mockMvc.perform(get("/api/hr/active-session")
                        .header("Authorization", bearerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.projectCode").value("MT-2024"))
                .andExpect(jsonPath("$.active").value(true));

        // 5. Clock-out
        TimeTrackingDto.ClockOutRequest clockOutReq = new TimeTrackingDto.ClockOutRequest("Completed core revision review");
        mockMvc.perform(post("/api/hr/clock-out")
                        .header("Authorization", bearerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(clockOutReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.active").value(false))
                .andExpect(jsonPath("$.durationSeconds").exists());
    }

    @Test
    void testProjectsListing() throws Exception {
        // Unauthenticated access to /api/projects should be 403 or require token
        AuthDto.LoginRequest loginReq = new AuthDto.LoginRequest("architect@arkipelago.ph", "architect");
        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isOk())
                .andReturn();

        AuthDto.AuthResponse authResponse = objectMapper.readValue(
                loginResult.getResponse().getContentAsString(),
                AuthDto.AuthResponse.class
        );

        mockMvc.perform(get("/api/projects")
                        .header("Authorization", "Bearer " + authResponse.getToken()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].code").exists())
                .andExpect(jsonPath("$[0].contractAmountPhp").exists());
    }
}
