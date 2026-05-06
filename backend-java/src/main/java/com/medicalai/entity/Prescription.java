package com.medicalai.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@Entity
@Table(name = "prescriptions")
public class Prescription {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id")
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Patient patient;

    // e.g. "Viral Cold" or "Strep Throat"
    @Column(length = 150)
    private String diagnosis;

    @Column(name = "antibiotic_name", length = 100)
    private String antibioticName;

    // e.g. "500" for 500mg
    private Integer dosageMg;
    
    // Duration in days
    @Column(name = "duration_days")
    private Integer durationDays;

    @Column(name = "prescribed_by", length = 100)
    private String prescribedBy;

    // Updated by the Python Misuse Monitor ML model
    @Column(name = "misuse_flagged")
    private Boolean misuseFlagged;

    @Column(name = "misuse_reason", length = 255)
    private String misuseReason;

    // RECOVERED / ONGOING / WORSENED
    @Column(name = "recovery_status", length = 20)
    private String recoveryStatus;

    @CreationTimestamp
    @Column(name = "prescribed_at", updatable = false)
    private LocalDateTime prescribedAt;
}
