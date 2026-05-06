package com.medicalai.controller;

import com.medicalai.entity.Patient;
import com.medicalai.repository.PatientRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;
import java.util.Map;
import java.util.Optional;

@Slf4j
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuthController {

    private final PatientRepository patientRepository;

    @Data
    public static class AuthRequest {
        private String username;
        private String password;
        private String fullName;
        private Integer age;
        private String gender;
        private String bloodGroup;
        private String role;
        private String villageOrArea;
        private String email;
        private String doctorId;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody AuthRequest request) {
        log.info("Attempting registration for username: {}", request.getUsername());

        // --- Duplicate username check ---
        if (patientRepository.findByUsername(request.getUsername()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", "Username '" + request.getUsername() + "' is already taken. Please choose another."));
        }

        // --- Duplicate email check ---
        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            if (patientRepository.findByEmail(request.getEmail()).isPresent()) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Map.of("message", "An account with this email already exists. Please login instead."));
            }
        }

        Patient newPatient = new Patient();
        newPatient.setUsername(request.getUsername());
        newPatient.setPassword(hashPassword(request.getPassword()));
        newPatient.setFullName(request.getFullName() != null ? request.getFullName() : request.getUsername());
        newPatient.setAge(request.getAge());
        newPatient.setGender(request.getGender());
        newPatient.setBloodGroup(request.getBloodGroup());
        newPatient.setEmail(request.getEmail());

        // RBAC — default to PATIENT if not specified
        newPatient.setRole(request.getRole() != null ? request.getRole() : "PATIENT");
        newPatient.setVillageOrArea(request.getVillageOrArea());

        patientRepository.save(newPatient);
        log.info("Registered new user: {} with role: {}", newPatient.getUsername(), newPatient.getRole());

        return ResponseEntity.ok(Map.of(
                "message", "Registration successful",
                "username", newPatient.getUsername(),
                "role", newPatient.getRole(),
                "villageOrArea", newPatient.getVillageOrArea() != null ? newPatient.getVillageOrArea() : ""
        ));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {
        log.info("Attempting login for username: {}", request.getUsername());

        Optional<Patient> opt = patientRepository.findByUsername(request.getUsername());
        
        // If not found by username, try searching by email
        if (opt.isEmpty()) {
            opt = patientRepository.findByEmail(request.getUsername());
        }

        if (opt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "No account found with this username or email. Please register first."));
        }

        Patient patient = opt.get();
        String hashedInput = hashPassword(request.getPassword());

        if (patient.getPassword() == null || !patient.getPassword().equals(hashedInput)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Incorrect password. Please try again."));
        }

        return ResponseEntity.ok(Map.of(
                "message", "Login successful",
                "username", patient.getUsername(),
                "fullName", patient.getFullName() != null ? patient.getFullName() : "",
                "role", patient.getRole() != null ? patient.getRole() : "PATIENT",
                "villageOrArea", patient.getVillageOrArea() != null ? patient.getVillageOrArea() : "",
                "email", patient.getEmail() != null ? patient.getEmail() : ""
        ));
    }

    @PostMapping("/doctor-login")
    public ResponseEntity<?> doctorLogin(@RequestBody AuthRequest request) {
        log.info("Attempting doctor login for doctorId: {}", request.getDoctorId());

        if (request.getDoctorId() == null || request.getEmail() == null || request.getPassword() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Doctor ID, Email, and Password are required."));
        }

        Optional<Patient> opt = patientRepository.findByUsername(request.getDoctorId());

        if (opt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid Doctor credentials."));
        }

        Patient patient = opt.get();

        if (!"DOCTOR".equalsIgnoreCase(patient.getRole())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Access denied. This portal is for registered doctors only."));
        }

        if (patient.getEmail() != null && !request.getEmail().equalsIgnoreCase(patient.getEmail())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid Doctor credentials."));
        }

        String hashedInput = hashPassword(request.getPassword());

        if (patient.getPassword() == null || !patient.getPassword().equals(hashedInput)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid Doctor credentials."));
        }

        return ResponseEntity.ok(Map.of(
                "message", "Login successful",
                "username", patient.getUsername(),
                "fullName", patient.getFullName() != null ? patient.getFullName() : "",
                "role", patient.getRole() != null ? patient.getRole() : "DOCTOR",
                "villageOrArea", patient.getVillageOrArea() != null ? patient.getVillageOrArea() : "",
                "email", patient.getEmail() != null ? patient.getEmail() : ""
        ));
    }

    private String hashPassword(String password) {
        if (password == null) return null;
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] encodedHash = digest.digest(password.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(encodedHash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not available", e);
        }
    }
}
