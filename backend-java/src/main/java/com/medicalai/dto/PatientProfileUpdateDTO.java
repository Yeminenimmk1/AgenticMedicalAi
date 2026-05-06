package com.medicalai.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class PatientProfileUpdateDTO {
    private String username;          // Used to look up the patient
    private String fullName;
    private Integer age;
    private String gender;
    private String bloodGroup;
    private String phoneNumber;
    private String villageZip;
    private String villageOrArea;
    // Baseline vitals for Digital Twin comparison
    private Integer baselineGlucose;
    private Integer baselineBloodPressure;
    private Double  baselineBmi;
}
