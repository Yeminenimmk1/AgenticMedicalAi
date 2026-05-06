package com.medicalai.controller;

import com.medicalai.dto.DiagnosisResponseDTO;
import com.medicalai.dto.SymptomRequestDTO;
import com.medicalai.service.DiagnosisOrchestrationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/v1/triage")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class TriageController {

    private final DiagnosisOrchestrationService diagnosisOrchestrationService;

    @PostMapping
    public ResponseEntity<DiagnosisResponseDTO> submitSymptoms(@RequestBody SymptomRequestDTO request) {
        log.info("Received Triage Request for Patient Username: {}", request.getUsername());
        
        try {
            DiagnosisResponseDTO response = diagnosisOrchestrationService.triagePatient(request);
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException ex) {
            log.error("Invalid Request: {}", ex.getMessage());
            return ResponseEntity.badRequest().build();
            
        } catch (Exception ex) {
            log.error("Triage Failed due to unexpected error.", ex);
            return ResponseEntity.internalServerError().build();
        }
    }
}
