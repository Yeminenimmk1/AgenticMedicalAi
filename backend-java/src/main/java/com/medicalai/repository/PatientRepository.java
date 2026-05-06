package com.medicalai.repository;

import com.medicalai.entity.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PatientRepository extends JpaRepository<Patient, UUID> {
    Optional<Patient> findByUsername(String username);
    Optional<Patient> findByEmail(String email);
    List<Patient> findByRole(String role);

    @Query("SELECT p FROM Patient p WHERE p.role = :role AND p.villageOrArea = :area")
    List<Patient> findDoctorsByArea(@Param("role") String role, @Param("area") String area);
}
