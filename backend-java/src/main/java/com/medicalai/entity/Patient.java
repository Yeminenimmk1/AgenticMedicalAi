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
@Table(name = "patients")
public class Patient {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "full_name", length = 100, nullable = false)
    private String fullName;
    
    @Column(unique = true, length = 50)
    private String username;
    
    @Column(length = 255)
    private String password;

    @Column(unique = true, length = 150)
    private String email;

    private Integer age;

    @Column(name = "blood_group", length = 5)
    private String bloodGroup;

    @Column(length = 10)
    private String gender;

    @Column(name = "phone_number", length = 15)
    private String phoneNumber;

    @Column(name = "village_zip", length = 10)
    private String villageZip;

    @Column(name = "village_or_area", length = 100)
    private String villageOrArea;

    @Column(length = 20)
    private String role;

    // The ML output scores from Python
    @Column(name = "diabetes_risk_score")
    private Double diabetesRiskScore;

    @Column(name = "heart_risk_score")
    private Double heartRiskScore;

    // Baseline vitals entered by the patient via the Profile page.
    // Used by VitalsExtractorService as a historical anchor for the Digital Twin.
    @Column(name = "baseline_glucose")
    private Integer baselineGlucose;

    @Column(name = "baseline_blood_pressure")
    private Integer baselineBloodPressure;

    @Column(name = "baseline_bmi")
    private Double baselineBmi;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Constructor without ID for easy creation
    public Patient(String fullName, Integer age, String gender, String phoneNumber, String villageZip) {
        this.fullName = fullName;
        this.age = age;
        this.gender = gender;
        this.phoneNumber = phoneNumber;
        this.villageZip = villageZip;
    }
}
