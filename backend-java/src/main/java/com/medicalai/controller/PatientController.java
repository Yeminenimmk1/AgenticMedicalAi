package com.medicalai.controller;

import com.medicalai.dto.PatientProfileUpdateDTO;
import com.medicalai.entity.DiagnosisLog;
import com.medicalai.entity.Patient;
import com.medicalai.repository.DiagnosisLogRepository;
import com.medicalai.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/patients")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class PatientController {

    private final PatientRepository patientRepository;
    private final DiagnosisLogRepository diagnosisLogRepository;

    @GetMapping("/me")
    public ResponseEntity<Patient> getMyProfile(@RequestParam String username) {
        return patientRepository.findByUsername(username)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/doctors")
    public ResponseEntity<List<Patient>> getAllDoctors() {
        return ResponseEntity.ok(patientRepository.findByRole("DOCTOR"));
    }

    @GetMapping("/history")
    public ResponseEntity<List<DiagnosisLog>> getPatientHistory(@RequestParam String username) {
        return patientRepository.findByUsername(username)
                .map(patient -> ResponseEntity.ok(diagnosisLogRepository.findByPatientIdOrderByCreatedAtDesc(patient.getId())))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/nearby-doctors")
    public ResponseEntity<List<Patient>> getNearbyDoctors(@RequestParam String area) {
        return ResponseEntity.ok(patientRepository.findDoctorsByArea("DOCTOR", area));
    }

    @PostMapping
    public ResponseEntity<Patient> createPatient(@RequestBody Patient patient) {
        Patient saved = patientRepository.save(patient);
        return ResponseEntity.ok(saved);
    }

    /**
     * Profile Update — partial update (only non-null DTO fields are applied).
     * Called by profile.html when the patient saves their profile.
     */
    @PutMapping("/update")
    public ResponseEntity<Patient> updateProfile(@RequestBody PatientProfileUpdateDTO dto) {
        return patientRepository.findByUsername(dto.getUsername())
                .map(patient -> {
                    if (dto.getFullName()             != null) patient.setFullName(dto.getFullName());
                    if (dto.getAge()                  != null) patient.setAge(dto.getAge());
                    if (dto.getGender()               != null) patient.setGender(dto.getGender());
                    if (dto.getBloodGroup()           != null) patient.setBloodGroup(dto.getBloodGroup());
                    if (dto.getPhoneNumber()          != null) patient.setPhoneNumber(dto.getPhoneNumber());
                    if (dto.getVillageZip()           != null) patient.setVillageZip(dto.getVillageZip());
                    if (dto.getVillageOrArea()        != null) patient.setVillageOrArea(dto.getVillageOrArea());
                    if (dto.getBaselineGlucose()      != null) patient.setBaselineGlucose(dto.getBaselineGlucose());
                    if (dto.getBaselineBloodPressure()!= null) patient.setBaselineBloodPressure(dto.getBaselineBloodPressure());
                    if (dto.getBaselineBmi()          != null) patient.setBaselineBmi(dto.getBaselineBmi());
                    return ResponseEntity.ok(patientRepository.save(patient));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
