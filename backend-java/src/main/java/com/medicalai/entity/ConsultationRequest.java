package com.medicalai.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@Entity
@Table(name = "consultation_requests")
public class ConsultationRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "patient_username", nullable = false)
    private String patientUsername;

    @Column(name = "doctor_username", nullable = false)
    private String doctorUsername;

    // Link strictly to the specific AI diagnostics log
    @Column(name = "diagnosis_log_id", nullable = false)
    private UUID diagnosisLogId;

    @Column(length = 20)
    private String status = "PENDING"; // PENDING, REVIEWED

    @Column(name = "doctor_reply", columnDefinition = "TEXT")
    private String doctorReply;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
