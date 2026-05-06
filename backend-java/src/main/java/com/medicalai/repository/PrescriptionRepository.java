package com.medicalai.repository;

import com.medicalai.entity.Prescription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PrescriptionRepository extends JpaRepository<Prescription, UUID> {

    // Useful query for Doctor Dashboard to find flagged prescriptions
    List<Prescription> findByMisuseFlaggedTrueOrderByPrescribedAtDesc();

    // Past prescriptions to feed into ML model
    List<Prescription> findByPatientIdOrderByPrescribedAtDesc(UUID patientId);
}
