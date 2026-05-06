package com.medicalai.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;

import com.medicalai.entity.DiagnosisLog;
import com.medicalai.entity.Prescription;
import com.medicalai.repository.DiagnosisLogRepository;
import com.medicalai.repository.PrescriptionRepository;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Slf4j
@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class DashboardController {

    private final WebClient webClient;
    private final DiagnosisLogRepository diagnosisLogRepository;
    private final PrescriptionRepository prescriptionRepository;

    @GetMapping("/logs")
    public ResponseEntity<List<DiagnosisLog>> getRecentLogs() {
        return ResponseEntity.ok(diagnosisLogRepository.findTop20ByOrderByCreatedAtDesc());
    }

    @GetMapping("/prescriptions/flagged")
    public ResponseEntity<List<Prescription>> getFlaggedPrescriptions() {
        return ResponseEntity.ok(prescriptionRepository.findByMisuseFlaggedTrueOrderByPrescribedAtDesc());
    }

    @GetMapping("/outbreak")
    public ResponseEntity<Map<String, Object>> getOutbreak(
            @RequestParam(required = false) String zipCode,
            @RequestParam(required = false, defaultValue = "fever") String disease,
            @RequestParam(required = false, defaultValue = "week") String timeframe) {
            
        log.info("Fetching Outbreak forecast for {}, timeframe {}, Zip: {}", disease, timeframe, zipCode);
        
        try {
            // Task 3: Secure Dynamic Python Call
            String pythonUrl = String.format("http://localhost:8000/api/outbreak/forecast?disease=%s&timeframe=%s", disease, timeframe);
            if (zipCode != null && !zipCode.isEmpty()) {
                pythonUrl += "&zip_code=" + zipCode;
            }
            
            Map<String, Object> forecastData = webClient.get()
                    .uri(pythonUrl)
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                    .block();
                    
            return ResponseEntity.ok(forecastData);
            
        } catch (Exception ex) {
            log.error("Failed to fetch outbreak data from ML service", ex);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/logs/{id}/status")
    public ResponseEntity<?> updateLogStatus(@PathVariable java.util.UUID id, @RequestParam String status) {
        log.info("Updating diagnosis log {} with status: {}", id, status);
        
        Optional<DiagnosisLog> opt = diagnosisLogRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        DiagnosisLog diagnosisLog = opt.get();
        diagnosisLog.setDoctorAction(status);
        diagnosisLogRepository.save(diagnosisLog);
        
        return ResponseEntity.ok(Map.of("message", "Status updated successfully"));
    }
}
