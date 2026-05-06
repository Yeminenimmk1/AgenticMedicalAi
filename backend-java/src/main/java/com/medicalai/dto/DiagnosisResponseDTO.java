package com.medicalai.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DiagnosisResponseDTO {
    private String diagnosisId;
    private String finalDiagnosis;
    private Double confidenceScore;
    private Boolean isEmergency;
    private Boolean autoEscalated;
    private String reasoning;
    
    // ML Generated Risk Scores specific to this patient at triage time
    private Double diabetesRiskScore;
    private Double heartRiskScore;
    private Double overallHealthScore;
    
    // The exact thought processes of the agents for doctor review
    private Map<String, Object> aiDebateLog;
}
