package com.medicalai.repository;

import com.medicalai.entity.DiagnosisLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DiagnosisLogRepository extends JpaRepository<DiagnosisLog, UUID> {
    
    // Fetch recent diagnostic logs for the global dashboard
    List<DiagnosisLog> findTop20ByOrderByCreatedAtDesc();

    // Find all diagnoses for a given patient
    List<DiagnosisLog> findByPatientIdOrderByCreatedAtDesc(UUID patientId);
}
