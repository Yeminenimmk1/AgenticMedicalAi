package com.medicalai.repository;

import com.medicalai.entity.ConsultationRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ConsultationRequestRepository extends JpaRepository<ConsultationRequest, UUID> {
    List<ConsultationRequest> findByDoctorUsernameOrderByCreatedAtDesc(String doctorUsername);
    List<ConsultationRequest> findByPatientUsernameOrderByCreatedAtDesc(String patientUsername);
}
