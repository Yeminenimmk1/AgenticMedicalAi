package com.medicalai.controller;

import com.medicalai.entity.ConsultationRequest;
import com.medicalai.repository.ConsultationRequestRepository;
import com.medicalai.repository.PatientRepository;
import com.medicalai.service.EmailNotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/v1/consultations")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class ConsultationController {

    private final ConsultationRequestRepository consultationRepository;
    private final PatientRepository patientRepository;

    @org.springframework.beans.factory.annotation.Autowired(required = false)
    private EmailNotificationService emailService;

    @PostMapping("/send")
    public ResponseEntity<?> sendConsultation(@RequestBody ConsultationRequest request) {
        log.info("Sending consultation from {} to {}", request.getPatientUsername(), request.getDoctorUsername());
        ConsultationRequest saved = consultationRepository.save(request);
        return ResponseEntity.ok(Map.of("message", "Consultation sent", "id", saved.getId()));
    }

    @GetMapping("/incoming")
    public ResponseEntity<List<ConsultationRequest>> getIncoming(@RequestParam String doctor) {
        return ResponseEntity.ok(consultationRepository.findByDoctorUsernameOrderByCreatedAtDesc(doctor));
    }

    @GetMapping("/patient")
    public ResponseEntity<List<ConsultationRequest>> getPatientConsults(@RequestParam String username) {
        return ResponseEntity.ok(consultationRepository.findByPatientUsernameOrderByCreatedAtDesc(username));
    }

    @PostMapping("/reply")
    public ResponseEntity<?> replyToConsultation(@RequestParam UUID id, @RequestParam String reply) {
        Optional<ConsultationRequest> opt = consultationRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        ConsultationRequest req = opt.get();
        req.setStatus("REVIEWED");
        req.setDoctorReply(reply);
        consultationRepository.save(req);

        // Trigger async email to the patient (if email service is configured)
        if (emailService != null) {
            patientRepository.findByUsername(req.getPatientUsername()).ifPresent(patient -> {
                String doctorFullName = patientRepository.findByUsername(req.getDoctorUsername())
                        .map(d -> d.getFullName() != null ? d.getFullName() : d.getUsername())
                        .orElse(req.getDoctorUsername());
                emailService.sendDoctorReplyNotification(
                        patient.getEmail(),
                        patient.getFullName() != null ? patient.getFullName() : patient.getUsername(),
                        doctorFullName
                );
            });
        }

        return ResponseEntity.ok(Map.of("message", "Reply sent successfully"));
    }
}
