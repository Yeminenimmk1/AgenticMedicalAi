package com.medicalai.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@Entity
@Table(name = "diagnosis_logs")
public class DiagnosisLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    // The patient this diagnosis belongs to
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id")
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Patient patient;

    // What the patient actually typed in
    @Column(name = "symptoms_input", columnDefinition = "TEXT")
    private String symptomsInput;

    // The individual agents' reasoning logs
    @Column(name = "fever_agent_output", columnDefinition = "TEXT")
    private String feverAgentOutput;

    @Column(name = "infection_agent_output", columnDefinition = "TEXT")
    private String infectionAgentOutput;

    @Column(name = "heart_agent_output", columnDefinition = "TEXT")
    private String heartAgentOutput;

    // The supervisor's finalized diagnosis
    @Column(name = "final_diagnosis", columnDefinition = "TEXT")
    private String finalDiagnosis;

    @Column(name = "confidence_score")
    private Double confidenceScore;

    @Column(name = "emergency_flag")
    private Boolean emergencyFlag;

    @Column(name = "emergency_escalated")
    private Boolean emergencyEscalated;

    // updatable=true allows the DataSeeder to backdate this field for Prophet time-series
    @Column(name = "created_at", updatable = true, nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void prePersist() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
    }

    @Column(name = "doctor_action")
    private String doctorAction;
}
