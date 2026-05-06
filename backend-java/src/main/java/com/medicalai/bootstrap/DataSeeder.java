package com.medicalai.bootstrap;

import com.medicalai.entity.DiagnosisLog;
import com.medicalai.entity.Patient;
import com.medicalai.repository.DiagnosisLogRepository;
import com.medicalai.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.Random;

/**
 * DataSeeder — runs once on startup to seed:
 *   1. Synthetic Doctor accounts (4 regional doctors)
 *   2. Patient Archetypes (5 distinct health profiles for Digital Twin testing)
 *   3. Outbreak Log History (30-day symptom timeline with a Dengue spike in Village B)
 *
 * ALL inserts are guarded with "if username/count is empty" checks so restarting
 * the server never creates duplicate data.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final PatientRepository     patientRepository;
    private final DiagnosisLogRepository diagnosisLogRepository;

    // Shared PRNG for date jitter — NOT used for security
    private final Random rng = new Random(42);

    // ─────────────────────────────────────────────────────────────────
    // ENTRY POINT
    // ─────────────────────────────────────────────────────────────────
    @Override
    public void run(String... args) throws Exception {

        // ── TASK 0: Synthetic Doctors ────────────────────────────────
        log.info("[Seeder] Checking synthetic doctor accounts...");
        seedDoctorIfMissing("dr_sharma", "Dr. Sharma",  "Cardiologist",      "Andheri, Mumbai");
        seedDoctorIfMissing("dr_reddy",  "Dr. Reddy",   "General Physician", "Madhapur, Hyderabad");
        seedDoctorIfMissing("dr_patel",  "Dr. Patel",   "Neurologist",       "Whitefield, Bangalore");
        seedDoctorIfMissing("dr_singh",  "Dr. Singh",   "Pediatrician",      "Gomti Nagar, Lucknow");

        // ── TASK 1: Patient Archetypes ───────────────────────────────
        log.info("[Seeder] Checking patient archetypes...");
        Patient healthy    = seedPatientIfMissing("patient_healthy",    "Arjun Mehta",       22, "Male",   "O+",  "A+",  "Chennai, Tamil Nadu",  60.0, 118.0, 24.5, 80.0);
        Patient diabetic   = seedPatientIfMissing("patient_diabetic",   "Sunita Rao",        45, "Female", "B+",  "A+",  "Madhapur, Hyderabad",  78.0, 165.0, 30.2, 90.0);
        Patient cardiac    = seedPatientIfMissing("patient_cardiac",    "Ramesh Iyer",       60, "Male",   "A+",  "A+",  "Andheri, Mumbai",      82.0, 102.0, 31.5, 105.0);
        Patient borderline = seedPatientIfMissing("patient_borderline", "Priya Nair",        35, "Female", "AB+", "A+",  "Whitefield, Bangalore",72.0, 132.0, 27.1, 88.0);
        Patient dengue     = seedPatientIfMissing("patient_dengue",     "Karan Patel",       25, "Male",   "O-",  "A+",  "Gomti Nagar, Lucknow", 68.0, 99.0,  22.8, 78.0);

        // ── TASK 2: Outbreak History Logs ────────────────────────────
        log.info("[Seeder] Checking outbreak history logs...");
        if (diagnosisLogRepository.count() == 0) {
            log.info("[Seeder] Log table empty — injecting 30-day outbreak history...");
            List<DiagnosisLog> logs = new ArrayList<>();

            // Patients to use for logs (need saved entities, get them from DB or use what was returned)
            Patient p1 = getOrFallback(healthy,    "patient_healthy");
            Patient p2 = getOrFallback(diabetic,   "patient_diabetic");
            Patient p3 = getOrFallback(borderline, "patient_borderline");
            Patient p4 = getOrFallback(dengue,     "patient_dengue");

            // ── Village A: Normal baseline (10-15 mild logs over 30 days) ──
            logs.add(makeLog(p1, daysAgo(29), "Mild headache and fatigue", "Normal headache, no fever.", "No signs of infection.", "No cardiac concern.", "Tension Headache",     72.0, false, false));
            logs.add(makeLog(p1, daysAgo(26), "Stomach ache and nausea",   "No fever.",                  "Mild gastritis possible.", "Normal cardiac.",          "Gastritis",            65.0, false, false));
            logs.add(makeLog(p2, daysAgo(24), "Dizziness and mild fatigue","Low fever 99F.",             "Possible mild viral.",     "No cardiac issue.",        "Mild Viral Syndrome",  60.0, false, false));
            logs.add(makeLog(p1, daysAgo(22), "Sore throat and cough",     "Low grade fever 99.1F.",     "Throat infection likely.", "No cardiac concern.",      "Pharyngitis",          68.0, false, false));
            logs.add(makeLog(p3, daysAgo(20), "Back pain",                 "No fever.",                  "Muscular strain.",         "No cardiac concern.",      "Musculoskeletal Pain", 70.0, false, false));
            logs.add(makeLog(p2, daysAgo(18), "Headache and runny nose",   "No fever.",                  "Viral rhinitis.",          "Normal.",                  "Common Cold",          75.0, false, false));
            logs.add(makeLog(p1, daysAgo(15), "Mild stomach cramp",        "No fever.",                  "Possible IBS.",            "Normal.",                  "IBS",                  60.0, false, false));
            logs.add(makeLog(p3, daysAgo(12), "Fatigue and body ache",     "Low fever 99.5F.",           "Viral syndrome.",          "No cardiac concern.",      "Mild Viral Syndrome",  63.0, false, false));
            logs.add(makeLog(p2, daysAgo(9),  "Mild fever 99F and cough",  "Mild fever present.",        "Upper respiratory.",       "Normal.",                  "Viral URTI",           67.0, false, false));
            logs.add(makeLog(p1, daysAgo(6),  "Sinus pain and headache",   "No fever.",                  "Sinusitis.",               "Normal.",                  "Sinusitis",            69.0, false, false));
            logs.add(makeLog(p3, daysAgo(4),  "Mild nausea and vomiting",  "No fever.",                  "Gastroenteritis.",         "Normal.",                  "Gastroenteritis",      64.0, false, false));
            logs.add(makeLog(p2, daysAgo(2),  "Throat pain and mild cough","No fever.",                  "Pharyngitis.",             "Normal.",                  "Pharyngitis",          66.0, false, false));

            // ── Village B (Dengue / Fever Spike): Sparse early, BURST last 10 days ──
            // Days 20-30: only 2 early cases
            logs.add(makeLog(p4, daysAgo(28), "High fever and headache",   "High fever 103F detected.", "Possible dengue.",         "No cardiac concern.",      "Dengue Fever",         78.0, true,  false));
            logs.add(makeLog(p4, daysAgo(23), "Fever and joint pain",      "High fever 102F.",          "Dengue signs present.",    "Normal.",                  "Dengue Fever",         80.0, true,  false));

            // Days 10-0: OUTBREAK SURGE — 16 dengue/fever cases
            String[] dengueSymptoms = {
                "High fever 104F, severe joint pain, and rash",
                "High fever 103F, headache behind eyes, and bone pain",
                "High fever 102F, chills, vomiting, and fatigue",
                "Very high fever 104F, severe muscle pain, and skin rash",
                "High fever with severe headache, no appetite, and joint pain",
                "Sudden high fever 103F, severe body ache, and red spots on skin",
                "High fever, retro-orbital pain, and weakness",
                "High fever 104F, nausea, skin bleeding spots",
                "High fever and severe joint pain since 3 days",
                "Dengue-like fever, rash all over body",
                "High fever 103F, bleeding gums, extreme fatigue",
                "Fever 102F, severe pain behind eyes, no appetite",
                "High fever, joint swelling, and rash",
                "Severe fever 103F, bone pain, and chills",
                "High fever 104F, vomiting, and petechial rash",
                "Fever, intense headache, and dengue rash"
            };

            double[] confidences = {88,85,90,87,82,91,84,89,86,83,92,85,88,87,90,86};
            int[] daysOffset     = {10, 9, 9, 8, 8, 7, 7, 6, 6, 5, 5, 4, 3, 2, 1, 0};

            for (int i = 0; i < dengueSymptoms.length; i++) {
                logs.add(makeLog(
                    p4,
                    daysAgo(daysOffset[i]),
                    dengueSymptoms[i],
                    "High fever " + (102 + rng.nextInt(3)) + "F detected. Classic dengue pattern.",
                    "Dengue fever highly suspected — thrombocytopenia risk.",
                    "Tachycardia possible in severe dengue. Monitor.",
                    "Dengue Fever",
                    confidences[i],
                    true,
                    daysOffset[i] <= 2  // escalate most severe cases
                ));
            }

            diagnosisLogRepository.saveAll(logs);
            log.info("[Seeder] Inserted {} diagnosis logs ({} Village A baseline + 18 Village B Dengue outbreak).",
                     logs.size(), logs.size() - 18);
        } else {
            log.info("[Seeder] Diagnosis logs already present ({} rows) — skipping outbreak injection.", diagnosisLogRepository.count());
        }

        log.info("[Seeder] All seeding complete.");
    }

    // ─────────────────────────────────────────────────────────────────
    // HELPERS
    // ─────────────────────────────────────────────────────────────────

    /** Seeds a doctor only if their username doesn't already exist. */
    private void seedDoctorIfMissing(String username, String fullName, String specialty, String area) {
        if (patientRepository.findByUsername(username).isEmpty()) {
            Patient doctor = new Patient();
            doctor.setUsername(username);
            doctor.setPassword(hashPassword("password123"));
            doctor.setFullName(fullName + " (" + specialty + ")");
            doctor.setRole("DOCTOR");
            doctor.setEmail(username + "@medtest.com");
            doctor.setVillageOrArea(area);
            doctor.setAge(45);
            doctor.setGender("Other");
            patientRepository.save(doctor);
            log.info("[Seeder] Seeded Doctor: {}", username);
        }
    }

    /**
     * Seeds a patient archetype only if that username is not already in the DB.
     * Returns the found-or-created Patient entity.
     *
     * @param glucose   fasting blood glucose (mg/dL)  — stored in diabetesRiskScore as hint
     * @param systolic  systolic BP (mmHg)              — stored in heartRiskScore as hint
     * @param bmi       body mass index
     * @param diastolic diastolic BP (not stored directly, used for log)
     */
    private Patient seedPatientIfMissing(
            String username, String fullName, int age, String gender,
            String bloodGroup, String role, String area,
            double glucose, double systolic, double bmi, double diastolic) {

        return patientRepository.findByUsername(username).orElseGet(() -> {
            Patient p = new Patient();
            p.setUsername(username);
            p.setPassword(hashPassword("Demo@1234"));
            p.setFullName(fullName);
            p.setAge(age);
            p.setGender(gender);
            p.setBloodGroup(bloodGroup);
            p.setRole("PATIENT");
            p.setEmail(username + "@medtest.com");
            p.setVillageOrArea(area);

            // Seed ML baseline scores derived from vitals
            // Diabetes risk: rough proxy based on glucose
            double diabetesRisk = Math.min(100.0, Math.max(0.0, (glucose - 80.0) / 1.2));
            // Heart risk: rough proxy based on systolic BP
            double heartRisk    = Math.min(100.0, Math.max(0.0, (systolic - 100.0) / 0.7));
            p.setDiabetesRiskScore(Math.round(diabetesRisk * 10.0) / 10.0);
            p.setHeartRiskScore(Math.round(heartRisk * 10.0) / 10.0);

            patientRepository.save(p);
            log.info("[Seeder] Seeded Patient: {} ({}, age {})", fullName, username, age);
            return p;
        });
    }

    /** Build a DiagnosisLog with a manually back-dated timestamp. */
    private DiagnosisLog makeLog(
            Patient patient, LocalDateTime timestamp,
            String symptoms,
            String feverOut, String infectionOut, String heartOut,
            String finalDiagnosis, double confidence,
            boolean isEmergency, boolean escalated) {

        DiagnosisLog log = new DiagnosisLog();
        log.setPatient(patient);
        log.setSymptomsInput(symptoms);
        log.setFeverAgentOutput(feverOut);
        log.setInfectionAgentOutput(infectionOut);
        log.setHeartAgentOutput(heartOut);
        log.setFinalDiagnosis(finalDiagnosis);
        log.setConfidenceScore(confidence);
        log.setEmergencyFlag(isEmergency);
        log.setEmergencyEscalated(escalated);
        // Override the @CreationTimestamp with a back-dated value for Prophet time-series
        log.setCreatedAt(timestamp);
        return log;
    }

    /**
     * Returns a timestamp N days before now, with random hour/minute jitter
     * so the time-series data looks natural (not all at midnight).
     */
    private LocalDateTime daysAgo(int days) {
        return LocalDateTime.now()
                .minusDays(days)
                .withHour(rng.nextInt(8) + 8)      // 08:00 – 15:59
                .withMinute(rng.nextInt(60))
                .withSecond(0)
                .withNano(0);
    }

    /** Null-safe fallback: if the seed was already in DB and returned null, re-fetch. */
    private Patient getOrFallback(Patient candidate, String username) {
        if (candidate != null) return candidate;
        return patientRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Expected seeded patient not found: " + username));
    }

    private String hashPassword(String password) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(password.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 not available", e);
        }
    }
}
