package com.cems.api;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDate;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(properties = {
        "spring.datasource.url=jdbc:h2:mem:cemstest;DB_CLOSE_DELAY=-1",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "cems.seed.enabled=true",
        "cems.seed.demo-password=cems@123"
})
class CemsApiFlowTest {

    private static final String STUDENT = "alex.rivera@college.edu";
    private static final String ORGANIZER = "s.connor@college.edu";
    private static final String ADMIN = "m.vance@college.edu";

    @Autowired
    MockMvc mvc;
    @Autowired
    ObjectMapper json;

    // ---------- helpers ----------
    private String login(String email) throws Exception {
        String body = "{\"email\":\"" + email + "\",\"password\":\"cems@123\"}";
        MvcResult res = mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isOk()).andReturn();
        return json.readTree(res.getResponse().getContentAsString()).get("token").asText();
    }

    private MvcResult send(MockHttpServletRequestBuilder req, String token, int expectedStatus) throws Exception {
        if (token != null) {
            req.header("Authorization", "Bearer " + token);
        }
        return mvc.perform(req).andExpect(status().is(expectedStatus)).andReturn();
    }

    private JsonNode body(MvcResult r) throws Exception {
        return json.readTree(r.getResponse().getContentAsString());
    }

    private String eventJson(String title, String venueId, LocalDate date, String time, int capacity) {
        return "{\"title\":\"" + title + "\",\"description\":\"Test event\",\"department\":\"Computer Science\","
                + "\"category\":\"Technical\",\"venueId\":\"" + venueId + "\",\"date\":\"" + date + "\","
                + "\"time\":\"" + time + "\",\"capacity\":" + capacity + "}";
    }

    private String proposeAndApprove(String title, String venueId, LocalDate date, String time, int capacity,
                                     String orgToken, String adminToken) throws Exception {
        MvcResult created = send(post("/api/events").contentType(MediaType.APPLICATION_JSON)
                .content(eventJson(title, venueId, date, time, capacity)), orgToken, 201);
        String id = body(created).get("id").asText();
        assertEquals("PENDING", body(created).get("status").asText());
        send(post("/api/events/" + id + "/approve"), adminToken, 200);
        return id;
    }

    // ---------- security ----------
    @Test
    void anonymousAndWrongRoleRequestsAreBlocked() throws Exception {
        send(get("/api/events"), null, 401);
        send(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"" + STUDENT + "\",\"password\":\"wrong\"}"), null, 401);

        String student = login(STUDENT);
        send(post("/api/events/evt-104/approve"), student, 403);
        send(get("/api/audit-logs"), student, 403);
        send(post("/api/checkin").contentType(MediaType.APPLICATION_JSON).content("{\"token\":\"x\"}"), student, 403);
    }

    // ---------- scheduling ----------
    @Test
    void venueClashCapacityAndApprovalRules() throws Exception {
        String admin = login(ADMIN);
        String org = login(ORGANIZER);

        JsonNode events = body(send(get("/api/events"), admin, 200));
        LocalDate hackDate = null;
        for (JsonNode e : events) {
            if (e.get("id").asText().equals("evt-101")) {
                hackDate = LocalDate.parse(e.get("date").asText());
            }
        }
        assertTrue(hackDate != null, "seeded evt-101 should exist");

        // overlaps 09:00 AM - 05:00 PM at the Tech Lab -> 409
        send(post("/api/events").contentType(MediaType.APPLICATION_JSON)
                .content(eventJson("Clash", "v-2", hackDate, "10:00 AM - 12:00 PM", 20)), org, 409);

        // live preview endpoint agrees
        MvcResult preview = send(get("/api/events/conflicts")
                .param("venueId", "v-2")
                .param("date", hackDate.toString())
                .param("time", "10:00 AM - 12:00 PM"), org, 200);
        assertTrue(body(preview).get("conflict").asBoolean());

        // exceeds the 50-seat venue -> 400
        send(post("/api/events").contentType(MediaType.APPLICATION_JSON)
                .content(eventJson("Too big", "v-2", hackDate, "06:00 PM - 08:00 PM", 60)), org, 400);

        // evening slot is free -> created PENDING, then approved by admin; second decision -> 409
        String id = proposeAndApprove("Evening Talk", "v-2", hackDate, "06:00 PM - 08:00 PM", 20, org, admin);
        send(post("/api/events/" + id + "/reject"), admin, 409);
    }

    // ---------- registration, QR, waitlist ----------
    @Test
    void registrationQrCheckInWaitlistAndPromotion() throws Exception {
        String admin = login(ADMIN);
        String org = login(ORGANIZER);
        String alex = login(STUDENT);

        // second student via self-service sign-up
        String email = "student-" + UUID.randomUUID() + "@college.edu";
        MvcResult signup = send(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\":\"Sam Student\",\"email\":\"" + email
                        + "\",\"password\":\"password123\",\"department\":\"Computer Science\"}"), null, 201);
        String sam = body(signup).get("token").asText();
        assertEquals("student", body(signup).get("user").get("role").asText());

        // one-seat event -> Alex confirmed, Sam waitlisted
        String id = proposeAndApprove("One Seat Workshop", "v-3", LocalDate.now().plusDays(60),
                "10:00 AM - 12:00 PM", 1, org, admin);

        MvcResult alexReg = send(post("/api/events/" + id + "/register"), alex, 201);
        assertEquals("CONFIRMED", body(alexReg).get("registration").get("status").asText());
        String alexRegId = body(alexReg).get("registration").get("id").asText();
        String alexToken = body(alexReg).get("registration").get("qrToken").asText();

        send(post("/api/events/" + id + "/register"), alex, 409); // duplicate

        MvcResult samReg = send(post("/api/events/" + id + "/register"), sam, 201);
        assertEquals("WAITLIST", body(samReg).get("registration").get("status").asText());
        String samToken = body(samReg).get("registration").get("qrToken").asText();

        // waitlisted ticket cannot enter
        MvcResult denied = send(post("/api/checkin").contentType(MediaType.APPLICATION_JSON)
                .content("{\"token\":\"" + samToken + "\"}"), org, 200);
        assertFalse(body(denied).get("success").asBoolean());

        // Alex cancels -> Sam promoted
        send(delete("/api/registrations/" + alexRegId), alex, 204);
        JsonNode samRegs = body(send(get("/api/registrations"), sam, 200));
        assertEquals("CONFIRMED", samRegs.get(0).get("status").asText());

        // Sam's QR works exactly once; an unknown code is rejected
        MvcResult first = send(post("/api/checkin").contentType(MediaType.APPLICATION_JSON)
                .content("{\"token\":\"" + samToken + "\"}"), org, 200);
        assertTrue(body(first).get("success").asBoolean());
        MvcResult second = send(post("/api/checkin").contentType(MediaType.APPLICATION_JSON)
                .content("{\"token\":\"" + samToken + "\"}"), org, 200);
        assertFalse(body(second).get("success").asBoolean());
        assertTrue(body(second).get("message").asText().startsWith("ALREADY CHECKED IN"));

        MvcResult bogus = send(post("/api/checkin").contentType(MediaType.APPLICATION_JSON)
                .content("{\"token\":\"CEMS-QR-FAKE\"}"), org, 200);
        assertFalse(body(bogus).get("success").asBoolean());
        assertFalse(alexToken.isBlank());

        // analytics visible to everyone, audit log admin-only
        send(get("/api/analytics"), alex, 200);
        send(get("/api/audit-logs"), admin, 200);
    }
}
