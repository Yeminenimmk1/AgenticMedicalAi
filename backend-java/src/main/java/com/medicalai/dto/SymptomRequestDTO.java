package com.medicalai.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SymptomRequestDTO {
    private String username;
    private String symptoms;
    // Optional vitals entered by the patient on the triage page.
    // When provided, these override the AI-extracted values for the Digital Twin ML call.
    private Integer currentGlucose;
    private Integer currentBloodPressure;
    private Double  currentBmi;
}
